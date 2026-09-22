# Design system — direction visuelle inspirée de delos.so

## Contexte et méthode

`delos.so` reste inaccessible en scraping direct depuis cette session (policy
réseau). Les tokens ci-dessous viennent en revanche de **captures d'écran
réelles du site (marketing + app.delos.so) partagées dans la conversation** :
les couleurs sont donc des **estimations visuelles** (pas des valeurs hex
extraites du CSS réel, auquel je n'ai pas accès), et la mise en page /
les patterns de composants sont observés directement sur les captures.

Le code, la copy et les visuels ci-dessous sont une implémentation
**originale** pour ImmoExpert — aucun texte, image ou code de delos.so n'est
repris tel quel.

## Ce qu'on voit sur les captures

- **Bandeau noir tout en haut** : annonce + compte à rebours + lien
  d'inscription (→ composant `AnnouncementBar`, non branché par défaut).
- **Nav claire** : logo noir + petit icône, liens gris, un seul CTA bleu en
  pilule ("Essayer gratuitement").
- **Hero centré, fond crème** (pas de hero sombre) : petits badges en
  pilule au-dessus du titre ("Essai gratuit", "Sans carte bancaire"...),
  titre noir avec un mot-clé en bleu, sous-texte gris, deux CTA en pilule
  (bleu plein + blanc contouré), puis une démo produit juste en dessous
  (chez Delos : un carrousel de "workers" ; chez ImmoExpert : la carte).
- **Cartes "portrait"** : photo/avatar sur aplat de couleur pastel (sable,
  sauge, rose poudré, gris...), nom + rôle en dessous, description courte,
  puis un **bouton noir plein en pilule** ("Recruter"). C'est le motif le
  plus caractéristique du site — repris pour les cartes `Experts`.
- **Section comparatif** ("CHATBOTS & COPILOTS" vs "AI WORKERS") : deux
  colonnes, coches bleues sur la colonne "gagnante", cercles gris sur
  l'autre. Pas encore repris (pas de contenu comparatif équivalent côté
  ImmoExpert pour l'instant).
- **Bandeau CTA sombre** avant le footer : photo assombrie en fond, titre
  blanc centré, deux boutons (blanc plein + contour blanc). Pas encore
  repris.
- **Footer clair** : logo noir, adresse, colonnes de liens gris.

## Palette (estimée depuis les captures)

### Encre (`ink`) — neutres quasi-noirs, remplacent le gris par défaut sur les sections retravaillées

| Token | Hex (estimé) | Usage |
|---|---|---|
| `ink-950` | `#0d0d0e` | Logo mark, boutons pilule noirs, `theme-color` |
| `ink-900` | `#161618` | Titres, hover des boutons noirs |
| `ink-600` | `#4a4a4e` | Liens de nav, texte secondaire |
| `ink-400` | `#94949a` | Texte tertiaire, légendes |
| `ink-100` | `#ececee` | Bordures hairline |
| `ink-50` | `#f7f7f8` | Fonds au hover |

### Crème (`cream`) — fond chaud du hero et de la nav, remplace le blanc pur

| Token | Hex (estimé) | Usage |
|---|---|---|
| `cream-50` | `#fdfcfa` | Nav au scroll |
| `cream-100` | `#f8f5ef` | Fond du hero |
| `cream-200` | `#f1ece1` | Variante plus contrastée |

### Bleu — le token `brand` existant (ex. `brand-600 #4449e7`) est déjà assez
proche du bleu CTA observé chez Delos : pas de nouveau token, on l'utilise
simplement de manière plus ciblée (CTA principal, mot-clé dans le titre,
accents), à la place du gris/violet utilisé avant.

### Pastels des cartes portrait

Définis directement en arbitrary values dans `Experts.tsx` (pas dans
`tailwind.config`, car ce sont des couleurs "décoratives tournantes", pas des
tokens sémantiques) : `#EFE1CB` (sable), `#D8E0CE` (sauge), `#EAD3CC` (rose
poudré).

## Typographie

**Correction** par rapport à la première passe (avant d'avoir les captures) :
pas de serif éditorial chez Delos — tout est en sans-serif grotesque, gras
sur les titres, avec un mot-clé coloré (bleu) dans le titre du hero. `Inter`
seul suffit, pas besoin d'une deuxième famille de police.

## Forme

Les boutons et pilules sont systématiquement en `rounded-full` (contre
`rounded-xl`/`rounded-lg` avant) : c'est le changement de forme le plus
visible sur les captures, aussi bien pour les CTA principaux que pour les
boutons "Recruter" et les badges.

## Animation

- `<Reveal>` (`apps/web/components/marketing/Reveal.tsx`) : fade +
  `translateY` au scroll via `IntersectionObserver`, courbe
  `cubic-bezier(0.16, 1, 0.3, 1)` (`ease-premium`), délai par prop pour un
  effet de stagger. Respecte `prefers-reduced-motion`.
- Les captures ne permettent pas de confirmer les animations réelles du
  carrousel de "workers" (drag/autoplay) — ce n'est **pas** reproduit tel
  quel, faute de pouvoir l'observer en direct.
- **Fail-safe important** : `Reveal` ne masque son contenu qu'une fois
  confirmé côté client qu'`IntersectionObserver` est disponible pour le
  révéler ensuite (`useLayoutEffect`). Sans JS, avec JS cassé, ou pour un
  crawler qui n'exécute pas le JS, le contenu reste visible par défaut —
  jamais caché en permanence. Repéré en testant un screenshot plein-page
  automatisé (voir ci-dessous) : sans ce garde-fou, tout ce qui n'a jamais
  été dans le viewport observé restait à `opacity: 0` pour de bon.

## État d'implémentation

- ✅ Tokens (`ink`, `cream`), formes en pilule, easing `premium`, `Reveal`
  (avec fallback visible par défaut)
- ✅ `Hero.tsx`, `Navbar.tsx` : fond crème, badges en pilule, CTA bleu +
  contour noir, mot-clé bleu dans le titre
- ✅ `Experts.tsx` : cartes portrait sur fond pastel + bouton noir pilule
- ✅ `Features.tsx`, `HowItWorks.tsx`, `Pricing.tsx`, `Testimonials.tsx`,
  `CTA.tsx`, `Footer.tsx` : migrés vers `ink`/`cream`, boutons en pilule,
  `<Reveal>` avec stagger sur les grilles de cartes
- ✅ `AnnouncementBar.tsx` : composant prêt, **non branché** sur la home —
  à activer uniquement avec un vrai contenu (éviter un faux compte à
  rebours)
- ⬜ Section comparatif type "avant/après" et bandeau CTA sombre en pied de
  page : pas encore repris, à faire si utile pour ImmoExpert

## Vérifié en local

Rendu testé avec `pnpm --filter @immoexpert/db run db:generate` puis
`next dev` + un screenshot plein-page (Playwright) sur toutes les
sections de la home. RAS visuellement. Une erreur `MissingSecret`
(next-auth) apparaît dans l'overlay de dev : c'est l'absence de variable
d'env `AUTH_SECRET` en local, préexistante et sans rapport avec ce
travail de design — à définir dans `.env` pour la faire disparaître.
