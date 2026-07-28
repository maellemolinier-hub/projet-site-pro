"""Tests du client SIRENE — aucun appel réseau réel (httpx.Client.get simulé)."""
from datetime import date

import httpx

from automation.prospection_publique.sirene_client import (
    _extraire_entreprise,
    rechercher_nouvelles_entreprises,
)


def _resultat_brut(siren="123456789", naf="43.22A", date_creation="2026-06-15", nom="Plomberie Dupont"):
    return {
        "siren": siren,
        "nom_complet": nom,
        "siege": {
            "siret": siren + "00012",
            "activite_principale": naf,
            "date_creation": date_creation,
            "adresse": "12 rue de la Paix",
            "code_postal": "33000",
            "libelle_commune": "Bordeaux",
        },
    }


def test_extraire_entreprise_champs_valides():
    entreprise = _extraire_entreprise(_resultat_brut())
    assert entreprise is not None
    assert entreprise.secteur == "plombier"
    assert entreprise.code_naf == "43.22A"
    assert entreprise.date_creation == date(2026, 6, 15)
    assert entreprise.ville == "Bordeaux"


def test_extraire_entreprise_code_naf_hors_perimetre_renvoie_none():
    brut = _resultat_brut(naf="00.00Z")
    assert _extraire_entreprise(brut) is None


def test_extraire_entreprise_sans_code_naf_renvoie_none():
    brut = _resultat_brut()
    del brut["siege"]["activite_principale"]
    assert _extraire_entreprise(brut) is None


class _FausseReponse:
    def __init__(self, payload: dict):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


def test_rechercher_nouvelles_entreprises_filtre_par_date(monkeypatch):
    appels = {"n": 0}

    def _faux_get(self, url, params=None):
        appels["n"] += 1
        if appels["n"] == 1:
            return _FausseReponse(
                {
                    "results": [
                        _resultat_brut(siren="111111111", date_creation="2026-06-15"),  # dans la fenêtre
                        _resultat_brut(siren="222222222", date_creation="2020-01-01"),  # trop ancien
                    ]
                }
            )
        return _FausseReponse({"results": []})

    monkeypatch.setattr(httpx.Client, "get", _faux_get)

    resultats = rechercher_nouvelles_entreprises(
        codes_naf=["43.22A"], date_min=date(2026, 1, 1), max_resultats=50
    )

    assert len(resultats) == 1
    assert resultats[0].siren == "111111111"


def test_rechercher_nouvelles_entreprises_respecte_max_resultats(monkeypatch):
    def _faux_get(self, url, params=None):
        # Une seule page de 25 résultats, tous valides et récents.
        return _FausseReponse(
            {
                "results": [
                    _resultat_brut(siren=str(1000 + i), date_creation="2026-06-01")
                    for i in range(25)
                ]
            }
        )

    monkeypatch.setattr(httpx.Client, "get", _faux_get)

    resultats = rechercher_nouvelles_entreprises(
        codes_naf=["43.22A"], date_min=date(2026, 1, 1), max_resultats=5
    )

    assert len(resultats) == 5
