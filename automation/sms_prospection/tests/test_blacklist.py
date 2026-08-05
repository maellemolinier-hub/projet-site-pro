from automation.sms_prospection.blacklist import (
    add_to_blacklist,
    bulk_add_to_blacklist,
    is_blacklisted,
)


def test_ajout_et_verification():
    assert not is_blacklisted("0611223344")
    ajoute = add_to_blacklist("0611223344")
    assert ajoute is True
    assert is_blacklisted("+33611223344")  # normalisation cohérente


def test_ajout_idempotent():
    add_to_blacklist("0622334455")
    assert add_to_blacklist("0622334455") is False


def test_ajout_en_masse():
    nb = bulk_add_to_blacklist(["0633445566", "0644556677", "0633445566"])
    assert nb == 2  # le doublon n'est compté qu'une fois
