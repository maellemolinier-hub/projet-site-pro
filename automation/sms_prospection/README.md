# Assistant de prospection SMS — artisans & commerçants (Pack Digitalisation)

Automatisation BtoB pour prospecter par SMS personnalisé les artisans et
commerçants de toute la France, avec :

- **Personnalisation** : prénom + secteur d'activité + assistant IA sectoriel
  correspondant + mention du **Pack Digitalisation**.
- **Conformité RGPD** : mention **STOP** obligatoire dans chaque SMS, et
  **liste noire automatique** — tout numéro qui répond STOP est bloqué
  définitivement, y compris en cas de ré-import ultérieur du même contact.
- **Prise de RDV directe** : lien de réservation dans le SMS -> page de
  créneaux libres -> création automatique de l'événement **"Audit de [Nom du
  Prospect]"** dans Google Agenda.

Deux façons d'exécuter ce système, au choix ou combinées :

1. **100% Python** (ce dossier) : scripts + micro-service FastAPI, exécutables
   en local, sur un serveur, ou orchestrés par un cron.
2. **Make.com** (dossier `make/`) : mêmes étapes modélisées en scénarios
   no-code, qui peuvent soit ré-implémenter la logique nativement dans Make,
   soit simplement appeler les endpoints Python ci-dessous via des modules
   HTTP — voir `make/scenario_logique.md`.

## Architecture du code

```
config.py            Configuration centralisée (variables d'environnement)
secteurs.py           Mapping secteur d'activité -> assistant IA sectoriel (valeurs par défaut)
secteurs_store.py      Version éditable en base (argumentaire modifiable depuis le centre de pilotage)
models.py             Dataclass Prospect
db.py                 Schéma SQLAlchemy (SQLite en dev, Postgres/Supabase en prod)
phone_utils.py        Normalisation des numéros au format E.164
blacklist.py          Liste noire RGPD (is_blacklisted / add_to_blacklist / lister / retirer)
message_builder.py    Construction du SMS personnalisé (mention STOP garantie)
shortener.py          Raccourcissement d'URL optionnel (TinyURL)
booking.py            Génération/résolution des tokens de réservation
providers/            Fournisseurs SMS (Brevo par défaut, Twilio en option)
google_calendar.py    Créneaux libres + création de l'événement "Audit de [Nom]"
campaign.py           Orchestrateur : import CSV -> filtrage -> envoi -> log
campagne_etat.py       État pause/reprise de la campagne (piloté depuis le centre de pilotage)
events.py              Journal d'activité/alertes par catégorie
conversations.py        Fil de messages unifié par prospect (auto + manuel + entrant)
gemini_client.py        Client REST Gemini avec function-calling (aucune dépendance SDK)
assistant_pilote.py      Assistant IA qui pilote réellement la campagne (chat en langage naturel)
assistant_sectoriel.py    Assistant IA sectoriel de démonstration (persona par secteur)
webhook_server.py      API FastAPI : SMS entrants (STOP) + page de réservation
copilot_api.py          API REST du centre de pilotage (utilisée par apps/copilot)
cli.py                 Interface en ligne de commande
sql/schema.sql         Schéma de référence PostgreSQL/Supabase
data/                  Exemples de CSV (prospects, liste noire)
tests/                 Tests pytest (aucun appel réseau réel)
make/                  Logique de scénario Make + blueprints JSON de départ
```

## Installation

```bash
cd automation/sms_prospection
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../../.env.example ../../.env   # puis renseigner les clés (Brevo, Google, etc.)
```

## Utilisation

```bash
# 1. Importer une liste de prospects (colonnes : prenom, phone, secteur, nom, ville, email)
python -m automation.sms_prospection.cli import-csv data/prospects_exemple.csv

# 2. Envoyer la campagne (mode simulation, aucun SMS réel, aucun appel réseau)
python -m automation.sms_prospection.cli send --dry-run

# 3. Envoyer réellement (nécessite BREVO_API_KEY ou les identifiants Twilio)
python -m automation.sms_prospection.cli send --limite 50

# 3bis. Envoyer la campagne e-mail (mode simulation)
python -m automation.sms_prospection.cli send-email --dry-run

# 3ter. Envoyer réellement les e-mails (nécessite BREVO_API_KEY + EMAIL_SENDER vérifié dans Brevo)
python -m automation.sms_prospection.cli send-email --limite 50

# 4. Démarrer le serveur de réservation + webhook SMS entrants
python -m automation.sms_prospection.cli serve
```

### Tests

```bash
cd /chemin/vers/projet-site-pro
python3 -m pytest automation/sms_prospection/tests -v
```

Tous les tests utilisent une base SQLite temporaire et ne font **aucun appel
réseau réel** (aucune clé API requise pour les faire passer).

## Configuration Google Agenda (compte de service)

1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com),
   activer l'API **Google Calendar**.
2. Créer un **compte de service**, générer une clé JSON, l'enregistrer sous
   `service-account.json` (chemin configurable via `GOOGLE_SERVICE_ACCOUNT_FILE`).
3. Partager votre agenda Google (Paramètres > Partager avec des personnes
   spécifiques) avec l'adresse e-mail du compte de service, droits
   "Modifier les événements".
4. Renseigner `GOOGLE_CALENDAR_ID` (adresse e-mail de l'agenda, ou `primary`).

## Format du SMS envoyé

```
Bonjour Julien, Votre Entreprise aide les plombiers à digitaliser leur
activité avec le Pack Digitalisation et l'Assistant IA Plomberie. Réservez
un audit gratuit : https://.../reserver/Ab12Cd34eF Rép STOP pour ne plus
recevoir de SMS.
```

La mention STOP est ajoutée par le code (`message_builder.py`) et ne peut pas
être omise, même en modifiant le gabarit du message.

## E-mail de prospection (Brevo)

Canal complémentaire au SMS, avec la même rigueur de conformité :

- Contenu possédé par le code (`email_builder.py`), pas par un template géré
  côté Brevo — une seule source de vérité, comme pour le SMS.
- **Lien de désabonnement obligatoire**, toujours inséré par le code (jamais
  omissible), pointant vers `UNSUBSCRIBE_BASE_URL/{token}` — la page
  correspondante (`copilot_api.py`, route `/desabonnement/{token}`) inscrit
  immédiatement l'adresse dans `email_blacklist.py`, l'équivalent e-mail du
  STOP SMS. Toute logique d'envoi vérifie cette liste noire avant d'envoyer.
- Réutilise le `booking_token` déjà attribué au prospect (`booking.py`) comme
  identifiant sécurisé, à la fois pour le lien de réservation et le lien de
  désabonnement — pas de colonne supplémentaire nécessaire.
- Envoi via l'API transactionnelle Brevo (`providers/brevo_email.py`),
  expéditeur configurable via `EMAIL_SENDER`/`EMAIL_SENDER_NAME` (doit être un
  expéditeur vérifié dans votre compte Brevo).

## Centre de pilotage (application séparée `apps/copilot`)

Une application web séparée permet de superviser et piloter l'ensemble du
système : discuter en langage naturel avec l'assistant IA qui contrôle la
campagne, discuter avec les assistants IA sectoriels (aperçu/test), voir
toute l'activité classée par catégorie avec alertes, et intervenir
manuellement à tout moment (pause, liste noire, réponse à un prospect,
argumentaire).

### Démarrage

```bash
# 1. API du centre de pilotage (ce dossier)
uvicorn automation.sms_prospection.copilot_api:app --port 8020

# 2. Frontend Next.js (dans un autre terminal)
cd apps/copilot
pnpm install
pnpm dev   # http://localhost:3010
```

### Fonctionnalités

- **Activité** (`/`) : journal filtrable par catégorie (SMS envoyés, erreurs,
  réponses, désinscriptions STOP, RDV pris, actions du pilote IA...), avec
  badge d'alerte dès qu'un événement n'est pas encore lu.
- **Chat IA** (`/chat`) : deux modes —
  - **Pilote** : exécute réellement les actions demandées (pause/reprise de
    campagne, blocage/déblocage de numéro, recherche de prospect, envoi de
    message manuel, consultation de l'activité, mise à jour de
    l'argumentaire) via function-calling Gemini — jamais de simulation.
  - **Assistant sectoriel** : prévisualise la façon dont l'assistant IA d'un
    secteur donné répondrait à un client final, à partir de l'argumentaire
    configuré dans Paramètres.
- **Prospects** (`/prospects`) : fil de conversation complet par prospect
  (SMS automatiques, réponses, messages manuels), avec reprise de main
  possible à tout moment.
- **Campagne** (`/campagne`) : pause/reprise des envois automatiques.
- **Paramètres** (`/parametres`) : gestion de la liste noire et édition de
  l'argumentaire commercial (explications sur l'offre) par secteur.

### Configuration Gemini (chat IA)

```bash
GEMINI_API_KEY="..."          # https://aistudio.google.com/apikey — jamais commité
GEMINI_MODEL="gemini-flash-latest"
COPILOT_CORS_ORIGINS="http://localhost:3010"
NEXT_PUBLIC_COPILOT_API_URL="http://localhost:8020"
```

**Important — quota gratuit très limité.** Sur la clé testée, le modèle
`gemini-2.0-flash` renvoyait un quota gratuit à zéro (erreur 429), alors que
l'alias `gemini-flash-latest` fonctionne mais reste plafonné à environ
**20 requêtes/jour** sur le palier gratuit (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`).
Ce plafond est bien trop bas pour un usage réel (chat pilote + assistants
sectoriels + campagne) : activez la facturation sur le projet Google AI
Studio associé à la clé avant toute mise en production, sans quoi le chat
s'arrêtera de répondre après quelques messages par jour.

### Sécurité de la clé

`GEMINI_API_KEY` ne doit **jamais** apparaître dans le code, un commit, ou un
message — uniquement dans un fichier `.env` non versionné (déjà ignoré par
`.gitignore`) ou dans le gestionnaire de secrets de votre hébergeur.

## Conformité RGPD / réglementation SMS commerciaux en France

- Mention STOP obligatoire dans chaque SMS (article L34-5 du Code des postes
  et des communications électroniques).
- Désinscription **immédiate et automatique** : toute réponse contenant un
  mot-clé STOP (`config.settings.stop_keywords`) déclenche l'ajout à la liste
  noire (`sms_blacklist`) avant tout futur envoi.
- Le filtre liste noire est vérifié à deux niveaux (défense en profondeur) :
  une première fois lors de la sélection des prospects à contacter, une
  seconde fois juste avant l'appel au fournisseur SMS.
- Conservez une preuve de l'origine des numéros prospectés (opt-in professionnel,
  annuaire professionnel public, etc.) — ce point reste sous votre
  responsabilité et n'est pas automatisé par ce code.
