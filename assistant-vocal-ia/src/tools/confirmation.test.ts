import { test } from "node:test";
import assert from "node:assert/strict";
import { isPreConfirmed } from "./confirmation.js";

test("isPreConfirmed accepte le bon code apres CONFIRME", () => {
  assert.equal(
    isPreConfirmed("CONFIRME a1b2c3d4 supprime le dossier temp", "a1b2c3d4"),
    true,
  );
});

test("isPreConfirmed refuse un mauvais code", () => {
  assert.equal(
    isPreConfirmed("CONFIRME mauvaiscode supprime le dossier temp", "a1b2c3d4"),
    false,
  );
});

test("isPreConfirmed refuse le mot CONFIRME seul (sans code)", () => {
  assert.equal(isPreConfirmed("CONFIRME supprime le dossier temp", "a1b2c3d4"), false);
});

test("isPreConfirmed refuse si CONFIRMATION_CODE n'est pas configure", () => {
  assert.equal(
    isPreConfirmed("CONFIRME a1b2c3d4 supprime le dossier temp", undefined),
    false,
  );
});

test("isPreConfirmed est insensible a la casse du mot CONFIRME mais pas du code", () => {
  assert.equal(isPreConfirmed("confirme a1b2c3d4 fais le menage", "a1b2c3d4"), true);
  assert.equal(isPreConfirmed("CONFIRME A1B2C3D4 fais le menage", "a1b2c3d4"), false);
});

test("isPreConfirmed refuse une demande sans le mot CONFIRME", () => {
  assert.equal(isPreConfirmed("supprime le dossier temp", "a1b2c3d4"), false);
});
