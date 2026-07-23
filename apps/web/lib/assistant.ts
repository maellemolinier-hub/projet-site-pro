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

/**
 * Diagnostic hors-ligne (sans clé LLM) : Capia reste utile en mode démo.
 * Elle repère des mots-clés dans le dernier message et recommande des offres.
 */
export function dryRunDiagnose(messages: ChatMessage[]): AssistantReply {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const text = lastUser.toLowerCase();

  if (!text.trim() || messages.filter((m) => m.role === "user").length === 0) {
    return {
      reply:
        `Bonjour, je suis ${ASSISTANT_NAME}, l'assistante IA de CAP Entreprendre France. ` +
        "Dites-moi votre métier et le principal problème que vous rencontrez, et je vous oriente vers la bonne solution.",
      offers: [],
    };
  }

  const scored = OFFERS.map((offer) => {
    let score = 0;
    for (const keyword of offer.solves) {
      const words = keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      for (const w of words) if (text.includes(w)) score += 1;
    }
    for (const w of ["site", "web", "vocal", "appel", "seo", "réseau", "visuel", "vidéo", "client", "prospection", "automat", "formation", "ia", "assistant"]) {
      if (text.includes(w) && (offer.name.toLowerCase().includes(w) || offer.tagline.toLowerCase().includes(w))) score += 1;
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
