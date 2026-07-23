"""Vérifie que les outils de l'assistant pilote déclenchent de vraies actions
(pas de simulation) sur les modules sous-jacents — sans appel réseau Gemini."""
from sqlalchemy import insert

from automation.sms_prospection import assistant_pilote, campagne_etat
from automation.sms_prospection.blacklist import is_blacklisted
from automation.sms_prospection.db import get_engine, sms_prospect


def test_outil_pause_et_reprise():
    assert not campagne_etat.obtenir_etat().en_pause
    print(assistant_pilote._tool_pause("test"))
    assert campagne_etat.obtenir_etat().en_pause
    print(assistant_pilote._tool_reprendre())
    assert not campagne_etat.obtenir_etat().en_pause


def test_outil_bloquer_et_debloquer_numero():
    resultat = assistant_pilote._tool_bloquer_numero("0699887766", motif="test pilote")
    assert "ajouté" in resultat
    assert is_blacklisted("0699887766")

    resultat2 = assistant_pilote._tool_debloquer_numero("0699887766")
    assert "retiré" in resultat2
    assert not is_blacklisted("0699887766")


def test_outil_rechercher_prospect():
    # Insertion directe (dédiée à ce test) pour ne pas interférer avec les
    # compteurs d'import testés dans test_campaign_filtering.py, qui partage
    # la même base SQLite temporaire pour toute la session de tests.
    # statut="envoye" (et non "nouveau") pour ne pas interférer avec les
    # tests de campagne qui comptent les prospects au statut "nouveau" dans
    # la même base SQLite partagée pour la session de tests.
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(
            insert(sms_prospect).values(
                phone="+33611112222",
                prenom="JulienTestPilote",
                secteur="plombier",
                statut="envoye",
            )
        )
    resultat = assistant_pilote._tool_rechercher_prospect("JulienTestPilote")
    assert "JulienTestPilote" in resultat


def test_outil_maj_argumentaire():
    resultat = assistant_pilote._tool_maj_argumentaire("plombier", "Nouvelle offre de test.")
    assert "plombier" in resultat
    from automation.sms_prospection import secteurs_store

    assert secteurs_store.get("plombier").argumentaire == "Nouvelle offre de test."
