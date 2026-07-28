"""Tests du module Google Places — aucun appel réseau réel (httpx.Client.post simulé)."""
import httpx
import pytest

from automation.prospection_publique.google_places_gap import (
    GooglePlacesError,
    rechercher_sans_site_web,
)


class _FausseReponse:
    def __init__(self, payload: dict):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


def _lieu(nom="Plomberie Dupont", website=None, telephone="0611223344", place_id="abc123"):
    lieu = {
        "id": place_id,
        "displayName": {"text": nom},
        "formattedAddress": "12 rue de la Paix, 33000 Bordeaux",
        "nationalPhoneNumber": telephone,
    }
    if website:
        lieu["websiteUri"] = website
    return lieu


def test_rechercher_sans_site_web_sans_cle_leve_erreur(monkeypatch):
    monkeypatch.delenv("GOOGLE_PLACES_API_KEY", raising=False)
    with pytest.raises(GooglePlacesError):
        rechercher_sans_site_web("plombier", "Bordeaux")


def test_rechercher_sans_site_web_filtre_ceux_avec_site(monkeypatch):
    def _faux_post(self, url, json=None, headers=None):
        assert headers["X-Goog-Api-Key"] == "fausse-cle"
        assert "plombier" in json["textQuery"]
        return _FausseReponse(
            {
                "places": [
                    _lieu("Plomberie Dupont", website=None),  # sans site -> cible
                    _lieu("Plomberie Martin", website="https://plomberie-martin.fr", place_id="def456"),  # a un site
                ]
            }
        )

    monkeypatch.setattr(httpx.Client, "post", _faux_post)

    resultats = rechercher_sans_site_web("plombier", "Bordeaux", cle_api="fausse-cle")

    assert len(resultats) == 1
    assert resultats[0].nom == "Plomberie Dupont"
    assert resultats[0].telephone == "0611223344"
    assert resultats[0].secteur_recherche == "plombier"


def test_rechercher_sans_site_web_respecte_max_resultats(monkeypatch):
    def _faux_post(self, url, json=None, headers=None):
        return _FausseReponse(
            {"places": [_lieu(f"Entreprise {i}", website=None, place_id=str(i)) for i in range(10)]}
        )

    monkeypatch.setattr(httpx.Client, "post", _faux_post)

    resultats = rechercher_sans_site_web("jardinier", "Bègles", cle_api="fausse-cle", max_resultats=3)

    assert len(resultats) == 3


def test_rechercher_sans_site_web_erreur_http(monkeypatch):
    def _faux_post(self, url, json=None, headers=None):
        raise httpx.ConnectError("échec réseau")

    monkeypatch.setattr(httpx.Client, "post", _faux_post)

    with pytest.raises(GooglePlacesError):
        rechercher_sans_site_web("plombier", "Bordeaux", cle_api="fausse-cle")
