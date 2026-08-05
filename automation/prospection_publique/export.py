"""Export des entreprises captées (SIRENE) vers un CSV de travail.

Ce CSV n'est volontairement PAS directement injectable dans la campagne SMS
(`automation.sms_prospection.campaign.importer_prospects_csv`) : il manque le
prénom du contact, le téléphone et l'e-mail, qui ne sont pas des données
publiques. Colonnes vides "telephone"/"email" à compléter lors de l'étape
d'enrichissement (voir README.md et `osm_enrichment.py` pour un enrichissement
automatique gratuit via OpenStreetMap).
"""
from __future__ import annotations

import csv
import logging
import time
from pathlib import Path

from .bodacc_client import AvisCreationBodacc
from .google_places_gap import EtablissementSansSite
from .osm_enrichment import enrichir_entreprise
from .sirene_client import EntrepriseCaptee

logger = logging.getLogger(__name__)

COLONNES = [
    "siren",
    "siret",
    "nom",
    "secteur",
    "code_naf",
    "date_creation",
    "date_parution_bodacc",
    "adresse",
    "code_postal",
    "ville",
    "telephone",
    "email",
    "site_web",
    "source_enrichissement",
    "source_capture",
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
                    "date_parution_bodacc": "",
                    "adresse": e.adresse or "",
                    "code_postal": e.code_postal or "",
                    "ville": e.ville or "",
                    "telephone": "",
                    "email": "",
                    "site_web": "",
                    "source_enrichissement": "",
                    "source_capture": "sirene",
                }
            )
    return len(entreprises)


def exporter_csv_bodacc(avis: list[AvisCreationBodacc], chemin_csv: str | Path) -> int:
    """Écrit les avis de création BODACC dans un CSV au même format que
    `exporter_csv` (mêmes colonnes), pour pouvoir les fusionner ensuite avec
    `fusionner_csv`. Le BODACC ne fournit ni SIRET, ni code NAF, ni adresse
    complète — ces colonnes restent vides ; `date_creation` reste vide aussi
    (on ne connaît que la date de *publication* de l'avis, pas la date exacte
    de création — voir `date_parution_bodacc`)."""
    chemin_csv = Path(chemin_csv)
    chemin_csv.parent.mkdir(parents=True, exist_ok=True)

    with open(chemin_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLONNES)
        writer.writeheader()
        for a in avis:
            writer.writerow(
                {
                    "siren": a.siren or "",
                    "siret": "",
                    "nom": a.nom,
                    "secteur": a.secteur,
                    "code_naf": "",
                    "date_creation": "",
                    "date_parution_bodacc": a.date_parution.isoformat() if a.date_parution else "",
                    "adresse": "",
                    "code_postal": "",
                    "ville": a.ville or "",
                    "telephone": "",
                    "email": "",
                    "site_web": "",
                    "source_enrichissement": "",
                    "source_capture": "bodacc",
                }
            )
    return len(avis)


def exporter_csv_google_places(etablissements: list[EtablissementSansSite], chemin_csv: str | Path) -> int:
    """Écrit les établissements sans site web (Google Places) dans un CSV au
    même format que COLONNES. Contrairement à SIRENE/BODACC, le téléphone est
    ici souvent déjà renseigné (fiche Google Maps) — la colonne 'telephone'
    n'est donc pas systématiquement vide."""
    chemin_csv = Path(chemin_csv)
    chemin_csv.parent.mkdir(parents=True, exist_ok=True)

    with open(chemin_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLONNES)
        writer.writeheader()
        for e in etablissements:
            writer.writerow(
                {
                    "siren": "",
                    "siret": "",
                    "nom": e.nom,
                    "secteur": e.secteur_recherche,
                    "code_naf": "",
                    "date_creation": "",
                    "date_parution_bodacc": "",
                    "adresse": e.adresse or "",
                    "code_postal": "",
                    "ville": "",
                    "telephone": e.telephone or "",
                    "email": "",
                    "site_web": "",
                    "source_enrichissement": "",
                    "source_capture": "google_places",
                }
            )
    return len(etablissements)


def fusionner_csv(chemins: list[str | Path], chemin_sortie: str | Path) -> tuple[int, int]:
    """Fusionne plusieurs CSV (même format que COLONNES, ex: une capture
    SIRENE + une capture BODACC) en dédoublonnant les entreprises : par SIREN
    quand il est connu, sinon par (nom, ville). En cas de doublon, la première
    occurrence rencontrée est conservée — passer le fichier SIRENE avant le
    fichier BODACC en argument pour privilégier les données SIRENE (plus
    complètes : SIRET, code NAF, adresse) en cas de recoupement.

    Renvoie (nombre de lignes lues au total, nombre de lignes après
    dédoublonnage)."""
    chemin_sortie = Path(chemin_sortie)
    chemin_sortie.parent.mkdir(parents=True, exist_ok=True)

    total_lu = 0
    vues: set[str] = set()
    lignes_uniques: list[dict] = []

    for chemin in chemins:
        with open(chemin, newline="", encoding="utf-8") as f:
            for ligne in csv.DictReader(f):
                total_lu += 1
                siren = (ligne.get("siren") or "").strip()
                cle = siren if siren else f"{(ligne.get('nom') or '').strip().lower()}|{(ligne.get('ville') or '').strip().lower()}"
                if cle in vues:
                    continue
                vues.add(cle)
                lignes_uniques.append(ligne)

    with open(chemin_sortie, "w", newline="", encoding="utf-8") as f_out:
        writer = csv.DictWriter(f_out, fieldnames=COLONNES)
        writer.writeheader()
        for ligne in lignes_uniques:
            writer.writerow({colonne: ligne.get(colonne, "") for colonne in COLONNES})

    return total_lu, len(lignes_uniques)


def enrichir_csv(
    chemin_entree: str | Path,
    chemin_sortie: str | Path,
    delai_entre_appels: float = 1.1,
) -> tuple[int, int]:
    """Relit un CSV produit par `exporter_csv` et tente de compléter les
    colonnes telephone/email/site_web via OpenStreetMap (gratuit, sans clé API
    — voir osm_enrichment.py pour les limites de couverture et le respect du
    rythme d'appel imposé par Nominatim).

    Renvoie (nombre de lignes total, nombre de lignes enrichies avec succès)."""
    chemin_entree = Path(chemin_entree)
    chemin_sortie = Path(chemin_sortie)
    chemin_sortie.parent.mkdir(parents=True, exist_ok=True)

    with open(chemin_entree, newline="", encoding="utf-8") as f_in:
        lignes = list(csv.DictReader(f_in))

    trouvees = 0
    for i, ligne in enumerate(lignes):
        if i > 0:
            time.sleep(delai_entre_appels)
        try:
            contact = enrichir_entreprise(
                nom=ligne.get("nom", ""),
                adresse=ligne.get("adresse"),
                code_postal=ligne.get("code_postal"),
                ville=ligne.get("ville"),
            )
        except Exception as exc:  # noqa: BLE001 — on ne bloque pas tout le lot sur une entreprise
            logger.warning("Enrichissement échoué pour %s : %s", ligne.get("nom"), exc)
            continue

        if contact.source == "osm":
            trouvees += 1
        ligne["telephone"] = contact.telephone or ligne.get("telephone", "")
        ligne["email"] = contact.email or ligne.get("email", "")
        ligne["site_web"] = contact.site_web or ligne.get("site_web", "")
        ligne["source_enrichissement"] = contact.source

    with open(chemin_sortie, "w", newline="", encoding="utf-8") as f_out:
        writer = csv.DictWriter(f_out, fieldnames=COLONNES)
        writer.writeheader()
        for ligne in lignes:
            writer.writerow({colonne: ligne.get(colonne, "") for colonne in COLONNES})

    return len(lignes), trouvees
