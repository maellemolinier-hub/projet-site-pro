"""Gestion de la liste noire e-mail — désinscriptions.

Équivalent e-mail de blacklist.py (STOP SMS) : toute logique d'envoi DOIT
passer par `is_blacklisted()` juste avant l'envoi, garantissant qu'une adresse
désinscrite ne recevra plus jamais d'e-mail de prospection, y compris en cas
de ré-import accidentel d'un fichier obsolète.
"""
from __future__ import annotations

import logging

from sqlalchemy import delete, insert, select

from .db import email_blacklist as email_blacklist_table
from .db import get_engine

logger = logging.getLogger(__name__)


def _normaliser(email: str) -> str:
    return email.strip().lower()


def is_blacklisted(email: str) -> bool:
    email = _normaliser(email)
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(
            select(email_blacklist_table.c.id).where(email_blacklist_table.c.email == email)
        ).first()
    return row is not None


def add_to_blacklist(email: str, source: str = "desabonnement_email") -> bool:
    """Ajoute une adresse à la liste noire. Idempotent : renvoie False si déjà présente."""
    email = _normaliser(email)
    if is_blacklisted(email):
        return False

    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(insert(email_blacklist_table).values(email=email, source=source))
    logger.info("E-mail %s ajouté à la liste noire (source=%s)", email, source)
    return True


def bulk_add_to_blacklist(emails: list[str], source: str = "import_manuel") -> int:
    """Ajoute plusieurs adresses ; renvoie le nombre effectivement ajoutées."""
    return sum(1 for email in emails if add_to_blacklist(email, source=source))


def lister_blacklist(limite: int = 500) -> list[dict]:
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(
            select(email_blacklist_table).order_by(email_blacklist_table.c.created_at.desc()).limit(limite)
        ).mappings().all()
    return [dict(r) for r in rows]


def retirer_de_la_blacklist(email: str) -> bool:
    """Retrait manuel explicite (jamais automatique) — renvoie False si l'adresse
    n'était pas présente."""
    email = _normaliser(email)
    if not is_blacklisted(email):
        return False
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(delete(email_blacklist_table).where(email_blacklist_table.c.email == email))
    logger.info("E-mail %s retiré de la liste noire", email)
    return True
