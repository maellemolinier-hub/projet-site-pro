"""Envoi de SMS transactionnels via l'API Brevo (ex-Sendinblue).

Documentation : https://developers.brevo.com/reference/sendtransacsms
"""
from __future__ import annotations

import logging

import httpx

from ..config import settings
from .base import SmsProvider, SmsResult

logger = logging.getLogger(__name__)

_BREVO_SMS_ENDPOINT = "https://api.brevo.com/v3/transactionalSMS/sms"


class BrevoSmsProvider(SmsProvider):
    def __init__(self, api_key: str | None = None, sender: str | None = None) -> None:
        self.api_key = api_key or settings.brevo_api_key
        self.sender = sender or settings.sms_sender_id
        if not self.api_key:
            raise RuntimeError("BREVO_API_KEY manquant — voir .env.example")

    def send(self, phone: str, message: str) -> SmsResult:
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        payload = {
            "sender": self.sender,
            "recipient": phone,
            "content": message,
            "type": "transactional",
        }
        try:
            response = httpx.post(_BREVO_SMS_ENDPOINT, json=payload, headers=headers, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            return SmsResult(succes=True, provider_ref=str(data.get("reference", "")))
        except httpx.HTTPStatusError as exc:
            erreur = f"HTTP {exc.response.status_code} : {exc.response.text}"
            logger.error("Échec envoi SMS Brevo à %s : %s", phone, erreur)
            return SmsResult(succes=False, erreur=erreur)
        except httpx.HTTPError as exc:
            logger.error("Échec envoi SMS Brevo à %s : %s", phone, exc)
            return SmsResult(succes=False, erreur=str(exc))
