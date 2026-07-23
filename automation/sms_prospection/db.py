"""Accès base de données (SQLAlchemy Core) — portable SQLite (dev) / PostgreSQL (Supabase, prod).

Le DDL est défini une seule fois via `MetaData`/`Table` : `create_all()` génère
le bon dialecte SQL (autoincrement, types) quel que soit le moteur cible, ce qui
évite d'avoir deux schémas à maintenir en parallèle (voir sql/schema.sql pour la
version PostgreSQL de référence, générée à partir des mêmes colonnes).
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    MetaData,
    String,
    Table,
    create_engine,
    select,
)
from sqlalchemy.engine import Engine

from .config import settings

metadata = MetaData()

sms_prospect = Table(
    "sms_prospect",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("phone", String, nullable=False, unique=True),
    Column("prenom", String, nullable=False),
    Column("nom", String),
    Column("secteur", String, nullable=False),
    Column("ville", String),
    Column("email", String),
    Column("booking_token", String, unique=True),
    Column("statut", String, nullable=False, default="nouveau"),
    Column("date_envoi", DateTime),
    Column("date_rdv", DateTime),
    Column("created_at", DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)),
)

sms_blacklist = Table(
    "sms_blacklist",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("phone", String, nullable=False, unique=True),
    Column("source", String, nullable=False, default="stop_sms"),
    Column("created_at", DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)),
)

sms_envoi_log = Table(
    "sms_envoi_log",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("prospect_id", Integer, nullable=False),
    Column("message", String, nullable=False),
    Column("statut_envoi", String, nullable=False),
    Column("provider_ref", String),
    Column("erreur", String),
    Column("created_at", DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)),
)

_engine: Engine | None = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        url = settings.database_url
        connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
        _engine = create_engine(url, connect_args=connect_args, future=True)
        metadata.create_all(_engine)
    return _engine


def reset_engine_for_tests() -> None:
    """Réinitialise l'engine mémorisé (utile entre deux tests avec des DB différentes)."""
    global _engine
    _engine = None


def phone_exists_in_table(table: Table, phone: str) -> bool:
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(select(table.c.id).where(table.c.phone == phone)).first()
        return row is not None
