"""Client pour l'API publique et gratuite du BODACC (Bulletin officiel des
annonces civiles et commerciales), publiée par la DILA sur une plateforme
opendatasoft — aucune clé API n'est nécessaire.

Pourquoi ce module en complément de `sirene_client.py` : le BODACC publie les
avis de création d'entreprise dès leur enregistrement au greffe, à un rythme
pouvant aller jusqu'à 5 publications par semaine — contre un cycle de
rafraîchissement hebdomadaire pour l'API recherche-entreprises (SIRENE) déjà
utilisée dans ce module. Cela ne supprime pas le délai administratif réel
entre la création et son enregistrement (2 à 4 semaines, voir README), mais
réduit le délai supplémentaire dû au cycle de synchronisation des données.

Limite importante : contrairement à SIRENE, le BODACC ne classe pas ses avis
par code NAF/APE — seul un texte libre décrit l'activité. Le rattachement à un
secteur se fait donc par recherche de mots-clés (`secteurs_mots_cles.py`),
une approximation moins fiable que le filtrage par code NAF.

Comme pour sirene_client.py, ce module n'a pas pu être testé en conditions
réelles depuis l'environnement de développement utilisé pour l'écrire (réseau
sortant limité vers les domaines gouvernementaux/opendatasoft) : l'extraction
des champs est volontairement défensive (plusieurs noms de clés essayés, la
recherche de mots-clés porte sur l'ensemble du texte de l'annonce plutôt que
sur un champ précis dont le nom exact n'a pas pu être vérifié en direct) pour
limiter les régressions si le schéma exact diffère légèrement de ce qui est
documenté publiquement. Un test de connectivité réel est recommandé avant
mise en production.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import date, datetime

import httpx

from .secteurs_mots_cles import secteur_pour_texte_libre

logger = logging.getLogger(__name__)

_API_BASE = (
    "https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/"
    "datasets/annonces-commerciales/records"
)
_LIMIT = 100  # maximum raisonnable par page côté API opendatasoft


class BodaccError(RuntimeError):
    pass


@dataclass
class AvisCreationBodacc:
    siren: str | None
    nom: str
    secteur: str
    date_parution: date | None  # date de publication de l'avis (pas nécessairement la date exacte de création)
    departement: str | None
    ville: str | None
    tribunal: str | None


def _extraire_date(valeur: str | None) -> date | None:
    if not valeur:
        return None
    try:
        return datetime.strptime(valeur[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _valeurs_textuelles(objet, acc: list[str]) -> None:
    if isinstance(objet, dict):
        for v in objet.values():
            _valeurs_textuelles(v, acc)
    elif isinstance(objet, list):
        for v in objet:
            _valeurs_textuelles(v, acc)
    elif isinstance(objet, str):
        acc.append(objet)


def _texte_recherche(resultat: dict) -> str:
    """Concatène toutes les valeurs textuelles du résultat (y compris
    imbriquées) : évite de dépendre d'un nom de champ précis pour la
    description d'activité, dont l'emplacement exact n'a pas pu être vérifié
    en conditions réelles."""
    acc: list[str] = []
    _valeurs_textuelles(resultat, acc)
    return " ".join(acc).lower()


def _chercher_cle(objet, cle_cible: str):
    """Recherche récursive d'une clé, quelle que soit sa profondeur
    d'imbrication — utile car la structure exacte de `listepersonnes` (et la
    présence du SIREN à l'intérieur) peut varier selon la version de l'API."""
    if isinstance(objet, dict):
        if objet.get(cle_cible):
            return objet[cle_cible]
        for v in objet.values():
            trouve = _chercher_cle(v, cle_cible)
            if trouve is not None:
                return trouve
    elif isinstance(objet, list):
        for v in objet:
            trouve = _chercher_cle(v, cle_cible)
            if trouve is not None:
                return trouve
    return None


def _parse_json_si_chaine(valeur):
    """`listepersonnes` est parfois une chaîne JSON, parfois déjà décodée
    selon la version de l'API — on gère les deux cas."""
    if isinstance(valeur, str):
        try:
            return json.loads(valeur)
        except (json.JSONDecodeError, TypeError):
            return None
    return valeur


def _extraire_avis(resultat: dict, secteurs_filtres: set[str] | None) -> AvisCreationBodacc | None:
    texte = _texte_recherche(resultat)
    secteur = secteur_pour_texte_libre(texte)
    if secteur is None:
        return None
    if secteurs_filtres is not None and secteur not in secteurs_filtres:
        return None

    listepersonnes = _parse_json_si_chaine(resultat.get("listepersonnes"))

    siren = _chercher_cle(resultat, "siren") or _chercher_cle(listepersonnes, "siren")
    nom = (
        _chercher_cle(listepersonnes, "denomination")
        or _chercher_cle(listepersonnes, "nom")
        or resultat.get("commercant")
        or f"Entreprise BODACC {siren or '?'}"
    )
    ville = resultat.get("ville") or _chercher_cle(listepersonnes, "ville")
    departement = (
        resultat.get("departement")
        or resultat.get("numerodepartement")
        or _chercher_cle(listepersonnes, "codePostal")
    )
    date_parution = _extraire_date(resultat.get("dateparution"))

    return AvisCreationBodacc(
        siren=str(siren) if siren else None,
        nom=str(nom).strip(),
        secteur=secteur,
        date_parution=date_parution,
        departement=str(departement) if departement else None,
        ville=str(ville) if ville else None,
        tribunal=resultat.get("tribunal"),
    )


def rechercher_creations_bodacc(
    secteurs: list[str] | None = None,
    date_min: date | None = None,
    date_max: date | None = None,
    departement: str | None = None,
    max_resultats: int = 200,
    timeout: float = 15.0,
) -> list[AvisCreationBodacc]:
    """Recherche les avis de création d'entreprise publiés au BODACC,
    filtrés (côté client) par secteur — via mots-clés, voir module docstring
    — et par date de publication. Renvoie au maximum `max_resultats` avis,
    triés par date de publication décroissante."""
    secteurs_filtres = set(secteurs) if secteurs else None
    resultats: list[AvisCreationBodacc] = []
    offset = 0

    with httpx.Client(timeout=timeout) as client:
        while len(resultats) < max_resultats:
            clauses = ['familleavis_lib="Créations"']
            if date_min:
                clauses.append(f"dateparution>=date'{date_min.isoformat()}'")
            if date_max:
                clauses.append(f"dateparution<=date'{date_max.isoformat()}'")
            if departement:
                clauses.append(f'departement="{departement}"')

            params = {
                "where": " and ".join(clauses),
                "limit": _LIMIT,
                "offset": offset,
                "order_by": "dateparution desc",
            }

            try:
                response = client.get(_API_BASE, params=params)
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise BodaccError(f"Échec de l'appel à l'API BODACC : {exc}") from exc

            data = response.json()
            lot = data.get("results", [])
            if not lot:
                break

            for brut in lot:
                avis = _extraire_avis(brut, secteurs_filtres)
                if avis is None:
                    continue
                # Filtrage de sécurité côté client, en plus du "where" envoyé à
                # l'API : le nom exact du champ de date côté serveur n'a pas pu
                # être vérifié en conditions réelles (voir docstring du module).
                if date_min and (avis.date_parution is None or avis.date_parution < date_min):
                    continue
                if date_max and (avis.date_parution is None or avis.date_parution > date_max):
                    continue
                resultats.append(avis)

            if len(lot) < _LIMIT:
                break
            offset += _LIMIT

    resultats.sort(key=lambda a: a.date_parution or date.min, reverse=True)
    return resultats[:max_resultats]
