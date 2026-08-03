# Assistant vocal IA - prototype

Prototype d'assistant personnel qui execute des actions locales (ranger des
photos, lancer des logiciels, consulter ses mails, se connecter a des sites
deja enregistres) a partir d'une commande texte ou vocale.

## Architecture

```
src/
  cli.ts            -> boucle interactive (mode texte, ou mode vocal avec --voice)
  core/router.ts     -> le "cerveau" : envoie la commande a Claude (Anthropic API)
                         avec la liste des outils disponibles, execute l'outil choisi
  voice/
    record.ts         -> enregistrement micro (push-to-talk) via SoX
    transcribe.ts       -> transcription locale (Whisper / whisper.cpp, aucun cloud)
  tools/
    organizeFiles.ts -> range les photos d'un dossier en sous-dossiers AAAA-MM
    openApp.ts        -> lance un logiciel installe sur la machine
    bitwarden.ts       -> recupere un identifiant depuis Bitwarden (CLI `bw`)
    loginToSite.ts      -> ouvre un site et remplit les champs de connexion
    mail/
      auth.ts            -> autorisation OAuth Gmail (lecture seule) + stockage token local
      gmail.ts             -> liste les emails recents
  scripts/
    authorizeGmail.ts -> a lancer une fois pour autoriser l'acces Gmail
```

Chaque outil est independant : ajouter une nouvelle capacite = ajouter un
fichier dans `tools/` et le declarer dans `router.ts`. C'est le meme
principe que MCP (Model Context Protocol) - le cerveau ne connait que
l'interface de chaque outil, pas son implementation.

## Choix de securite

- **Aucun mot de passe n'est jamais envoye au modele.** `bitwarden.ts`
  recupere l'identifiant et le garde uniquement cote hote (`credentialStore`,
  jamais serialise dans une reponse d'outil). Seul `login_to_site` y accede
  directement pour remplir le formulaire.
- **Comptes en ligne** : passe par la CLI Bitwarden (`bw`) plutot que par une
  lecture brute des mots de passe enregistres dans le navigateur - cette
  derniere approche reproduit la technique des malwares voleurs
  d'identifiants et n'a pas ete retenue.
- **Mail en lecture seule.** Le scope OAuth demande est
  `gmail.readonly` uniquement - l'assistant peut consulter mais ne peut ni
  envoyer ni supprimer d'email tant que ce scope n'est pas elargi
  explicitement (principe du moindre privilege).
- **Le repo est prive.** A ne jamais rendre public une fois `.env` rempli
  ou apres la premiere autorisation Gmail (`.gmail-token.json`) meme s'ils
  sont dans `.gitignore` - verifier avant tout commit.

## Prerequis

- Node.js 20+
- [Bitwarden CLI](https://bitwarden.com/help/cli/) installee et deverrouillee
  (`bw unlock --raw` pour obtenir `BW_SESSION`)
- Une cle API Anthropic ([console.anthropic.com](https://console.anthropic.com))
- **Pour le mode vocal uniquement** : [SoX](http://sox.sourceforge.net) installe
  et accessible dans le PATH (`brew install sox` sur Mac, `apt-get install sox
  libsox-fmt-all` sur Linux, binaires Windows sur le site de SoX). Le modele
  Whisper (`base`, ~150 Mo) est telecharge automatiquement au premier
  enregistrement - aucune cle API supplementaire, tout tourne en local.
- **Pour le connecteur mail uniquement** : un projet
  [Google Cloud Console](https://console.cloud.google.com/) avec l'API Gmail
  activee et des identifiants OAuth de type "Application de bureau" (menu
  *Identifiants > Creer des identifiants > ID client OAuth*). Renseigne
  `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `.env`.

## Installation

```bash
cd assistant-vocal-ia
pnpm install   # ou npm install
cp .env.example .env
# remplir ANTHROPIC_API_KEY et BW_SESSION dans .env

pnpm run auth:gmail    # une seule fois, ouvre le navigateur pour autoriser Gmail (lecture seule)

pnpm start             # mode texte
pnpm start -- --voice  # mode vocal (push-to-talk : Entree pour parler, Entree pour arreter)
```

## Tests

```bash
pnpm test   # tsc --noEmit + tests unitaires (organizeFiles)
```

**Ce qui est verifie automatiquement** (aucun materiel/compte externe requis) :
tsc compile sans erreur, et `organizePhotosByDate` est teste avec de vrais
fichiers temporaires (tri par mois, fichiers non-image ignores).

**Ce qui ne peut pas etre teste dans cet environnement sandbox** (pas de
microphone, pas de cle API Anthropic, pas de session Bitwarden active) - a
valider toi-meme sur ton poste avant usage reel :
- le mode `--voice` (enregistrement SoX + transcription Whisper)
- le routeur complet (`runCommand`, qui appelle l'API Claude)
- `fetch_credential` / `login_to_site` (necessitent Bitwarden deverrouille)
- `list_recent_emails` (necessite l'autorisation OAuth Gmail au prealable)

## Limites actuelles (prototype)

- Mode vocal en **push-to-talk** (pas d'ecoute continue par mot-cle type "Hey
  Siri") et non teste en conditions reelles - a valider sur ton poste.
- Pas encore d'application mobile - le mode vocal ne fonctionne aujourd'hui
  que sur PC (Node.js + micro local).
- `login_to_site` utilise des selecteurs generiques : marche sur beaucoup de
  formulaires standards, pas garanti sur tous les sites.
- Le connecteur mail ne couvre que Gmail (pas encore Outlook) et est en
  lecture seule (pas d'envoi, pas de suppression, pas de brouillon).
- Aucune authentification biometrique / confirmation graduee par niveau de
  risque pour l'instant - toutes les commandes s'executent directement.
  A ajouter avant tout usage au-dela du test personnel.

## Prochaines etapes

1. Valider le mode vocal en conditions reelles (micro, bruit ambiant,
   accent) et ajuster la langue/le modele Whisper si besoin.
2. Application mobile legere (relaie juste la commande, vocale ou texte,
   vers ce meme routeur).
3. Elargir le connecteur mail (Outlook, envoi/brouillon avec confirmation)
   une fois le scope lecture seule valide en usage reel.
4. Permissions par niveau de risque + confirmation orale pour les actions
   sensibles (cf. discussion sur la securite).

## Scalabilite / monetisation

L'architecture (cerveau + outils independants) est reutilisable et suit le
meme pattern que des produits commerciaux existants. Un produit monetisable
pour d'autres utilisateurs devra en revanche se limiter aux integrations via
API officielle (mail, cloud, logiciels pro) plutot qu'a l'automatisation
universelle de sites tiers : iOS interdit ce niveau d'acces systeme par
design, et l'automatisation de connexion a des sites tiers viole souvent
leurs conditions d'utilisation des qu'un tiers (pas toi-meme) l'utilise.
