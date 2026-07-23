"""Assistant IA « pilote » : chat en langage naturel pour piloter la
prospection SMS (pause/reprise de campagne, liste noire, envoi manuel,
consultation de l'activité, mise à jour de l'argumentaire), via function
calling Gemini. Chaque action déclenchée est réellement exécutée (pas de
simulation) et journalisée comme événement `action_pilote`.
"""
from __future__ import annotations

from . import campagne_etat, secteurs_store
from .blacklist import add_to_blacklist, retirer_de_la_blacklist
from .campaign import envoyer_message_manuel, rechercher_prospects
from .events import lister_evenements
from .gemini_client import ReponseChat, ToolDeclaration, discuter
from .phone_utils import NumeroInvalide, normaliser_e164

_SYSTEM_PROMPT = """Tu es l'assistant IA "pilote" du centre de pilotage de prospection SMS
pour artisans et commerçants. Tu aides l'utilisateur (le patron de l'entreprise) à
superviser et contrôler la campagne : pauses, liste noire, envoi de messages manuels,
consultation de l'activité récente, mise à jour de l'argumentaire commercial par secteur.

Règles impératives :
- N'invente jamais de résultat : utilise toujours les outils fournis pour toute action
  ou information réelle (état de la campagne, recherche de prospect, liste noire, activité).
- Confirme clairement chaque action effectuée (ce qui a été fait, sur qui/quoi).
- Si une demande est ambiguë (ex: plusieurs prospects trouvés), demande une précision
  avant d'agir plutôt que de deviner.
- Réponds en français, de façon concise et professionnelle.
"""


def _tool_pause(motif: str = "") -> str:
    campagne_etat.mettre_en_pause(motif or None)
    return "Campagne mise en pause." + (f" Motif : {motif}" if motif else "")


def _tool_reprendre() -> str:
    campagne_etat.reprendre()
    return "Campagne reprise, les envois vont continuer normalement."


def _tool_etat_campagne() -> str:
    etat = campagne_etat.obtenir_etat()
    if etat.en_pause:
        return f"La campagne est actuellement EN PAUSE. Motif : {etat.motif or 'non précisé'}."
    return "La campagne est active (aucune pause en cours)."


def _tool_bloquer_numero(telephone: str, motif: str = "") -> str:
    try:
        numero = normaliser_e164(telephone)
    except NumeroInvalide as exc:
        return f"Numéro invalide : {exc}"
    ajoute = add_to_blacklist(numero, source="pilote_ia")
    if ajoute:
        return f"Numéro {numero} ajouté à la liste noire." + (f" Motif : {motif}" if motif else "")
    return f"Numéro {numero} était déjà dans la liste noire."


def _tool_debloquer_numero(telephone: str) -> str:
    try:
        numero = normaliser_e164(telephone)
    except NumeroInvalide as exc:
        return f"Numéro invalide : {exc}"

    if retirer_de_la_blacklist(numero):
        return f"Numéro {numero} retiré de la liste noire."
    return f"Le numéro {numero} n'est pas dans la liste noire."


def _tool_rechercher_prospect(recherche: str) -> str:
    resultats = rechercher_prospects(recherche)
    if not resultats:
        return f"Aucun prospect trouvé pour '{recherche}'."
    lignes = [
        f"- id={p.id} : {p.prenom} {p.nom or ''} ({p.phone}), secteur={p.secteur}, statut={p.statut}"
        for p in resultats
    ]
    return "Prospects trouvés :\n" + "\n".join(lignes)


def _tool_envoyer_message(prospect_id: int, message: str) -> str:
    return envoyer_message_manuel(int(prospect_id), message)


def _tool_activite_recente(categorie: str = "", limite: int = 10) -> str:
    evenements = lister_evenements(categorie=categorie or None, limite=int(limite))
    if not evenements:
        return "Aucune activité récente."
    lignes = [f"- [{e.categorie}] {e.titre} ({e.created_at:%d/%m %Hh%M})" for e in evenements]
    return "\n".join(lignes)


def _tool_maj_argumentaire(secteur: str, argumentaire: str) -> str:
    config = secteurs_store.mettre_a_jour(secteur, argumentaire=argumentaire)
    return f"Argumentaire mis à jour pour le secteur '{config.cle}'."


_TOOLS = [
    ToolDeclaration(
        name="mettre_en_pause_campagne",
        description="Met en pause l'envoi automatique des SMS de la campagne.",
        parameters={
            "type": "object",
            "properties": {"motif": {"type": "string", "description": "Raison de la pause (optionnel)"}},
        },
        handler=_tool_pause,
    ),
    ToolDeclaration(
        name="reprendre_campagne",
        description="Relance l'envoi automatique des SMS après une pause.",
        parameters={"type": "object", "properties": {}},
        handler=_tool_reprendre,
    ),
    ToolDeclaration(
        name="obtenir_etat_campagne",
        description="Indique si la campagne est actuellement en pause ou active.",
        parameters={"type": "object", "properties": {}},
        handler=_tool_etat_campagne,
    ),
    ToolDeclaration(
        name="bloquer_numero",
        description="Ajoute un numéro de téléphone à la liste noire (il ne recevra plus jamais de SMS).",
        parameters={
            "type": "object",
            "properties": {
                "telephone": {"type": "string", "description": "Numéro de téléphone (tout format)"},
                "motif": {"type": "string", "description": "Raison du blocage (optionnel)"},
            },
            "required": ["telephone"],
        },
        handler=_tool_bloquer_numero,
    ),
    ToolDeclaration(
        name="debloquer_numero",
        description="Retire un numéro de téléphone de la liste noire.",
        parameters={
            "type": "object",
            "properties": {"telephone": {"type": "string", "description": "Numéro de téléphone (tout format)"}},
            "required": ["telephone"],
        },
        handler=_tool_debloquer_numero,
    ),
    ToolDeclaration(
        name="rechercher_prospect",
        description="Recherche un prospect par prénom, nom ou numéro de téléphone.",
        parameters={
            "type": "object",
            "properties": {"recherche": {"type": "string", "description": "Terme de recherche"}},
            "required": ["recherche"],
        },
        handler=_tool_rechercher_prospect,
    ),
    ToolDeclaration(
        name="envoyer_message_manuel",
        description="Envoie un SMS libre (hors template automatique) à un prospect précis, identifié par son id.",
        parameters={
            "type": "object",
            "properties": {
                "prospect_id": {"type": "integer", "description": "Identifiant du prospect (voir rechercher_prospect)"},
                "message": {"type": "string", "description": "Texte du SMS à envoyer"},
            },
            "required": ["prospect_id", "message"],
        },
        handler=_tool_envoyer_message,
    ),
    ToolDeclaration(
        name="obtenir_activite_recente",
        description="Renvoie les derniers événements d'activité, éventuellement filtrés par catégorie "
        "(sms_envoye, sms_erreur, reponse_prospect, stop_recu, rdv_pris, action_pilote, alerte_technique).",
        parameters={
            "type": "object",
            "properties": {
                "categorie": {"type": "string", "description": "Catégorie à filtrer (optionnel)"},
                "limite": {"type": "integer", "description": "Nombre maximum d'événements (défaut 10)"},
            },
        },
        handler=_tool_activite_recente,
    ),
    ToolDeclaration(
        name="mettre_a_jour_argumentaire",
        description="Met à jour l'argumentaire commercial (explications sur l'offre) d'un secteur donné.",
        parameters={
            "type": "object",
            "properties": {
                "secteur": {"type": "string", "description": "Clé du secteur (ex: plombier, coiffeur...)"},
                "argumentaire": {"type": "string", "description": "Nouveau texte de l'argumentaire"},
            },
            "required": ["secteur", "argumentaire"],
        },
        handler=_tool_maj_argumentaire,
    ),
]


def discuter_avec_pilote(message: str, historique: list[dict] | None = None) -> ReponseChat:
    return discuter(
        message_utilisateur=message,
        system_instruction=_SYSTEM_PROMPT,
        historique=historique,
        tools=_TOOLS,
    )
