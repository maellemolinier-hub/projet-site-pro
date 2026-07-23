from automation.sms_prospection.secteurs import DEFAULT_SECTEUR, get_secteur


def test_secteur_connu():
    s = get_secteur("plombier")
    assert s.label_pluriel == "plombiers"
    assert "Plomberie" in s.assistant_ia


def test_secteur_insensible_a_la_casse_et_espaces():
    assert get_secteur(" Plombier ") == get_secteur("plombier")


def test_secteur_inconnu_utilise_le_profil_par_defaut():
    assert get_secteur("secteur-qui-n-existe-pas") == DEFAULT_SECTEUR


def test_secteur_vide_utilise_le_profil_par_defaut():
    assert get_secteur("") == DEFAULT_SECTEUR
