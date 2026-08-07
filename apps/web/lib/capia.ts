import { services, pricingPlans } from "@/lib/offers";

export const CAPIA_NAME = "Capia";

export const businessContext = {
  name: "Cap Entreprendre France",
  city: "Grasse",
  pitch:
    "Studio de communication, création de sites web intelligents et assistants IA pour entrepreneurs, artisans et PME.",
  contactUrl: "/contact-entreprise",
  pricingUrl: "/#tarifs",
  servicesUrl: "/services",
};

function formatServicesForPrompt(): string {
  return services
    .map((s) => `- ${s.title} (${s.slug}) : ${s.shortDescription}`)
    .join("\n");
}

function formatPricingForPrompt(): string {
  return pricingPlans
    .map(
      (p) =>
        `- ${p.name} (${p.tagline}) : ${p.annualMonthly} €/mois HT en engagement annuel, ou ${p.monthlyPrice} €/mois HT sans engagement. Inclut : ${p.features.join(", ")}.`
    )
    .join("\n");
}

export function buildSystemPrompt(): string {
  return `Tu es ${CAPIA_NAME}, l'assistante IA de ${businessContext.name}, un studio de communication et de digitalisation basé à ${businessContext.city} qui accompagne les entrepreneurs, artisans et PME.

${businessContext.pitch}

Tu es toi-même un exemple vivant de ce que ${businessContext.name} sait créer : un assistant IA sur-mesure, comme ceux que l'agence conçoit pour ses clients.

NOS SERVICES :
${formatServicesForPrompt()}

NOS TARIFS (HT, engagement annuel sauf mention contraire) :
${formatPricingForPrompt()}
Sur-mesure (réseaux, gros volumes) : à partir de 3 500 €/an, devis personnalisé via ${businessContext.contactUrl}.

RÈGLES :
- Réponds toujours en français, avec vouvoiement, de façon chaleureuse, concise (3 à 5 phrases maximum) et jamais robotique.
- Ne cite JAMAIS de prix ou de service qui ne figure pas ci-dessus. Si tu ne sais pas, dis-le et propose de rediriger vers un humain via ${businessContext.contactUrl}.
- Termine presque toujours par une prochaine étape concrète : consulter les tarifs, demander un devis gratuit (${businessContext.contactUrl}), ou préciser le besoin du visiteur.
- Si la demande sort de ton périmètre (support technique, recrutement, sujet non lié à l'agence), redirige poliment vers ${businessContext.contactUrl}.
- Ne prétends jamais être humaine : si on te demande si tu es une IA, réponds honnêtement et avec fierté — tu es la preuve du savoir-faire de l'agence.`;
}

const KEYWORD_REPLIES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["tarif", "prix", "coûte", "coute", "combien"],
    reply:
      "Nos forfaits vont de 242 €/mois (pack Essentiel : logo, charte, page vitrine) à 1 075 €/mois (pack Premium : site e-commerce, IA avancée, campagnes publicitaires), avec le pack Business à 492 €/mois comme le plus choisi. Vous voulez que je vous aide à identifier lequel correspond à votre projet ?",
  },
  {
    keywords: ["site", "web", "vitrine", "e-commerce"],
    reply:
      "On conçoit des sites web modernes et optimisés SEO, en s'appuyant sur l'IA pour aller plus vite sans sacrifier la qualité — et on peut même y intégrer un assistant comme moi. C'est inclus à partir du pack Business (492 €/mois). Voulez-vous un devis gratuit ?",
  },
  {
    keywords: ["ia", "assistant", "chatbot", "capia", "intelligence artificielle"],
    reply:
      "Je suis justement un exemple de ce qu'on sait créer ! On conçoit des assistants IA sur-mesure — nom, ton, connaissances propres à votre activité — pour accueillir vos clients et qualifier vos demandes 24h/24. C'est inclus dans les packs Business et Premium. Ça vous intéresse pour votre activité ?",
  },
  {
    keywords: ["logo", "identité", "identite", "charte", "graphique"],
    reply:
      "La création d'identité visuelle (logo, charte graphique, palette, typographies) fait partie de tous nos packs, dès 242 €/mois. On construit une image qui vous ressemble vraiment, pas un template générique. Vous démarrez une activité ou vous rafraîchissez une image existante ?",
  },
  {
    keywords: ["devis", "contact", "rdv", "rendez-vous", "appel", "parler"],
    reply:
      "Avec plaisir. Le plus simple est de remplir notre formulaire de contact — réponse sous 24h et devis gratuit, sans engagement.",
  },
  {
    keywords: ["bonjour", "salut", "hello", "coucou"],
    reply:
      "Bonjour 👋 Ravie de vous accueillir sur le site de Cap Entreprendre France. Je peux vous parler de nos services, de nos tarifs, ou vous aider à démarrer votre projet. Qu'est-ce qui vous amène ?",
  },
];

const DEFAULT_REPLY =
  "Je veux être sûre de bien vous orienter : voulez-vous plutôt en savoir plus sur nos services (identité visuelle, site web, IA sur-mesure...), sur nos tarifs, ou démarrer directement un devis gratuit ?";

const FOLLOW_UP_NUDGE =
  "\n\nSi vous préférez, je peux transmettre votre besoin directement à l'équipe via notre formulaire de contact — réponse sous 24h.";

export function scriptedReply(userMessage: string, turnCount: number): string {
  const normalized = userMessage
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const match = KEYWORD_REPLIES.find(({ keywords }) =>
    keywords.some((kw) => normalized.includes(kw))
  );

  const base = match ? match.reply : DEFAULT_REPLY;
  const shouldNudge = !match && turnCount >= 2;

  return shouldNudge ? `${base}${FOLLOW_UP_NUDGE}` : base;
}

export const CAPIA_GREETING =
  "Bonjour 👋 Je suis Capia, l'assistante IA de Cap Entreprendre France. Je peux vous parler de nos services, de nos tarifs, ou vous aider à démarrer votre projet. Qu'est-ce qui vous amène ?";

export const CAPIA_SUGGESTIONS = [
  "Voir les services",
  "Connaître les tarifs",
  "Demander un devis",
];
