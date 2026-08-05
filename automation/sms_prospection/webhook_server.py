"""Serveur FastAPI exposant :

- `POST /webhooks/sms-inbound` : réception des réponses SMS entrantes
  (branché sur le webhook "inbound SMS" du fournisseur, ou relayé depuis Make).
  Détecte les mots-clés STOP et alimente automatiquement la liste noire.
- `GET  /reserver/{token}`     : page de réservation (créneaux libres Google
  Agenda) pour le prospect identifié par son token unique.
- `POST /reserver/{token}`     : confirme un créneau -> crée l'événement
  "Audit de [Nom du Prospect]" dans Google Agenda.

Lancement : `uvicorn automation.sms_prospection.webhook_server:app --port 8010`
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from html import escape

from fastapi import Body, FastAPI, Header, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy import select, update

from . import secteurs_store
from .blacklist import add_to_blacklist
from .booking import get_prospect_by_token
from .config import settings
from .conversations import journaliser_message
from .db import get_engine, sms_prospect
from .events import enregistrer_evenement
from .google_calendar import Creneau, create_audit_event, list_free_slots

logger = logging.getLogger(__name__)
app = FastAPI(title="Assistant de prospection SMS & e-mail — Cap Entreprendre France")


def _verifier_secret(x_webhook_secret: str | None) -> None:
    if settings.webhook_shared_secret and x_webhook_secret != settings.webhook_shared_secret:
        raise HTTPException(status_code=401, detail="Secret webhook invalide")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/webhooks/sms-inbound")
def sms_inbound(
    payload: dict = Body(...),
    x_webhook_secret: str | None = Header(default=None),
) -> dict:
    """Corps attendu (adapter le mapping Make si le fournisseur diffère) :
    {"from": "+33612345678", "text": "STOP"}
    """
    _verifier_secret(x_webhook_secret)

    phone = payload.get("from") or payload.get("phone") or payload.get("msisdn")
    texte_brut = payload.get("text") or payload.get("message") or ""
    texte = texte_brut.strip().lower()

    if not phone:
        raise HTTPException(status_code=400, detail="Champ 'from'/'phone' manquant")

    engine = get_engine()
    with engine.connect() as conn:
        prospect_row = conn.execute(
            select(sms_prospect).where(sms_prospect.c.phone == phone)
        ).mappings().first()
    prospect_id = prospect_row["id"] if prospect_row else None
    prenom = prospect_row["prenom"] if prospect_row else phone

    if prospect_id is not None:
        journaliser_message(prospect_id, "entrant", "prospect", texte_brut)

    if any(mot in texte for mot in settings.stop_keywords):
        ajoute = add_to_blacklist(phone, source="stop_sms")
        with engine.begin() as conn:
            conn.execute(
                update(sms_prospect)
                .where(sms_prospect.c.phone == phone)
                .values(statut="stop")
            )
        enregistrer_evenement(
            "stop_recu",
            f"{prenom} s'est désinscrit (STOP)",
            detail=texte_brut,
            niveau="alerte",
            prospect_id=prospect_id,
        )
        logger.info("STOP reçu de %s (nouvellement ajouté=%s)", phone, ajoute)
        return {"traite": True, "action": "blacklist", "nouveau": ajoute}

    enregistrer_evenement(
        "reponse_prospect",
        f"Réponse de {prenom}",
        detail=texte_brut,
        prospect_id=prospect_id,
    )
    return {"traite": True, "action": "aucune"}


def _page_html(corps: str) -> str:
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Réserver un audit gratuit — Cap Entreprendre France</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {{ font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; padding: 0 16px; }}
h1 {{ font-size: 1.3rem; }}
.creneau {{ display: block; width: 100%; margin: 6px 0; padding: 10px; border: 1px solid #ccc;
            border-radius: 8px; background: #f7f7f7; cursor: pointer; text-align: left; }}
.creneau:hover {{ background: #eee; }}
</style></head>
<body>{corps}</body></html>"""


@app.get("/reserver/{token}", response_class=HTMLResponse)
def page_reservation(token: str) -> str:
    prospect = get_prospect_by_token(token)
    if prospect is None:
        raise HTTPException(status_code=404, detail="Lien de réservation invalide")

    if prospect.statut == "rdv_pris":
        return _page_html(f"<h1>Rendez-vous déjà confirmé</h1><p>À bientôt, {escape(prospect.prenom)} !</p>")

    secteur = secteurs_store.get(prospect.secteur)
    creneaux = list_free_slots()
    boutons = "".join(
        f'<form method="post" action="/reserver/{token}">'
        f'<input type="hidden" name="creneau" value="{c.debut.isoformat()}">'
        f'<button class="creneau" type="submit">'
        f'{c.debut.strftime("%A %d/%m à %Hh%M")}</button></form>'
        for c in creneaux[:20]
    )
    corps = (
        f"<h1>Réservez votre audit {escape(secteur.assistant_ia)}</h1>"
        f"<p>Bonjour {escape(prospect.prenom)}, choisissez un créneau :</p>"
        f"{boutons or '<p>Aucun créneau disponible pour le moment.</p>'}"
    )
    return _page_html(corps)


@app.post("/reserver/{token}", response_class=HTMLResponse)
def confirmer_reservation(token: str, creneau: str = Body(..., embed=True)) -> str:
    prospect = get_prospect_by_token(token)
    if prospect is None:
        raise HTTPException(status_code=404, detail="Lien de réservation invalide")
    if prospect.statut == "rdv_pris":
        return _page_html("<h1>Rendez-vous déjà confirmé</h1>")

    debut = datetime.fromisoformat(creneau)
    fin = debut + timedelta(minutes=settings.booking_slot_duration_minutes)

    create_audit_event(prospect, Creneau(debut=debut, fin=fin))

    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(
            update(sms_prospect)
            .where(sms_prospect.c.id == prospect.id)
            .values(statut="rdv_pris", date_rdv=debut)
        )

    enregistrer_evenement(
        "rdv_pris",
        f"RDV pris — Audit de {prospect.nom_pour_rdv}",
        detail=f"Créneau : {debut.strftime('%d/%m/%Y à %Hh%M')}",
        prospect_id=prospect.id,
    )

    return _page_html(
        f"<h1>Rendez-vous confirmé !</h1>"
        f"<p>Audit de {escape(prospect.nom_pour_rdv)} le {debut.strftime('%d/%m/%Y à %Hh%M')}. "
        f"Vous recevrez une invitation Google Agenda.</p>"
    )
