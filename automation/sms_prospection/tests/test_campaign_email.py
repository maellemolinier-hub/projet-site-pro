from pathlib import Path

from automation.sms_prospection.campaign import envoyer_email_campagne, importer_prospects_csv
from automation.sms_prospection.email_blacklist import add_to_blacklist

CSV_EXEMPLE = Path(__file__).resolve().parent.parent / "data" / "prospects_exemple.csv"


def test_campagne_email_ignore_les_prospects_sans_email_et_respecte_la_liste_noire():
    importer_prospects_csv(CSV_EXEMPLE)  # idempotent, garantit les données même si ce fichier tourne seul

    # Sur les 5 prospects de l'exemple, seuls 3 ont un e-mail renseigné.
    # On désinscrit l'un d'eux avant l'envoi.
    add_to_blacklist("marc@example.com")

    rapport = envoyer_email_campagne(dry_run=True)

    assert rapport.total == 3  # seuls les prospects avec un e-mail sont sélectionnés
    assert rapport.bloques_blacklist == 1
    assert rapport.envoyes == 2
    assert rapport.echecs == 0
