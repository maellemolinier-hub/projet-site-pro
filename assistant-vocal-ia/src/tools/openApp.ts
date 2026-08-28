import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Lance un logiciel installe sur la machine par son nom.
 * macOS: `open -a`, Windows: `start`, Linux: `xdg-open` / nom de binaire direct.
 */
export async function openApplication(appName: string): Promise<string> {
  const platform = process.platform;

  if (platform === "darwin") {
    await execFileAsync("open", ["-a", appName]);
    return `${appName} lance (macOS).`;
  }

  if (platform === "win32") {
    // `start` est une commande interne du shell, pas un executable.
    await execFileAsync("cmd", ["/c", "start", "", appName]);
    return `${appName} lance (Windows).`;
  }

  // Linux: on tente de lancer le binaire directement.
  await execFileAsync(appName, []);
  return `${appName} lance (Linux).`;
}
