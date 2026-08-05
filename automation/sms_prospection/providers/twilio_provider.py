"""Envoi de SMS via l'API Twilio (fournisseur alternatif)."""
from __future__ import annotations

import logging

import httpx

from ..config import settings
from .base import SmsProvider, SmsResult

logger = logging.getLogger(__name__)


class TwilioSmsProvider(SmsProvider):
    def __init__(
        self,
        account_sid: str | None = None,
        auth_token: str | None = None,
        from_number: str | None = None,
    ) -> None:
        self.account_sid = account_sid or settings.twilio_account_sid
        self.auth_token = auth_token or settings.twilio_auth_token
        self.from_number = from_number or settings.twilio_from_number
        if not (self.account_sid and self.auth_token and self.from_number):
            raise RuntimeError(
                "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER manquants"
            )

    def send(self, phone: str, message: str) -> SmsResult:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        try:
            response = httpx.post(
                url,
                data={"To": phone, "From": self.from_number, "Body": message},
                auth=(self.account_sid, self.auth_token),
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            return SmsResult(succes=True, provider_ref=data.get("sid"))
        except httpx.HTTPStatusError as exc:
            erreur = f"HTTP {exc.response.status_code} : {exc.response.text}"
            logger.error("Échec envoi SMS Twilio à %s : %s", phone, erreur)
            return SmsResult(succes=False, erreur=erreur)
        except httpx.HTTPError as exc:
            logger.error("Échec envoi SMS Twilio à %s : %s", phone, exc)
            return SmsResult(succes=False, erreur=str(exc))
