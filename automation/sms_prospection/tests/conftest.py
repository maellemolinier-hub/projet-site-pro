"""Configuration pytest : base SQLite temporaire isolée pour toute la session
de tests, définie AVANT que le package `automation.sms_prospection` (et son
singleton `config.settings`) ne soit importé pour la première fois."""
import os
import tempfile

_tmp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["SMS_PROSPECTION_DATABASE_URL"] = f"sqlite:///{_tmp_db.name}"
os.environ.setdefault("CAMPAIGN_DRY_RUN", "true")
os.environ.setdefault("SECONDS_BETWEEN_SMS", "0")
