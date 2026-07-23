"""Normalisation des numéros de téléphone au format E.164 (France par défaut)."""
from __future__ import annotations

import re


class NumeroInvalide(ValueError):
    pass


def normaliser_e164(numero: str, indicatif_pays_defaut: str = "+33") -> str:
    """Normalise un numéro français saisi sous diverses formes vers l'E.164.

    Exemples acceptés : "06 12 34 56 78", "0612345678", "+33612345678",
    "0033612345678".
    """
    if not numero:
        raise NumeroInvalide("Numéro vide")

    nettoye = re.sub(r"[\s().-]", "", numero.strip())

    if nettoye.startswith("+"):
        candidat = nettoye
    elif nettoye.startswith("00"):
        candidat = "+" + nettoye[2:]
    elif nettoye.startswith("0"):
        candidat = indicatif_pays_defaut + nettoye[1:]
    else:
        candidat = indicatif_pays_defaut + nettoye

    if not re.fullmatch(r"\+[1-9]\d{7,14}", candidat):
        raise NumeroInvalide(f"Numéro invalide après normalisation : {numero!r} -> {candidat!r}")

    return candidat
