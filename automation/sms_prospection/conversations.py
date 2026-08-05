"""Fil de conversation unifié par prospect (SMS automatiques, réponses
entrantes, et messages manuels envoyés depuis le centre de pilotage)."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import insert, select

from .db import get_engine, sms_message, sms_prospect


@dataclass
class Message:
    id: int
    prospect_id: int
    direction: str   # entrant | sortant
    auteur: str      # automatique | manuel | prospect
    texte: str
    created_at: datetime


def journaliser_message(prospect_id: int, direction: str, auteur: str, texte: str) -> int:
    engine = get_engine()
    with engine.begin() as conn:
        result = conn.execute(
            insert(sms_message).values(
                prospect_id=prospect_id, direction=direction, auteur=auteur, texte=texte
            )
        )
        return result.inserted_primary_key[0]


def obtenir_fil(prospect_id: int) -> list[Message]:
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(
            select(sms_message)
            .where(sms_message.c.prospect_id == prospect_id)
            .order_by(sms_message.c.created_at.asc())
        ).mappings().all()
    return [Message(**dict(r)) for r in rows]


def lister_prospects_avec_dernier_message(limite: int = 200) -> list[dict]:
    """Renvoie les prospects triés par activité récente (dernier message
    d'abord), avec le texte et la date du dernier message le cas échéant."""
    engine = get_engine()
    with engine.connect() as conn:
        prospects = conn.execute(select(sms_prospect)).mappings().all()
        derniers = conn.execute(
            select(
                sms_message.c.prospect_id,
                sms_message.c.texte,
                sms_message.c.direction,
                sms_message.c.created_at,
            ).order_by(sms_message.c.created_at.desc())
        ).all()

    dernier_par_prospect: dict[int, dict] = {}
    for prospect_id, texte, direction, created_at in derniers:
        if prospect_id not in dernier_par_prospect:
            dernier_par_prospect[prospect_id] = {
                "texte": texte,
                "direction": direction,
                "created_at": created_at,
            }

    resultat = []
    for p in prospects:
        dernier = dernier_par_prospect.get(p["id"])
        resultat.append(
            {
                "id": p["id"],
                "prenom": p["prenom"],
                "nom": p["nom"],
                "phone": p["phone"],
                "secteur": p["secteur"],
                "statut": p["statut"],
                "dernier_message": dernier["texte"] if dernier else None,
                "dernier_message_direction": dernier["direction"] if dernier else None,
                "dernier_message_date": dernier["created_at"] if dernier else p["created_at"],
            }
        )

    resultat.sort(key=lambda r: r["dernier_message_date"] or datetime.min, reverse=True)
    return resultat[:limite]
