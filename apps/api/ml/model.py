"""
Modèle de prédiction de probabilité de mise en vente.
Entrée sur l'historique DVF : bien vendu ou pas dans les 6 mois suivant la date d'observation.
"""
import logging
import pickle
from pathlib import Path

import numpy as np

logger = logging.getLogger(__name__)

_model = None
MODEL_PATH = Path(__file__).parent / "sale_probability_model.pkl"

# Features attendues par le modèle (doit correspondre à l'entraînement)
REQUIRED_FEATURES = ("years_owned", "avg_price_sqm", "trend_6m", "lat", "lng")

# Seuil de fallback : si le modèle ML échoue, on utilise le score heuristique
# mais on log un warning pour que l'opérateur sache que l'inférence est dégradée.
HEURISTIC_BASE_SCORE = 0.3


def _load_model():
    global _model
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        logger.info("Modèle ML chargé depuis %s", MODEL_PATH)
    else:
        logger.warning("Modèle ML non trouvé — utilisation du modèle heuristique")
        _model = None


def predict_sale_probability(features: dict) -> float:
    """
    Retourne une probabilité de mise en vente dans les 6 mois (0.0 ≤ 1.0).
    """
    global _model

    # Valider les features d'entrée
    missing = [k for k in REQUIRED_FEATURES if k not in features]
    if missing:
        logger.warning("Features manquantes pour l'inférence ML: %s — fallback heuristique", missing)
        return _heuristic_score(features)

    if _model is None:
        _load_model()

    if _model is not None:
        try:
            X = _build_feature_vector(features)
            proba = float(_model.predict_proba(X)[0][1])
            # Clamp de sécurité
            return max(0.0, min(1.0, proba))
        except Exception as exc:
            logger.error("Erreur d'inférence ML (%s) — fallback heuristique", exc)

    logger.warning("Fallback heuristique activé pour predict_sale_probability")
    return _heuristic_score(features)


def _build_feature_vector(features: dict) -> np.ndarray:
    """Construit le vecteur de features pour l'inférence ML."""
    return np.array([[
        features.get("years_owned", 0),
        features.get("avg_price_sqm", 0),
        features.get("trend_6m", 0),
        features.get("lat", features.get("latitude", 48.8)),
        features.get("lng", features.get("longitude", 2.35)),
    ]])


def _heuristic_score(features: dict) -> float:
    """Score heuristique quand le modèle ML n'est pas encadré."""
    score = HEURISTIC_BASE_SCORE

    years_owned = features.get("years_owned", 0)
    if years_owned > 20:
        score += 0.35
    elif years_owned > 10:
        score += 0.20
    elif years_owned > 5:
        score += 0.10

    trend = features.get("trend_6m", 0)
    if trend > 10:
        score += 0.20
    elif trend > 5:
        score += 0.10
    elif trend < -5:
        score -= 0.10

    return min(max(score, 0.0), 1.0)


def train_model(X: np.ndarray, y: np.ndarray) -> None:
    """Entraîne et sauvegarde le modèle XGBoost."""
    if X.shape[1] != len(REQUIRED_FEATURES):
        raise ValueError(
            f"Dimension de X ({X.shape[1]}) != nombre de features attendues "
            f"({len(REQUIRED_FEATURES)}). Features attendues: {REQUIRED_FEATURES}"
        )
    try:
        from xgboost import XGBClassifier
    except ImportError:
        from sklearn.ensemble import GradientBoostingClassifier as XGBClassifier

    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
    )
    model.fit(X, y)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    global _model
    _model = model
    logger.info("Modèle entraîné et sauvegardé")
