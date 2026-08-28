import { GoogleGenAI, createPartFromUri } from "@google/genai";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import os from "node:os";

const DEFAULT_MODEL = "gemini-2.5-flash";
// Veo 3.1 en preview payante au moment de l'ecriture (voir README > Cout).
// Le nom exact du modele evolue avec le temps chez Google - remplacable via
// GEMINI_VIDEO_MODEL sans toucher au code.
const DEFAULT_VIDEO_MODEL = "veo-3.1-generate-preview";
const FILE_READY_TIMEOUT_MS = 60_000;
const VIDEO_TIMEOUT_MS = 5 * 60_000;
const VIDEO_POLL_INTERVAL_MS = 10_000;
const DEFAULT_VIDEO_DIR = path.join(os.homedir(), "Serv'IA-videos");

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

/**
 * Genere une video a partir d'un texte via Veo (Google) et la telecharge
 * localement. PAYANT (facture a la seconde de video generee cote Google) -
 * voir README > Connecteurs IA > Cout avant utilisation. L'appelant est
 * responsable de verifier une confirmation explicite avant d'appeler cette
 * fonction (voir router.ts).
 */
export async function generateVideo(
  prompt: string,
  outputPath?: string,
): Promise<string> {
  const ai = getClient();
  const model = process.env.GEMINI_VIDEO_MODEL || DEFAULT_VIDEO_MODEL;

  let operation = await ai.models.generateVideos({ model, prompt });

  const start = Date.now();
  while (!operation.done) {
    if (Date.now() - start > VIDEO_TIMEOUT_MS) {
      throw new Error("Delai depasse en attendant la generation de la video.");
    }
    await new Promise((resolve) => setTimeout(resolve, VIDEO_POLL_INTERVAL_MS));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  if (operation.error) {
    throw new Error(`Generation video echouee : ${JSON.stringify(operation.error)}`);
  }

  const generatedVideo = operation.response?.generatedVideos?.[0];
  if (!generatedVideo) {
    throw new Error(
      "Aucune video generee - possiblement filtree par les regles de contenu de Google.",
    );
  }

  const destination = outputPath ?? path.join(DEFAULT_VIDEO_DIR, `${Date.now()}.mp4`);
  await mkdir(path.dirname(destination), { recursive: true });
  await ai.files.download({ file: generatedVideo, downloadPath: destination });

  return destination;
}
