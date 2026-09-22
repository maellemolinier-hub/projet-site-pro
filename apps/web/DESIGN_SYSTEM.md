# Design system — direction "premium" (inspirée wealth-management / fintech haut de gamme)

## Contexte et limite importante

Cette direction a été demandée en référence à `delos.so`. **L'accès réseau sortant vers ce domaine est bloqué pour cette session** (policy d'egress de l'environnement Claude Code) : ni le code source, ni des captures d'écran du site réel n'ont pu être récupérés.

Ce document ne décrit donc **pas** un clonage pixel-perfect de delos.so, mais une **interprétation originale des codes visuels du secteur "wealth-management / fintech premium"** (sobriété, contraste encre/or, typographie éditoriale, animations discrètes au scroll) — appliquée à l'identité ImmoExpert.

Si tu veux affiner pour coller plus précisément à delos.so : colle le HTML d'une section (clic droit → *Afficher le code source*, ou l'inspecteur du navigateur) ou des screenshots ici, et les tokens ci-dessous seront ajustés en conséquence.

## Palette

### Encre (`ink`) — nouvelle base sombre, en complément du bleu `brand` existant

| Token | Hex | Usage |
|---|---|---|
| `ink-950` | `#090b14` | Fond hero, `theme-color` mobile |
| `ink-900` | `#0f1320` | Fond secondaire, logo mark |
| `ink-800` | `#171c2c` | Dégradé hero |
| `ink-600` | `#333c54` | Texte secondaire sur fond clair |
| `ink-500` | `#48526b` | Liens de nav |
| `ink-100` | `#e4e7ec` | Bordures hairline |
| `ink-50` | `#f4f5f7` | Fonds au hover |

### Or (`gold`) — nouvel accent, en complément de l'orange `accent` existant

| Token | Hex | Usage |
|---|---|---|
| `gold-400` | `#d9bd78` | Icônes, highlights clairs |
| `gold-500` | `#c9a24c` | CTA primaire, accents |
| `gold-600` | `#ad8636` | Hover CTA, liens actifs |
| `gold-700` | `#8c6b29` | Texte accent sur fond clair |

Les tokens `brand` (bleu) et `accent` (orange) existants **restent en place** — ils sont encore utilisés par `Features`, `Pricing`, `Testimonials`, etc. `ink`/`gold` sont une couche additive, pour l'instant appliquée au `Hero` et à la `Navbar`.

## Typographie

- **Display** (titres) : `Fraunces` — serif éditorial, variable font, chargée via `next/font/google`, exposée en `font-display` / var `--font-display`.
- **Texte courant** : `Inter` (inchangé) — `font-sans`.
- Échelle resserrée sur les titres : `leading-[1.08]`, `tracking-tight` ; labels/badges en `uppercase tracking-widest text-[11px]`.

## Espacement

Aucune nouvelle échelle custom : on reste sur l'échelle Tailwind standard pour rester cohérent avec le reste du site (`py-20`, `gap-12 lg:gap-20`, `max-w-7xl`, etc.).

## Animation

- Nouveau composant `<Reveal>` (`apps/web/components/marketing/Reveal.tsx`) : fade + `translateY(28px)` déclenché au scroll via `IntersectionObserver`, courbe `cubic-bezier(0.16, 1, 0.3, 1)` (utilitaire Tailwind `ease-premium`), délai configurable en prop pour un effet de stagger entre éléments.
- Respecte `prefers-reduced-motion` (animation totalement désactivée si l'utilisateur l'a demandé côté OS).
- Les animations existantes (`fade-up`, `fade-in`, `float`) sont conservées pour les composants qui les utilisent déjà.

## État d'implémentation

- ✅ Fondations : couleurs `ink`/`gold`, typo `Fraunces`, easing `premium`, composant `Reveal`
- ✅ `Hero.tsx` et `Navbar.tsx` migrés
- ⬜ `Features`, `HowItWorks`, `Pricing`, `Experts`, `Testimonials`, `CTA`, `Footer` — encore sur `brand`/`accent`, à migrer ensuite avec la même logique de tokens pour une cohérence visuelle totale sur toute la page.
