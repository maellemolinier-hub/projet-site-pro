"""Journal d'activité / alertes — alimente le tableau de bord du centre de
pilotage (une entrée par catégorie : envoi SMS, réponse prospect, STOP, RDV
pris, action du pilote IA, alerte technique...).
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import insert, select, update

from .db import get_engine, sms_event

CATEGORIES = (
    "sms_envoye",
    "sms_erreur",
    "reponse_prospect",
    "stop_recu",
    "rdv_pris",
    "action_pilote",
    "commande",
    "alerte_technique",
)


@dataclass
class Evenement:
    id: int
    categorie: str
    niveau: str
    titre: str
    detail: str | None
    prospect_id: int | None
    lu: bool
    created_at: datetime


def enregistrer_evenement(
    categorie: str,
    titre: str,
    detail: str | None = None,
    niveau: str = "info",
    prospect_id: int | None = None,
) -> int:
    engine = get_engine()
    with engine.begin() as conn:
        result = conn.execute(
            insert(sms_event).values(
                categorie=categorie,
                niveau=niveau,
                titre=titre,
                detail=detail,
                prospect_id=prospect_id,
            )
        )
        return result.inserted_primary_key[0]


def lister_evenements(
    categorie: str | None = None, non_lus_seulement: bool = False, limite: int = 100
) -> list[Evenement]:
    engine = get_engine()
    requete = select(sms_event).order_by(sms_event.c.created_at.desc()).limit(limite)
    if categorie:
        requete = requete.where(sms_event.c.categorie == categorie)
    if non_lus_seulement:
        requete = requete.where(sms_event.c.lu.is_(False))

    with engine.connect() as conn:
        rows = conn.execute(requete).mappings().all()
    return [Evenement(**dict(r)) for r in rows]


def compter_non_lus_par_categorie() -> dict[str, int]:
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(
            select(sms_event.c.categorie).where(sms_event.c.lu.is_(False))
        ).all()
    compteurs = {c: 0 for c in CATEGORIES}
    for (categorie,) in rows:
        compteurs[categorie] = compteurs.get(categorie, 0) + 1
    return compteurs


def marquer_lu(evenement_id: int) -> None:
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(
            update(sms_event).where(sms_event.c.id == evenement_id).values(lu=True)
        )


def marquer_categorie_lue(categorie: str) -> None:
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(
            update(sms_event).where(sms_event.c.categorie == categorie).values(lu=True)
        )
