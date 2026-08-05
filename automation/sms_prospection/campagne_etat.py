"""État global de la campagne (pause / reprise) — ligne singleton en base,
consultée par `campaign.envoyer_campagne` avant chaque envoi."""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import insert, select, update

from .db import campaign_state, get_engine
from .events import enregistrer_evenement


@dataclass
class EtatCampagne:
    en_pause: bool
    motif: str | None


def _ligne_singleton(conn) -> int | None:
    row = conn.execute(select(campaign_state.c.id)).first()
    return row[0] if row else None


def obtenir_etat() -> EtatCampagne:
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(select(campaign_state)).mappings().first()
    if row is None:
        return EtatCampagne(en_pause=False, motif=None)
    return EtatCampagne(en_pause=bool(row["en_pause"]), motif=row["motif"])


def mettre_en_pause(motif: str | None = None) -> None:
    engine = get_engine()
    with engine.begin() as conn:
        id_ligne = _ligne_singleton(conn)
        if id_ligne is None:
            conn.execute(insert(campaign_state).values(en_pause=True, motif=motif))
        else:
            conn.execute(
                update(campaign_state).where(campaign_state.c.id == id_ligne).values(
                    en_pause=True, motif=motif
                )
            )
    enregistrer_evenement(
        "action_pilote", "Campagne mise en pause", detail=motif, niveau="alerte"
    )


def reprendre() -> None:
    engine = get_engine()
    with engine.begin() as conn:
        id_ligne = _ligne_singleton(conn)
        if id_ligne is None:
            conn.execute(insert(campaign_state).values(en_pause=False, motif=None))
        else:
            conn.execute(
                update(campaign_state).where(campaign_state.c.id == id_ligne).values(
                    en_pause=False, motif=None
                )
            )
    enregistrer_evenement("action_pilote", "Campagne reprise")
