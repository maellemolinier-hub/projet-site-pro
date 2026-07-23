"""Génération et résolution des tokens de réservation de créneau.

Chaque prospect reçoit un token unique et non devinable : le lien inséré dans
le SMS (`{BOOKING_BASE_URL}/{token}`) permet de retrouver le prospect exact
lorsqu'il réserve, afin de nommer l'événement Google Agenda "Audit de [Nom]".
"""
from __future__ import annotations

import secrets

from sqlalchemy import select, update

from .db import get_engine, sms_prospect
from .models import Prospect


def generate_booking_token() -> str:
    return secrets.token_urlsafe(12)


def ensure_booking_token(prospect: Prospect) -> Prospect:
    """Attribue un token au prospect s'il n'en a pas encore, et le persiste."""
    if prospect.booking_token:
        return prospect

    token = generate_booking_token()
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(
            update(sms_prospect)
            .where(sms_prospect.c.id == prospect.id)
            .values(booking_token=token)
        )
    prospect.booking_token = token
    return prospect


def get_prospect_by_token(token: str) -> Prospect | None:
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(
            select(sms_prospect).where(sms_prospect.c.booking_token == token)
        ).mappings().first()
    if row is None:
        return None
    return Prospect(
        id=row["id"],
        prenom=row["prenom"],
        phone=row["phone"],
        secteur=row["secteur"],
        nom=row["nom"],
        ville=row["ville"],
        email=row["email"],
        booking_token=row["booking_token"],
        statut=row["statut"],
        date_envoi=row["date_envoi"],
        date_rdv=row["date_rdv"],
    )
