import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readdir, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { organizePhotosByDate } from "./organizeFiles.js";

test("organizePhotosByDate range les images par mois et ignore le reste", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "organize-photos-"));

  try {
    await writeFile(path.join(dir, "vacances.jpg"), "fake-jpg");
    await writeFile(path.join(dir, "portrait.PNG"), "fake-png");
    await writeFile(path.join(dir, "notes.txt"), "pas une photo");

    const oldDate = new Date("2023-03-15T10:00:00Z");
    const recentDate = new Date("2024-11-02T10:00:00Z");
    await utimes(path.join(dir, "vacances.jpg"), oldDate, oldDate);
    await utimes(path.join(dir, "portrait.PNG"), recentDate, recentDate);

    const result = await organizePhotosByDate(dir);

    assert.equal(result.scanned, 2, "seules les 2 images doivent etre comptees");
    assert.equal(result.moved, 2);
    assert.deepEqual(new Set(result.createdFolders), new Set(["2023-03", "2024-11"]));

    const marchFiles = await readdir(path.join(dir, "2023-03"));
    const novFiles = await readdir(path.join(dir, "2024-11"));
    assert.deepEqual(marchFiles, ["vacances.jpg"]);
    assert.deepEqual(novFiles, ["portrait.PNG"]);

    const rootFiles = await readdir(dir);
    assert.ok(rootFiles.includes("notes.txt"), "le fichier non-image ne doit pas bouger");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("organizePhotosByDate ne fait rien sur un dossier sans images", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "organize-photos-empty-"));

  try {
    await writeFile(path.join(dir, "readme.md"), "rien a ranger ici");
    const result = await organizePhotosByDate(dir);

    assert.equal(result.scanned, 0);
    assert.equal(result.moved, 0);
    assert.deepEqual(result.createdFolders, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
