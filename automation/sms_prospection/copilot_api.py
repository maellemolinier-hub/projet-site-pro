"""API REST du centre de pilotage (application séparée `apps/copilot`) :

- Activité : journal d'événements par catégorie, avec compteurs non-lus (alertes).
- Campagne : état, pause, reprise.
- Liste noire : consultation, ajout, retrait manuel.
- Prospects : liste + fil de conversation + réponse manuelle.
- Secteurs : argumentaire/offres éditables par secteur.
- Chat IA : pilote (function-calling, actions réelles) et assistants sectoriels.

Monte également les routes de `webhook_server.py` (page de réservation
`/reserver/{token}`, webhook SMS entrant) : les deux vivaient dans des apps
FastAPI séparées, mais un seul déploiement public existe (celui-ci) — sans ce
montage, les liens de réservation envoyés par SMS/e-mail renvoient un 404.

Lancement : `uvicorn automation.sms_prospection.copilot_api:app --port 8020`
"""
from __future__ import annotations

from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from . import assistant_pilote, assistant_sectoriel, campagne_etat, conversations, secteurs_store
from .blacklist import add_to_blacklist, lister_blacklist, retirer_de_la_blacklist
from .booking import get_prospect_by_token
from .campaign import envoyer_message_manuel, obtenir_prospect
from .config import settings
from .email_blacklist import add_to_blacklist as add_email_to_blacklist
from .email_blacklist import lister_blacklist as lister_email_blacklist
from .email_blacklist import retirer_de_la_blacklist as retirer_email_de_la_blacklist
from .events import CATEGORIES, compter_non_lus_par_categorie, lister_evenements, marquer_categorie_lue, marquer_lu
from .gemini_client import GeminiError
from .phone_utils import NumeroInvalide, normaliser_e164

app = FastAPI(title="Centre de pilotage — Assistant de prospection SMS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.copilot_cors_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


# ── Activité ──────────────────────────────────────────────────────────────

@app.get("/api/activite")
def activite(
    categorie: str | None = Query(default=None),
    non_lus_seulement: bool = Query(default=False),
    limite: int = Query(default=100, le=500),
) -> dict:
    evenements = lister_evenements(categorie=categorie, non_lus_seulement=non_lus_seulement, limite=limite)
    return {
        "evenements": [vars(e) for e in evenements],
        "compteurs_non_lus": compter_non_lus_par_categorie(),
        "categories": CATEGORIES,
    }


@app.post("/api/activite/{evenement_id}/lu")
def activite_marquer_lu(evenement_id: int) -> dict:
    marquer_lu(evenement_id)
    return {"ok": True}


@app.post("/api/activite/categorie/{categorie}/lu")
def activite_marquer_categorie_lue(categorie: str) -> dict:
    marquer_categorie_lue(categorie)
    return {"ok": True}


# ── Campagne ─────────────────────────────────────────────────────────────

class PauseBody(BaseModel):
    motif: str | None = None


@app.get("/api/campagne/etat")
def campagne_get_etat() -> dict:
    etat = campagne_etat.obtenir_etat()
    return {"en_pause": etat.en_pause, "motif": etat.motif}


@app.post("/api/campagne/pause")
def campagne_pause(body: PauseBody = Body(default=PauseBody())) -> dict:
    campagne_etat.mettre_en_pause(body.motif)
    return {"ok": True}


@app.post("/api/campagne/reprendre")
def campagne_reprendre() -> dict:
    campagne_etat.reprendre()
    return {"ok": True}


# ── Liste noire ──────────────────────────────────────────────────────────

class BlacklistBody(BaseModel):
    phone: str
    source: str = "manuel_pilotage"


@app.get("/api/blacklist")
def blacklist_lister() -> dict:
    return {"numeros": lister_blacklist()}


@app.post("/api/blacklist")
def blacklist_ajouter(body: BlacklistBody) -> dict:
    try:
        numero = normaliser_e164(body.phone)
    except NumeroInvalide as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    ajoute = add_to_blacklist(numero, source=body.source)
    return {"ok": True, "nouveau": ajoute, "phone": numero}


@app.delete("/api/blacklist/{phone}")
def blacklist_retirer(phone: str) -> dict:
    try:
        numero = normaliser_e164(phone)
    except NumeroInvalide as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    retire = retirer_de_la_blacklist(numero)
    return {"ok": True, "retire": retire}


class BlacklistEmailBody(BaseModel):
    email: str
    source: str = "manuel_pilotage"


@app.get("/api/blacklist-email")
def blacklist_email_lister() -> dict:
    return {"emails": lister_email_blacklist()}


@app.post("/api/blacklist-email")
def blacklist_email_ajouter(body: BlacklistEmailBody) -> dict:
    ajoute = add_email_to_blacklist(body.email, source=body.source)
    return {"ok": True, "nouveau": ajoute, "email": body.email.strip().lower()}


@app.delete("/api/blacklist-email/{email}")
def blacklist_email_retirer(email: str) -> dict:
    retire = retirer_email_de_la_blacklist(email)
    return {"ok": True, "retire": retire}


# ── Désabonnement e-mail (page publique, cliquée depuis un e-mail) ───────

@app.get("/desabonnement/{token}", response_class=HTMLResponse)
def desabonnement(token: str) -> str:
    prospect = get_prospect_by_token(token)
    if prospect is None or not prospect.email:
        titre, message = "Lien invalide", "Ce lien de désabonnement n'est plus valide."
    else:
        add_email_to_blacklist(prospect.email, source="desabonnement_email")
        titre, message = "Désabonnement confirmé", f"{prospect.email} ne recevra plus d'e-mails de Cap Entreprendre France."

    return f"""<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8" /><title>{titre}</title></head>
<body style="font-family: Arial, Helvetica, sans-serif; background:#0d1420; color:#e9ebef; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0;">
  <div style="max-width:420px; text-align:center; padding:32px;">
    <h1 style="font-size:20px;">{titre}</h1>
    <p style="color:#9aa2ad; font-size:14px; line-height:1.6;">{message}</p>
  </div>
</body></html>"""


# ── Prospects & conversations ────────────────────────────────────────────

class MessageManuelBody(BaseModel):
    texte: str


@app.get("/api/prospects")
def prospects_lister(limite: int = Query(default=200, le=500)) -> dict:
    return {"prospects": conversations.lister_prospects_avec_dernier_message(limite)}


@app.get("/api/prospects/{prospect_id}")
def prospects_detail(prospect_id: int) -> dict:
    prospect = obtenir_prospect(prospect_id)
    if prospect is None:
        raise HTTPException(status_code=404, detail="Prospect introuvable")
    fil = conversations.obtenir_fil(prospect_id)
    return {"prospect": vars(prospect), "messages": [vars(m) for m in fil]}


@app.post("/api/prospects/{prospect_id}/messages")
def prospects_envoyer_message(prospect_id: int, body: MessageManuelBody) -> dict:
    resultat = envoyer_message_manuel(prospect_id, body.texte)
    fil = conversations.obtenir_fil(prospect_id)
    return {"resultat": resultat, "messages": [vars(m) for m in fil]}


# ── Secteurs / argumentaire ──────────────────────────────────────────────

class SecteurBody(BaseModel):
    label_pluriel: str | None = None
    assistant_ia: str | None = None
    argumentaire: str | None = None


@app.get("/api/secteurs")
def secteurs_lister() -> dict:
    return {"secteurs": [vars(s) for s in secteurs_store.lister()]}


@app.put("/api/secteurs/{cle}")
def secteurs_mettre_a_jour(cle: str, body: SecteurBody) -> dict:
    config = secteurs_store.mettre_a_jour(
        cle,
        label_pluriel=body.label_pluriel,
        assistant_ia=body.assistant_ia,
        argumentaire=body.argumentaire,
    )
    return {"secteur": vars(config)}


# ── Chat IA ──────────────────────────────────────────────────────────────

class ChatBody(BaseModel):
    message: str
    historique: list[dict] = []


@app.post("/api/chat/pilote")
def chat_pilote(body: ChatBody) -> dict:
    try:
        reponse = assistant_pilote.discuter_avec_pilote(body.message, body.historique)
    except GeminiError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {
        "texte": reponse.texte,
        "actions": [vars(a) for a in reponse.appels_outils],
    }


@app.post("/api/chat/secteur/{cle}")
def chat_secteur(cle: str, body: ChatBody) -> dict:
    try:
        reponse = assistant_sectoriel.discuter_avec_assistant_sectoriel(cle, body.message, body.historique)
    except GeminiError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"texte": reponse.texte}


# ── Réservation & webhook SMS (webhook_server.py) ────────────────────────
# Montées ici (et non déployées séparément) : un seul déploiement public
# expose donc à la fois le centre de pilotage et les liens envoyés aux
# prospects (réservation, STOP SMS).

from .webhook_server import app as _webhook_app  # noqa: E402

app.mount("/", _webhook_app)
