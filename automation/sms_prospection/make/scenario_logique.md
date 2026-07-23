# Logique des scénarios Make.com

Trois scénarios indépendants, qui peuvent tous appeler les endpoints du
micro-service Python (`webhook_server.py`) plutôt que de ré-implémenter la
logique nativement dans Make — c'est l'approche recommandée pour la
cohérence de la liste noire et de la base de prospects.

Les fichiers `blueprint_*.json` de ce dossier sont des **squelettes de
départ**, construits uniquement avec des modules génériques Make (Webhooks,
HTTP, Data Store, Router, Filtre) qui n'exigent pas de connexion tierce
préalable. Importez-les dans Make (Scénarios > Importer un blueprint) puis
complétez les modules marqués `// À CONFIGURER` (connexion Google Sheets/
Airtable si vous préférez gérer les prospects côté no-code, connexion SMS si
vous n'utilisez pas l'appel HTTP direct vers Brevo, etc.).

---

## Scénario 1 — Envoi de la campagne SMS

**Déclencheur** : planification quotidienne (`builtin:BasicScheduler`), par
exemple tous les jours ouvrés à 10h.

1. **HTTP > Faire une requête** : `POST {BOOKING_BASE_URL_HOST}/cli` n'est pas
   exposé en HTTP — dans la pratique, ce scénario appelle plutôt directement
   la commande `campaign.envoyer_campagne()` via un petit endpoint FastAPI
   dédié (`POST /campagnes/envoyer`) que vous pouvez ajouter à
   `webhook_server.py` si vous voulez piloter l'envoi depuis Make plutôt que
   depuis un cron. Corps : `{"limite": 200, "dry_run": false}`.
   - *Alternative sans le micro-service* : répliquer les étapes 2 à 6 en
     natif dans Make (Data Store au lieu de la table `sms_prospect`), voir
     `blueprint_1_envoi_campagne_sms.json` pour ce mode 100% no-code.
2. **Data Store > Rechercher des enregistrements** : prospects au statut
   `nouveau`, limité à `CAMPAIGN_DAILY_QUOTA`.
3. **Router** avec deux branches :
   - **Branche A (bloqué)** : `Data Store > Rechercher` dans le Data Store
     `liste_noire` sur le numéro courant. Si trouvé -> `Data Store > Mettre à
     jour l'enregistrement` (statut = `stop`) puis fin de branche.
   - **Branche B (à envoyer)** : filtre "non trouvé dans la liste noire".
4. **Outils > Composer une chaîne de caractères** : construit le message
   personnalisé :
   `Bonjour {{prenom}}, {{COMPANY_NAME}} aide les {{secteur_label_pluriel}} à
   digitaliser leur activité avec le Pack Digitalisation et
   {{assistant_ia}}. Réservez un audit gratuit : {{lien_reservation}} Rép
   STOP pour ne plus recevoir de SMS.`
   - `secteur_label_pluriel` et `assistant_ia` proviennent d'une table de
     correspondance (Data Store `secteurs`, reflet de `secteurs.py`).
   - `lien_reservation` = `{{BOOKING_BASE_URL}}/{{booking_token}}`.
5. **HTTP > Faire une requête** : `POST https://api.brevo.com/v3/transactionalSMS/sms`
   avec l'en-tête `api-key` et le corps `{sender, recipient, content, type:
   "transactional"}` (mêmes paramètres que `providers/brevo.py`).
6. **Data Store > Mettre à jour l'enregistrement** : statut = `envoye`,
   date_envoi = maintenant.
7. **Outils > Pause** (`Sleep`) : `SECONDS_BETWEEN_SMS` secondes entre deux
   itérations, pour respecter la cadence d'envoi et la réputation expéditeur.

**Gestion des erreurs** : sur le module HTTP d'envoi, ajouter un gestionnaire
d'erreur "Ignorer" routé vers un module `Data Store > Mettre à jour` (statut =
`echec`), pour ne jamais interrompre le scénario complet sur un échec isolé.

---

## Scénario 2 — Traitement des réponses STOP (conformité RGPD)

**Déclencheur** : `Webhooks > Webhook personnalisé` (URL fournie par Make),
configurée comme callback "SMS entrant" côté fournisseur SMS (Brevo : Inbound
SMS Webhook ; Twilio : Messaging Webhook).

1. **Webhook** reçoit `{from, text}` (adapter le mapping selon le fournisseur).
2. **Filtre** : `text` contient (insensible à la casse/accents) l'un des
   mots-clés `stop`, `arret`, `arrêt`, `desinscription`, `désinscription`.
3. **Si oui** :
   - **HTTP > Faire une requête** : `POST {BOOKING_BASE_URL_HOST}/webhooks/sms-inbound`
     avec le même corps, en-tête `X-Webhook-Secret: {{SMS_WEBHOOK_SECRET}}` —
     délègue au code Python (`blacklist.add_to_blacklist`) l'ajout à la liste
     noire de façon centralisée et idempotente.
   - *Alternative 100% no-code* : `Data Store > Ajouter un enregistrement`
     dans le Data Store `liste_noire` (clé = numéro normalisé E.164), puis
     `Data Store > Mettre à jour l'enregistrement` sur `sms_prospect`
     (statut = `stop`).
4. **Si non** : fin du scénario (aucune action — on ne bloque pas les
   réponses positives type "OUI" ou "intéressé").

Ce scénario doit être actif en permanence (webhook), et non planifié.

---

## Scénario 3 — Réservation de créneau -> événement "Audit de [Nom]"

Deux implémentations possibles :

### Option recommandée — le prospect réserve sur la page Python

Le lien du SMS pointe vers `GET {BOOKING_BASE_URL}/{token}`
(`webhook_server.py`), qui affiche les créneaux libres et, à la confirmation,
appelle directement l'API Google Calendar (`google_calendar.create_audit_event`)
pour créer l'événement **"Audit de [Nom du Prospect]"**. Aucun scénario Make
n'est nécessaire pour cette option ; Make peut néanmoins **surveiller** les
nouveaux RDV :

1. **Déclencheur** : planification (ex. toutes les 15 min) ou webhook sortant
   optionnel côté Python (`POST` vers un webhook Make après création de
   l'événement) pour notifier votre équipe (Slack/e-mail) qu'un audit vient
   d'être réservé.

### Option 100% Make (sans micro-service Python)

1. **Webhook personnalisé** : reçoit `{token, creneau_iso}` depuis une page
   de réservation externe (Make ne peut pas nativement servir de page HTML
   avec calcul de disponibilités — utiliser un outil de formulaire, ex. Make
   + une page statique, ou l'app "Google Calendar" de Make combinée à une
   route personnalisée).
2. **Data Store > Rechercher** l'enregistrement prospect via `token`.
3. **Google Calendar > Créer un événement** :
   - `Titre` : `Audit de {{nom}}` (repli sur `{{prenom}}` si `nom` est vide).
   - `Début` / `Fin` : `{{creneau_iso}}` / `+{{BOOKING_SLOT_DURATION_MINUTES}} min`.
   - `Calendrier` : `{{GOOGLE_CALENDAR_ID}}`.
   - `Description` : secteur, téléphone, origine "campagne SMS prospection".
4. **Data Store > Mettre à jour l'enregistrement** : statut = `rdv_pris`,
   date_rdv = `{{creneau_iso}}`.

---

## Récapitulatif des correspondances champ Make <-> code Python

| Concept                         | Python                                   | Make (no-code)                    |
|----------------------------------|-------------------------------------------|-------------------------------------|
| Table prospects                  | `db.sms_prospect` (SQLite/Postgres)         | Data Store `prospects`               |
| Liste noire                       | `db.sms_blacklist`                          | Data Store `liste_noire`              |
| Mapping secteur -> assistant IA    | `secteurs.SECTEURS`                          | Data Store `secteurs` (clé/valeur)     |
| Construction du message            | `message_builder.build_sms_message`           | Module "Composer une chaîne"           |
| Envoi SMS                          | `providers/brevo.py` (API Brevo)               | Module HTTP -> même endpoint Brevo       |
| Détection STOP                     | `config.settings.stop_keywords`                 | Filtre "texte contient"                    |
| Créneaux libres Google Agenda        | `google_calendar.list_free_slots`                | Module "Google Calendar > Rechercher"       |
| Création de l'événement RDV           | `google_calendar.create_audit_event`              | Module "Google Calendar > Créer un événement" |
