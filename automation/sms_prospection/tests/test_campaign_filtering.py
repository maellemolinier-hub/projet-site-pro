from pathlib import Path

from automation.sms_prospection.blacklist import add_to_blacklist
from automation.sms_prospection.campaign import envoyer_campagne, importer_prospects_csv

CSV_EXEMPLE = Path(__file__).resolve().parent.parent / "data" / "prospects_exemple.csv"


def test_import_puis_envoi_en_dry_run_respecte_la_liste_noire():
    nb_importes = importer_prospects_csv(CSV_EXEMPLE)
    assert nb_importes == 5

    # Un des prospects du CSV (0623456789) est désinscrit avant l'envoi.
    add_to_blacklist("0623456789")

    rapport = envoyer_campagne(dry_run=True)

    assert rapport.total == 5
    assert rapport.bloques_blacklist == 1
    assert rapport.envoyes == 4
    assert rapport.echecs == 0


def test_reimport_ignore_les_doublons():
    # Deuxième import du même fichier : tous les numéros existent déjà.
    nb_importes = importer_prospects_csv(CSV_EXEMPLE)
    assert nb_importes == 0
