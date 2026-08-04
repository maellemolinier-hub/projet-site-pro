import "dotenv/config";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { runCommand } from "./core/router.js";
import { recordUntil } from "./voice/record.js";
import { transcribeAudio } from "./voice/transcribe.js";

const voiceMode = process.argv.includes("--voice");

async function main() {
  console.log(
    voiceMode
      ? "Serv'IA - prototype (mode vocal, push-to-talk)."
      : "Serv'IA - prototype (mode texte).",
  );
  console.log(
    voiceMode
      ? "Appuie sur Entree pour commencer a parler, puis Entree a nouveau pour arreter. \"exit\" + Entree pour quitter.\n"
      : "Tape une commande (ex: \"range mes photos dans /Users/moi/Photos\"), ou \"exit\" pour quitter.\n",
  );

  const rl = readline.createInterface({ input: stdin, output: stdout });

  while (true) {
    const command = voiceMode ? await captureVoiceCommand(rl) : await rl.question("> ");
    if (command === null) continue;
    if (command.trim().toLowerCase() === "exit") break;
    if (!command.trim()) continue;

    try {
      const response = await runCommand(command);
      console.log(response, "\n");
    } catch (error) {
      console.error("Erreur:", error instanceof Error ? error.message : error, "\n");
    }
  }

  rl.close();
}

/**
 * Enregistre depuis le micro entre deux appuis sur Entree, transcrit avec
 * Whisper (local), puis renvoie le texte. Renvoie null si l'utilisateur a
 * tape "exit" a la place d'appuyer sur Entree.
 */
async function captureVoiceCommand(
  rl: readline.Interface,
): Promise<string | null> {
  const start = await rl.question("Appuie sur Entree pour parler... ");
  if (start.trim().toLowerCase() === "exit") return "exit";

  console.log("Enregistrement... (Entree pour arreter)");
  let resolveStop: () => void;
  const stopSignal = new Promise<void>((resolve) => {
    resolveStop = resolve;
  });

  const recordingPromise = recordUntil(stopSignal);
  await rl.question("");
  resolveStop!();

  const filePath = await recordingPromise;
  console.log("Transcription en cours...");
  const text = await transcribeAudio(filePath);
  console.log(`Commande comprise : "${text}"`);
  return text;
}

main();
