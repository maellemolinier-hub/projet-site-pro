import { chromium } from "playwright";
import { getStoredCredential } from "./bitwarden.js";

const USER_DATA_DIR = ".browser-profile";

/**
 * Ouvre le site dans un profil Chromium persistant et tente de remplir
 * les champs identifiant/mot de passe a partir d'un identifiant deja
 * recupere via fetchCredential. Le mot de passe transite uniquement entre
 * ce fichier et le navigateur - jamais dans le contexte envoye au modele.
 */
export async function loginToSite(
  siteName: string,
  url: string,
): Promise<string> {
  const credential = getStoredCredential(siteName);
  if (!credential) {
    return `Aucun identifiant en memoire pour "${siteName}". Appelle d'abord fetch_credential.`;
  }

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  try {
    if (credential.username) {
      const userField = page
        .locator('input[type="email"], input[type="text"][name*="user" i], input[autocomplete="username"]')
        .first();
      await userField.fill(credential.username, { timeout: 5000 });
    }

    const passField = page.locator('input[type="password"]').first();
    await passField.fill(credential.password, { timeout: 5000 });

    return `Champs remplis sur ${url}. Verifie et valide manuellement la connexion (formulaires varient selon les sites).`;
  } catch {
    return `Site ouvert sur ${url}, mais les champs de connexion n'ont pas pu etre detectes automatiquement. Connexion manuelle necessaire.`;
  }
}
