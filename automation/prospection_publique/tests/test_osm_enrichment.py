"""Tests de l'enrichissement OpenStreetMap — aucun appel réseau réel."""
import httpx
import pytest

from automation.prospection_publique.osm_enrichment import (
    ContactEnrichi,
    _meilleur_poi,
    _similarite,
    enrichir_entreprise,
    enrichir_liste,
)


class _FausseReponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


def _mock_nominatim_ok(monkeypatch, lat="44.8378", lon="-0.5792"):
    def _faux_get(self, url, params=None, headers=None):
        assert "nominatim" in url
        assert headers.get("User-Agent")
        return _FausseReponse([{"lat": lat, "lon": lon}])

    monkeypatch.setattr(httpx.Client, "get", _faux_get)


def _mock_nominatim_vide(monkeypatch):
    def _faux_get(self, url, params=None, headers=None):
        return _FausseReponse([])

    monkeypatch.setattr(httpx.Client, "get", _faux_get)


def _mock_overpass(monkeypatch, elements):
    def _faux_post(self, url, data=None):
        assert "overpass" in url
        return _FausseReponse({"elements": elements})

    monkeypatch.setattr(httpx.Client, "post", _faux_post)


def test_similarite_noms_identiques():
    assert _similarite("Plomberie Dupont", "Plomberie Dupont") == 1.0


def test_meilleur_poi_choisit_le_plus_proche_par_nom():
    elements = [
        {"tags": {"name": "Boulangerie Martin", "phone": "0555"}},
        {"tags": {"name": "Plomberie Dupont", "phone": "0611223344", "email": "contact@dupont.fr"}},
    ]
    poi = _meilleur_poi(elements, "Plomberie Dupont")
    assert poi is not None
    assert poi["tags"]["phone"] == "0611223344"


def test_meilleur_poi_sans_correspondance_suffisante():
    elements = [{"tags": {"name": "Boulangerie Martin"}}]
    assert _meilleur_poi(elements, "Plomberie Dupont SARL") is None


def test_enrichir_entreprise_trouve_telephone_et_email(monkeypatch):
    _mock_nominatim_ok(monkeypatch)
    _mock_overpass(
        monkeypatch,
        [{"tags": {"name": "Plomberie Dupont", "contact:phone": "0611223344", "contact:email": "c@dupont.fr"}}],
    )

    contact = enrichir_entreprise("Plomberie Dupont", "12 rue de la Paix", "33000", "Bordeaux")

    assert contact.source == "osm"
    assert contact.telephone == "0611223344"
    assert contact.email == "c@dupont.fr"


def test_enrichir_entreprise_sans_geocodage_renvoie_vide(monkeypatch):
    _mock_nominatim_vide(monkeypatch)

    contact = enrichir_entreprise("Plomberie Dupont", "adresse inconnue", None, None)

    assert contact == ContactEnrichi(telephone=None, email=None, site_web=None, source="aucun")


def test_enrichir_entreprise_aucun_poi_a_proximite(monkeypatch):
    _mock_nominatim_ok(monkeypatch)
    _mock_overpass(monkeypatch, [])

    contact = enrichir_entreprise("Plomberie Dupont", "12 rue de la Paix", "33000", "Bordeaux")

    assert contact.source == "aucun"


def test_enrichir_liste_respecte_le_delai(monkeypatch):
    _mock_nominatim_ok(monkeypatch)
    _mock_overpass(monkeypatch, [{"tags": {"name": "Plomberie Dupont", "phone": "0600"}}])

    appels_sleep = []
    monkeypatch.setattr(
        "automation.prospection_publique.osm_enrichment.time.sleep",
        lambda s: appels_sleep.append(s),
    )

    entreprises = [
        {"nom": "Plomberie Dupont", "adresse": "12 rue de la Paix", "code_postal": "33000", "ville": "Bordeaux"},
        {"nom": "Plomberie Dupont 2", "adresse": "13 rue de la Paix", "code_postal": "33000", "ville": "Bordeaux"},
    ]
    resultats = enrichir_liste(entreprises, delai_entre_appels=1.1)

    assert len(resultats) == 2
    assert appels_sleep == [1.1]  # pas de délai avant la 1ère entreprise, un seul entre les deux
