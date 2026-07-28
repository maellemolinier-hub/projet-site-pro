from automation.sms_prospection.email_blacklist import (
    add_to_blacklist,
    bulk_add_to_blacklist,
    is_blacklisted,
    retirer_de_la_blacklist,
)


def test_ajout_et_verification():
    assert not is_blacklisted("contact@exemple.fr")
    ajoute = add_to_blacklist("Contact@Exemple.fr")
    assert ajoute is True
    assert is_blacklisted("contact@exemple.fr")  # normalisation casse cohérente


def test_ajout_idempotent():
    add_to_blacklist("dupont@exemple.fr")
    assert add_to_blacklist("dupont@exemple.fr") is False


def test_ajout_en_masse():
    nb = bulk_add_to_blacklist(["a@exemple.fr", "b@exemple.fr", "a@exemple.fr"])
    assert nb == 2  # le doublon n'est compté qu'une fois


def test_retrait_manuel():
    add_to_blacklist("retrait@exemple.fr")
    assert retirer_de_la_blacklist("retrait@exemple.fr") is True
    assert not is_blacklisted("retrait@exemple.fr")
    assert retirer_de_la_blacklist("retrait@exemple.fr") is False
