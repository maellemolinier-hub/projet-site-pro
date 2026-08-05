"""Mapping secteur d'activité -> codes NAF/APE (nomenclature INSEE), utilisé
pour interroger l'API publique "Recherche d'entreprises" (SIRENE).

Les clés de secteur sont volontairement alignées sur celles
d'`automation.sms_prospection.secteurs` : une entreprise captée ici (secteur
"plombier") pourra directement recevoir le SMS/e-mail "plombier" déjà
construit, sans traduction supplémentaire.

Priorité donnée par le client : artisans du BTP, jardiniers/paysagistes,
restaurateurs, VTC — secteurs de métiers qui ont un besoin fort de visibilité
en ligne (peu ou pas de présence web à la création).
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SecteurNaf:
    codes_naf: tuple[str, ...]
    prioritaire: bool = False


SECTEURS_NAF: dict[str, SecteurNaf] = {
    # ── BTP / artisans du bâtiment (priorité) ────────────────────────────
    "plombier": SecteurNaf(("43.22A", "43.22B"), prioritaire=True),
    "electricien": SecteurNaf(("43.21A",), prioritaire=True),
    "macon": SecteurNaf(("43.99C", "41.20B"), prioritaire=True),
    "couvreur": SecteurNaf(("43.91A", "43.91B"), prioritaire=True),
    "peintre": SecteurNaf(("43.34Z",), prioritaire=True),
    "menuisier": SecteurNaf(("43.32A", "43.32C"), prioritaire=True),
    "platrier_carreleur": SecteurNaf(("43.31Z", "43.33Z"), prioritaire=True),
    "btp": SecteurNaf(("43.99A", "43.99B", "43.99C", "41.20A", "41.20B"), prioritaire=True),

    # ── Jardinier / paysagiste (priorité) ────────────────────────────────
    "jardinier": SecteurNaf(("81.30Z",), prioritaire=True),

    # ── Restauration (priorité) ───────────────────────────────────────────
    "restaurateur": SecteurNaf(("56.10A", "56.10B", "56.10C"), prioritaire=True),

    # ── VTC / transport de personnes (priorité) ──────────────────────────
    "vtc": SecteurNaf(("49.32Z", "49.39B"), prioritaire=True),

    # ── Autres artisans/commerçants déjà couverts par le SMS ─────────────
    "coiffeur": SecteurNaf(("96.02A",)),
    "esthetique": SecteurNaf(("96.02B",)),
    "boulanger": SecteurNaf(("10.71C",)),
    "boucher": SecteurNaf(("47.22Z",)),
    "fleuriste": SecteurNaf(("47.76Z",)),
    "garagiste": SecteurNaf(("45.20A", "45.20B")),
}


def secteurs_prioritaires() -> list[str]:
    """Secteurs à cibler en priorité (BTP, jardinier, restaurateur, VTC)."""
    return [cle for cle, s in SECTEURS_NAF.items() if s.prioritaire]


def codes_naf_pour(secteur: str) -> tuple[str, ...]:
    entree = SECTEURS_NAF.get((secteur or "").strip().lower())
    return entree.codes_naf if entree else ()


def secteur_pour_code_naf(code_naf: str) -> str | None:
    """Retrouve le secteur (clé) correspondant à un code NAF donné."""
    code_naf = (code_naf or "").strip().upper()
    for cle, secteur in SECTEURS_NAF.items():
        if code_naf in secteur.codes_naf:
            return cle
    return None
