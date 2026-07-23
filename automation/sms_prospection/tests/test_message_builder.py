from automation.sms_prospection.config import settings
from automation.sms_prospection.message_builder import build_sms_message
from automation.sms_prospection.models import Prospect


def _prospect(**overrides):
    base = dict(
        prenom="Julien",
        phone="+33612345678",
        secteur="plombier",
        nom="Julien Plomberie SARL",
        booking_token="tok123",
    )
    base.update(overrides)
    return Prospect(**base)


def test_message_contient_prenom_secteur_et_assistant_ia():
    message = build_sms_message(_prospect())
    assert "Julien" in message.texte
    assert "plombiers" in message.texte
    assert "Assistant IA Plomberie" in message.texte
    assert "Pack Digitalisation" in message.texte


def test_message_contient_toujours_la_mention_stop():
    message = build_sms_message(_prospect())
    assert settings.stop_mention in message.texte


def test_message_contient_le_lien_de_reservation():
    message = build_sms_message(_prospect())
    assert f"{settings.booking_base_url}/tok123" in message.texte


def test_message_sans_token_leve_une_erreur():
    prospect = _prospect(booking_token=None)
    try:
        build_sms_message(prospect)
        assert False, "une ValueError était attendue"
    except ValueError:
        pass


def test_comptage_segments_court_message():
    message = build_sms_message(_prospect(prenom="Jo"))
    assert message.encodage in ("GSM-7", "UCS-2")
    assert message.nb_segments >= 1
