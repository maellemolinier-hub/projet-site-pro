import { promises as fs } from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".gif",
  ".webp",
  ".raw",
  ".cr2",
  ".dng",
]);

export interface OrganizeResult {
  scanned: number;
  moved: number;
  skipped: number;
  createdFolders: string[];
}

/**
 * Range les images d'un dossier dans des sous-dossiers AAAA-MM
 * bases sur la date de derniere modification du fichier.
 */
export async function organizePhotosByDate(
  targetDir: string,
): Promise<OrganizeResult> {
  const resolved = path.resolve(targetDir);
  const entries = await fs.readdir(resolved, { withFileTypes: true });

  const result: OrganizeResult = {
    scanned: 0,
    moved: 0,
    skipped: 0,
    createdFolders: [],
  };
  const createdFolders = new Set<string>();

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    result.scanned += 1;
    const fullPath = path.join(resolved, entry.name);
    const stat = await fs.stat(fullPath);
    const yearMonth = `${stat.mtime.getFullYear()}-${String(
      stat.mtime.getMonth() + 1,
    ).padStart(2, "0")}`;

    const destDir = path.join(resolved, yearMonth);
    if (!createdFolders.has(destDir)) {
      await fs.mkdir(destDir, { recursive: true });
      createdFolders.add(destDir);
      result.createdFolders.push(yearMonth);
    }

    const destPath = path.join(destDir, entry.name);
    try {
      await fs.rename(fullPath, destPath);
      result.moved += 1;
    } catch {
      result.skipped += 1;
    }
  }

  return result;
}
