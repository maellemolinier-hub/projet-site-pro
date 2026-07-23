"""Accès base de données (SQLAlchemy Core) — portable SQLite (dev) / PostgreSQL (Supabase, prod).

Le DDL est défini une seule fois via `MetaData`/`Table` : `create_all()` génère
le bon dialecte SQL (autoincrement, types) quel que soit le moteur cible, ce qui
évite d'avoir deux schémas à maintenir en parallèle (voir sql/schema.sql pour la
version PostgreSQL de référence, générée à partir des mêmes colonnes).
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
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

sms_event = Table(
    "sms_event",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("categorie", String, nullable=False),
        # sms_envoye | sms_erreur | reponse_prospect | stop_recu | rdv_pris | action_pilote | commande | alerte_technique
    Column("niveau", String, nullable=False, default="info"),  # info | alerte
    Column("titre", String, nullable=False),
    Column("detail", String),
    Column("prospect_id", Integer),
    Column("lu", Boolean, nullable=False, default=False),
    Column("created_at", DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)),
)

campaign_state = Table(
    "campaign_state",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("en_pause", Boolean, nullable=False, default=False),
    Column("motif", String),
    Column("updated_at", DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)),
)

secteur_config = Table(
    "secteur_config",
    metadata,
    Column("cle", String, primary_key=True),
    Column("label_pluriel", String, nullable=False),
    Column("assistant_ia", String, nullable=False),
    Column("argumentaire", String, nullable=False),
        # texte libre : description de l'offre / des explications utilisées
        # à la fois dans le SMS et comme base du persona de l'assistant sectoriel
    Column("updated_at", DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)),
)

sms_message = Table(
    "sms_message",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("prospect_id", Integer, nullable=False),
    Column("direction", String, nullable=False),   # entrant | sortant
    Column("auteur", String, nullable=False),        # automatique | manuel | prospect
    Column("texte", String, nullable=False),
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
