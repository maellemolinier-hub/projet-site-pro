"""Gestion de la liste noire RGPD — numéros désinscrits (STOP).

Toute logique d'envoi DOIT passer par `is_blacklisted()` juste avant l'envoi
(défense en profondeur, même si la campagne a déjà filtré en amont) : c'est la
garantie qu'un numéro désinscrit ne recevra plus jamais de SMS, y compris en
cas de ré-import accidentel d'un fichier de prospection obsolète.
"""
from __future__ import annotations

import logging

from sqlalchemy import insert, select

from .db import get_engine, sms_blacklist
from .phone_utils import normaliser_e164

logger = logging.getLogger(__name__)


def is_blacklisted(phone: str) -> bool:
    phone = normaliser_e164(phone)
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(
            select(sms_blacklist.c.id).where(sms_blacklist.c.phone == phone)
        ).first()
    return row is not None


def add_to_blacklist(phone: str, source: str = "stop_sms") -> bool:
    """Ajoute un numéro à la liste noire. Idempotent : renvoie False si déjà présent."""
    phone = normaliser_e164(phone)
    if is_blacklisted(phone):
        return False

    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(insert(sms_blacklist).values(phone=phone, source=source))
    logger.info("Numéro %s ajouté à la liste noire (source=%s)", phone, source)
    return True


def bulk_add_to_blacklist(phones: list[str], source: str = "import_manuel") -> int:
    """Ajoute plusieurs numéros ; renvoie le nombre effectivement ajoutés."""
    return sum(1 for phone in phones if add_to_blacklist(phone, source=source))
