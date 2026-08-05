"""Enrichissement contact (téléphone / e-mail / site web) via OpenStreetMap.

Solution **gratuite et sans clé API** : géocodage de l'adresse via Nominatim,
puis recherche du point d'intérêt correspondant via Overpass, dont on lit les
tags `phone`/`contact:phone`, `email`/`contact:email` et `website` quand ils
existent.

Limites à connaître avant usage en volume :
- Couverture partielle : OpenStreetMap est alimenté par des contributeurs
  bénévoles, une entreprise tout juste créée n'y figure pas forcément.
- Respect obligatoire de la politique d'usage de Nominatim
  (https://operations.osmfoundation.org/policies/nominatim/) : 1 requête/seconde
  maximum et un User-Agent identifiant l'application — géré ici par
  `enrichir_liste` (délai entre appels) et l'en-tête `_USER_AGENT`.
- Pour un volume important ou une fiabilité plus élevée, une solution payante
  (Google Places API, SocieteInfo...) donnera une meilleure couverture — voir
  README.md.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from difflib import SequenceMatcher

import httpx

logger = logging.getLogger(__name__)

_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
_OVERPASS_URL = "https://overpass-api.de/api/interpreter"
_USER_AGENT = "CapEntreprendreFranceProspection/1.0"
_RAYON_RECHERCHE_M = 150
_SEUIL_SIMILARITE_NOM = 0.55


class EnrichissementError(RuntimeError):
    pass


@dataclass
class ContactEnrichi:
    telephone: str | None
    email: str | None
    site_web: str | None
    source: str  # "osm" ou "aucun"


def _similarite(a: str, b: str) -> float:
    return SequenceMatcher(None, a.strip().lower(), b.strip().lower()).ratio()


def _geocoder_adresse(
    adresse: str | None, code_postal: str | None, ville: str | None, timeout: float
) -> tuple[float, float] | None:
    morceaux = [p for p in (adresse, code_postal, ville, "France") if p]
    if not morceaux:
        return None
    requete = ", ".join(morceaux)

    with httpx.Client(timeout=timeout) as client:
        try:
            response = client.get(
                _NOMINATIM_URL,
                params={"q": requete, "format": "json", "limit": 1},
                headers={"User-Agent": _USER_AGENT},
            )
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise EnrichissementError(f"Échec du géocodage Nominatim : {exc}") from exc

    resultats = response.json()
    if not resultats:
        return None
    try:
        return float(resultats[0]["lat"]), float(resultats[0]["lon"])
    except (KeyError, ValueError, TypeError):
        return None


def _rechercher_poi(lat: float, lon: float, timeout: float) -> list[dict]:
    requete_overpass = f"""
    [out:json][timeout:{int(timeout)}];
    nwr(around:{_RAYON_RECHERCHE_M},{lat},{lon})["name"];
    out tags;
    """
    with httpx.Client(timeout=timeout) as client:
        try:
            response = client.post(_OVERPASS_URL, data={"data": requete_overpass})
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise EnrichissementError(f"Échec de la requête Overpass : {exc}") from exc

    return response.json().get("elements", [])


def _meilleur_poi(elements: list[dict], nom: str) -> dict | None:
    meilleur: dict | None = None
    meilleur_score = 0.0
    for element in elements:
        tags = element.get("tags") or {}
        nom_poi = tags.get("name")
        if not nom_poi:
            continue
        score = _similarite(nom, nom_poi)
        if score > meilleur_score:
            meilleur_score = score
            meilleur = element
    if meilleur is not None and meilleur_score >= _SEUIL_SIMILARITE_NOM:
        return meilleur
    return None


def enrichir_entreprise(
    nom: str,
    adresse: str | None,
    code_postal: str | None,
    ville: str | None,
    timeout: float = 15.0,
) -> ContactEnrichi:
    """Tente de retrouver téléphone/e-mail/site web d'une entreprise via
    OpenStreetMap. Renvoie un ContactEnrichi vide (source="aucun") si rien
    n'est trouvé — ce n'est pas une erreur, juste une absence de donnée."""
    position = _geocoder_adresse(adresse, code_postal, ville, timeout)
    if position is None:
        return ContactEnrichi(telephone=None, email=None, site_web=None, source="aucun")

    lat, lon = position
    elements = _rechercher_poi(lat, lon, timeout)
    poi = _meilleur_poi(elements, nom)
    if poi is None:
        return ContactEnrichi(telephone=None, email=None, site_web=None, source="aucun")

    tags = poi.get("tags") or {}
    telephone = tags.get("contact:phone") or tags.get("phone")
    email = tags.get("contact:email") or tags.get("email")
    site_web = tags.get("contact:website") or tags.get("website")

    if not any((telephone, email, site_web)):
        return ContactEnrichi(telephone=None, email=None, site_web=None, source="aucun")

    return ContactEnrichi(telephone=telephone, email=email, site_web=site_web, source="osm")


def enrichir_liste(
    entreprises: list[dict],
    delai_entre_appels: float = 1.1,
    timeout: float = 15.0,
) -> list[ContactEnrichi]:
    """Enrichit une liste d'entreprises (dicts avec clés nom/adresse/code_postal/ville).

    Respecte la limite de 1 requête/seconde de Nominatim en attendant
    `delai_entre_appels` secondes entre chaque entreprise (donc ~1
    entreprise/seconde traitée — prévoir le temps nécessaire sur un gros lot)."""
    resultats: list[ContactEnrichi] = []
    for i, entreprise in enumerate(entreprises):
        if i > 0:
            time.sleep(delai_entre_appels)
        resultats.append(
            enrichir_entreprise(
                nom=entreprise.get("nom", ""),
                adresse=entreprise.get("adresse"),
                code_postal=entreprise.get("code_postal"),
                ville=entreprise.get("ville"),
                timeout=timeout,
            )
        )
    return resultats
