# Le Caveau — maquette de site (cabaret intimiste, cave voûtée)

Maquette statique (HTML/CSS/JS, sans build), animée, livrée comme point de départ visuel pour un site de cabaret/club nocturne intimiste, ambiance cave voûtée en vieilles pierres. Nom de marque **« Le Caveau »** utilisé comme placeholder — à remplacer par le vrai nom, les vrais textes, photos et coordonnées.

## Aperçu local

```bash
cd apps/cabaret
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

Aucune dépendance, aucun build : `index.html` + `assets/style.css` + `assets/script.js`.

## Ce qui a été construit

- **Rideau d'ouverture** façon cabaret (velours rouge + liseré or) qui s'écarte à l'arrivée sur le site.
- **Hero en cave voûtée** : arches de pierre en perspective, flammes de bougie animées, particules dorées en suspension, **danseuse silhouette avec jupe animée** (jupe à volants qui ondule/tourbillonne en CSS pur).
- **Navigation** sticky qui se fond en verre dépoli au scroll, menu plein écran en mobile.
- Sections : L'Univers (histoire/concept), L'Expérience (4 offres), Programme (agenda de soirées), Galerie, Avis (carrousel), Réservation (formulaire → message WhatsApp pré-rempli), Contact (coordonnées + réseaux), Footer.
- **Bouton WhatsApp flottant** (pulsation) toujours visible + liens WhatsApp dans le header et la section réservation.
- Icônes réseaux sociaux (Instagram / Facebook / TikTok / WhatsApp) prêtes à lier.
- Animations au scroll (apparition en fondu), micro-interactions au survol, responsive mobile.

## À personnaliser avant mise en ligne

- [ ] Nom de l'établissement, logo réel (actuellement typographique)
- [ ] Numéro WhatsApp réel : remplacer `33600000000` dans `index.html` (3 liens) et `assets/script.js` (`WHATSAPP_NUMBER`)
- [ ] Liens Instagram / Facebook / TikTok réels (actuellement `href="#"`)
- [ ] Adresse, horaires, ville réels (section Contact)
- [ ] Textes définitifs (univers, offres, programme, avis) — les textes actuels sont des exemples crédibles, pas des faits vérifiés
- [ ] Vraies photos/vidéos du lieu à la place des vignettes dégradées (galerie, hero)
- [ ] Carte Google Maps intégrée (actuellement un placeholder)
- [ ] Mentions légales, politique de confidentialité

## Charte graphique

### Couleurs

| Rôle | Variable CSS | Valeur |
|---|---|---|
| Fond pierre profond | `--stone-950` | `#0b0908` |
| Pierre | `--stone-800` | `#1c1512` |
| Velours bordeaux | `--wine-700` / `--wine-900` | `#5c1420` / `#3b0d14` |
| Or cabaret | `--gold-500` | `#d4af37` |
| Or clair | `--gold-100` | `#f6e7c1` |
| Texte clair (crème) | `--cream` | `#f3e9d8` |
| Texte secondaire (fumée) | `--smoke` | `#b9aca0` |

Toutes les couleurs sont centralisées en variables CSS dans `assets/style.css` (`:root`) — un rebrand couleur se fait en un seul endroit.

### Typographies

- **Titres / logo** : `Cinzel` (serif capitale, gravée, très « enseigne de cabaret »)
- **Accents manuscrits** : `Tangerine` (script, pour les touches d'élégance : « Bienvenue au », légende sous la danseuse)
- **Texte courant** : `Jost` (sans-serif fine, lisible, moderne — contraste avec le serif des titres)

### Principes visuels

- **Nocturne et doré** : fond quasi noir, lumière chaude (bougie, or), jamais de blanc pur.
- **Pierre + velours** : textures suggérées (dégradés, halos) plutôt que photos — la vraie pierre/velours du lieu remplacera ces textures via photo.
- **Symétrie et arches** : le plein cintre (arc de voûte) revient comme motif structurant (hero, cadres).
- **Une danseuse en mouvement** comme signature de marque : silhouette + jupe à volants animée, réutilisable ailleurs sur le site (loader, section réservation, etc.) une fois affinée avec un illustrateur si besoin d'un rendu moins abstrait.

## Axes d'amélioration (au-delà de la maquette)

**Conversion / réservation**
- Réservation en ligne avec choix de créneau + acompte carte bancaire (Stripe) pour réduire les no-show
- Automatiser la réponse WhatsApp (bot Make/Zapier) pour confirmer une demande hors horaires d'ouverture
- Pop-in « offre de bienvenue » contre une inscription newsletter/SMS

**Acquisition**
- SEO local : fiche Google Business Profile optimisée, avis Google mis en avant, page dédiée par ville si plusieurs adresses
- Blog / actus événements pour capter les recherches « soirée cabaret [ville] »
- Flux Instagram en direct intégré (preuve sociale vivante)
- Version anglaise du site si clientèle touristique

**Fidélisation**
- Carte VIP / programme de fidélité (accès prioritaire, soirées privées)
- Séquence email/SMS post-visite (merci + demande d'avis + offre de retour)

**Mesure**
- Google Analytics 4 + Meta Pixel pour piloter les campagnes et le retargeting
- Suivi des conversions WhatsApp (clics sur le bouton flottant)

**Production**
- Remplacer les vignettes CSS de la galerie/hero par de vraies photos et une courte vidéo d'ambiance en fond du hero
- Décliner la maquette en composants réutilisables si le site évolue vers Next.js (le dossier `apps/web` du monorepo utilise déjà Next — portage possible plus tard)
