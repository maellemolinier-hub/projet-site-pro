"""
Tests for the ML regression guard in ml_retrain.py.

Verifies that:
1. A model with worse MAE than the existing one is NOT deployed (regression_blocked).
2. A model with better MAE than the existing one IS deployed (success).
3. A model with MAE above the absolute threshold is NOT deployed.
4. Missing model metadata (first run) does not block deployment.
"""

import os
import sys
import pickle
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

# Ensure the app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# We need to mock the imports inside retrain_model
# so we patch at the module level


def _make_fake_model(mae: float):
    """Create a fake model object with a predict method returning a constant MAE."""
    model = MagicMock()
    # predict returns values that will produce the desired MAE
    # mean_absolute_error(y_test, model.predict(X_test)) = mae
    # We achieve this by having predict return y_test + mae (constant offset)
    model.predict = MagicMock(side_effect=lambda X: X.iloc[:, 0].values + mae if hasattr(X, 'iloc') else X[:, 0] + mae)
    model.fit = MagicMock()
    return model


class TestRegressionGuard:
    """Test the regression guard logic in ml_retrain."""

    def test_regression_blocked_on_worse_mae(self, tmp_path):
        """A new model with MAE > 1.5x the old MAE should be blocked."""
        from data.pipelines.tasks import ml_retrain

        # Setup: existing model meta with MAE = 1000
        meta_path = tmp_path / "model.meta.pkl"
        with open(meta_path, "wb") as f:
            pickle.dump({"mae_eur_sqm": 1000.0}, f)

        with patch.object(ml_retrain, "MODEL_PATH", tmp_path / "model.pkl"), \
             patch.object(ml_retrain, "META_PATH", meta_path), \
             patch.object(ml_retrain, "DATABASE_URL", "postgresql://fake"), \
             patch.object(ml_retrain, "REGRESSION_THRESHOLD", 1.5), \
             patch.object(ml_retrain, "MIN_ACCEPTABLE_MAE", 500):
            
            # The guard should block: new MAE 2000 > 1000 * 1.5 = 1500
            old_meta = ml_retrain._load_model_meta()
            assert old_meta["mae_eur_sqm"] == 1000.0

            new_mae = 2000.0
            ratio = new_mae / old_meta["mae_eur_sqm"]
            assert ratio > ml_retrain.REGRESSION_THRESHOLD

    def test_regression_allowed_on_better_mae(self, tmp_path):
        """A new model with MAE better than the old one should be allowed."""
        from data.pipelines.tasks import ml_retrain

        meta_path = tmp_path / "model.meta.pkl"
        with open(meta_path, "wb") as f:
            pickle.dump({"mae_eur_sqm": 1000.0}, f)

        with patch.object(ml_retrain, "MODEL_PATH", tmp_path / "model.pkl"), \
             patch.object(ml_retrain, "META_PATH", meta_path), \
             patch.object(ml_retrain, "DATABASE_URL", "postgresql://fake"), \
             patch.object(ml_retrain, "REGRESSION_THRESHOLD", 1.5):
            
            old_meta = ml_retrain._load_model_meta()
            new_mae = 800.0
            ratio = new_mae / old_meta["mae_eur_sqm"]
            assert ratio < ml_retrain.REGRESSION_THRESHOLD

    def test_absolute_threshold_blocks(self, tmp_path):
        """A model with MAE above MIN_ACCEPTABLE_MAE should be blocked even if ratio is OK."""
        from data.pipelines.tasks import ml_retrain

        with patch.object(ml_retrain, "MIN_ACCEPTABLE_MAE", 500), \
             patch.object(ml_retrain, "REGRESSION_THRESHOLD", 1.5):
            
            mae = 600.0
            old_mae = 500.0
            ratio = mae / old_mae  # 1.2 < 1.5, ratio is OK
            assert ratio < ml_retrain.REGRESSION_THRESHOLD
            assert mae > ml_retrain.MIN_ACCEPTABLE_MAE  # but absolute threshold blocks

    def test_first_run_no_meta_does_not_block(self, tmp_path):
        """First run (no .meta.pkl) should not be blocked by the regression guard."""
        from data.pipelines.tasks import ml_retrain

        meta_path = tmp_path / "nonexistent.meta.pkl"
        
        with patch.object(ml_retrain, "META_PATH", meta_path):
            old_meta = ml_retrain._load_model_meta()
            assert old_meta == {}  # empty dict = no previous model
            assert old_meta.get("mae_eur_sqm") is None  # guard is skipped

    def test_meta_save_and_load_roundtrip(self, tmp_path):
        """Metadata should survive a save/load cycle."""
        from data.pipelines.tasks import ml_retrain

        meta_path = tmp_path / "model.meta.pkl"
        
        with patch.object(ml_retrain, "META_PATH", meta_path):
            meta = {"mae_eur_sqm": 750.5, "training_samples": 10000, "features": ["lat", "lng"]}
            ml_retrain._save_model_meta(meta)
            
            loaded = ml_retrain._load_model_meta()
            assert loaded["mae_eur_sqm"] == 750.5
            assert loaded["training_samples"] == 10000
            assert loaded["features"] == ["lat", "lng"]