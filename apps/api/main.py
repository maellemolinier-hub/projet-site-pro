import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional

from routers import prices, prospects, tiles, formations


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown


app = FastAPI(
    title="ImmoExpert API",
    version="0.1.0",
    description="API de données immobilières, prospection prédictive et formations",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://immoexpert.fr"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prices.router, prefix="/prices", tags=["Prix immobiliers"])
app.include_router(prospects.router, prefix="/prospects", tags=["Prospection prédictive"])
app.include_router(tiles.router, prefix="/tiles", tags=["Tuiles vectorielles"])
app.include_router(formations.router, prefix="/formations", tags=["Formations"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


class DVFRefreshRequest(BaseModel):
    departments: Optional[List[str]] = None


@app.post("/admin/refresh-dvf", tags=["Admin"])
async def trigger_dvf_refresh(
    body: DVFRefreshRequest,
    x_admin_secret: str = Header(alias="X-Admin-Secret", default=""),
):
    expected = os.environ.get("ADMIN_SECRET", "")
    if not expected or x_admin_secret != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        from data.pipelines.celery_app import app as celery_app  # noqa
        task = celery_app.send_task(
            "data.pipelines.tasks.daily_refresh.refresh_dvf",
            kwargs={"departments": body.departments},
        )
        return {"status": "queued", "task_id": task.id}
    except Exception as exc:
        # Celery may not be available in all environments — degrade gracefully
        return {"status": "error", "detail": str(exc)}
