import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import recorder from "node-record-lpcm16";

const VOICE_TMP_DIR = path.resolve(".voice-tmp");

/**
 * Enregistre depuis le micro jusqu'a ce que `stopSignal` se resolve, puis
 * ecrit un fichier WAV et renvoie son chemin. Necessite SoX (ou rec/arecord)
 * installe et disponible dans le PATH - voir README.
 */
export async function recordUntil(stopSignal: Promise<void>): Promise<string> {
  await mkdir(VOICE_TMP_DIR, { recursive: true });
  const filePath = path.join(VOICE_TMP_DIR, `commande-${Date.now()}.wav`);
  const fileStream = createWriteStream(filePath, { encoding: "binary" });

  const recording = recorder.record({
    sampleRate: 16000,
    channels: 1,
    recorder: "sox",
  });

  recording.stream().pipe(fileStream);

  await stopSignal;
  recording.stop();

  // Laisse le temps au flux de finir d'ecrire sur disque.
  await new Promise<void>((resolve) => fileStream.end(resolve));

  return filePath;
}
