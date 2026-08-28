import { recordUntil } from "./record.js";
import { transcribeAudio } from "./transcribe.js";
import { containsWakeWord } from "./wakeWordUtils.js";

const IDLE_WINDOW_MS = 4000;
const COMMAND_WINDOW_MS = 10_000;

async function recordFixedWindow(durationMs: number): Promise<string> {
  const stopSignal = new Promise<void>((resolve) => setTimeout(resolve, durationMs));
  const filePath = await recordUntil(stopSignal);
  return transcribeAudio(filePath);
}

/**
 * Ecoute en continu par fenetres de IDLE_WINDOW_MS et transcrit chaque
 * fenetre localement (Whisper) pour detecter "Hey Serv'IA".
 *
 * Ce n'est PAS un vrai moteur de mot-cle (type Porcupine/openWakeWord) :
 * c'est une transcription Whisper repetee toutes les IDLE_WINDOW_MS, donc
 * ca consomme du CPU en continu (micro + inference en boucle) et peut
 * manquer le declencheur selon la qualite de la capture. Suffisant pour un
 * prototype ; a remplacer par un moteur dedie si l'usage reel le justifie
 * (voir README > Mode reveil "Hey Serv'IA").
 */
export async function waitForWakeWord(): Promise<void> {
  for (;;) {
    const transcript = await recordFixedWindow(IDLE_WINDOW_MS);
    if (containsWakeWord(transcript)) return;
  }
}

/**
 * Enregistre la commande prononcee juste apres le mot-cle (fenetre fixe,
 * pas de detection de silence - voir limite ci-dessus).
 */
export async function captureCommandAfterWake(): Promise<string> {
  return recordFixedWindow(COMMAND_WINDOW_MS);
}
