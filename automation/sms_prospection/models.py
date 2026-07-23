"""Modèles de données (dataclasses) — indépendants du moteur de stockage."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Prospect:
    prenom: str
    phone: str                       # E.164, ex: +33612345678
    secteur: str                     # clé technique, voir secteurs.py
    nom: Optional[str] = None        # nom du prospect / de l'entreprise -> "Audit de [Nom]"
    ville: Optional[str] = None
    email: Optional[str] = None
    id: Optional[int] = None
    booking_token: Optional[str] = None
    statut: str = "nouveau"
    date_envoi: Optional[datetime] = None
    date_rdv: Optional[datetime] = None

    @property
    def nom_pour_rdv(self) -> str:
        """Nom utilisé dans le titre de l'événement Google Agenda."""
        return self.nom or self.prenom
