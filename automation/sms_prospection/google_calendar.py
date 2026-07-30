"""Intégration Google Agenda : créneaux libres + création de l'événement de RDV.

L'événement créé est systématiquement nommé "Audit de [Nom du Prospect]",
conformément à la demande. Authentification via compte de service Google,
avec délégation sur l'agenda cible (GOOGLE_CALENDAR_ID) — voir README.md
pour la procédure de configuration complète.

Deux façons de fournir les identifiants du compte de service :
- GOOGLE_SERVICE_ACCOUNT_JSON : le contenu JSON complet de la clé, dans une
  variable d'environnement — nécessaire sur les plateformes serverless
  (Vercel...) qui ne permettent pas d'y déposer un fichier.
- GOOGLE_SERVICE_ACCOUNT_FILE : chemin vers un fichier JSON local — pratique
  en développement, mais inutilisable en production serverless.

Les imports Google (googleapiclient / google-auth) sont volontairement faits
à l'intérieur des fonctions : les modules de personnalisation/liste noire du
projet restent utilisables (et testables) sans cette dépendance installée.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timedelta

from .config import settings
from .models import Prospect

_SCOPES = ["https://www.googleapis.com/auth/calendar"]


class GoogleCalendarConfigError(RuntimeError):
    pass


@dataclass
class Creneau:
    debut: datetime
    fin: datetime


def _get_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    if settings.google_service_account_json:
        try:
            infos = json.loads(settings.google_service_account_json)
        except json.JSONDecodeError as exc:
            raise GoogleCalendarConfigError(
                "GOOGLE_SERVICE_ACCOUNT_JSON n'est pas un JSON valide."
            ) from exc
        credentials = service_account.Credentials.from_service_account_info(infos, scopes=_SCOPES)
    else:
        credentials = service_account.Credentials.from_service_account_file(
            settings.google_service_account_file, scopes=_SCOPES
        )
    return build("calendar", "v3", credentials=credentials, cache_discovery=False)


def list_free_slots(
    jours_max: int | None = None,
    duree_minutes: int | None = None,
    maintenant: datetime | None = None,
) -> list[Creneau]:
    """Renvoie les créneaux libres (heures ouvrées) sur les prochains jours,
    en excluant les plages occupées de l'agenda (requête freebusy)."""
    from zoneinfo import ZoneInfo

    tz = ZoneInfo(settings.booking_timezone)
    jours_max = jours_max or settings.booking_lookahead_days
    duree = timedelta(minutes=duree_minutes or settings.booking_slot_duration_minutes)
    debut_journee_h, fin_journee_h = settings.booking_business_hours

    now = maintenant or datetime.now(tz)
    time_min = now
    time_max = now + timedelta(days=jours_max)

    service = _get_service()
    freebusy = service.freebusy().query(
        body={
            "timeMin": time_min.isoformat(),
            "timeMax": time_max.isoformat(),
            "timeZone": settings.booking_timezone,
            "items": [{"id": settings.google_calendar_id}],
        }
    ).execute()
    occupe = freebusy["calendars"][settings.google_calendar_id]["busy"]
    plages_occupees = [
        (datetime.fromisoformat(b["start"]), datetime.fromisoformat(b["end"])) for b in occupe
    ]

    creneaux: list[Creneau] = []
    jour = now.date()
    for _ in range(jours_max):
        if jour.weekday() < 5:  # lundi-vendredi uniquement
            curseur = datetime.combine(jour, datetime.min.time(), tzinfo=tz).replace(
                hour=debut_journee_h
            )
            fin_journee = curseur.replace(hour=fin_journee_h)
            while curseur + duree <= fin_journee:
                fin_creneau = curseur + duree
                if curseur > now and not any(
                    curseur < occ_fin and fin_creneau > occ_debut
                    for occ_debut, occ_fin in plages_occupees
                ):
                    creneaux.append(Creneau(debut=curseur, fin=fin_creneau))
                curseur += duree
        jour += timedelta(days=1)

    return creneaux


def create_audit_event(prospect: Prospect, creneau: Creneau) -> dict:
    """Crée l'événement Google Agenda "Audit de [Nom du Prospect]"."""
    from . import secteurs_store

    secteur = secteurs_store.get(prospect.secteur)
    event_body = {
        "summary": f"Audit de {prospect.nom_pour_rdv}",
        "description": (
            f"Audit digital gratuit — {secteur.assistant_ia}\n"
            f"Prospect : {prospect.prenom} {prospect.nom or ''}\n"
            f"Secteur : {prospect.secteur}\n"
            f"Téléphone : {prospect.phone}\n"
            f"Ville : {prospect.ville or 'N/A'}\n"
            f"Origine : campagne SMS prospection"
        ),
        "start": {"dateTime": creneau.debut.isoformat(), "timeZone": settings.booking_timezone},
        "end": {"dateTime": creneau.fin.isoformat(), "timeZone": settings.booking_timezone},
        "reminders": {"useDefault": True},
    }
    if prospect.email:
        event_body["attendees"] = [{"email": prospect.email}]

    service = _get_service()
    return service.events().insert(
        calendarId=settings.google_calendar_id, body=event_body, sendUpdates="all"
    ).execute()
