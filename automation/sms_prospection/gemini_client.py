"""Client minimal pour l'API Gemini (Google Generative Language), avec prise
en charge du "function calling" (l'assistant pilote peut déclencher de
vraies actions : pause de campagne, blocage de numéro, envoi manuel...).

Aucune clé API n'est codée en dur : `GEMINI_API_KEY` vient de l'environnement
(voir .env.example). Le client ne fait strictement aucun appel réseau au
chargement du module — uniquement lorsque `discuter()` est appelé.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Callable

import httpx

from .config import settings

logger = logging.getLogger(__name__)

_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


class GeminiError(RuntimeError):
    pass


@dataclass
class ToolDeclaration:
    name: str
    description: str
    parameters: dict
    handler: Callable[..., str]


@dataclass
class ToolCallTrace:
    name: str
    args: dict
    resultat: str


@dataclass
class ReponseChat:
    texte: str
    appels_outils: list[ToolCallTrace] = field(default_factory=list)


def _appeler_gemini(
    system_instruction: str,
    contents: list[dict],
    declarations: list[dict],
    model: str,
    api_key: str,
) -> dict:
    url = f"{_API_BASE}/models/{model}:generateContent"
    body: dict = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": contents,
    }
    if declarations:
        body["tools"] = [{"function_declarations": declarations}]

    response = httpx.post(url, params={"key": api_key}, json=body, timeout=30.0)
    if response.status_code >= 400:
        raise GeminiError(f"Erreur API Gemini ({response.status_code}) : {response.text}")
    return response.json()


def _extraire_parts(data: dict) -> list[dict]:
    candidats = data.get("candidates") or []
    if not candidats:
        raise GeminiError(f"Réponse Gemini sans candidat exploitable : {data}")
    return candidats[0].get("content", {}).get("parts", [])


def discuter(
    message_utilisateur: str,
    system_instruction: str,
    historique: list[dict] | None = None,
    tools: list[ToolDeclaration] | None = None,
    model: str | None = None,
    max_tours_outils: int = 5,
) -> ReponseChat:
    """Envoie un message à Gemini et exécute localement les éventuels appels
    d'outils demandés par le modèle, en boucle, jusqu'à obtenir une réponse
    texte finale (ou `max_tours_outils` atteint)."""
    if not settings.gemini_api_key:
        raise GeminiError(
            "GEMINI_API_KEY manquant — définissez-le dans votre .env (jamais dans le code/les commits)."
        )

    model = model or settings.gemini_model
    outils_par_nom = {t.name: t for t in (tools or [])}
    declarations = [
        {"name": t.name, "description": t.description, "parameters": t.parameters}
        for t in (tools or [])
    ]

    contents = [dict(c) for c in (historique or [])]
    contents.append({"role": "user", "parts": [{"text": message_utilisateur}]})

    appels_outils: list[ToolCallTrace] = []

    for _ in range(max_tours_outils):
        data = _appeler_gemini(system_instruction, contents, declarations, model, settings.gemini_api_key)
        parts = _extraire_parts(data)

        appels = [p["functionCall"] for p in parts if "functionCall" in p]
        textes = [p["text"] for p in parts if "text" in p]

        if not appels:
            return ReponseChat(texte="".join(textes).strip(), appels_outils=appels_outils)

        contents.append({"role": "model", "parts": parts})

        reponses_fonctions = []
        for appel in appels:
            nom = appel["name"]
            args = appel.get("args") or {}
            outil = outils_par_nom.get(nom)
            if outil is None:
                resultat = f"Outil inconnu : {nom}"
            else:
                try:
                    resultat = outil.handler(**args)
                except Exception as exc:  # ne jamais faire planter le chat sur une erreur d'outil
                    logger.exception("Échec de l'outil %s", nom)
                    resultat = f"Erreur lors de l'exécution : {exc}"
            appels_outils.append(ToolCallTrace(name=nom, args=args, resultat=resultat))
            reponses_fonctions.append(
                {"functionResponse": {"name": nom, "response": {"result": resultat}}}
            )

        # L'API Gemini n'a pas de rôle "function" dédié : la réponse d'un appel
        # d'outil est renvoyée avec le rôle "user" (comme un tour normal),
        # symétriquement au rôle "model" utilisé pour l'appel de fonction.
        contents.append({"role": "user", "parts": reponses_fonctions})

    return ReponseChat(
        texte="Désolé, je n'ai pas réussi à conclure cette action après plusieurs essais.",
        appels_outils=appels_outils,
    )
