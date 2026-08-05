"""Assistant IA sectoriel : persona de démonstration/prévisualisation pour un
secteur donné (plombier, coiffeur...), tel qu'il serait proposé aux clients
finaux avec leur site internet (assistant IA + site qui reste la propriété
du client). Permet de tester/ajuster le discours avant de le déployer,
directement depuis le centre de pilotage.
"""
from __future__ import annotations

from . import secteurs_store
from .gemini_client import ReponseChat, discuter


def _system_prompt(cle_secteur: str) -> str:
    secteur = secteurs_store.get(cle_secteur)
    return f"""Tu es {secteur.assistant_ia}, l'assistant IA sectoriel fourni aux {secteur.label_pluriel}
avec leur site internet (qui reste leur propriété). Tu réponds aux questions des clients finaux de cet
artisan/commerçant (devis, disponibilités, questions fréquentes sur le métier), avec un ton
professionnel, chaleureux et concis, en français.

Argumentaire / offres à connaître (utilise-les pour répondre aux questions sur les
tarifs, le contenu de l'offre, etc.) :
{secteur.argumentaire}

Si une question sort de ce cadre (urgence, litige, demande très spécifique), invite
poliment la personne à contacter directement l'artisan/commerçant.
"""


def discuter_avec_assistant_sectoriel(
    cle_secteur: str, message: str, historique: list[dict] | None = None
) -> ReponseChat:
    return discuter(
        message_utilisateur=message,
        system_instruction=_system_prompt(cle_secteur),
        historique=historique,
        tools=None,
    )
