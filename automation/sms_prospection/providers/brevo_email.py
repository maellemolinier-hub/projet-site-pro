"""Envoi d'e-mails transactionnels via l'API Brevo (ex-Sendinblue).

Documentation : https://developers.brevo.com/reference/sendtransacemail
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

from ..config import settings

logger = logging.getLogger(__name__)

_BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email"


@dataclass
class EmailResult:
    succes: bool
    provider_ref: str | None = None
    erreur: str | None = None


class BrevoEmailProvider:
    def __init__(self, api_key: str | None = None, sender_email: str | None = None, sender_name: str | None = None) -> None:
        self.api_key = api_key or settings.brevo_api_key
        self.sender_email = sender_email or settings.email_sender
        self.sender_name = sender_name or settings.email_sender_name
        if not self.api_key:
            raise RuntimeError("BREVO_API_KEY manquant — voir .env.example")

    def send(self, email: str, sujet: str, html: str) -> EmailResult:
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        payload = {
            "sender": {"name": self.sender_name, "email": self.sender_email},
            "to": [{"email": email}],
            "subject": sujet,
            "htmlContent": html,
        }
        try:
            response = httpx.post(_BREVO_EMAIL_ENDPOINT, json=payload, headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            return EmailResult(succes=True, provider_ref=str(data.get("messageId", "")))
        except httpx.HTTPStatusError as exc:
            erreur = f"HTTP {exc.response.status_code} : {exc.response.text}"
            logger.error("Échec envoi e-mail Brevo à %s : %s", email, erreur)
            return EmailResult(succes=False, erreur=erreur)
        except httpx.HTTPError as exc:
            logger.error("Échec envoi e-mail Brevo à %s : %s", email, exc)
            return EmailResult(succes=False, erreur=str(exc))
