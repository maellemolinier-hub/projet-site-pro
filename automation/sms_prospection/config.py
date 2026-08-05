"""Configuration centralisée de l'assistant de prospection SMS.

Toutes les valeurs sont surchargeables via variables d'environnement
(voir `.env.example`). Aucun secret n'est codé en dur ici.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _bool(name: str, default: bool) -> bool:
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "oui", "on")


@dataclass(frozen=True)
class Settings:
    # ── Identité de l'expéditeur (obligatoire pour la conformité RGPD/SMS) ──
    company_name: str = os.environ.get("COMPANY_NAME", "Cap Entreprendre France")
    sms_sender_id: str = os.environ.get("SMS_SENDER_ID", "CapEntFR")

    # ── Fournisseur SMS ──────────────────────────────────────────────────
    sms_provider: str = os.environ.get("SMS_PROVIDER", "brevo")  # brevo | twilio
    brevo_api_key: str = os.environ.get("BREVO_API_KEY", "")
    twilio_account_sid: str = os.environ.get("TWILIO_ACCOUNT_SID", "")
    twilio_auth_token: str = os.environ.get("TWILIO_AUTH_TOKEN", "")
    twilio_from_number: str = os.environ.get("TWILIO_FROM_NUMBER", "")

    # ── E-mail (Brevo, transactionnel) ──────────────────────────────────
    email_sender: str = os.environ.get("EMAIL_SENDER", "maelle.molinier@gmail.com")
    email_sender_name: str = os.environ.get("EMAIL_SENDER_NAME", "Cap entreprendre France")
    unsubscribe_base_url: str = os.environ.get(
        "UNSUBSCRIBE_BASE_URL", "http://localhost:8020/desabonnement"
    )

    # ── Base de données (Postgres/Supabase si DATABASE_URL défini,
    #    sinon fichier SQLite local — zéro configuration en dev) ──────────
    database_url: str = os.environ.get(
        "SMS_PROSPECTION_DATABASE_URL",
        os.environ.get("DATABASE_URL", "") or "sqlite:////tmp/sms_prospection.db",
    )

    # ── Prise de rendez-vous / Google Agenda ────────────────────────────
    # "primary" ne fonctionne QUE si l'agenda appartient au compte de service
    # lui-même — pour agir sur votre propre agenda, mettez ici l'adresse
    # e-mail du compte Google dont l'agenda a été partagé avec le compte de
    # service (voir README.md).
    google_calendar_id: str = os.environ.get("GOOGLE_CALENDAR_ID", "primary")
    google_service_account_file: str = os.environ.get(
        "GOOGLE_SERVICE_ACCOUNT_FILE", "service-account.json"
    )
    # Contenu JSON complet de la clé de compte de service, en variable
    # d'environnement — nécessaire en production serverless (Vercel), où
    # déposer un fichier n'est pas possible. Prioritaire sur
    # GOOGLE_SERVICE_ACCOUNT_FILE quand renseigné.
    google_service_account_json: str = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    booking_base_url: str = os.environ.get(
        "BOOKING_BASE_URL", "http://localhost:8010/reserver"
    )
    booking_slot_duration_minutes: int = int(
        os.environ.get("BOOKING_SLOT_DURATION_MINUTES", "30")
    )
    booking_business_hours: tuple[int, int] = (9, 18)
    booking_lookahead_days: int = int(os.environ.get("BOOKING_LOOKAHEAD_DAYS", "10"))
    booking_timezone: str = os.environ.get("BOOKING_TIMEZONE", "Europe/Paris")

    # ── Campagne ─────────────────────────────────────────────────────────
    daily_quota: int = int(os.environ.get("CAMPAIGN_DAILY_QUOTA", "200"))
    seconds_between_sms: float = float(os.environ.get("SECONDS_BETWEEN_SMS", "2"))
    dry_run: bool = _bool("CAMPAIGN_DRY_RUN", True)

    # ── Conformité RGPD ──────────────────────────────────────────────────
    stop_keywords: tuple[str, ...] = ("stop", "arret", "arrêt", "desinscription", "désinscription")
    stop_mention: str = "Rép STOP pour ne plus recevoir de SMS."

    # ── Webhook / serveur ────────────────────────────────────────────────
    webhook_shared_secret: str = os.environ.get("SMS_WEBHOOK_SECRET", "")

    # ── Centre de pilotage (chat IA — Gemini) ───────────────────────────
    gemini_api_key: str = os.environ.get("GEMINI_API_KEY", "")
    gemini_model: str = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
    copilot_cors_origins: tuple[str, ...] = tuple(
        o.strip()
        for o in os.environ.get(
            "COPILOT_CORS_ORIGINS",
            "http://localhost:3010,https://cap-entreprendre-copilot.vercel.app",
        ).split(",")
        if o.strip()
    )


settings = Settings()
