"""Construction du message SMS personnalisé, avec mention STOP obligatoire.

Conformité :
- La mention STOP (`config.settings.stop_mention`) est TOUJOURS ajoutée par le
  code, jamais laissée à la discrétion d'un template modifiable en amont — un
  gabarit personnalisé ne peut donc jamais l'omettre par erreur.
- L'identité de l'expéditeur (`COMPANY_NAME`) apparaît dans le corps du message.
"""
from __future__ import annotations

from dataclasses import dataclass

from . import secteurs_store
from .config import settings
from .models import Prospect

# GSM-7 : 160 caractères/segment (153 si multi-segments).
# Dès qu'un caractère hors GSM-7 est présent (emoji, certains accents rares),
# l'encodage bascule en UCS-2 : 70 caractères/segment (67 si multi-segments).
_GSM7_CHARSET = (
    "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?"
    "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà"
)


def _is_gsm7(text: str) -> bool:
    return all(c in _GSM7_CHARSET for c in text)


@dataclass
class MessageSMS:
    texte: str
    nb_caracteres: int
    encodage: str    # "GSM-7" ou "UCS-2"
    nb_segments: int


def build_booking_link(prospect: Prospect) -> str:
    if not prospect.booking_token:
        raise ValueError("Le prospect n'a pas encore de booking_token (voir booking.py)")
    return f"{settings.booking_base_url}/{prospect.booking_token}"


def build_sms_message(prospect: Prospect, lien_reservation: str | None = None) -> MessageSMS:
    """Construit le SMS de prospection BtoB personnalisé.

    Exemple de rendu :
      "Bonjour Julien, Votre Entreprise crée des sites internet qui vous
       appartiennent et des assistants IA pour les plombiers.
       Réservez un audit gratuit : https://.../reserver/abc123
       Rép STOP pour ne plus recevoir de SMS."
    """
    secteur = secteurs_store.get(prospect.secteur)
    lien = lien_reservation or build_booking_link(prospect)

    corps = (
        f"Bonjour {prospect.prenom}, {settings.company_name} crée des sites "
        f"internet qui vous appartiennent et des assistants IA ({secteur.assistant_ia}) "
        f"pour les {secteur.label_pluriel}. "
        f"Réservez un audit gratuit : {lien}"
    )
    texte = f"{corps} {settings.stop_mention}"

    encodage = "GSM-7" if _is_gsm7(texte) else "UCS-2"
    taille_segment = 160 if encodage == "GSM-7" else 70
    taille_segment_multi = 153 if encodage == "GSM-7" else 67
    n = len(texte)
    nb_segments = 1 if n <= taille_segment else -(-n // taille_segment_multi)  # ceil

    return MessageSMS(texte=texte, nb_caracteres=n, encodage=encodage, nb_segments=nb_segments)
