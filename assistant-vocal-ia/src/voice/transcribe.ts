import { nodewhisper } from "nodejs-whisper";

/**
 * Transcrit un fichier WAV en texte via Whisper, execute 100% en local
 * (whisper.cpp) - aucun audio n'est envoye a un service tiers. Le modele
 * (par defaut "base") est telecharge automatiquement au premier lancement.
 */
export async function transcribeAudio(filePath: string): Promise<string> {
  const transcript = await nodewhisper(filePath, {
    modelName: "base",
    autoDownloadModelName: "base",
    removeWavFileAfterTranscription: true,
    whisperOptions: {
      outputInText: true,
      language: "fr",
    },
  });

  return transcript.trim();
}
