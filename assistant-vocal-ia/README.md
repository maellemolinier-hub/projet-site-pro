# Assistant vocal IA - prototype

Prototype d'assistant personnel qui execute des actions locales (ranger des
photos, lancer des logiciels, consulter ses mails, se connecter a des sites
deja enregistres) a partir d'une commande texte ou vocale, depuis le PC ou
depuis une app mobile.

## Architecture

```
src/                  (tourne sur le PC - c'est la que vivent les actions)
  cli.ts               -> boucle interactive (mode texte, ou mode vocal avec --voice)
  server.ts             -> API locale (Express) pour piloter l'assistant depuis le mobile
  core/router.ts         -> le "cerveau" : envoie la commande a Claude (Anthropic API)
                            avec la liste des outils disponibles, execute l'outil choisi
  voice/
    record.ts             -> enregistrement micro (push-to-talk) via SoX
    transcribe.ts           -> transcription locale (Whisper / whisper.cpp, aucun cloud)
  tools/
    organizeFiles.ts     -> range les photos d'un dossier en sous-dossiers AAAA-MM
    openApp.ts            -> lance un logiciel installe sur la machine
    bitwarden.ts           -> recupere un identifiant depuis Bitwarden (CLI `bw`)
    loginToSite.ts          -> ouvre un site et remplit les champs de connexion
    mail/
      auth.ts                -> autorisation OAuth Gmail (lecture seule) + stockage token local
      gmail.ts                 -> liste les emails recents
  scripts/
    authorizeGmail.ts     -> a lancer une fois pour autoriser l'acces Gmail

mobile/                (app Expo/React Native - un client leger, aucune logique metier)
  App.tsx               -> ecran unique : config serveur + champ commande + historique
  src/assistantClient.ts -> appelle l'API du PC (src/server.ts) et stocke serveur/token
```

Chaque outil est independant : ajouter une nouvelle capacite = ajouter un
fichier dans `tools/` et le declarer dans `router.ts`. C'est le meme
principe que MCP (Model Context Protocol) - le cerveau ne connait que
l'interface de chaque outil, pas son implementation. **Le mobile ne fait
qu'envoyer du texte au serveur du PC** - c'est le PC qui execute reellement
les actions (fichiers, logiciels, comptes), pas le telephone.

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
- **Serveur mobile protege par token.** `src/server.ts` refuse toute requete
  sans le bon `ASSISTANT_TOKEN` (sauf `/health`, qui ne renvoie aucune info
  sensible). Sans ce token, n'importe quel appareil sur le meme reseau
  pourrait faire ranger des fichiers ou lancer des logiciels sur ton PC -
  genere un token aleatoire long (`openssl rand -hex 32`), ne le partage
  qu'avec ton propre telephone, et ne l'expose jamais hors de ton reseau
  local sans un tunnel authentifie (voir "App mobile" ci-dessous).

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

## App mobile

L'app mobile (dossier `mobile/`, Expo/React Native) est un client leger :
elle envoie juste le texte de la commande au serveur qui tourne sur ton PC
(`src/server.ts`) et affiche la reponse. Le PC reste le seul endroit ou les
actions s'executent reellement.

```bash
# 1. Sur le PC : demarrer le serveur (en plus, ou a la place, de `pnpm start`)
cd assistant-vocal-ia
# ajoute ASSISTANT_TOKEN (ex: `openssl rand -hex 32`) et PORT dans .env
pnpm run server

# 2. Sur le telephone : installer l'app Expo Go (App Store / Play Store)

# 3. Sur le PC, dans un second terminal : lancer le serveur de dev Expo
cd assistant-vocal-ia/mobile
npm install
npm start
# scanne le QR code affiche avec Expo Go (PC et telephone sur le meme Wi-Fi)
```

Au premier lancement de l'app, renseigne dans l'ecran "Serveur (PC)" :
- l'adresse IP locale de ton PC + le port (ex: `http://192.168.1.23:4174` -
  trouvable via `ipconfig` sur Windows ou `ifconfig`/`ipconfig getifaddr en0`
  sur Mac)
- le meme `ASSISTANT_TOKEN` que celui mis dans `.env`

**Portee actuelle : reseau local uniquement.** Le telephone doit etre sur le
meme Wi-Fi que le PC. Pour piloter l'assistant depuis l'exterieur (4G, autre
reseau), il faudra un tunnel authentifie (ex: [Tailscale](https://tailscale.com/),
qui cree un reseau prive virtuel entre tes appareils) - pas encore mis en
place, et a eviter avec un tunnel public non authentifie (type ngrok sans
protection) qui exposerait le controle de ton PC sur internet.

## Tests

```bash
pnpm test              # tsc --noEmit + tests unitaires (organizeFiles)
cd mobile && npx tsc --noEmit   # verification TypeScript de l'app mobile
```

**Ce qui est verifie automatiquement dans cet environnement** (aucun
materiel/compte externe requis) : le code du PC et celui du mobile compilent
tous les deux sans erreur, `organizePhotosByDate` est teste avec de vrais
fichiers temporaires (tri par mois, fichiers non-image ignores), et
`src/server.ts` a ete demarre et teste manuellement ici (`/health` public,
`/command` qui rejette les requetes sans le bon token, et qui appelle bien
le routeur - verifie via le message d'erreur attendu en l'absence de cle
Anthropic).

**Ce qui ne peut pas etre teste dans cet environnement sandbox** (pas de
microphone, pas de cle API Anthropic, pas de session Bitwarden active, pas
de telephone/Expo Go) - a valider toi-meme sur ton poste avant usage reel :
- le mode `--voice` (enregistrement SoX + transcription Whisper)
- le routeur complet avec une vraie reponse du modele (`runCommand`)
- `fetch_credential` / `login_to_site` (necessitent Bitwarden deverrouille)
- `list_recent_emails` (necessite l'autorisation OAuth Gmail au prealable)
- l'app mobile en conditions reelles (connexion au serveur, Expo Go)

## Limites actuelles (prototype)

- Mode vocal en **push-to-talk** (pas d'ecoute continue par mot-cle type "Hey
  Siri") et non teste en conditions reelles - a valider sur ton poste.
- L'app mobile est en **texte uniquement** pour l'instant (pas de micro sur
  mobile) et fonctionne seulement sur le meme reseau Wi-Fi que le PC - non
  testee en conditions reelles (pas de telephone dans cet environnement).
- `login_to_site` utilise des selecteurs generiques : marche sur beaucoup de
  formulaires standards, pas garanti sur tous les sites.
- Le connecteur mail ne couvre que Gmail (pas encore Outlook) et est en
  lecture seule (pas d'envoi, pas de suppression, pas de brouillon).
- Aucune authentification biometrique / confirmation graduee par niveau de
  risque pour l'instant - toutes les commandes s'executent directement.
  A ajouter avant tout usage au-dela du test personnel.

## Prochaines etapes

1. Valider le mode vocal (PC) et l'app mobile en conditions reelles - c'est
   la priorite avant d'ajouter de nouvelles briques.
2. Ajouter la voix a l'app mobile (dictee native iOS/Android ou meme
   pipeline Whisper que le PC).
3. Acces a distance securise (Tailscale ou equivalent) pour piloter
   l'assistant hors du reseau local.
4. Elargir le connecteur mail (Outlook, envoi/brouillon avec confirmation)
   une fois le scope lecture seule valide en usage reel.
5. Permissions par niveau de risque + confirmation orale pour les actions
   sensibles (cf. discussion sur la securite).

## Scalabilite / monetisation

L'architecture (cerveau + outils independants) est reutilisable et suit le
meme pattern que des produits commerciaux existants. Un produit monetisable
pour d'autres utilisateurs devra en revanche se limiter aux integrations via
API officielle (mail, cloud, logiciels pro) plutot qu'a l'automatisation
universelle de sites tiers : iOS interdit ce niveau d'acces systeme par
design, et l'automatisation de connexion a des sites tiers viole souvent
leurs conditions d'utilisation des qu'un tiers (pas toi-meme) l'utilise.
