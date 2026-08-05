from pathlib import Path

from automation.sms_prospection.blacklist import add_to_blacklist
from automation.sms_prospection.campaign import envoyer_campagne, importer_prospects_csv

CSV_EXEMPLE = Path(__file__).resolve().parent.parent / "data" / "prospects_exemple.csv"


def test_import_puis_envoi_en_dry_run_respecte_la_liste_noire():
    # Idempotent : peut avoir déjà été importé par un autre fichier de test
    # partageant la même base SQLite de session (ex: test_campaign_email.py) —
    # on ne peut donc pas supposer être le tout premier import.
    importer_prospects_csv(CSV_EXEMPLE)

    # Un des prospects du CSV (0623456789) est désinscrit avant l'envoi.
    add_to_blacklist("0623456789")

    rapport = envoyer_campagne(dry_run=True)

    assert rapport.total == 5
    assert rapport.bloques_blacklist == 1
    assert rapport.envoyes == 4
    assert rapport.echecs == 0


def test_reimport_ignore_les_doublons():
    # S'assure qu'un premier import a bien eu lieu, puis vérifie qu'un second
    # import explicite du même fichier n'ajoute aucun doublon.
    importer_prospects_csv(CSV_EXEMPLE)
    nb_importes = importer_prospects_csv(CSV_EXEMPLE)
    assert nb_importes == 0
