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


@shared_task(bind=True, name="data.pipelines.tasks.ml_retrain.retrain_model", max_retries=2)
def retrain_model(self):
    """Retrain the XGBoost prospect model with the latest DVF data."""
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

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    logger.info(f"Model saved to {MODEL_PATH}")

    return {
        "status": "success",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "mae_eur_sqm": round(mae, 1),
        "model_path": str(MODEL_PATH),
    }
