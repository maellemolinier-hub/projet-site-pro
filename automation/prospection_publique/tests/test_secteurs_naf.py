from automation.prospection_publique.secteurs_naf import (
    codes_naf_pour,
    secteur_pour_code_naf,
    secteurs_prioritaires,
)


def test_codes_naf_pour_plombier():
    assert "43.22A" in codes_naf_pour("plombier")


def test_codes_naf_pour_secteur_inconnu():
    assert codes_naf_pour("secteur-inexistant") == ()


def test_secteur_pour_code_naf_jardinier():
    assert secteur_pour_code_naf("81.30Z") == "jardinier"


def test_secteur_pour_code_naf_insensible_a_la_casse():
    assert secteur_pour_code_naf("81.30z") == "jardinier"


def test_secteur_pour_code_naf_inconnu():
    assert secteur_pour_code_naf("00.00Z") is None


def test_secteurs_prioritaires_contient_btp_jardinier_restaurateur_vtc():
    prioritaires = secteurs_prioritaires()
    for secteur in ("plombier", "electricien", "macon", "jardinier", "restaurateur", "vtc"):
        assert secteur in prioritaires
