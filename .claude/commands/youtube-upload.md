---
description: Automatise l'upload d'une vidéo YouTube (@azurimmobymaelle) avec validation humaine avant publication.
---

Aide l'utilisateur à uploader une vidéo YouTube via le script `youtube-upload/upload.js`.

## Étapes à suivre

1. **Vérifie le quota disponible** avant de commencer :
   ```bash
   cd youtube-upload && node validate.js quota
   ```

2. **Demande les informations manquantes** si l'utilisateur ne les a pas fournies :
   - Chemin vers la vidéo (`.mp4`, `.mov`)
   - Chemin vers la miniature (`.jpg` ou `.png`, max 2 Mo, ratio 16:9)
   - Titre (max 100 caractères)
   - Description (incluez liens, hashtags, appel à l'action)
   - Tags séparés par des virgules (optionnel)
   - ID de playlist (optionnel)

3. **Lance l'upload** avec la commande :
   ```bash
   cd youtube-upload && node upload.js \
     --video "$CHEMIN_VIDEO" \
     --thumbnail "$CHEMIN_MINIATURE" \
     --title "$TITRE" \
     --description "$DESCRIPTION" \
     --tags "$TAGS"
   ```

4. **Note l'ID vidéo** retourné et l'URL YouTube Studio pour la vérification.

5. **Rappelle à l'utilisateur** de :
   - Vérifier la vidéo dans YouTube Studio
   - Valider titre, description, miniature et tags
   - Lancer `node validate.js publish <videoId>` une fois satisfait(e)

## Commandes de validation

```bash
# Voir toutes les vidéos en attente
cd youtube-upload && node validate.js list

# Publier une vidéo validée
cd youtube-upload && node validate.js publish <videoId>

# Rejeter et supprimer une vidéo
cd youtube-upload && node validate.js reject <videoId>
```

## Coûts quota (limite 10 000 unités/jour)

| Action | Coût |
|--------|------|
| Upload vidéo | 1 600 unités |
| Upload miniature | 50 unités |
| Publication | 50 unités |
| **Total par vidéo** | **~1 700 unités** |
| **Max uploads/jour** | **~5 vidéos** |

## Configuration initiale (première fois)

Si `config.json` n'existe pas :
1. Copier `config.example.json` → `config.json`
2. Créer un projet sur https://console.cloud.google.com
3. Activer l'API "YouTube Data API v3"
4. Créer des identifiants OAuth 2.0 (type : Application de bureau)
5. Renseigner `client_id` et `client_secret` dans `config.json`
6. Lancer `cd youtube-upload && npm install`
