from .base import SmsProvider, SmsResult
from .brevo import BrevoSmsProvider
from .twilio_provider import TwilioSmsProvider

__all__ = ["SmsProvider", "SmsResult", "BrevoSmsProvider", "TwilioSmsProvider", "get_provider"]


def get_provider(name: str | None = None) -> SmsProvider:
    from ..config import settings

    name = (name or settings.sms_provider).strip().lower()
    if name == "brevo":
        return BrevoSmsProvider()
    if name == "twilio":
        return TwilioSmsProvider()
    raise ValueError(f"Fournisseur SMS inconnu : {name!r} (attendu : 'brevo' ou 'twilio')")
