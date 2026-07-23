"""Raccourcissement d'URL optionnel (réduit le nombre de segments SMS).

Utilise l'API publique et gratuite TinyURL (sans clé). En cas d'échec réseau,
on retombe silencieusement sur le lien complet : un lien non raccourci reste
fonctionnel, alors qu'un envoi bloqué ne l'est pas.
"""
from __future__ import annotations

import logging

import httpx

logger = logging.getLogger(__name__)

_TINYURL_ENDPOINT = "https://tinyurl.com/api-create.php"


def shorten_url(url: str, timeout: float = 5.0) -> str:
    try:
        response = httpx.get(_TINYURL_ENDPOINT, params={"url": url}, timeout=timeout)
        response.raise_for_status()
        short = response.text.strip()
        if short.startswith("http"):
            return short
        logger.warning("Réponse inattendue du raccourcisseur d'URL : %s", short)
    except httpx.HTTPError as exc:
        logger.warning("Échec du raccourcissement d'URL (%s) — envoi du lien complet", exc)
    return url
