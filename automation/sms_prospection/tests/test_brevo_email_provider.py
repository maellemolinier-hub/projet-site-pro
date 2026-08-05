"""Tests du provider Brevo e-mail — aucun appel réseau réel (httpx.post simulé)."""
import httpx

from automation.sms_prospection.providers.brevo_email import BrevoEmailProvider


class _FausseReponse:
    def __init__(self, status_code=201, payload=None):
        self.status_code = status_code
        self._payload = payload or {"messageId": "msg-123"}

    def raise_for_status(self):
        if self.status_code >= 400:
            request = httpx.Request("POST", "https://api.brevo.com/v3/smtp/email")
            response = httpx.Response(self.status_code, request=request, text="erreur")
            raise httpx.HTTPStatusError("erreur", request=request, response=response)

    def json(self):
        return self._payload


def test_send_succes(monkeypatch):
    appels = {}

    def _faux_post(url, json=None, headers=None, timeout=None):
        appels["url"] = url
        appels["json"] = json
        appels["headers"] = headers
        return _FausseReponse()

    monkeypatch.setattr(httpx, "post", _faux_post)

    provider = BrevoEmailProvider(api_key="fake-key", sender_email="a@b.fr", sender_name="Cap Entreprendre France")
    resultat = provider.send("prospect@exemple.fr", "Sujet test", "<p>Bonjour</p>")

    assert resultat.succes is True
    assert resultat.provider_ref == "msg-123"
    assert appels["json"]["to"] == [{"email": "prospect@exemple.fr"}]
    assert appels["json"]["sender"] == {"name": "Cap Entreprendre France", "email": "a@b.fr"}
    assert appels["headers"]["api-key"] == "fake-key"


def test_send_echec_http(monkeypatch):
    def _faux_post(url, json=None, headers=None, timeout=None):
        return _FausseReponse(status_code=400)

    monkeypatch.setattr(httpx, "post", _faux_post)

    provider = BrevoEmailProvider(api_key="fake-key")
    resultat = provider.send("prospect@exemple.fr", "Sujet", "<p>Corps</p>")

    assert resultat.succes is False
    assert "400" in resultat.erreur


def test_sans_cle_api_leve_erreur():
    # BREVO_API_KEY n'est pas défini dans l'environnement de test (voir conftest.py) :
    # sans clé explicite, settings.brevo_api_key est vide par défaut.
    try:
        BrevoEmailProvider(api_key="")
        assert False, "une RuntimeError était attendue"
    except RuntimeError:
        pass
