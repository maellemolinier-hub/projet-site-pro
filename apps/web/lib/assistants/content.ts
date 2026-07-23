/**
 * Moteur de génération de contenu — Assistant Réseaux sociaux & SEO.
 *
 * Objectif : produire, sans dépendance externe, du contenu prêt à publier
 * (posts réseaux sociaux + article SEO + calendrier éditorial) pensé pour
 * attirer des leads immobiliers naturellement.
 *
 * Le moteur local fonctionne toujours, même sans clé API. Si OPENAI_API_KEY
 * est présent, le contenu est raffiné par un LLM (amélioration facultative).
 */

import type {
  Platform,
  Tone,
  Goal,
  ContentRequest,
  SocialPost,
  SeoArticle,
  CalendarEntry,
  GeneratedContent,
} from "./meta";

export type {
  Platform,
  Tone,
  Goal,
  ContentRequest,
  SocialPost,
  SeoArticle,
  CalendarEntry,
  GeneratedContent,
};

const GOAL_LABEL: Record<Goal, string> = {
  leads_vendeurs: "attirer des propriétaires prêts à vendre",
  leads_acheteurs: "attirer des acheteurs qualifiés",
  notoriete: "asseoir votre notoriété d'expert local",
  recrutement: "attirer de nouveaux conseillers dans votre équipe",
};

const GOAL_CTA: Record<Goal, string[]> = {
  leads_vendeurs: [
    "Vous pensez vendre en {zone} ? Recevez votre estimation offerte en 24h — commentez « ESTIMATION » ou écrivez-moi en privé.",
    "Curieux de connaître la vraie valeur de votre bien à {zone} ? Je vous envoie une estimation détaillée, sans engagement.",
    "Envie de savoir combien vaut votre bien aujourd'hui à {zone} ? DM « PRIX » et je m'en occupe.",
  ],
  leads_acheteurs: [
    "Vous cherchez à acheter à {zone} ? Dites-moi votre budget en commentaire, je vous partage les opportunités avant tout le monde.",
    "Un projet d'achat à {zone} ? Écrivez-moi « ACHAT » : je vous envoie ma sélection off-market.",
    "Recevez en avant-première les biens qui arrivent à {zone} — commentez « ALERTE ».",
  ],
  notoriete: [
    "Une question sur le marché de {zone} ? Posez-la en commentaire, je réponds à toutes.",
    "Enregistrez ce post pour votre prochain projet immobilier à {zone}.",
    "Partagez à quelqu'un qui a un projet immobilier à {zone} — ça peut l'aider.",
  ],
  recrutement: [
    "Vous êtes agent et vous vous sentez à l'étroit ? Parlons-en — DM « ÉQUIPE ».",
    "On recrute à {zone}. Curieux de voir nos outils ? Écrivez-moi.",
    "Envie de travailler avec des données de marché en temps réel ? Contactez-moi.",
  ],
};

const HOOKS: Record<Goal, string[]> = {
  leads_vendeurs: [
    "Le prix affiché n'est pas le prix de vente. Voici pourquoi 👇",
    "90 % des estimations en ligne se trompent de 15 %. La vôtre aussi ?",
    "Ce bien à {zone} est parti en 9 jours. Pas par chance.",
    "Vendre en {zone} en 2026 : les 3 erreurs qui coûtent le plus cher.",
    "Votre voisin a vendu 40 000 € au-dessus du prix « moyen ». Comment ?",
  ],
  leads_acheteurs: [
    "Les meilleurs biens à {zone} ne sont jamais sur les portails. Voici où ils sont 👇",
    "Acheter à {zone} en 2026 : le bon moment, ou pas ?",
    "3 quartiers de {zone} encore sous-cotés (mais plus pour longtemps).",
    "Ce que personne ne vous dit avant d'acheter à {zone}.",
    "Budget serré à {zone} ? Ces 4 leviers changent tout.",
  ],
  notoriete: [
    "Le marché de {zone} vient de bouger. Le point en 30 secondes 👇",
    "On m'a posé cette question 12 fois cette semaine. Ma réponse :",
    "Voici ce que les chiffres DVF de {zone} racontent vraiment.",
    "Prix au m² à {zone} : la réalité derrière les moyennes.",
    "Ce graphique du marché de {zone} devrait vous intéresser.",
  ],
  recrutement: [
    "J'ai arrêté de prospecter au hasard. Voici ce qui a changé 👇",
    "Pourquoi mes mandats rentrent plus vite qu'avant (spoiler : la data).",
    "Le métier d'agent immobilier en 2026 n'a plus rien à voir.",
    "Ce que j'aurais aimé savoir à mes débuts d'agent à {zone}.",
    "L'outil qui a doublé mes rentrées de mandats.",
  ],
};

const VALUE_POINTS = [
  "les prix réels au m² rue par rue (données DVF + notaires), pas des moyennes trompeuses",
  "l'évolution des prix sur 12 mois dans votre secteur exact",
  "les signaux qui indiquent qu'un bien va se vendre vite (ou stagner)",
  "la différence entre le prix affiché et le prix réellement signé",
  "les quartiers en tension où la demande dépasse l'offre",
  "l'impact du DPE sur la valeur et le délai de vente",
];

const TONE_INTRO: Record<Tone, (topic: string, zone: string, goal: Goal) => string> = {
  expert: (topic, zone) =>
    `En tant que professionnel de l'immobilier à ${zone}, je vois passer beaucoup d'idées reçues sur ${topic.toLowerCase()}. Faisons le tri avec des données concrètes.`,
  proche: (topic, zone) =>
    `On me parle souvent de ${topic.toLowerCase()} à ${zone}. Voici, simplement, ce qu'il faut vraiment savoir.`,
  punchy: (topic) =>
    `${topic}. On arrête les approximations. Voici les faits, direct.`,
  premium: (topic, zone) =>
    `${topic} à ${zone} mérite une analyse rigoureuse. Voici la lecture d'un expert, chiffres à l'appui.`,
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function seedFrom(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

const BASE_HASHTAGS = [
  "immobilier",
  "immo",
  "estimationimmobiliere",
  "agentimmobilier",
  "vendresonbien",
  "investissementimmobilier",
];

function zoneHashtag(city?: string): string[] {
  if (!city) return [];
  const c = city.toLowerCase().replace(/[^a-z0-9]/g, "");
  return [c, `immo${c}`];
}

function buildSocialPost(
  req: ContentRequest,
  platform: Platform,
  seed: number,
): SocialPost {
  const zone = req.city?.trim() || "votre secteur";
  const hook = pick(HOOKS[req.goal], seed).replace(/\{zone\}/g, zone);
  const cta = pick(GOAL_CTA[req.goal], seed + 1).replace(/\{zone\}/g, zone);
  const v1 = pick(VALUE_POINTS, seed);
  const v2 = pick(VALUE_POINTS, seed + 3);
  const v3 = pick(VALUE_POINTS, seed + 5);

  const intro = TONE_INTRO[req.tone](req.topic, zone, req.goal);

  let body = "";
  switch (platform) {
    case "linkedin":
      body =
        `${intro}\n\n` +
        `3 choses que je regarde avant tout :\n\n` +
        `1️⃣ ${cap(v1)}.\n` +
        `2️⃣ ${cap(v2)}.\n` +
        `3️⃣ ${cap(v3)}.\n\n` +
        `La plupart des vendeurs et acheteurs à ${zone} n'ont pas accès à ces données. Moi si, et je m'en sers pour ${GOAL_LABEL[req.goal]}.`;
      break;
    case "instagram":
      body =
        `${intro}\n\n` +
        `✅ ${cap(v1)}\n` +
        `✅ ${cap(v2)}\n` +
        `✅ ${cap(v3)}\n\n` +
        `Enregistre ce post 📌 et partage-le à quelqu'un concerné.`;
      break;
    case "facebook":
      body =
        `${intro}\n\n` +
        `Ce qui fait vraiment la différence à ${zone} :\n` +
        `• ${cap(v1)}\n` +
        `• ${cap(v2)}\n` +
        `• ${cap(v3)}\n\n` +
        `Je suis votre expert local et j'accompagne mes clients avec des données de marché fiables.`;
      break;
    case "twitter":
      body =
        `${req.topic} à ${zone} :\n` +
        `→ ${cap(v1)}\n` +
        `→ ${cap(v2)}`;
      break;
    default:
      body = intro;
  }

  const hashtags =
    platform === "linkedin" || platform === "instagram" || platform === "facebook"
      ? dedupe([...zoneHashtag(req.city), ...BASE_HASHTAGS]).slice(
          0,
          platform === "instagram" ? 12 : 5,
        )
      : dedupe([...zoneHashtag(req.city), "immobilier"]).slice(0, 2);

  const full = `${hook}\n\n${body}\n\n${cta}`;
  return {
    platform,
    hook,
    body,
    cta,
    hashtags,
    charCount: full.length + hashtags.reduce((a, h) => a + h.length + 2, 0),
  };
}

function buildSeoArticle(req: ContentRequest, seed: number): SeoArticle {
  const zone = req.city?.trim() || "votre ville";
  const topic = req.topic;
  const kw = dedupe([
    ...(req.keywords ?? []),
    `${topic.toLowerCase()} ${zone.toLowerCase()}`,
    `prix immobilier ${zone.toLowerCase()}`,
    `estimation immobilière ${zone.toLowerCase()}`,
    `agent immobilier ${zone.toLowerCase()}`,
  ]).slice(0, 6);

  const metaTitle = `${topic} à ${zone} : le guide complet 2026 (prix, conseils, tendances)`;
  const metaDescription = `${topic} à ${zone} : prix réels au m², tendances du marché et conseils d'expert pour ${GOAL_LABEL[req.goal]}. Estimation gratuite en 24h.`;

  const outline: { h2: string; h3: string[] }[] = [
    {
      h2: `${topic} à ${zone} : où en est le marché en 2026 ?`,
      h3: [
        `Prix moyen au m² à ${zone}`,
        `Évolution des prix sur 12 mois`,
        `Les quartiers qui montent`,
      ],
    },
    {
      h2: `Comment est réellement fixé un prix à ${zone}`,
      h3: [
        "Les critères qui font varier le prix",
        "Prix affiché vs prix signé",
        "Le poids du DPE en 2026",
      ],
    },
    {
      h2: `${req.goal === "leads_acheteurs" ? "Bien acheter" : "Bien vendre"} à ${zone} : la méthode`,
      h3: [
        "Les 3 erreurs les plus fréquentes",
        "Le bon timing",
        "Se faire accompagner par un expert local",
      ],
    },
  ];

  const intro =
    `Vous vous intéressez à ${topic.toLowerCase()} à ${zone} ? Vous êtes au bon endroit. ` +
    `Dans ce guide, on va au-delà des moyennes affichées sur les portails : ` +
    `on regarde les prix réels au m² (données DVF et notaires), les tendances récentes ` +
    `et les leviers concrets pour ${GOAL_LABEL[req.goal]}. Objectif : que vous preniez ` +
    `votre décision avec des chiffres fiables, pas des impressions.`;

  const body = outline
    .map((section) => {
      const paras = section.h3
        .map((h3) => {
          const v = pick(VALUE_POINTS, seed + h3.length);
          return (
            `### ${h3}\n\n` +
            `${cap(v)}. À ${zone}, ce point est souvent sous-estimé. ` +
            `Un professionnel qui s'appuie sur des données actualisées vous évite ` +
            `les erreurs coûteuses et vous fait gagner un temps précieux.`
          );
        })
        .join("\n\n");
      return `## ${section.h2}\n\n${paras}`;
    })
    .join("\n\n");

  const faq = [
    {
      q: `Quel est le prix au m² à ${zone} en 2026 ?`,
      a: `Le prix dépend fortement du quartier, de l'étage, de l'état et du DPE. Une estimation personnalisée basée sur les ventes réelles (DVF) est bien plus fiable qu'une moyenne. Demandez la vôtre gratuitement.`,
    },
    {
      q: `Combien de temps pour vendre à ${zone} ?`,
      a: `Un bien correctement estimé et bien présenté se vend nettement plus vite. Le délai varie selon le type de bien et le quartier, mais un prix juste dès le départ est le facteur numéro un.`,
    },
    {
      q: `Faut-il faire estimer son bien par un professionnel ?`,
      a: `Oui. Les estimateurs automatiques ignorent des dizaines de critères locaux. Un expert local croise la data et le terrain pour un prix réaliste et défendable.`,
    },
  ];

  const wordCount = (intro + body + faq.map((f) => f.q + f.a).join(" ")).split(
    /\s+/,
  ).length;

  return {
    metaTitle: metaTitle.slice(0, 65),
    metaDescription: metaDescription.slice(0, 158),
    slug: slugify(`${topic}-${zone}-2026`),
    targetKeywords: kw,
    outline,
    intro,
    body,
    faq,
    internalLinks: [
      "/experts (annuaire des experts certifiés)",
      "Page « Estimation gratuite » (formulaire de capture de leads)",
      "Article : « Prix au m² quartier par quartier »",
    ],
    wordCount,
  };
}

function buildCalendar(req: ContentRequest, seed: number): CalendarEntry[] {
  const zone = req.city?.trim() || "votre secteur";
  const days = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  const plan: Omit<CalendarEntry, "day">[] = [
    {
      platform: "linkedin",
      format: "Post analyse",
      idea: `Décryptage : l'évolution des prix à ${zone} sur 12 mois (avec un chiffre fort).`,
    },
    {
      platform: "instagram",
      format: "Carrousel",
      idea: `« 3 erreurs qui font perdre de l'argent à ${zone} » (1 erreur par slide).`,
    },
    {
      platform: "facebook",
      format: "Post local",
      idea: `Focus quartier : pourquoi ce secteur de ${zone} attire autant en ce moment.`,
    },
    {
      platform: "instagram",
      format: "Reel",
      idea: `Visite express d'un bien type + estimation « à la volée » face caméra.`,
    },
    {
      platform: "linkedin",
      format: "Post témoignage",
      idea: `Étude de cas : un bien vendu au bon prix grâce à la data (avant/après).`,
    },
    {
      platform: "instagram",
      format: "Story Q&A",
      idea: `Sticker questions : « Posez-moi vos questions immo sur ${zone} ».`,
    },
    {
      platform: "seo",
      format: "Article de blog",
      idea: `Publier le guide SEO « ${req.topic} à ${zone} » et le relayer partout.`,
    },
  ];
  return plan.map((p, i) => ({ day: days[i], ...p }));
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// ── Point d'entrée local ───────────────────────────────────────────────────
export function generateLocal(req: ContentRequest): GeneratedContent {
  const seed = seedFrom(`${req.topic}|${req.city ?? ""}|${req.goal}|${req.tone}`);
  const socialPlatforms = req.platforms.filter((p) => p !== "seo");
  const posts = socialPlatforms.map((p, i) => buildSocialPost(req, p, seed + i * 7));
  const seo = req.platforms.includes("seo")
    ? buildSeoArticle(req, seed)
    : undefined;
  return {
    topic: req.topic,
    city: req.city,
    goal: req.goal,
    tone: req.tone,
    posts,
    seo,
    calendar: buildCalendar(req, seed),
    engine: "local",
  };
}

/**
 * Amélioration facultative par LLM. Si OPENAI_API_KEY est absent ou l'appel
 * échoue, on renvoie silencieusement le contenu local (toujours fonctionnel).
 */
export async function enhanceWithLLM(
  req: ContentRequest,
  base: GeneratedContent,
): Promise<GeneratedContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return base;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const zone = req.city?.trim() || "votre secteur";

  const prompt = [
    `Tu es le responsable social media & SEO d'un expert immobilier à ${zone}.`,
    `Objectif : ${GOAL_LABEL[req.goal]}.`,
    `Sujet : "${req.topic}". Ton : ${req.tone}.`,
    `Réécris et améliore le JSON de contenu ci-dessous pour qu'il soit percutant,`,
    `crédible, sans superlatifs creux, orienté conversion, en français.`,
    `Garde EXACTEMENT la même structure JSON (mêmes clés). Ne renvoie que du JSON valide.`,
    ``,
    JSON.stringify({ posts: base.posts, seo: base.seo }),
  ].join("\n");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Tu renvoies uniquement du JSON valide." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return base;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return base;
    const parsed = JSON.parse(content);
    return {
      ...base,
      posts: Array.isArray(parsed.posts) ? parsed.posts : base.posts,
      seo: parsed.seo ?? base.seo,
      engine: "openai",
    };
  } catch {
    return base;
  }
}

export { GENERATION_META } from "./meta";
