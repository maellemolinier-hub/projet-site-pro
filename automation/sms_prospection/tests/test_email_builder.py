from automation.sms_prospection.config import settings
from automation.sms_prospection.email_builder import build_email_message
from automation.sms_prospection.models import Prospect


def _prospect(**overrides):
    base = dict(
        prenom="Julien",
        phone="+33612345678",
        secteur="plombier",
        nom="Julien Plomberie SARL",
        email="julien@plomberie-exemple.fr",
        booking_token="tok123",
    )
    base.update(overrides)
    return Prospect(**base)


def test_email_contient_prenom_secteur_et_assistant_ia():
    message = build_email_message(_prospect())
    assert "Julien" in message.html
    assert "plombiers" in message.html
    assert "Assistant IA Plomberie" in message.html
    assert "Pack Digitalisation" in message.html
    assert "Julien" in message.sujet


def test_email_contient_toujours_un_lien_de_desabonnement():
    message = build_email_message(_prospect())
    assert f"{settings.unsubscribe_base_url}/tok123" in message.html


def test_email_contient_le_lien_de_reservation():
    message = build_email_message(_prospect())
    assert f"{settings.booking_base_url}/tok123" in message.html


def test_email_sans_token_leve_une_erreur():
    prospect = _prospect(booking_token=None)
    try:
        build_email_message(prospect)
        assert False, "une ValueError était attendue"
    except ValueError:
        pass
