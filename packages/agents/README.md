# @immoexpert/agents — Plateforme d'agents IA autonomes (Cap Entreprendre France)

Moteur d'orchestration qui transforme une **commande client** en **livrables**,
grâce à 5 agents IA autonomes branchés ensemble et propulsés par **Claude (Anthropic)**
et **Gemini (Google)**.

```
Commande (site web, Make, Google Sheets)
        │
        ▼
  Orchestrateur ── planifie ──► mobilise les bons agents
        │
        ├─ 🧑‍💻 Agent Développeur           (sites & apps Next.js/React)
        ├─ 📈 Agent SEO & Réseaux sociaux  (stratégie, contenu, calendrier)
        ├─ 🎬 Agent Visuels cinématographiques (direction artistique + prompts image/vidéo)
        ├─ ☎️ Agent Prospection téléphonique (ICP, scripts, objections)
        └─ 🔁 Agent Relance client          (séquences de suivi, avis, upsell)
        │
        ▼
  Livrables agrégés ──► Make ──► Google Sheets / email / Slack…
```

## Démarrer en 30 secondes (sans aucune clé)

```bash
pnpm --filter @immoexpert/agents demo
```

La démo tourne en **mode DÉMO** : elle produit le plan et le câblage complet
sans appeler de LLM. Aucune clé requise pour valider l'architecture.

## Passer en production (vrais livrables)

Ajoutez au minimum une clé LLM dans votre `.env` :

```bash
ANTHROPIC_API_KEY=sk-ant-...      # Claude (recommandé pour dev, SEO, prospection, relance)
GEMINI_API_KEY=...                # Gemini (recommandé pour les visuels)
# Optionnel : choisir le modèle
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
GEMINI_MODEL=gemini-1.5-pro
```

Sans surcharge, la plateforme choisit automatiquement le fournisseur disponible,
avec repli. Relancez `... demo` : les agents produisent alors de vrais livrables.

## Utilisation dans le code

```ts
import { createOrchestrator } from "@immoexpert/agents";

const orchestrator = createOrchestrator();

const result = await orchestrator.run({
  clientName: "Boulangerie Le Fournil",
  type: "Site vitrine + réseaux sociaux",
  description: "Boulangerie à Lyon, click & collect, visuels pub, prospection B2B.",
  budget: 3500,
});

console.log(result.plan.steps);   // agents mobilisés
console.log(result.results);      // livrables par agent
```

## Connexion Make + Google Sheets

- **Entrée** : votre scénario Make (déclenché par une ligne Google Sheets ou un formulaire)
  appelle `POST /api/agents/webhook/make` (voir `apps/web`). Le payload est normalisé
  automatiquement par `parseInboundOrder` (champs FR ou EN tolérés).
- **Sortie** : à la fin de l'orchestration, `MakeClient.sendResult()` renvoie la synthèse
  vers un webhook Make (`MAKE_WEBHOOK_URL`) qui écrit dans Google Sheets, envoie l'email, etc.
- **Direct Google Sheets** (optionnel) : `GoogleSheetsClient` (compte de service) permet
  de lire/écrire directement, sans passer par Make.

```bash
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/xxxxxxxx   # webhook sortant (livrables)
MAKE_SIGNING_SECRET=un-secret-partage                 # sécurise le webhook entrant
GOOGLE_SERVICE_ACCOUNT_JSON=...                        # JSON compte de service (brut ou base64)
GOOGLE_SHEETS_ID=1AbC...                               # ID du classeur
```

## Architecture du package

| Dossier | Rôle |
|---------|------|
| `src/agents/` | Les 5 agents + classe de base + registre |
| `src/llm/` | Fournisseurs Claude / Gemini + routeur + mode démo |
| `src/orchestrator/` | Planificateur (déterministe) + orchestrateur |
| `src/integrations/` | Connecteurs Make + Google Sheets |
| `src/config.ts` | Configuration depuis l'environnement |
| `src/demo.ts` | Démo exécutable de bout en bout |

## Principes

- **Zéro dépendance runtime** : appels LLM et API via `fetch` natif.
- **Testable hors-ligne** : mode démo intégré, planificateur déterministe.
- **Extensible** : ajouter un agent = 1 fichier + 1 ligne dans le registre.
- **Conforme** : l'agent de prospection rappelle systématiquement RGPD/Bloctel.
