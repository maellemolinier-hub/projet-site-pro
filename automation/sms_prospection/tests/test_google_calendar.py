"""Tests de la sélection des identifiants Google Calendar — aucun appel réseau réel."""
from dataclasses import dataclass

import pytest
from google.oauth2 import service_account
from googleapiclient import discovery

from automation.sms_prospection import google_calendar
from automation.sms_prospection.google_calendar import GoogleCalendarConfigError, _get_service


@dataclass
class _FausseSettings:
    google_service_account_json: str = ""
    google_service_account_file: str = "service-account.json"


class _FauxService:
    pass


def _mock_build(monkeypatch):
    monkeypatch.setattr(discovery, "build", lambda *a, **kw: _FauxService())


def test_get_service_utilise_le_json_env_si_present(monkeypatch):
    appels = {}

    def _faux_from_info(info, scopes=None):
        appels["info"] = info
        appels["scopes"] = scopes
        return "fausses-credentials"

    monkeypatch.setattr(service_account.Credentials, "from_service_account_info", _faux_from_info)
    monkeypatch.setattr(
        google_calendar, "settings", _FausseSettings(google_service_account_json='{"type": "service_account", "project_id": "x"}')
    )
    _mock_build(monkeypatch)

    _get_service()

    assert appels["info"] == {"type": "service_account", "project_id": "x"}


def test_get_service_json_invalide_leve_erreur_claire(monkeypatch):
    monkeypatch.setattr(
        google_calendar, "settings", _FausseSettings(google_service_account_json="pas du json valide")
    )
    _mock_build(monkeypatch)

    with pytest.raises(GoogleCalendarConfigError):
        _get_service()


def test_get_service_retombe_sur_le_fichier_si_pas_de_json(monkeypatch):
    appels = {}

    def _faux_from_file(path, scopes=None):
        appels["path"] = path
        return "fausses-credentials"

    monkeypatch.setattr(service_account.Credentials, "from_service_account_file", _faux_from_file)
    monkeypatch.setattr(
        google_calendar, "settings", _FausseSettings(google_service_account_json="", google_service_account_file="mon-fichier.json")
    )
    _mock_build(monkeypatch)

    _get_service()

    assert appels["path"] == "mon-fichier.json"
