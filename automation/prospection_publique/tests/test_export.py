"""Tests d'export CSV et d'enrichissement CSV — aucun appel réseau réel."""
import csv
from datetime import date

from automation.prospection_publique import export as export_module
from automation.prospection_publique.bodacc_client import AvisCreationBodacc
from automation.prospection_publique.export import (
    enrichir_csv,
    exporter_csv,
    exporter_csv_bodacc,
    exporter_csv_google_places,
    fusionner_csv,
)
from automation.prospection_publique.google_places_gap import EtablissementSansSite
from automation.prospection_publique.osm_enrichment import ContactEnrichi
from automation.prospection_publique.sirene_client import EntrepriseCaptee


def _entreprise(nom="Plomberie Dupont", siren="123456789"):
    return EntrepriseCaptee(
        siren=siren,
        siret="12345678900012",
        nom=nom,
        secteur="plombier",
        code_naf="43.22A",
        date_creation=date(2026, 6, 15),
        adresse="12 rue de la Paix",
        code_postal="33000",
        ville="Bordeaux",
    )


def _avis_bodacc(nom="Plomberie Dupont", siren="123456789", ville="Bordeaux"):
    return AvisCreationBodacc(
        siren=siren,
        nom=nom,
        secteur="plombier",
        date_parution=date(2026, 7, 10),
        departement="33",
        ville=ville,
        tribunal="Tribunal de commerce de Bordeaux",
    )


def test_exporter_csv_colonnes_contact_vides(tmp_path):
    chemin = tmp_path / "capture.csv"
    n = exporter_csv([_entreprise()], chemin)

    assert n == 1
    with open(chemin, newline="", encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    assert lignes[0]["telephone"] == ""
    assert lignes[0]["email"] == ""
    assert lignes[0]["site_web"] == ""
    assert lignes[0]["source_enrichissement"] == ""


def test_enrichir_csv_complete_les_colonnes_trouvees(tmp_path, monkeypatch):
    entree = tmp_path / "capture.csv"
    sortie = tmp_path / "enrichi.csv"
    exporter_csv([_entreprise("Plomberie Dupont"), _entreprise("Plomberie Introuvable")], entree)

    def _faux_enrichir(nom, adresse, code_postal, ville, timeout=15.0):
        if nom == "Plomberie Dupont":
            return ContactEnrichi(telephone="0611223344", email="c@dupont.fr", site_web="dupont.fr", source="osm")
        return ContactEnrichi(telephone=None, email=None, site_web=None, source="aucun")

    monkeypatch.setattr(export_module, "enrichir_entreprise", _faux_enrichir)
    monkeypatch.setattr(export_module.time, "sleep", lambda s: None)

    total, trouvees = enrichir_csv(entree, sortie)

    assert total == 2
    assert trouvees == 1
    with open(sortie, newline="", encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    assert lignes[0]["telephone"] == "0611223344"
    assert lignes[0]["source_enrichissement"] == "osm"
    assert lignes[1]["telephone"] == ""
    assert lignes[1]["source_enrichissement"] == "aucun"


def test_exporter_csv_bodacc_colonnes(tmp_path):
    chemin = tmp_path / "bodacc.csv"
    n = exporter_csv_bodacc([_avis_bodacc()], chemin)

    assert n == 1
    with open(chemin, newline="", encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    assert lignes[0]["source_capture"] == "bodacc"
    assert lignes[0]["date_parution_bodacc"] == "2026-07-10"
    assert lignes[0]["date_creation"] == ""
    assert lignes[0]["code_naf"] == ""


def test_fusionner_csv_deduplique_par_siren(tmp_path):
    fichier_sirene = tmp_path / "sirene.csv"
    fichier_bodacc = tmp_path / "bodacc.csv"
    sortie = tmp_path / "fusion.csv"

    exporter_csv([_entreprise("Plomberie Dupont", siren="111111111")], fichier_sirene)
    exporter_csv_bodacc(
        [
            _avis_bodacc("Plomberie Dupont", siren="111111111"),  # doublon (même SIREN)
            _avis_bodacc("Jardins Martin", siren="222222222", ville="Bègles"),  # nouvelle entreprise
        ],
        fichier_bodacc,
    )

    total, uniques = fusionner_csv([fichier_sirene, fichier_bodacc], sortie)

    assert total == 3
    assert uniques == 2
    with open(sortie, newline="", encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    assert len(lignes) == 2
    # Le doublon SIREN 111111111 doit garder la version SIRENE (plus complète), pas BODACC
    ligne_dupont = next(l for l in lignes if l["siren"] == "111111111")
    assert ligne_dupont["source_capture"] == "sirene"
    assert ligne_dupont["code_naf"] == "43.22A"


def test_fusionner_csv_deduplique_par_nom_et_ville_sans_siren(tmp_path):
    fichier_a = tmp_path / "a.csv"
    fichier_b = tmp_path / "b.csv"
    sortie = tmp_path / "fusion.csv"

    exporter_csv_bodacc([_avis_bodacc("Jardins Martin", siren=None, ville="Bègles")], fichier_a)
    exporter_csv_bodacc([_avis_bodacc("Jardins Martin", siren=None, ville="Bègles")], fichier_b)

    total, uniques = fusionner_csv([fichier_a, fichier_b], sortie)

    assert total == 2
    assert uniques == 1


def test_exporter_csv_google_places_colonnes(tmp_path):
    chemin = tmp_path / "google_places.csv"
    etablissement = EtablissementSansSite(
        place_id="abc123",
        nom="Plomberie Dupont",
        secteur_recherche="plombier",
        adresse="12 rue de la Paix, 33000 Bordeaux",
        telephone="0611223344",
    )

    n = exporter_csv_google_places([etablissement], chemin)

    assert n == 1
    with open(chemin, newline="", encoding="utf-8") as f:
        lignes = list(csv.DictReader(f))
    assert lignes[0]["source_capture"] == "google_places"
    assert lignes[0]["telephone"] == "0611223344"
    assert lignes[0]["secteur"] == "plombier"
    assert lignes[0]["siren"] == ""
