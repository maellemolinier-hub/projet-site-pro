# Serv'IA - prototype

Assistant personnel qui execute des actions locales (ranger des photos,
lancer des logiciels, consulter ses mails, se connecter a des sites deja
enregistres) a partir d'une commande texte ou vocale. Trois facons de
l'utiliser, independantes les unes des autres :

1. **Sur PC seul** - CLI en texte ou en vocal (`pnpm start`).
2. **Sur mobile seul** - app Expo qui envoie des commandes en Wi-Fi local
   au serveur du PC.
3. **PC et mobile relies par mail** - le pont mail (`pnpm run mail-bridge`)
   permet de piloter le PC depuis le mobile de n'importe ou (pas besoin du
   meme reseau), en envoyant la commande par email et en recevant la
   reponse par email.

## Architecture

```
src/                  (tourne sur le PC - c'est la que vivent les actions)
  cli.ts               -> boucle interactive (mode texte, ou mode vocal avec --voice)
  server.ts             -> API locale (Express) pour piloter l'assistant en Wi-Fi
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
      auth.ts                -> autorisation OAuth Gmail + stockage token local
      gmail.ts                 -> liste les emails recents (tool "consulte mes mails")
      bridgeParser.ts           -> logique pure : detecte/parse les mails de commande
      bridge.ts                 -> pont mail : lit, execute, repond, marque comme lu
  scripts/
    authorizeGmail.ts     -> a lancer une fois pour autoriser l'acces Gmail
    mailBridge.ts          -> point d'entree de `pnpm run mail-bridge`

mobile/                (app Expo/React Native - un client leger, aucune logique metier)
  App.tsx               -> ecran unique : config Wi-Fi + config mail + commande + historique
  src/assistantClient.ts -> appelle le serveur du PC (Wi-Fi) ou compose un mail (partout)
```

Chaque outil est independant : ajouter une nouvelle capacite = ajouter un
fichier dans `tools/` et le declarer dans `router.ts`. C'est le meme
principe que MCP (Model Context Protocol) - le cerveau ne connait que
l'interface de chaque outil, pas son implementation. **Le mobile n'execute
jamais rien lui-meme** - il envoie du texte (en Wi-Fi ou par mail) et c'est
toujours le PC qui range les fichiers, lance les logiciels, etc.

## Choix de securite

- **Aucun mot de passe n'est jamais envoye au modele.** `bitwarden.ts`
  recupere l'identifiant et le garde uniquement cote hote (`credentialStore`,
  jamais serialise dans une reponse d'outil). Seul `login_to_site` y accede
  directement pour remplir le formulaire.
- **Comptes en ligne** : passe par la CLI Bitwarden (`bw`) plutot que par une
  lecture brute des mots de passe enregistres dans le navigateur - cette
  derniere approche reproduit la technique des malwares voleurs
  d'identifiants et n'a pas ete retenue.
- **Le repo est prive.** A ne jamais rendre public une fois `.env` rempli
  ou apres la premiere autorisation Gmail (`.gmail-token.json`) meme s'ils
  sont dans `.gitignore` - verifier avant tout commit.
- **Serveur Wi-Fi protege par token.** `src/server.ts` refuse toute requete
  sans le bon `ASSISTANT_TOKEN` (sauf `/health`, qui ne renvoie aucune info
  sensible). Sans ce token, n'importe quel appareil sur le meme reseau
  pourrait faire ranger des fichiers ou lancer des logiciels sur ton PC.
- **Securite du pont mail** (le point le plus sensible, puisqu'il expose une
  commande a distance) - deux verifications independantes avant d'executer
  quoi que ce soit :
  1. **Liste blanche d'expediteur** (`TRUSTED_SENDER_EMAIL`) : seuls les
     mails dont l'en-tete `From` correspond exactement a cette adresse sont
     consideres. Un mail usurpant cette adresse ("From" falsifie) est en
     pratique tres difficile a faire passer sur gmail.com, qui applique
     DMARC strictement - mais ce n'est pas une garantie absolue, d'ou la
     deuxieme verification.
  2. **Phrase secrete** (`COMMAND_PASSPHRASE`) : chaque commande doit la
     contenir. Sans elle, meme un mail provenant reellement de l'adresse de
     confiance est ignore.
  Un mail qui echoue l'une des deux vérifications n'est jamais execute. En
  cas d'expediteur non reconnu, l'assistant ne repond meme pas (pour ne pas
  confirmer a un inconnu que le declencheur existe). Genere ces deux valeurs
  de facon aleatoire et longue (`openssl rand -hex 8` par exemple) et ne les
  partage avec personne.

## Prerequis

- Node.js 20+
- [Bitwarden CLI](https://bitwarden.com/help/cli/) installee et deverrouillee
  (`bw unlock --raw` pour obtenir `BW_SESSION`)
- Une cle API Anthropic ([console.anthropic.com](https://console.anthropic.com))
- **Pour le mode vocal (PC) uniquement** : [SoX](http://sox.sourceforge.net)
  installe et accessible dans le PATH (`brew install sox` sur Mac,
  `apt-get install sox libsox-fmt-all` sur Linux, binaires Windows sur le
  site de SoX). Le modele Whisper (`base`, ~150 Mo) est telecharge
  automatiquement au premier enregistrement - aucune cle API supplementaire,
  tout tourne en local.
- **Pour le connecteur mail et/ou le pont mail** : un projet
  [Google Cloud Console](https://console.cloud.google.com/) avec l'API Gmail
  activee et des identifiants OAuth de type "Application de bureau" (menu
  *Identifiants > Creer des identifiants > ID client OAuth*). Renseigne
  `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `.env`.

## Installation (PC)

```bash
cd assistant-vocal-ia
pnpm install   # ou npm install
cp .env.example .env
# remplir ANTHROPIC_API_KEY et BW_SESSION dans .env

pnpm run auth:gmail    # une seule fois, ouvre le navigateur pour autoriser Gmail

pnpm start             # mode texte
pnpm start -- --voice  # mode vocal (push-to-talk : Entree pour parler, Entree pour arreter)
```

## Mode 2 - App mobile en Wi-Fi (reseau local)

```bash
# Sur le PC : demarrer le serveur
pnpm run server   # necessite ASSISTANT_TOKEN et PORT dans .env

# Sur le telephone : installer l'app Expo Go (App Store / Play Store)

# Sur le PC, dans un second terminal : lancer le serveur de dev Expo
cd mobile
npm install
npm start
# scanne le QR code affiche avec Expo Go (PC et telephone sur le meme Wi-Fi)
```

Dans l'app, section "Connexion Wi-Fi", renseigne l'adresse IP locale du PC +
port (ex: `http://192.168.1.23:4174` - trouvable via `ipconfig` sur Windows
ou `ifconfig`/`ipconfig getifaddr en0` sur Mac) et le meme `ASSISTANT_TOKEN`
que dans `.env`. Reponse immediate, mais **le telephone et le PC doivent
etre sur le meme Wi-Fi**.

## Mode 3 - Pont mail (PC et mobile relies, fonctionne de partout)

C'est le mode a utiliser quand le telephone n'est pas sur le meme reseau que
le PC. Le telephone envoie un mail de commande, le PC (qui doit rester
allume et connecte) le detecte, execute la commande, et repond par mail.

```bash
# Sur le PC : ajoute dans .env (en plus de GOOGLE_CLIENT_ID/SECRET)
# TRUSTED_SENDER_EMAIL=ton-adresse@gmail.com
# COMMAND_PASSPHRASE=<valeur generee avec `openssl rand -hex 8`>

pnpm run auth:gmail    # a refaire si deja fait avant l'ajout des scopes send/modify
pnpm run mail-bridge   # tourne en continu, verifie les nouveaux mails toutes les 30s
```

Format d'un mail de commande (envoyable depuis n'importe quelle app mail,
y compris manuellement) :
- **Sujet** : `Serv'IA <phrase secrete> <commande>` (ex: `Serv'IA a1b2c3d4
  range mes photos`), ou juste `Serv'IA <phrase secrete>` si la commande est
  plus longue et mise dans le corps du mail a la place.
- **Doit etre envoye depuis** `TRUSTED_SENDER_EMAIL`.

Dans l'app mobile, section "Connexion par mail", renseigne l'adresse mail
surveillee par le PC et la meme `COMMAND_PASSPHRASE` - le bouton "Envoyer
par mail" ouvre l'app Mail native du telephone avec le sujet/corps
pre-remplis ; c'est toi qui appuies sur "Envoyer" dans ton app mail (rien
n'est envoye automatiquement en arriere-plan). La reponse arrive ensuite par
mail, pas dans l'app.

## Tests

```bash
pnpm test              # tsc --noEmit + tests unitaires (organizeFiles, bridgeParser)
cd mobile && npx tsc --noEmit   # verification TypeScript de l'app mobile
```

**Ce qui est verifie automatiquement dans cet environnement** (aucun
materiel/compte externe requis) : le code du PC et celui du mobile compilent
tous les deux sans erreur ; `organizePhotosByDate` est teste avec de vrais
fichiers temporaires (tri par mois, fichiers non-image ignores) ; la
logique du pont mail (`bridgeParser.ts` - detection du declencheur "Serv'IA"
avec ses variantes, extraction de la phrase secrete et de la commande,
decodage du corps d'un mail multipart) est testee sans reseau ni compte
Google ; `src/server.ts` a ete demarre et teste manuellement ici (`/health`
public, `/command` qui rejette les requetes sans le bon token) ; le pont
mail refuse bien de demarrer sans `TRUSTED_SENDER_EMAIL`/`COMMAND_PASSPHRASE`.

**Ce qui ne peut pas etre teste dans cet environnement sandbox** (pas de
microphone, pas de cle API Anthropic, pas de session Bitwarden active, pas
de compte Gmail autorise, pas de telephone/Expo Go) - a valider toi-meme sur
ton poste avant usage reel :
- le mode `--voice` (enregistrement SoX + transcription Whisper)
- le routeur complet avec une vraie reponse du modele (`runCommand`)
- `fetch_credential` / `login_to_site` (necessitent Bitwarden deverrouille)
- `list_recent_emails` et le pont mail de bout en bout (necessitent
  l'autorisation OAuth Gmail et un vrai mail de commande recu)
- l'app mobile en conditions reelles (Wi-Fi et mail, Expo Go)

## Limites actuelles (prototype)

- Mode vocal PC en **push-to-talk** (pas d'ecoute continue par mot-cle type
  "Hey Siri") et non teste en conditions reelles - a valider sur ton poste.
- L'app mobile est en **texte uniquement** pour l'instant (pas de micro sur
  mobile).
- Le pont mail interroge Gmail toutes les 30 secondes (pas instantane) et
  necessite que le PC reste allume avec `pnpm run mail-bridge` actif.
- `login_to_site` utilise des selecteurs generiques : marche sur beaucoup de
  formulaires standards, pas garanti sur tous les sites.
- Le connecteur mail (lecture + pont) ne couvre que Gmail (pas encore
  Outlook).
- Aucune confirmation graduee par niveau de risque pour l'instant - toutes
  les commandes s'executent directement des qu'elles passent les
  verifications d'authenticite. A ajouter avant tout usage au-dela du test
  personnel (cf. discussion securite).

## Prochaines etapes

1. Valider les trois modes en conditions reelles (micro PC, app mobile en
   Wi-Fi, pont mail de bout en bout) - c'est la priorite avant d'ajouter de
   nouvelles briques.
2. Ajouter la voix a l'app mobile (dictee native iOS/Android ou meme
   pipeline Whisper que le PC).
3. Notification push mobile quand une reponse arrive par mail, plutot que
   de devoir aller consulter la boite de reception.
4. Elargir le connecteur mail (Outlook) une fois Gmail valide en usage reel.
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
