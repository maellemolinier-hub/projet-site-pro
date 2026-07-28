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


def test_cycle_liste_noire_email():
    r = client.post("/api/blacklist-email", json={"email": "Test@Exemple.fr"})
    assert r.status_code == 200
    assert r.json()["nouveau"] is True

    emails = client.get("/api/blacklist-email").json()["emails"]
    assert any(e["email"] == "test@exemple.fr" for e in emails)

    r = client.delete("/api/blacklist-email/test@exemple.fr")
    assert r.json()["retire"] is True

    r = client.delete("/api/blacklist-email/test@exemple.fr")
    assert r.json()["retire"] is False


def test_desabonnement_email_valide_ajoute_a_la_liste_noire():
    from pathlib import Path

    from automation.sms_prospection.booking import ensure_booking_token
    from automation.sms_prospection.campaign import importer_prospects_csv, rechercher_prospects
    from automation.sms_prospection.email_blacklist import is_blacklisted

    csv_exemple = Path(__file__).resolve().parent.parent / "data" / "prospects_exemple.csv"
    importer_prospects_csv(csv_exemple)
    # Recherche par téléphone (pas par prénom) : "Julien" seul est ambigu dans la
    # base de test partagée (voir JulienTestPilote dans test_assistant_pilote.py).
    prospect = rechercher_prospects("+33612345678")[0]
    prospect = ensure_booking_token(prospect)

    assert not is_blacklisted(prospect.email)

    r = client.get(f"/desabonnement/{prospect.booking_token}")
    assert r.status_code == 200
    assert "Désabonnement confirmé" in r.text
    assert is_blacklisted(prospect.email)


def test_desabonnement_token_invalide_affiche_un_message_clair():
    r = client.get("/desabonnement/token-inexistant")
    assert r.status_code == 200
    assert "Lien invalide" in r.text
