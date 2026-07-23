"""Mapping secteur d'activité -> assistant IA sectoriel & libellé métier.

Utilisé pour personnaliser le SMS avec le bon nom d'assistant IA et le bon
pluriel métier (ex: "plombiers", "boulangers-pâtissiers"...).
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Secteur:
    label_pluriel: str      # ex: "plombiers" — utilisé dans "aide les {label_pluriel} à..."
    assistant_ia: str        # ex: "l'Assistant IA Plomberie"


SECTEURS: dict[str, Secteur] = {
    "plombier": Secteur("plombiers", "l'Assistant IA Plomberie"),
    "electricien": Secteur("électriciens", "l'Assistant IA Électricité"),
    "macon": Secteur("maçons", "l'Assistant IA BTP"),
    "btp": Secteur("professionnels du BTP", "l'Assistant IA BTP"),
    "peintre": Secteur("peintres en bâtiment", "l'Assistant IA Peinture & Décoration"),
    "menuisier": Secteur("menuisiers", "l'Assistant IA Menuiserie"),
    "coiffeur": Secteur("coiffeurs", "l'Assistant IA Coiffure & Beauté"),
    "esthetique": Secteur("instituts de beauté", "l'Assistant IA Coiffure & Beauté"),
    "restaurateur": Secteur("restaurateurs", "l'Assistant IA Restauration"),
    "boulanger": Secteur("boulangers-pâtissiers", "l'Assistant IA Boulangerie-Pâtisserie"),
    "fleuriste": Secteur("fleuristes", "l'Assistant IA Fleuriste"),
    "garagiste": Secteur("garagistes", "l'Assistant IA Garage Auto"),
    "boucher": Secteur("bouchers-charcutiers", "l'Assistant IA Boucherie-Charcuterie"),
    "artisan": Secteur("artisans", "l'Assistant IA Artisan"),
    "commercant": Secteur("commerçants", "l'Assistant IA Commerce"),
}

DEFAULT_SECTEUR = Secteur("artisans et commerçants", "l'Assistant IA métier")


def get_secteur(cle: str) -> Secteur:
    """Retourne le profil sectoriel, ou un profil générique si le secteur est inconnu."""
    return SECTEURS.get((cle or "").strip().lower(), DEFAULT_SECTEUR)
