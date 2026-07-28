"""Tests d'export CSV et d'enrichissement CSV — aucun appel réseau réel."""
import csv
from datetime import date

from automation.prospection_publique import export as export_module
from automation.prospection_publique.export import enrichir_csv, exporter_csv
from automation.prospection_publique.osm_enrichment import ContactEnrichi
from automation.prospection_publique.sirene_client import EntrepriseCaptee


def _entreprise(nom="Plomberie Dupont"):
    return EntrepriseCaptee(
        siren="123456789",
        siret="12345678900012",
        nom=nom,
        secteur="plombier",
        code_naf="43.22A",
        date_creation=date(2026, 6, 15),
        adresse="12 rue de la Paix",
        code_postal="33000",
        ville="Bordeaux",
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
