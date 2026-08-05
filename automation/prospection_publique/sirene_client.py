"""Client pour l'API publique et gratuite "Recherche d'entreprises"
(recherche-entreprises.api.gouv.fr), adossée au répertoire SIRENE de l'INSEE.

Aucune clé API n'est nécessaire (données ouvertes). Cette API renvoie
l'identité légale des entreprises (nom, SIRET, adresse, code NAF, date de
création) — **elle ne fournit ni e-mail ni téléphone** : ces données ne sont
pas publiques dans le répertoire SIRENE. Une entreprise captée ici doit donc
passer par une étape d'enrichissement (recherche manuelle, service payant type
DropContact/Pappers, fiche Google Business...) avant de pouvoir être
contactée par SMS ou e-mail — voir README.md de ce dossier.

Note : les appels réseau vers *.gouv.fr peuvent être bloqués par certains
pare-feux/proxys sortants restrictifs ; ce module n'a pas pu être testé en
conditions réelles depuis l'environnement de développement utilisé pour
l'écrire (réseau sortant limité). Le code suit strictement le contrat
documenté de l'API (https://recherche-entreprises.api.gouv.fr/docs/) ; un
test de connectivité réel est recommandé avant mise en production.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, datetime

import httpx

from .secteurs_naf import secteur_pour_code_naf

logger = logging.getLogger(__name__)

_API_BASE = "https://recherche-entreprises.api.gouv.fr/search"
_PER_PAGE = 25  # maximum raisonnable par page côté API


class SireneError(RuntimeError):
    pass


@dataclass
class EntrepriseCaptee:
    siren: str
    siret: str | None
    nom: str
    secteur: str
    code_naf: str
    date_creation: date | None
    adresse: str | None
    code_postal: str | None
    ville: str | None


def _extraire_date(valeur: str | None) -> date | None:
    if not valeur:
        return None
    try:
        return datetime.strptime(valeur[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def _extraire_entreprise(resultat: dict) -> EntrepriseCaptee | None:
    """Extraction défensive : la structure exacte des champs imbriqués
    (`siege`) peut varier selon la version de l'API ; on essaie plusieurs
    emplacements plausibles plutôt que de faire planter tout le lot sur une
    entrée inattendue."""
    siege = resultat.get("siege") or {}

    code_naf = (
        siege.get("activite_principale")
        or resultat.get("activite_principale")
        or ""
    ).strip().upper()
    if not code_naf:
        return None

    secteur = secteur_pour_code_naf(code_naf)
    if secteur is None:
        return None

    siren = resultat.get("siren") or ""
    nom = (
        resultat.get("nom_complet")
        or resultat.get("nom_raison_sociale")
        or siege.get("enseigne1")
        or f"Entreprise {siren}"
    )
    date_creation = _extraire_date(siege.get("date_creation") or resultat.get("date_creation"))

    return EntrepriseCaptee(
        siren=siren,
        siret=siege.get("siret"),
        nom=nom,
        secteur=secteur,
        code_naf=code_naf,
        date_creation=date_creation,
        adresse=siege.get("adresse") or siege.get("geo_adresse"),
        code_postal=siege.get("code_postal"),
        ville=siege.get("libelle_commune") or siege.get("commune"),
    )


def rechercher_nouvelles_entreprises(
    codes_naf: list[str],
    date_min: date | None = None,
    date_max: date | None = None,
    departement: str | None = None,
    max_resultats: int = 200,
    timeout: float = 15.0,
) -> list[EntrepriseCaptee]:
    """Recherche des entreprises actives pour une liste de codes NAF, filtrées
    côté client sur la date de création (l'API ne garantit pas un filtre de
    date fiable pour toutes ses versions). Renvoie au maximum
    `max_resultats` entreprises, triées par date de création décroissante."""
    resultats: list[EntrepriseCaptee] = []
    page = 1

    with httpx.Client(timeout=timeout) as client:
        while len(resultats) < max_resultats:
            params = {
                "code_naf": ",".join(codes_naf),
                "etat_administratif": "A",  # entreprises actives uniquement
                "page": page,
                "per_page": _PER_PAGE,
                "minimal": "false",
            }
            if departement:
                params["departement"] = departement

            try:
                response = client.get(_API_BASE, params=params)
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise SireneError(f"Échec de l'appel à l'API SIRENE : {exc}") from exc

            data = response.json()
            lot = data.get("results", [])
            if not lot:
                break

            for brut in lot:
                entreprise = _extraire_entreprise(brut)
                if entreprise is None:
                    continue
                if date_min and (entreprise.date_creation is None or entreprise.date_creation < date_min):
                    continue
                if date_max and (entreprise.date_creation is None or entreprise.date_creation > date_max):
                    continue
                resultats.append(entreprise)

            if len(lot) < _PER_PAGE:
                break
            page += 1

    resultats.sort(key=lambda e: e.date_creation or date.min, reverse=True)
    return resultats[:max_resultats]
