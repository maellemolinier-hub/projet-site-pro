import { GoogleGenAI, createPartFromUri } from "@google/genai";

const DEFAULT_MODEL = "gemini-2.5-flash";
const FILE_READY_TIMEOUT_MS = 60_000;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY manquant dans .env (voir README > Connecteur Gemini).",
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Attend qu'un fichier uploade soit pret cote Gemini. Les videos en
 * particulier passent par un etat PROCESSING avant de devenir utilisables
 * dans un prompt (contrairement aux images/textes, traites immediatement).
 */
async function waitForFileActive(
  ai: GoogleGenAI,
  name: string,
): Promise<void> {
  const start = Date.now();

  for (;;) {
    const file = await ai.files.get({ name });

    if (file.state === "ACTIVE") return;
    if (file.state === "FAILED") {
      throw new Error("Le traitement du fichier par Gemini a echoue.");
    }
    if (Date.now() - start > FILE_READY_TIMEOUT_MS) {
      throw new Error("Delai depasse en attendant que Gemini traite le fichier.");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

/**
 * Envoie une question a Gemini (Google), avec eventuellement un fichier
 * local a analyser (video, image, audio, document...). Le type MIME est
 * deduit automatiquement de l'extension du fichier par l'API Gemini.
 */
export async function askGemini(
  prompt: string,
  filePath?: string,
): Promise<string> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!filePath) {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text ?? "(pas de reponse de Gemini)";
  }

  const uploaded = await ai.files.upload({ file: filePath });
  if (!uploaded.name || !uploaded.uri || !uploaded.mimeType) {
    throw new Error("Echec de l'upload du fichier vers Gemini.");
  }

  await waitForFileActive(ai, uploaded.name);

  const response = await ai.models.generateContent({
    model,
    contents: [createPartFromUri(uploaded.uri, uploaded.mimeType), prompt],
  });

  return response.text ?? "(pas de reponse de Gemini)";
}
