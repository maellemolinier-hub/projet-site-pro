"""Interface commune à tous les fournisseurs SMS (permet de changer de
gateway — Brevo, Twilio, OVH, SMSFactor... — sans toucher au reste du code)."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class SmsResult:
    succes: bool
    provider_ref: str | None = None
    erreur: str | None = None


class SmsProvider(ABC):
    @abstractmethod
    def send(self, phone: str, message: str) -> SmsResult:
        """Envoie un SMS unitaire au numéro E.164 donné."""
        raise NotImplementedError
