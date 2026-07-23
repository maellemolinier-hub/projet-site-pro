"""Orchestrateur de campagne : import des prospects, filtrage liste noire,
personnalisation, envoi SMS avec quota/débit maîtrisés, journalisation.
"""
from __future__ import annotations

import csv
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import insert, select, update

from . import campagne_etat
from .blacklist import is_blacklisted
from .booking import ensure_booking_token
from .config import settings
from .conversations import journaliser_message
from .db import get_engine, sms_envoi_log, sms_prospect
from .events import enregistrer_evenement
from .message_builder import build_sms_message
from .models import Prospect
from .phone_utils import NumeroInvalide, normaliser_e164
from .providers import get_provider
from .providers.base import SmsProvider
from .shortener import shorten_url

logger = logging.getLogger(__name__)


@dataclass
class RapportEnvoi:
    total: int = 0
    envoyes: int = 0
    bloques_blacklist: int = 0
    echecs: int = 0
    ignores_quota: int = 0


def _row_to_prospect(row) -> Prospect:
    return Prospect(
        id=row["id"],
        prenom=row["prenom"],
        phone=row["phone"],
        secteur=row["secteur"],
        nom=row["nom"],
        ville=row["ville"],
        email=row["email"],
        booking_token=row["booking_token"],
        statut=row["statut"],
        date_envoi=row["date_envoi"],
        date_rdv=row["date_rdv"],
    )


def importer_prospects_csv(chemin_csv: str | Path) -> int:
    """Importe un CSV (colonnes : prenom, phone, secteur, nom, ville, email) en
    base, en ignorant les numéros déjà présents ou invalides. Renvoie le
    nombre de lignes effectivement importées."""
    engine = get_engine()
    importes = 0
    with open(chemin_csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for ligne in reader:
            try:
                phone = normaliser_e164(ligne["phone"])
            except (NumeroInvalide, KeyError) as exc:
                logger.warning("Ligne ignorée (numéro invalide) : %s (%s)", ligne, exc)
                continue

            with engine.connect() as conn:
                existe = conn.execute(
                    select(sms_prospect.c.id).where(sms_prospect.c.phone == phone)
                ).first()
            if existe:
                continue

            with engine.begin() as conn:
                conn.execute(
                    insert(sms_prospect).values(
                        phone=phone,
                        prenom=ligne["prenom"].strip(),
                        secteur=ligne.get("secteur", "").strip().lower(),
                        nom=(ligne.get("nom") or "").strip() or None,
                        ville=(ligne.get("ville") or "").strip() or None,
                        email=(ligne.get("email") or "").strip() or None,
                        statut="nouveau",
                    )
                )
            importes += 1
    return importes


def obtenir_prospect(prospect_id: int) -> Prospect | None:
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(
            select(sms_prospect).where(sms_prospect.c.id == prospect_id)
        ).mappings().first()
    return _row_to_prospect(row) if row else None


def rechercher_prospects(recherche: str, limite: int = 10) -> list[Prospect]:
    """Recherche par prénom, nom ou numéro de téléphone (correspondance partielle,
    insensible à la casse — `.ilike()` est portable SQLite/Postgres via SQLAlchemy)."""
    motif = f"%{recherche.strip()}%"
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(
            select(sms_prospect)
            .where(
                sms_prospect.c.phone.ilike(motif)
                | sms_prospect.c.prenom.ilike(motif)
                | sms_prospect.c.nom.ilike(motif)
            )
            .limit(limite)
        ).mappings().all()
    return [_row_to_prospect(r) for r in rows]


def envoyer_message_manuel(prospect_id: int, texte: str, provider: SmsProvider | None = None) -> str:
    """Envoie un SMS libre (hors template automatique) à un prospect précis,
    depuis le centre de pilotage. Respecte la liste noire. Renvoie un message
    de statut lisible (utilisé tel quel par l'assistant IA pilote)."""
    prospect = obtenir_prospect(prospect_id)
    if prospect is None:
        return f"Prospect introuvable (id={prospect_id})."

    if is_blacklisted(prospect.phone):
        return f"Impossible : {prospect.prenom} ({prospect.phone}) est en liste noire (désinscrit)."

    if settings.dry_run:
        journaliser_message(prospect.id, "sortant", "manuel", texte)
        return f"[DRY-RUN] Message à {prospect.prenom} simulé (aucun SMS réel envoyé) : {texte!r}"

    provider = provider or get_provider()
    resultat = provider.send(prospect.phone, texte)
    if resultat.succes:
        journaliser_message(prospect.id, "sortant", "manuel", texte)
        enregistrer_evenement(
            "sms_envoye",
            f"Message manuel envoyé à {prospect.prenom}",
            detail=texte,
            prospect_id=prospect.id,
        )
        return f"Message envoyé à {prospect.prenom} ({prospect.phone})."

    enregistrer_evenement(
        "sms_erreur",
        f"Échec de l'envoi manuel à {prospect.prenom}",
        detail=resultat.erreur,
        niveau="alerte",
        prospect_id=prospect.id,
    )
    return f"Échec de l'envoi à {prospect.prenom} : {resultat.erreur}"


def _prospects_a_contacter(limite: int) -> list[Prospect]:
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(
            select(sms_prospect)
            .where(sms_prospect.c.statut == "nouveau")
            .limit(limite)
        ).mappings().all()
    return [_row_to_prospect(r) for r in rows]


def _maj_statut_prospect(prospect_id: int, statut: str, **champs) -> None:
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(
            update(sms_prospect)
            .where(sms_prospect.c.id == prospect_id)
            .values(statut=statut, **champs)
        )


def _journaliser(prospect_id: int, message: str, statut_envoi: str, provider_ref=None, erreur=None) -> None:
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(
            insert(sms_envoi_log).values(
                prospect_id=prospect_id,
                message=message,
                statut_envoi=statut_envoi,
                provider_ref=provider_ref,
                erreur=erreur,
            )
        )


def envoyer_campagne(
    limite: int | None = None,
    provider: SmsProvider | None = None,
    dry_run: bool | None = None,
    raccourcir_lien: bool = True,
) -> RapportEnvoi:
    """Envoie la campagne SMS aux prospects au statut 'nouveau', dans la limite
    du quota journalier, avec un délai entre chaque envoi (protège la
    réputation de l'expéditeur et respecte les limites des fournisseurs).
    Ne fait rien si la campagne est en pause (voir campagne_etat.py) —
    contrôlable depuis le centre de pilotage ou l'assistant IA pilote."""
    if campagne_etat.obtenir_etat().en_pause:
        logger.info("Campagne en pause — envoi ignoré.")
        return RapportEnvoi()

    limite = min(limite or settings.daily_quota, settings.daily_quota)
    dry_run = settings.dry_run if dry_run is None else dry_run
    provider = provider or (None if dry_run else get_provider())

    rapport = RapportEnvoi()
    prospects = _prospects_a_contacter(limite)
    rapport.total = len(prospects)

    for prospect in prospects:
        if is_blacklisted(prospect.phone):
            _maj_statut_prospect(prospect.id, "stop")
            rapport.bloques_blacklist += 1
            logger.info("Prospect %s ignoré (liste noire)", prospect.phone)
            continue

        prospect = ensure_booking_token(prospect)
        message = build_sms_message(prospect)
        texte_final = message.texte
        if raccourcir_lien and not dry_run:
            from .message_builder import build_booking_link

            lien = build_booking_link(prospect)
            lien_court = shorten_url(lien)
            texte_final = texte_final.replace(lien, lien_court)

        if dry_run:
            logger.info("[DRY-RUN] SMS à %s (%s segment·s) : %s", prospect.phone, message.nb_segments, texte_final)
            _journaliser(prospect.id, texte_final, "dry_run")
            rapport.envoyes += 1
            continue

        resultat = provider.send(prospect.phone, texte_final)
        if resultat.succes:
            _maj_statut_prospect(
                prospect.id, "envoye", date_envoi=datetime.now(timezone.utc)
            )
            _journaliser(prospect.id, texte_final, "envoye", provider_ref=resultat.provider_ref)
            journaliser_message(prospect.id, "sortant", "automatique", texte_final)
            enregistrer_evenement(
                "sms_envoye",
                f"SMS envoyé à {prospect.prenom}",
                detail=texte_final,
                prospect_id=prospect.id,
            )
            rapport.envoyes += 1
        else:
            _maj_statut_prospect(prospect.id, "echec")
            _journaliser(prospect.id, texte_final, "echec", erreur=resultat.erreur)
            enregistrer_evenement(
                "sms_erreur",
                f"Échec de l'envoi à {prospect.prenom}",
                detail=resultat.erreur,
                niveau="alerte",
                prospect_id=prospect.id,
            )
            rapport.echecs += 1

        time.sleep(settings.seconds_between_sms)

    return rapport
