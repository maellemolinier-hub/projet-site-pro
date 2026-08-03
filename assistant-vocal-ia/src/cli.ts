import "dotenv/config";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { runCommand } from "./core/router.js";

async function main() {
  console.log("Assistant vocal IA - prototype (texte pour l'instant, pas encore de micro).");
  console.log("Tape une commande (ex: \"range mes photos dans /Users/moi/Photos\"), ou \"exit\" pour quitter.\n");

  const rl = readline.createInterface({ input: stdin, output: stdout });

  while (true) {
    const command = await rl.question("> ");
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

main();
