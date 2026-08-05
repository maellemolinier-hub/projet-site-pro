import pytest

from automation.sms_prospection.phone_utils import NumeroInvalide, normaliser_e164


@pytest.mark.parametrize(
    "entree,attendu",
    [
        ("06 12 34 56 78", "+33612345678"),
        ("0612345678", "+33612345678"),
        ("+33612345678", "+33612345678"),
        ("0033612345678", "+33612345678"),
        ("06.12.34.56.78", "+33612345678"),
    ],
)
def test_normalisation(entree, attendu):
    assert normaliser_e164(entree) == attendu


def test_numero_vide_invalide():
    with pytest.raises(NumeroInvalide):
        normaliser_e164("")


def test_numero_trop_court_invalide():
    with pytest.raises(NumeroInvalide):
        normaliser_e164("01")
