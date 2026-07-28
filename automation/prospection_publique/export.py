"""Export des entreprises captées (SIRENE) vers un CSV de travail.

Ce CSV n'est volontairement PAS directement injectable dans la campagne SMS
(`automation.sms_prospection.campaign.importer_prospects_csv`) : il manque le
prénom du contact, le téléphone et l'e-mail, qui ne sont pas des données
publiques. Colonnes vides "telephone"/"email" à compléter lors de l'étape
d'enrichissement (voir README.md).
"""
from __future__ import annotations

import csv
from pathlib import Path

from .sirene_client import EntrepriseCaptee

COLONNES = [
    "siren",
    "siret",
    "nom",
    "secteur",
    "code_naf",
    "date_creation",
    "adresse",
    "code_postal",
    "ville",
    "telephone",
    "email",
]


def exporter_csv(entreprises: list[EntrepriseCaptee], chemin_csv: str | Path) -> int:
    """Écrit les entreprises dans un CSV (colonnes telephone/email vides,
    à compléter lors de l'enrichissement). Renvoie le nombre de lignes écrites."""
    chemin_csv = Path(chemin_csv)
    chemin_csv.parent.mkdir(parents=True, exist_ok=True)

    with open(chemin_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLONNES)
        writer.writeheader()
        for e in entreprises:
            writer.writerow(
                {
                    "siren": e.siren,
                    "siret": e.siret or "",
                    "nom": e.nom,
                    "secteur": e.secteur,
                    "code_naf": e.code_naf,
                    "date_creation": e.date_creation.isoformat() if e.date_creation else "",
                    "adresse": e.adresse or "",
                    "code_postal": e.code_postal or "",
                    "ville": e.ville or "",
                    "telephone": "",
                    "email": "",
                }
            )
    return len(entreprises)
