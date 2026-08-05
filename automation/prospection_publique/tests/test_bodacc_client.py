"""Tests du client BODACC — aucun appel réseau réel (httpx.Client.get simulé)."""
import json
from datetime import date

import httpx

from automation.prospection_publique.bodacc_client import (
    _extraire_avis,
    rechercher_creations_bodacc,
)


def _resultat_brut(siren="111222333", nom="Dupont SARL", texte_activite="plomberie sanitaire",
                    date_parution="2026-07-10", ville="Bordeaux", departement="33"):
    return {
        "dateparution": date_parution,
        "departement": departement,
        "ville": ville,
        "tribunal": "Tribunal de commerce de Bordeaux",
        "familleavis_lib": "Créations",
        "listepersonnes": json.dumps(
            [{"personne": {"siren": siren, "denomination": nom, "activite": texte_activite}}]
        ),
    }


def test_extraire_avis_champs_valides():
    avis = _extraire_avis(_resultat_brut(), secteurs_filtres=None)
    assert avis is not None
    assert avis.siren == "111222333"
    assert avis.nom == "Dupont SARL"
    assert avis.secteur == "plombier"
    assert avis.date_parution == date(2026, 7, 10)
    assert avis.ville == "Bordeaux"
    assert avis.departement == "33"


def test_extraire_avis_sans_secteur_reconnu_renvoie_none():
    brut = _resultat_brut(texte_activite="société de conseil en informatique")
    assert _extraire_avis(brut, secteurs_filtres=None) is None


def test_extraire_avis_filtre_par_secteurs_demandes():
    brut = _resultat_brut(texte_activite="paysagiste")
    assert _extraire_avis(brut, secteurs_filtres={"plombier"}) is None
    assert _extraire_avis(brut, secteurs_filtres={"jardinier"}) is not None


class _FausseReponse:
    def __init__(self, payload: dict):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


def test_rechercher_creations_bodacc_filtre_par_date(monkeypatch):
    appels = {"n": 0}

    def _faux_get(self, url, params=None):
        appels["n"] += 1
        if appels["n"] == 1:
            return _FausseReponse(
                {
                    "results": [
                        _resultat_brut(siren="111111111", date_parution="2026-07-10"),  # dans la fenêtre
                        _resultat_brut(siren="222222222", date_parution="2020-01-01"),  # trop ancien
                    ]
                }
            )
        return _FausseReponse({"results": []})

    monkeypatch.setattr(httpx.Client, "get", _faux_get)

    resultats = rechercher_creations_bodacc(date_min=date(2026, 1, 1), max_resultats=50)

    assert len(resultats) == 1
    assert resultats[0].siren == "111111111"


def test_rechercher_creations_bodacc_respecte_max_resultats(monkeypatch):
    def _faux_get(self, url, params=None):
        return _FausseReponse(
            {
                "results": [
                    _resultat_brut(siren=str(1000 + i), date_parution="2026-07-01")
                    for i in range(25)
                ]
            }
        )

    monkeypatch.setattr(httpx.Client, "get", _faux_get)

    resultats = rechercher_creations_bodacc(date_min=date(2026, 1, 1), max_resultats=5)

    assert len(resultats) == 5
