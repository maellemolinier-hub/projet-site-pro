"""
Tests d'évaluation pour le modèle de probabilité de mise en vente (model.py).

Vérifie que :
1. La garde anti-régression bloque un modèle moins performant que l'ancien.
2. La garde anti-régression autorise un modèle plus performant.
3. Un modèle avec une accuracy absolue insuffisante est bloqué.
4. Le fallback heuristique fonctionne quand le modèle ML n'est pas disponible.
5. Les features manquantes déclenchent le fallback heuristique.
6. Le clamp de sécurité borne la sortie entre 0 et 1.
"""

import os
import sys
import pickle
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

import numpy as np
import pytest

# Ensure the app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from apps.api.ml import model as ml_model


def _make_fake_classifier(accuracy: float):
    """Create a fake classifier that returns predictions producing the desired accuracy."""
    classifier = MagicMock()
    # predict returns values that will produce the desired accuracy
    # We achieve this by having predict return y_test + offset (constant offset)
    # mean(predictions == y_test) = accuracy
    # predict returns y_test if accuracy is high, or inverted if low
    classifier.predict = MagicMock(side_effect=lambda X: _accuracy_predict(X, accuracy))
    classifier.predict_proba = MagicMock(return_value=np.array([[0.3, 0.7]]))
    classifier.fit = MagicMock()
    return classifier


def _accuracy_predict(X, accuracy):
    """Return predictions that achieve a target accuracy on a known y_test."""
    # This is a helper; actual accuracy is tested via evaluate_model
    return np.zeros(len(X))


class TestSaleProbabilityModel:
    """Tests for the sale probability model and its regression guard."""

    def test_regression_blocked_on_worse_accuracy(self, tmp_path):
        """A new model with accuracy > 10% worse than old should be blocked."""
        from apps.api.ml import model as ml

        # Setup: existing model with accuracy = 0.80
        model_path = tmp_path / "sale_probability_model.pkl"
        old_model = MagicMock()
        old_model.predict = MagicMock(return_value=np.array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0]))
        with open(model_path, "wb") as f:
            pickle.dump(old_model, f)

        # New model with accuracy = 0.40 (worse by 0.40 > 0.10 threshold)
        new_model = MagicMock()
        new_model.predict = MagicMock(return_value=np.array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]))
        new_model.fit = MagicMock()

        y_eval = np.array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
        X_eval = np.zeros((10, 5))

        with patch.object(ml, "MODEL_PATH", model_path):
            with patch("xgboost.XGBClassifier", return_value=new_model):
                result = ml.train_model(
                    np.zeros((100, 5)),
                    np.zeros(100),
                    X_eval=X_eval,
                    y_eval=y_eval,
                )

        assert result["status"] == "regression_blocked"
        assert result["action"] == "kept_existing_model"

    def test_regression_allowed_on_better_accuracy(self, tmp_path):
        """A new model with better accuracy than old should be deployed."""
        from apps.api.ml import model as ml

        model_path = tmp_path / "sale_probability_model.pkl"
        old_model = MagicMock()
        # Old model: 50% accuracy
        old_model.predict = MagicMock(return_value=np.array([1, 1, 0, 0, 1, 1, 0, 0, 1, 1]))
        with open(model_path, "wb") as f:
            pickle.dump(old_model, f)

        # New model: 90% accuracy
        new_model = MagicMock()
        new_model.predict = MagicMock(return_value=np.array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0]))
        new_model.fit = MagicMock()

        y_eval = np.array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
        X_eval = np.zeros((10, 5))

        with patch.object(ml, "MODEL_PATH", model_path):
            with patch("xgboost.XGBClassifier", return_value=new_model):
                result = ml.train_model(
                    np.zeros((100, 5)),
                    np.zeros(100),
                    X_eval=X_eval,
                    y_eval=y_eval,
                )

        assert result["status"] == "success"

    def test_absolute_threshold_blocks_poor_model(self, tmp_path):
        """A model with accuracy below MIN_ACCEPTABLE_ACCURACY should be blocked."""
        from apps.api.ml import model as ml

        model_path = tmp_path / "sale_probability_model.pkl"
        # No existing model (first run)

        # New model with very poor accuracy
        new_model = MagicMock()
        new_model.predict = MagicMock(return_value=np.array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
        new_model.fit = MagicMock()

        y_eval = np.array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
        X_eval = np.zeros((10, 5))

        with patch.object(ml, "MODEL_PATH", model_path):
            with patch("xgboost.XGBClassifier", return_value=new_model):
                result = ml.train_model(
                    np.zeros((100, 5)),
                    np.zeros(100),
                    X_eval=X_eval,
                    y_eval=y_eval,
                )

        assert result["status"] == "regression_blocked"
        assert "accuracy" in result["reason"]

    def test_first_run_no_meta_does_not_block(self, tmp_path):
        """First run (no existing model) with acceptable accuracy should succeed."""
        from apps.api.ml import model as ml

        model_path = tmp_path / "nonexistent_model.pkl"

        # New model with good accuracy
        new_model = MagicMock()
        new_model.predict = MagicMock(return_value=np.array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0]))
        new_model.fit = MagicMock()

        y_eval = np.array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
        X_eval = np.zeros((10, 5))

        with patch.object(ml, "MODEL_PATH", model_path):
            with patch("xgboost.XGBClassifier", return_value=new_model):
                result = ml.train_model(
                    np.zeros((100, 5)),
                    np.zeros(100),
                    X_eval=X_eval,
                    y_eval=y_eval,
                )

        assert result["status"] == "success"

    def test_heuristic_fallback_when_no_model(self):
        """Heuristic score should be returned when no ML model is available."""
        from apps.api.ml import model as ml

        with patch.object(ml, "_model", None):
            with patch.object(ml, "MODEL_PATH", Path("/nonexistent/path/model.pkl")):
                score = ml.predict_sale_probability({
                    "years_owned": 25,
                    "avg_price_sqm": 5000,
                    "trend_6m": 15,
                    "lat": 48.8,
                    "lng": 2.35,
                })

        # years_owned > 20 → +0.35, trend > 10 → +0.20, base = 0.3
        # total = 0.85
        assert 0.0 <= score <= 1.0
        assert score == pytest.approx(0.85, abs=0.01)

    def test_missing_features_trigger_fallback(self):
        """Missing required features should trigger heuristic fallback."""
        from apps.api.ml import model as ml

        with patch.object(ml, "_model", None):
            score = ml.predict_sale_probability({
                "years_owned": 15,
                # Missing: avg_price_sqm, trend_6m, lat, lng
            })

        assert 0.0 <= score <= 1.0

    def test_predict_output_is_clamped(self):
        """Predict output should always be between 0.0 and 1.0."""
        from apps.api.ml import model as ml

        fake_model = MagicMock()
        fake_model.predict_proba = MagicMock(return_value=np.array([[-5.0, 5.0]]))

        with patch.object(ml, "_model", fake_model):
            score = ml.predict_sale_probability({
                "years_owned": 10,
                "avg_price_sqm": 4000,
                "trend_6m": 5,
                "lat": 48.8,
                "lng": 2.35,
            })

        assert 0.0 <= score <= 1.0

    def test_evaluate_model_returns_accuracy(self):
        """evaluate_model should return correct accuracy."""
        from apps.api.ml import model as ml

        fake_model = MagicMock()
        fake_model.predict = MagicMock(return_value=np.array([1, 0, 1, 0]))
        y_test = np.array([1, 0, 1, 0])
        X_test = np.zeros((4, 5))

        accuracy = ml.evaluate_model(fake_model, X_test, y_test)
        assert accuracy == 1.0

        fake_model.predict = MagicMock(return_value=np.array([0, 1, 0, 1]))
        accuracy = ml.evaluate_model(fake_model, X_test, y_test)
        assert accuracy == 0.0

    def test_evaluate_model_empty_returns_zero(self):
        """evaluate_model with empty arrays should return 0.0."""
        from apps.api.ml import model as ml

        fake_model = MagicMock()
        accuracy = ml.evaluate_model(fake_model, np.array([]), np.array([]))
        assert accuracy == 0.0

    def test_train_model_dimension_validation(self):
        """train_model should raise ValueError on wrong feature dimension."""
        from apps.api.ml import model as ml

        with pytest.raises(ValueError, match="Dimension de X"):
            ml.train_model(np.zeros((10, 3)), np.zeros(10))