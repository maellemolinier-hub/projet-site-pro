# Maëlle Jean Immobilier — Site Pro

Site vitrine pour Maëlle Jean, conseillère immobilière indépendante sur la Côte d'Azur (Cannes, Grasse, région 06).

## Structure du projet

```
index.html               Page d'accueil principale
pages/
  estimation.html        Outil d'estimation de bien
  rendez-vous.html       Prise de rendez-vous
  vlog.html              Blog / articles vidéo
  ebook.html             Guide téléchargeable
css/
  style.css              Styles principaux
  estimation.css         Styles de l'outil d'estimation
js/
  main.js                Comportements généraux
  chatbot.js             Chatbot intégré
  estimation.js          Logique d'estimation
images/                  Photos, vidéos, favicon
.claude/commands/
  upload-post.md         Commande /upload-post (ajouter un article vlog)
.mcp.json                Configuration MCP (serveur Unipile)
```

## Commandes disponibles

### `/upload-post`
Ajoute un nouvel épisode au vlog (`pages/vlog.html` + mise à jour `index.html`).
Arguments : `titre`, `categorie`, `description`, `duree`, `date`, `tags`, `url`, `featured`.

## Serveur MCP Unipile

Ce projet utilise le serveur MCP officiel d'Unipile pour accéder à LinkedIn et aux messageries professionnelles directement depuis Claude Code.

### Configuration

Le fichier `.mcp.json` à la racine du projet configure la connexion :

```json
{
  "mcpServers": {
    "unipile": {
      "type": "http",
      "url": "https://developer.unipile.com/mcp?branch=v1.0",
      "headers": {
        "X-API-KEY": "${UNIPILE_API_KEY}"
      }
    }
  }
}
```

### Prérequis

1. **Compte Unipile** — créer un compte sur [unipile.com](https://unipile.com) et connecter les comptes souhaités (LinkedIn, Gmail, etc.)
2. **Clé API** — récupérer la clé depuis le tableau de bord Unipile
3. **Variable d'environnement** — définir `UNIPILE_API_KEY` dans l'environnement :
   ```bash
   export UNIPILE_API_KEY=votre_clé_api
   ```
   Ou l'ajouter dans `.env` (ne pas committer ce fichier).

### Connexion au serveur

Une fois la clé configurée, Claude Code se connecte automatiquement au démarrage de session. Vérifier le statut avec :
```
/mcp
```

### Outils disponibles via Unipile MCP

Le serveur expose des outils pour :

**Messagerie LinkedIn**
- Lister les conversations et messages
- Envoyer des messages à des prospects ou clients
- Démarrer de nouvelles conversations
- Envoyer des InMails (contacts hors réseau)

**Recherche LinkedIn**
- Chercher des profils (particuliers, agences, notaires)
- Rechercher des entreprises
- Parcourir les posts et contenus

**Gestion des connexions**
- Envoyer/accepter des invitations
- Consulter les connexions de 1er degré
- Gérer les demandes en attente

**Email et Calendrier**
- Lire et envoyer des emails (si compte Gmail/Outlook connecté)
- Gérer les événements calendrier

**Autres messageries** (si comptes connectés)
- WhatsApp, Instagram, Telegram

### Exemples d'utilisation

```
# Trouver des prospects dans la région
"Cherche des propriétaires qui ont posté sur LinkedIn à propos de vente immobilière sur Cannes"

# Suivre un contact après un rendez-vous
"Envoie un message LinkedIn de remerciement à [nom] suite à notre estimation d'hier"

# Consulter les messages non lus
"Liste mes dernières conversations LinkedIn non lues"
```

### Limites recommandées (LinkedIn)

Pour éviter les restrictions de compte LinkedIn :
- Vues de profils : 80–100 / jour
- Invitations : 80–100 / semaine (compte payant)
- Messages : 100–150 / jour

### Documentation complète

Voir [developer.unipile.com](https://developer.unipile.com) pour la référence complète de l'API et des outils disponibles.
