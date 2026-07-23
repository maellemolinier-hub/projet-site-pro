"""Tests de l'API REST du centre de pilotage (FastAPI TestClient — aucun appel
réseau réel, aucun appel Gemini)."""
from fastapi.testclient import TestClient

from automation.sms_prospection.copilot_api import app

client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_cycle_pause_reprise_campagne():
    assert client.get("/api/campagne/etat").json()["en_pause"] is False

    r = client.post("/api/campagne/pause", json={"motif": "maintenance"})
    assert r.status_code == 200
    assert client.get("/api/campagne/etat").json() == {"en_pause": True, "motif": "maintenance"}

    client.post("/api/campagne/reprendre")
    assert client.get("/api/campagne/etat").json()["en_pause"] is False


def test_cycle_liste_noire():
    r = client.post("/api/blacklist", json={"phone": "0677889900"})
    assert r.status_code == 200
    assert r.json()["nouveau"] is True

    numeros = client.get("/api/blacklist").json()["numeros"]
    assert any(n["phone"] == "+33677889900" for n in numeros)

    r = client.delete("/api/blacklist/0677889900")
    assert r.json()["retire"] is True

    r = client.delete("/api/blacklist/0677889900")
    assert r.json()["retire"] is False


def test_secteurs_lecture_et_mise_a_jour():
    r = client.get("/api/secteurs")
    cles = [s["cle"] for s in r.json()["secteurs"]]
    assert "plombier" in cles

    r = client.put("/api/secteurs/plombier", json={"argumentaire": "Offre spéciale test API."})
    assert r.json()["secteur"]["argumentaire"] == "Offre spéciale test API."


def test_activite_liste_et_compteurs():
    client.post("/api/campagne/pause", json={"motif": "test activite"})
    r = client.get("/api/activite")
    body = r.json()
    assert body["compteurs_non_lus"]["action_pilote"] >= 1
    assert "sms_envoye" in body["categories"]

    evenement_id = body["evenements"][0]["id"]
    client.post(f"/api/activite/{evenement_id}/lu")
    client.post("/api/campagne/reprendre")


def test_prospect_introuvable_renvoie_404():
    r = client.get("/api/prospects/999999")
    assert r.status_code == 404
