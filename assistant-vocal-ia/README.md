# Assistant vocal IA - prototype

Prototype d'assistant personnel qui execute des actions locales (ranger des
photos, lancer des logiciels, se connecter a des sites deja enregistres) a
partir d'une commande texte. La reconnaissance vocale n'est pas encore
branchee - c'est l'etape suivante une fois le routage de commandes valide.

## Architecture

```
src/
  cli.ts            -> boucle interactive (entree texte pour l'instant)
  core/router.ts     -> le "cerveau" : envoie la commande a Claude (Anthropic API)
                         avec la liste des outils disponibles, execute l'outil choisi
  tools/
    organizeFiles.ts -> range les photos d'un dossier en sous-dossiers AAAA-MM
    openApp.ts        -> lance un logiciel installe sur la machine
    bitwarden.ts       -> recupere un identifiant depuis Bitwarden (CLI `bw`)
    loginToSite.ts      -> ouvre un site et remplit les champs de connexion
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
- **Le repo est prive.** A ne jamais rendre public une fois `.env` rempli
  meme s'il est dans `.gitignore` - verifier avant tout commit.

## Prerequis

- Node.js 20+
- [Bitwarden CLI](https://bitwarden.com/help/cli/) installee et deverrouillee
  (`bw unlock --raw` pour obtenir `BW_SESSION`)
- Une cle API Anthropic ([console.anthropic.com](https://console.anthropic.com))

## Installation

```bash
cd assistant-vocal-ia
pnpm install   # ou npm install
cp .env.example .env
# remplir ANTHROPIC_API_KEY et BW_SESSION dans .env
pnpm start     # ou npm start
```

## Limites actuelles (prototype)

- Pas de reconnaissance vocale (Whisper) ni d'app mobile - commandes texte
  uniquement pour valider l'architecture avant d'investir dans ces briques.
- `login_to_site` utilise des selecteurs generiques : marche sur beaucoup de
  formulaires standards, pas garanti sur tous les sites.
- Pas encore de connecteur mail (necessite une configuration OAuth Gmail/
  Outlook cote utilisateur, a faire dans une prochaine iteration).
- Aucune authentification biometrique / confirmation graduee par niveau de
  risque pour l'instant - toutes les commandes s'executent directement.
  A ajouter avant tout usage au-dela du test personnel.

## Prochaines etapes

1. Entree vocale (Whisper local ou API) a la place du texte dans `cli.ts`.
2. Application mobile legere (relaie juste la commande vers ce meme routeur).
3. Connecteur mail via OAuth (Gmail API / Microsoft Graph).
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
