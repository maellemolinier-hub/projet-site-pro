Ajoute un nouvel article/épisode au vlog du site Maëlle Jean Immobilier.

## Ce que tu dois faire

1. **Collecter les informations** manquantes via $ARGUMENTS ou en demandant à l'utilisateur :
   - `titre` — titre de l'article/vidéo (obligatoire)
   - `categorie` — l'une de : `conseil`, `juridique`, `staging`, `marche`, `tips` (obligatoire)
   - `description` — résumé en 1-2 phrases (obligatoire)
   - `duree` — durée de la vidéo ex. "8 min" (optionnel, défaut : "5 min")
   - `date` — mois et année ex. "Juin 2025" (optionnel, défaut : mois courant)
   - `tags` — liste de mots-clés ex. "DVF, Estimation" (optionnel)
   - `url` — lien vers la vidéo (optionnel, défaut : "#")
   - `featured` — true/false pour mettre en article à la une (optionnel, défaut : false)

2. **Mapper la catégorie** vers son libellé et emoji :
   - `conseil` → libellé "Conseil", emoji "💡", meta "Conseil vendeur"
   - `juridique` → libellé "Juridique", emoji "⚖️", meta "Jurisprudence"
   - `staging` → libellé "Home Staging", emoji "🏠", meta "Home Staging"
   - `marche` → libellé "Marché", emoji "📊", meta "Analyse marché"
   - `tips` → libellé "Tips", emoji "✨", meta "Tip rapide"

3. **Insérer le nouvel article** au tout début du `<div class="vlog-full-grid" id="vlogGrid">` dans `pages/vlog.html`, en utilisant ce template HTML :

```html
        <article class="vlog-full-card" data-cat="CATEGORIE_SLUG">
          <div class="vfc-thumb">
            <div class="vfc-play">▶</div>
            <span class="vfc-cat">LIBELLE_CATEGORIE</span>
            <span class="vfc-duration">DUREE</span>
          </div>
          <div class="vfc-body">
            <div class="vfc-meta">📅 DATE · EMOJI META_CATEGORIE</div>
            <h3>TITRE</h3>
            <p>DESCRIPTION</p>
            <div class="vfc-tags">TAGS_HTML</div>
          </div>
        </article>
```

   Pour les tags, chaque tag devient : `<span class="vfc-tag">TAG</span>`

4. **Si `featured: true`**, remplacer également le bloc `<div class="vlog-featured">` dans `pages/vlog.html` par ce template :

```html
      <div class="vlog-featured">
        <div class="vf-thumb">
          <div class="vf-play">▶</div>
          <div class="vf-badge">⭐ À la une</div>
        </div>
        <div class="vf-body">
          <span class="section-tag">LIBELLE_CATEGORIE</span>
          <h2>TITRE</h2>
          <p>DESCRIPTION</p>
          <div class="vf-meta">📅 DATE · ⏱ DUREE</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <a href="URL" class="btn btn-primary">Regarder →</a>
            <a href="ebook.html" class="btn btn-outline">Télécharger le guide</a>
          </div>
        </div>
      </div>
```

5. **Mettre à jour la homepage** (`index.html`) : remplacer le premier article `<article class="vlog-card">` (le petit, pas le featured) dans la section `.vlog-grid` par le nouveau post, en utilisant ce template :

```html
        <article class="vlog-card">
          <div class="vlog-thumb vlog-thumb--sm">
            <div class="vlog-play vlog-play--sm">▶</div>
          </div>
          <div class="vlog-info">
            <span class="vlog-category-sm">LIBELLE_CATEGORIE</span>
            <h4>TITRE</h4>
            <a href="pages/vlog.html" class="vlog-link">Lire →</a>
          </div>
        </article>
```

   Si `featured: true`, mettre aussi à jour l'article featured de la homepage (`.vlog-card--featured`) :

```html
        <article class="vlog-card vlog-card--featured">
          <div class="vlog-thumb">
            <div class="vlog-play">▶</div>
            <span class="vlog-category">LIBELLE_CATEGORIE</span>
          </div>
          <div class="vlog-info">
            <h3>TITRE</h3>
            <p>DESCRIPTION</p>
            <a href="pages/vlog.html" class="vlog-link">Voir la vidéo →</a>
          </div>
        </article>
```

6. **Confirmer** à l'utilisateur les fichiers modifiés et l'aperçu du post ajouté.

## Notes importantes
- Préserver exactement l'indentation existante dans les fichiers HTML
- Ne pas modifier d'autres sections que celles décrites
- Si l'utilisateur fournit `$ARGUMENTS`, parser les arguments comme des paires clé=valeur séparées par des virgules ou des nouvelles lignes
