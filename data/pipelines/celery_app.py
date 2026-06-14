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
)

app.conf.beat_schedule = {
    # Ingest DVF data every night at 3:00 AM
    "dvf-daily-refresh": {
        "task": "data.pipelines.tasks.daily_refresh.refresh_dvf",
        "schedule": crontab(hour=3, minute=0),
        "kwargs": {"departments": ["75", "69", "13", "33", "59", "67", "31", "06"]},
    },
    # Retrain ML model every Sunday at 4:00 AM
    "ml-weekly-retrain": {
        "task": "data.pipelines.tasks.ml_retrain.retrain_model",
        "schedule": crontab(hour=4, minute=0, day_of_week=0),
    },
}
