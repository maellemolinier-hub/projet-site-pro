from celery import Celery
from celery.schedules import crontab
import os

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

app = Celery(
    "immoexpert",
    broker=redis_url,
    backend=redis_url,
    include=[
        "data.pipelines.tasks.daily_refresh",
        "data.pipelines.tasks.ml_retrain",
        "data.pipelines.tasks.indicators_refresh",
    ],
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Paris",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    # Timeout 30 min par tâche (un département peut peser ~50 MB)
    task_soft_time_limit=1800,
    task_time_limit=2100,
)

app.conf.beat_schedule = {
    # ── Nightly : batch rotatif (~15 depts/nuit, France entière en 7 jours) ──
    # batch_index=None → calculé automatiquement depuis le jour de l'année
    "dvf-nightly-batch": {
        "task": "data.pipelines.tasks.daily_refresh.refresh_dvf_batch",
        "schedule": crontab(hour=3, minute=0),
        "kwargs": {"batch_index": None},
    },

    # ── Mensuel (1er du mois à 2h) : ingestion complète France entière ───────
    # Recharge le fichier DVF annuel complet pour les 101 départements
    "dvf-monthly-full-france": {
        "task": "data.pipelines.tasks.daily_refresh.refresh_all_france",
        "schedule": crontab(hour=2, minute=0, day_of_month=1),
        "kwargs": {},  # year=None → année N-1 automatiquement
    },

    # ── Hebdomadaire (dimanche 4h) : réentraînement modèle ML ────────────────
    "ml-weekly-retrain": {
        "task": "data.pipelines.tasks.ml_retrain.retrain_model",
        "schedule": crontab(hour=4, minute=0, day_of_week=0),
    },

    # ── Mensuel (2 du mois à 5h) : référentiel communes + indicateurs de zone ─
    "indicators-monthly-communes": {
        "task": "data.pipelines.tasks.indicators_refresh.refresh_communes",
        "schedule": crontab(hour=5, minute=0, day_of_month=2),
    },
    "indicators-monthly-vacant-housing": {
        "task": "data.pipelines.tasks.indicators_refresh.refresh_vacant_housing",
        "schedule": crontab(hour=5, minute=30, day_of_month=2),
    },
    # ── Annuel (15 janvier 6h) : décès de l'année N-1 par commune ─────────────
    "indicators-yearly-deaths": {
        "task": "data.pipelines.tasks.indicators_refresh.refresh_deaths",
        "schedule": crontab(hour=6, minute=0, day_of_month=15, month_of_year=1),
    },
}
