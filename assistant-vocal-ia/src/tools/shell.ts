import { exec } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";

const execAsync = promisify(exec);
const MAX_OUTPUT_LENGTH = 4000;
const TIMEOUT_MS = 30_000;

export interface ShellResult {
  stdout: string;
  stderr: string;
  truncated: boolean;
}

function buildResult(stdout: string, stderr: string): ShellResult {
  const truncated = stdout.length > MAX_OUTPUT_LENGTH || stderr.length > MAX_OUTPUT_LENGTH;
  return {
    stdout: stdout.slice(0, MAX_OUTPUT_LENGTH),
    stderr: stderr.slice(0, MAX_OUTPUT_LENGTH),
    truncated,
  };
}

/**
 * Execute une commande shell dans le dossier utilisateur.
 *
 * ATTENTION : aucune sandbox - la commande tourne avec les memes droits que
 * le compte utilisateur qui a lance Serv'IA. Le seul filet de securite est
 * le controle "commande destructrice" fait par l'appelant (voir router.ts /
 * destructiveCommand.ts) avant d'appeler cette fonction.
 */
export async function runShellCommand(command: string): Promise<ShellResult> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: os.homedir(),
      timeout: TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
    });
    return buildResult(stdout, stderr);
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; message?: string };
    return buildResult(execError.stdout ?? "", execError.stderr ?? execError.message ?? "Erreur inconnue.");
  }
}
