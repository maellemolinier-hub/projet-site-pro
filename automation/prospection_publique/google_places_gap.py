"""Détection des entreprises sans site web via l'API Google Places (New).

Contrairement à sirene_client.py et bodacc_client.py (données publiques
gratuites), ce module appelle une API **payante à l'usage** — Google offre un
crédit gratuit mensuel qui couvre largement le volume visé ici, mais ça
nécessite un projet Google Cloud avec la facturation activée et l'API
"Places API (New)" activée, puis une clé fournie via le paramètre `cle_api`
ou la variable d'environnement `GOOGLE_PLACES_API_KEY`. Cette étape (créer le
projet, activer la facturation) ne peut être faite que par la propriétaire du
compte Google Cloud — voir README.md.

Principe : pour un secteur et une ville donnés, on recherche les
établissements correspondants sur Google Maps (Text Search), puis on ne garde
que ceux dont le champ `websiteUri` est absent — signal direct qu'ils n'ont
pas encore de site et sont donc des prospects prioritaires pour Cap
Entreprendre France. Contrairement à SIRENE/BODACC, Google Places fournit
directement un téléphone (`nationalPhoneNumber`) quand il est renseigné sur la
fiche.

Comme pour les autres clients de ce module, l'appel réel n'a pas pu être
testé en conditions réelles depuis cet environnement de développement (accès
réseau sortant limité, et aucune clé API n'est disponible ici) ; le code suit
le contrat documenté de l'API Places (New)
(https://developers.google.com/maps/documentation/places/web-service/text-search).
Un test de connexion réel (avec une vraie clé) est recommandé avant la
première utilisation en production.
"""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

_API_URL = "https://places.googleapis.com/v1/places:searchText"
_FIELD_MASK = (
    "places.id,places.displayName,places.formattedAddress,"
    "places.websiteUri,places.nationalPhoneNumber,places.types"
)


class GooglePlacesError(RuntimeError):
    pass


@dataclass
class EtablissementSansSite:
    place_id: str
    nom: str
    secteur_recherche: str
    adresse: str | None
    telephone: str | None


def _resoudre_cle_api(cle_api: str | None) -> str:
    cle = cle_api or os.environ.get("GOOGLE_PLACES_API_KEY", "")
    if not cle:
        raise GooglePlacesError(
            "Aucune clé API Google Places fournie (paramètre cle_api ou variable "
            "d'environnement GOOGLE_PLACES_API_KEY). Voir README.md pour la créer."
        )
    return cle


def rechercher_sans_site_web(
    secteur_recherche: str,
    ville: str,
    cle_api: str | None = None,
    max_resultats: int = 20,
    timeout: float = 15.0,
) -> list[EtablissementSansSite]:
    """Recherche les établissements correspondant à `secteur_recherche` dans
    `ville` sur Google Maps, et renvoie uniquement ceux qui n'ont pas de site
    web renseigné (`websiteUri` absent) — signal direct de besoin."""
    cle = _resoudre_cle_api(cle_api)
    resultats: list[EtablissementSansSite] = []
    page_token: str | None = None

    with httpx.Client(timeout=timeout) as client:
        while len(resultats) < max_resultats:
            corps: dict = {"textQuery": f"{secteur_recherche} à {ville}"}
            if page_token:
                corps["pageToken"] = page_token

            try:
                response = client.post(
                    _API_URL,
                    json=corps,
                    headers={
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": cle,
                        "X-Goog-FieldMask": _FIELD_MASK,
                    },
                )
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise GooglePlacesError(f"Échec de l'appel à l'API Google Places : {exc}") from exc

            data = response.json()
            lieux = data.get("places", [])
            if not lieux:
                break

            for lieu in lieux:
                if lieu.get("websiteUri"):
                    continue  # a déjà un site -> pas une cible pour nous
                nom = (lieu.get("displayName") or {}).get("text") or "Établissement sans nom"
                resultats.append(
                    EtablissementSansSite(
                        place_id=lieu.get("id", ""),
                        nom=nom,
                        secteur_recherche=secteur_recherche,
                        adresse=lieu.get("formattedAddress"),
                        telephone=lieu.get("nationalPhoneNumber"),
                    )
                )
                if len(resultats) >= max_resultats:
                    break

            page_token = data.get("nextPageToken")
            if not page_token:
                break

    return resultats[:max_resultats]
