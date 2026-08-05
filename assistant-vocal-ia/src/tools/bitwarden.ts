import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

interface BitwardenItem {
  login?: {
    username?: string;
    password?: string;
  };
}

/**
 * Stockage local des identifiants recuperes durant la session en cours.
 * Le mot de passe n'est JAMAIS renvoye au modele (voir fetchCredential) -
 * seule cette fonction (cote hote) et loginToSite y ont acces.
 */
const credentialStore = new Map<string, { username?: string; password: string }>();

/**
 * Recupere un identifiant depuis Bitwarden via la CLI `bw` et le garde
 * cote hote uniquement. Necessite BW_SESSION dans l'environnement
 * (obtenu via `bw unlock --raw`).
 */
export async function fetchCredential(
  siteName: string,
): Promise<{ found: boolean; username?: string }> {
  const session = process.env.BW_SESSION;
  if (!session) {
    throw new Error(
      "BW_SESSION absent. Lance `bw unlock --raw` et mets le resultat dans .env.",
    );
  }

  const { stdout } = await execFileAsync("bw", [
    "get",
    "item",
    siteName,
    "--session",
    session,
  ]);

  const item = JSON.parse(stdout) as BitwardenItem;
  if (!item.login?.password) {
    return { found: false };
  }

  credentialStore.set(siteName, {
    username: item.login.username,
    password: item.login.password,
  });

  return { found: true, username: item.login.username };
}

export function getStoredCredential(siteName: string) {
  return credentialStore.get(siteName);
}
