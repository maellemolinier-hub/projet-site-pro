"""Tests du client Gemini — aucun appel réseau réel : `_appeler_gemini` est
simulé (monkeypatch) pour vérifier la boucle de function-calling.

`settings` est un dataclass frozen (immuable) : on ne peut pas modifier ses
attributs directement, on remplace donc la référence `gemini_client.settings`
elle-même par un objet factice pour chaque test.
"""
from types import SimpleNamespace

import automation.sms_prospection.gemini_client as gemini_client
from automation.sms_prospection.gemini_client import ToolDeclaration, discuter


def _fake_settings(api_key: str) -> SimpleNamespace:
    return SimpleNamespace(gemini_api_key=api_key, gemini_model="gemini-2.0-flash")


def test_discuter_sans_outil_renvoie_le_texte(monkeypatch):
    monkeypatch.setattr(gemini_client, "settings", _fake_settings("fake-key"))

    def _faux_appel(system_instruction, contents, declarations, model, api_key):
        return {"candidates": [{"content": {"parts": [{"text": "Bonjour !"}]}}]}

    monkeypatch.setattr(gemini_client, "_appeler_gemini", _faux_appel)

    reponse = discuter("Salut", "Tu es un assistant.")
    assert reponse.texte == "Bonjour !"
    assert reponse.appels_outils == []


def test_discuter_execute_un_appel_outil_puis_renvoie_le_texte_final(monkeypatch):
    monkeypatch.setattr(gemini_client, "settings", _fake_settings("fake-key"))

    appels = {"n": 0}
    contents_du_second_appel = []

    def _faux_appel(system_instruction, contents, declarations, model, api_key):
        appels["n"] += 1
        if appels["n"] == 1:
            return {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {"functionCall": {"name": "additionner", "args": {"a": 2, "b": 3}}}
                            ]
                        }
                    }
                ]
            }
        contents_du_second_appel.extend(contents)
        return {"candidates": [{"content": {"parts": [{"text": "Le résultat est 5."}]}}]}

    monkeypatch.setattr(gemini_client, "_appeler_gemini", _faux_appel)

    resultats_captures = []

    def _handler(a, b):
        resultat = str(a + b)
        resultats_captures.append(resultat)
        return resultat

    outil = ToolDeclaration(
        name="additionner",
        description="Additionne deux nombres",
        parameters={
            "type": "object",
            "properties": {"a": {"type": "integer"}, "b": {"type": "integer"}},
        },
        handler=_handler,
    )

    reponse = discuter("Combien font 2+3 ?", "Tu es une calculatrice.", tools=[outil])

    assert reponse.texte == "Le résultat est 5."
    assert resultats_captures == ["5"]
    assert len(reponse.appels_outils) == 1
    assert reponse.appels_outils[0].name == "additionner"
    assert reponse.appels_outils[0].resultat == "5"

    # Régression : l'API Gemini rejette le rôle "function" (seuls "user" et
    # "model" sont acceptés) — la réponse d'un appel d'outil doit être
    # envoyée avec le rôle "user".
    role_reponse_fonction = contents_du_second_appel[-1]["role"]
    assert role_reponse_fonction == "user"
    assert "functionResponse" in contents_du_second_appel[-1]["parts"][0]


def test_discuter_sans_cle_api_leve_une_erreur(monkeypatch):
    monkeypatch.setattr(gemini_client, "settings", _fake_settings(""))
    try:
        discuter("Salut", "Tu es un assistant.")
        assert False, "GeminiError attendue"
    except gemini_client.GeminiError:
        pass
