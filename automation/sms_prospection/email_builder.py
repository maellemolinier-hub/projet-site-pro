"""Construction de l'e-mail de prospection personnalisé, avec lien de
désabonnement obligatoire (équivalent e-mail de la mention STOP en SMS).

Conformité :
- Le lien de désabonnement (`build_unsubscribe_link`) est TOUJOURS inséré par
  le code, jamais laissé à la discrétion d'un gabarit modifiable en amont.
- Le contenu (sujet + HTML) est possédé par ce module, pas par un template
  géré côté Brevo : une seule source de vérité, comme pour message_builder.py.
"""
from __future__ import annotations

from dataclasses import dataclass

from . import secteurs_store
from .config import settings
from .models import Prospect


@dataclass
class MessageEmail:
    sujet: str
    html: str


def build_booking_link(prospect: Prospect) -> str:
    if not prospect.booking_token:
        raise ValueError("Le prospect n'a pas encore de booking_token (voir booking.py)")
    return f"{settings.booking_base_url}/{prospect.booking_token}"


def build_unsubscribe_link(prospect: Prospect) -> str:
    if not prospect.booking_token:
        raise ValueError("Le prospect n'a pas encore de booking_token (voir booking.py)")
    return f"{settings.unsubscribe_base_url}/{prospect.booking_token}"


_GABARIT_HTML = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Cap Entreprendre France</title>
</head>
<body style="margin:0; padding:0; background:#0d1420;">
  <div style="max-width:600px; margin:0 auto; background:#0d1420;">
    <div style="padding:26px 32px; background:#0d1420; border-bottom:1px solid #1c2434;">
      <div style="color:#fff; font-size:17px; font-weight:700; letter-spacing:.2px; font-family: Arial, Helvetica, sans-serif;">
        Cap Entreprendre <span style="color:#ff6b35;">France</span>
      </div>
    </div>
    <div style="padding:34px 32px 30px;">
      <p style="color:#35d0c0; font-size:11.5px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; margin:0 0 12px; font-family: Arial, Helvetica, sans-serif;">
        Audit digital gratuit
      </p>
      <h1 style="color:#fff; font-size:22px; line-height:1.35; margin:0 0 16px; font-weight:700; font-family: Arial, Helvetica, sans-serif;">
        Bonjour {prenom}, votre activité mérite d'être visible en ligne.
      </h1>
      <p style="color:#c3cad6; font-size:14.5px; line-height:1.65; margin:0 0 15px; font-family: Arial, Helvetica, sans-serif;">
        Nous accompagnons les <span style="color:#35d0c0; font-weight:700;">{secteur_label}</span> partout en France
        à se digitaliser rapidement&nbsp;: site internet professionnel, prise de rendez-vous en ligne,
        et {assistant_ia} pour répondre à vos clients même quand vous êtes sur un chantier.
      </p>
      <p style="color:#c3cad6; font-size:14.5px; line-height:1.65; margin:0 0 15px; font-family: Arial, Helvetica, sans-serif;">
        Avec le <span style="color:#35d0c0; font-weight:700;">Pack Digitalisation</span>, tout est prêt en quelques jours —
        aucune compétence technique requise de votre côté.
      </p>
      <div style="text-align:center; margin:26px 0 6px;">
        <a href="{lien_reservation}" style="display:inline-block; background:#ff6b35; color:#0d1420; font-weight:700; font-size:14.5px; padding:13px 26px; border-radius:7px; text-decoration:none; font-family: Arial, Helvetica, sans-serif;">
          Réserver mon audit gratuit (15 min)
        </a>
        <div style="color:#5b6572; font-size:12px; margin-top:10px; font-family: Arial, Helvetica, sans-serif;">
          Aucun engagement — on regarde ensemble ce qui serait utile pour vous.
        </div>
      </div>
      <hr style="border:none; border-top:1px solid #1c2434; margin:30px 0;" />
      <p style="color:#c3cad6; font-size:13.5px; line-height:1.6; font-family: Arial, Helvetica, sans-serif;">
        À bientôt,<br />
        <b style="color:#fff;">Maëlle — Cap Entreprendre France</b>
      </p>
    </div>
    <div style="padding:20px 32px 26px; background:#080d16;">
      <p style="color:#4b5563; font-size:11.5px; line-height:1.6; margin:0 0 5px; font-family: Arial, Helvetica, sans-serif;">
        Cap Entreprendre France — vous recevez cet e-mail dans le cadre d'une prospection professionnelle (B2B).
      </p>
      <p style="color:#4b5563; font-size:11.5px; line-height:1.6; margin:0; font-family: Arial, Helvetica, sans-serif;">
        <a href="{lien_desabonnement}" style="color:#7a8494;">Se désinscrire</a> de ces e-mails à tout moment.
      </p>
    </div>
  </div>
</body>
</html>
"""


def build_email_message(
    prospect: Prospect,
    lien_reservation: str | None = None,
    lien_desabonnement: str | None = None,
) -> MessageEmail:
    """Construit l'e-mail de prospection BtoB personnalisé (sujet + HTML)."""
    secteur = secteurs_store.get(prospect.secteur)
    lien_res = lien_reservation or build_booking_link(prospect)
    lien_desab = lien_desabonnement or build_unsubscribe_link(prospect)

    sujet = f"{prospect.prenom}, votre activité mérite d'être visible en ligne"
    html = _GABARIT_HTML.format(
        prenom=prospect.prenom,
        secteur_label=secteur.label_pluriel,
        assistant_ia=secteur.assistant_ia,
        lien_reservation=lien_res,
        lien_desabonnement=lien_desab,
    )
    return MessageEmail(sujet=sujet, html=html)
