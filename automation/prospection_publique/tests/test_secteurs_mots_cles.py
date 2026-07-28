from automation.prospection_publique.secteurs_mots_cles import secteur_pour_texte_libre


def test_secteur_pour_texte_libre_plombier():
    assert secteur_pour_texte_libre("Immatriculation. Activité : plomberie sanitaire") == "plombier"


def test_secteur_pour_texte_libre_jardinier():
    assert secteur_pour_texte_libre("Création d'une activité de paysagiste") == "jardinier"


def test_secteur_pour_texte_libre_insensible_a_la_casse():
    assert secteur_pour_texte_libre("ACTIVITÉ DE RESTAURATION TRADITIONNELLE") == "restaurateur"


def test_secteur_pour_texte_libre_aucune_correspondance():
    assert secteur_pour_texte_libre("Société de conseil en informatique") is None
