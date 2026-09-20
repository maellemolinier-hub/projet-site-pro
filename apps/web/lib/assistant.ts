import { OFFERS, offerById, type Offer } from "./offers";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantReply {
  reply: string;
  offers: Offer[];
}

export const ASSISTANT_NAME = "Capia";

/** Prompt système de Capia, l'assistante IA (mi-femme, mi-robot) de CAP Entreprendre France. */
export function buildSystemPrompt(): string {
  const catalog = OFFERS.map(
    (o) =>
      `- [${o.id}] ${o.name} — ${o.tagline} (résout : ${o.solves.join(", ")}${
        o.priceHint ? ` ; prix : ${o.priceHint}` : ""
      })`,
  ).join("\n");

  return [
    `Tu es ${ASSISTANT_NAME}, l'assistante IA de CAP Entreprendre France — mi-femme, mi-robot :`,
    "chaleureuse et humaine dans le ton, précise et efficace comme une IA.",
    "Ta mission : diagnostiquer le problème de l'entreprise qui te parle, puis lui recommander",
    "la ou les meilleures offres de CAP Entreprendre France pour le résoudre.",
    "",
    "Déroulé de la conversation :",
    "1. Accueille brièvement et demande le métier/secteur et le principal problème (1 question à la fois).",
    "2. Pose au maximum 2 à 3 questions ciblées pour bien cerner le besoin.",
    "3. Dès que c'est clair, fais un mini-diagnostic (2-3 phrases) puis recommande 1 à 3 offres,",
    "   en expliquant en quoi elles répondent au problème.",
    "4. Termine par un appel à l'action : proposer un rendez-vous / une prise de contact.",
    "",
    "Règles :",
    "- Réponds toujours en français, ton professionnel, bienveillant, concret. Messages courts.",
    "- Ne promets jamais de résultats chiffrés irréalistes.",
    "- Ne recommande que des offres du catalogue ci-dessous.",
    "- Quand tu recommandes des offres, termine ton message par une ligne technique EXACTE :",
    "  [[OFFRES: id1,id2]] (les identifiants entre crochets du catalogue). Sinon [[OFFRES: ]].",
    "  Cette ligne est masquée à l'utilisateur, ne la commente pas.",
    "",
    "Catalogue des offres :",
    catalog,
  ].join("\n");
}

/** Extrait la ligne technique [[OFFRES: ...]] et renvoie le texte nettoyé + les offres. */
export function parseReply(text: string): AssistantReply {
  const match = text.match(/\[\[OFFRES:\s*([^\]]*)\]\]/i);
  const ids = match
    ? match[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const reply = text.replace(/\[\[OFFRES:[^\]]*\]\]/i, "").trim();
  const offers = ids.map((id) => offerById(id)).filter((o): o is Offer => Boolean(o));
  return { reply, offers };
}

/** Minuscules + suppression des accents, pour une correspondance robuste. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Mots-clés déclencheurs par offre (sans accents), pour le diagnostic hors-ligne. */
const OFFER_TRIGGERS: Record<string, string[]> = {
  "site-web": ["site", "web", "internet", "vitrine", "boutique", "e-commerce", "ecommerce", "application", "app", "vendre en ligne"],
  "assistant-ia": ["chatbot", "assistant", "repondre", "faq", "questions", "24/7", "chat"],
  "assistant-vocal": ["appel", "appels", "telephone", "standard", "vocal", "voix", "rendez-vous", "rdv", "secretariat", "accueil telephonique"],
  "seo-social": ["seo", "google", "referencement", "visibilite", "reseaux", "instagram", "tiktok", "linkedin", "facebook", "abonnes", "vues", "communaute", "contenu", "post"],
  visuels: ["visuel", "photo", "image", "video", "montage", "pub", "publicite", "logo", "branding", "design", "affiche"],
  prospection: ["prospection", "prospect", "leads", "clients", "acquisition", "b2b", "demarchage", "crm", "hubspot"],
  relance: ["relance", "fidelisation", "avis", "paiement", "facture", "devis", "suivi", "retour client"],
  automatisation: ["automatisation", "automatiser", "make", "zapier", "tache", "repetitif", "excel", "sheets", "process"],
  "formation-metier": ["formation", "former", "apprendre", "monter en competence", "equipe", "coacher"],
};

/**
 * Diagnostic hors-ligne (sans clé LLM) : Capia reste utile en mode démo.
 * Elle repère des mots-clés dans le dernier message et recommande des offres.
 */
export function dryRunDiagnose(messages: ChatMessage[]): AssistantReply {
  const userTurns = messages.filter((m) => m.role === "user");
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const text = lastUser.toLowerCase();

  if (!text.trim() || userTurns.length === 0) {
    return {
      reply:
        `Bonjour, je suis ${ASSISTANT_NAME}, l'assistante IA de CAP Entreprendre France. ` +
        "Dites-moi votre métier et le principal problème que vous rencontrez, et je vous oriente vers la bonne solution.",
      offers: [],
    };
  }

  // Premier message trop vague : on pose une question de qualification avant de recommander.
  const wordCount = text.trim().split(/\s+/).length;
  if (userTurns.length === 1 && wordCount < 6) {
    return {
      reply:
        "Merci ! Pour bien vous orienter, dites-m'en un peu plus : quel est votre métier, et " +
        "qu'est-ce qui vous pose le plus problème aujourd'hui (visibilité, manque de clients, " +
        "temps perdu, image, appels manqués…) ?",
      offers: [],
    };
  }

  const norm = normalize(text);
  const scored = OFFERS.map((offer) => {
    let score = 0;
    for (const trigger of OFFER_TRIGGERS[offer.id] ?? []) {
      if (norm.includes(trigger)) score += 1;
    }
    for (const keyword of offer.solves) {
      for (const w of normalize(keyword).split(/\s+/).filter((x) => x.length > 4)) {
        if (norm.includes(w)) score += 1;
      }
    }
    return { offer, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.offer);

  const recommended = scored.length > 0 ? scored : OFFERS.slice(0, 2);

  const reply =
    "Merci, je comprends votre situation. Voici ce que je vous recommande pour avancer concrètement. " +
    "Souhaitez-vous que l'on en discute lors d'un court rendez-vous ?";

  return { reply, offers: recommended };
}
