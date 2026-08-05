"""
Weekly ML model retraining task.
Pulls recent PricePoint data and retrains the XGBoost prospect scoring model.
"""
import os
import logging
import pickle
from pathlib import Path

import pandas as pd
from celery import shared_task
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "")
MODEL_PATH = Path(os.environ.get("MODEL_PATH", "/app/ml/model.pkl"))

# Seuil de régression : si le nouveau MAE est > 1.5x l'ancien, on garde l'ancien modèle
REGRESSION_THRESHOLD = 1.5
# MAE minimum acceptable en absolu (€/m²)
MIN_ACCEPTABLE_MAE = 500

# Métadonnées du modèle actuel (chargées depuis le fichier .meta)
META_PATH = MODEL_PATH.with_suffix(".meta.pkl")


def _load_model_meta() -> dict:
    """Charge les métadonnées du modèle actuel (MAE, date, samples)."""
    if META_PATH.exists():
        with open(META_PATH, "rb") as f:
            return pickle.load(f)
    return {}


def _save_model_meta(meta: dict) -> None:
    with open(META_PATH, "wb") as f:
        pickle.dump(meta, f)


@shared_task(bind=True, name="data.pipelines.tasks.ml_retrain.retrain_model", max_retries=2)
def retrain_model(self):
    """Retrain the XGBoost prospect scoring model with the latest DVF data."""
    if not DATABASE_URL:
        logger.warning("DATABASE_URL not set, skipping ML retraining")
        return {"status": "skipped"}

    try:
        import xgboost as xgb
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import mean_absolute_error
    except ImportError:
        logger.error("xgboost/sklearn not installed")
        return {"status": "error", "reason": "missing deps"}

    engine = create_engine(DATABASE_URL)

    logger.info("Loading training data from DB…")
    with engine.connect() as conn:
        df = pd.read_sql(
            text("""
                SELECT
                    latitude, longitude, surface_area, room_count,
                    price_per_sqm, property_type,
                    EXTRACT(MONTH FROM sale_date) AS month,
                    EXTRACT(YEAR FROM sale_date) AS year
                FROM "PricePoint"
                WHERE
                    sale_date >= NOW() - INTERVAL '3 years'
                    AND price_per_sqm BETWEEN 500 AND 50000
                    AND surface_area > 5
                    AND latitude IS NOT NULL
                LIMIT 500000
            """),
            conn,
        )

    if len(df) < 1000:
        logger.warning(f"Too few training samples ({len(df)}), skipping retraining")
        return {"status": "skipped", "reason": "insufficient data", "rows": len(df)}

    logger.info(f"Training on {len(df)} samples")

    # Features
    df["property_type_enc"] = df["property_type"].map(
        {"APARTMENT": 0, "HOUSE": 1, "COMMERCIAL": 2, "OTHER": 3}
    ).fillna(3)

    features = ["latitude", "longitude", "surface_area", "room_count",
                "property_type_enc", "month", "year"]
    X = df[features].fillna(0)
    y = df["price_per_sqm"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    model = xgb.XGBRegressor(
        n_estimators=400,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    mae = mean_absolute_error(y_test, model.predict(X_test))
    logger.info(f"Model MAE: {mae:.0f} €/m²")

    # === Garde anti-régression ===
    old_meta = _load_model_meta()
    old_mae = old_meta.get("mae_eur_sqm")

    if old_mae is not None:
        ratio = mae / old_mae if old_mae > 0 else float("inf")
        if ratio > REGRESSION_THRESHOLD:
            logger.error(
                f"RÉGRESSION DÉTECTÉE : nouveau MAE {mae:.0f} vs ancien {old_mae:.0f} "
                f"(ratio {ratio:.2f} > seuil {REGRESSION_THRESHOLD}). "
                f"Le modèle actuel est conservé."
            )
            return {
                "status": "regression_blocked",
                "new_mae_eur_sqm": round(mae, 1),
                "old_mae_eur_sqm": old_mae,
                "ratio": round(ratio, 2),
                "threshold": REGRESSION_THRESHOLD,
                "action": "kept_existing_model",
            }

    if mae > MIN_ACCEPTABLE_MAE:
        logger.error(
            f"MAE absolu inacceptable ({mae:.0f} > {MIN_ACCEPTABLE_MAE}). "
            f"Modèle non déployé."
        )
        return {
            "status": "regression_blocked",
            "new_mae_eur_sqm": round(mae, 1),
            "reason": f"MAE > {MIN_ACCEPTABLE_MAE}",
            "action": "kept_existing_model",
        }

    # Sauvegarder le nouveau modèle
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    # Sauvegarder les métadonnées
    meta = {
        "mae_eur_sqm": round(mae, 1),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "features": features,
        "model_type": "XGBRegressor",
    }
    _save_model_meta(meta)

    logger.info(f"Model saved to {MODEL_PATH}")

    return {
        "status": "success",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "mae_eur_sqm": round(mae, 1),
        "model_path": str(MODEL_PATH),
        "previous_mae": old_mae,
    }