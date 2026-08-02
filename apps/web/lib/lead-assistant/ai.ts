const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

async function callClaude(system: string, userMessage: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquant");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.content?.find((b: { type: string }) => b.type === "text")?.text;
  if (!text) throw new Error("Réponse Anthropic vide");
  return text;
}

export interface IntentScoreResult {
  score: number;
  summary: string;
  contactName: string | null;
}

/**
 * Qualifie une conversation entrante : probabilité (0-1) qu'il s'agisse d'un
 * prospect intéressé par l'offre du professionnel, avec un résumé court.
 */
export async function scoreIntent(
  businessDescription: string,
  transcript: string
): Promise<IntentScoreResult> {
  const system = `Tu es un assistant commercial qui qualifie des conversations entrantes pour un professionnel.
Activité du professionnel : ${businessDescription || "non précisée"}.
Analyse la conversation fournie et réponds UNIQUEMENT avec un objet JSON de la forme
{"score": <nombre entre 0 et 1>, "summary": "<résumé en une phrase>", "contact_name": "<prénom/nom si mentionné, sinon null>"}.
score proche de 1 = intention d'achat claire et immédiate, proche de 0 = pas un prospect (spam, question hors sujet, simple bonjour).`;

  const raw = await callClaude(system, transcript, 400);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Impossible de parser la réponse de qualification");

  const parsed = JSON.parse(jsonMatch[0]);
  const score = Math.max(0, Math.min(1, Number(parsed.score) || 0));

  return {
    score,
    summary: String(parsed.summary || "").slice(0, 500),
    contactName: parsed.contact_name ? String(parsed.contact_name).slice(0, 120) : null,
  };
}

/**
 * Rédige une proposition commerciale personnalisée à envoyer au prospect,
 * en l'invitant à prendre rendez-vous si un lien de réservation est fourni.
 */
export async function draftProposal(
  businessDescription: string,
  transcript: string,
  bookingLink: string | null
): Promise<string> {
  const system = `Tu rédiges, au nom d'un professionnel, une réponse commerciale courte et chaleureuse à un prospect qui vient d'échanger avec lui.
Activité du professionnel : ${businessDescription || "non précisée"}.
Contraintes :
- Français, ton professionnel mais direct, pas de formules creuses.
- 80 à 130 mots maximum.
- Reformule la demande du prospect pour montrer que tu as compris son besoin, puis propose une offre adaptée.
${bookingLink ? `- Termine par une invitation claire à réserver un créneau via ce lien : ${bookingLink}` : "- Termine en demandant ses disponibilités pour un échange rapide."}
- Réponds uniquement avec le texte du message, sans guillemets ni préambule.`;

  const draft = await callClaude(system, transcript, 500);
  return draft.trim();
}
