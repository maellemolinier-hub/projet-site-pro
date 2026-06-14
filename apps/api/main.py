from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

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
