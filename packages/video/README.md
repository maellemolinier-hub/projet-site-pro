# @immoexpert/video

Génération vidéo (Remotion) pour ImmoExpert : vidéos de rapports de marché
partageables et clips vlog/social pour les experts et agences.

## Compositions

- **RapportVideo** (1080×1920, vertical) — reprend les données d'un rapport
  de marché (zone, type de bien, prix moyen au m², tendance) affiché dans
  `apps/web` (`RapportsDashboard`) pour produire une vidéo courte à partager
  en complément du PDF.
- **VlogClip** (1920×1080, horizontal) — carte d'intro/outro animée pour un
  épisode de vlog ou un clip social (titre, catégorie, description, durée,
  date, tags), à assembler avec le montage vidéo réel.

## Développement

```bash
pnpm --filter @immoexpert/video dev
```

Ouvre Remotion Studio pour prévisualiser et ajuster les compositions en direct.

## Rendu

Rendu via la CLI Remotion (props par défaut) :

```bash
pnpm --filter @immoexpert/video render:rapport
pnpm --filter @immoexpert/video render:vlog
```

Rendu programmatique avec des props personnalisées (utilisable depuis un job
backend) :

```bash
pnpm --filter @immoexpert/video render RapportVideo props.json out/rapport.mp4
```

où `props.json` respecte le schéma `rapportVideoSchema` (ou `vlogClipSchema`)
exporté par `src/compositions`.
