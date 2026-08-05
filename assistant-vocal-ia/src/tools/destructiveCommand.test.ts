import { test } from "node:test";
import assert from "node:assert/strict";
import { isDestructiveCommand } from "./destructiveCommand.js";

test("isDestructiveCommand detecte les motifs dangereux courants", () => {
  assert.equal(isDestructiveCommand("rm -rf ~/Documents"), true);
  assert.equal(isDestructiveCommand("sudo apt-get remove --purge x"), true);
  assert.equal(isDestructiveCommand("shutdown -h now"), true);
  assert.equal(isDestructiveCommand("DROP TABLE users;"), true);
  assert.equal(isDestructiveCommand("git push --force origin main"), true);
  assert.equal(isDestructiveCommand("del /f /q C:\\temp"), true);
});

test("isDestructiveCommand laisse passer les commandes anodines", () => {
  assert.equal(isDestructiveCommand("ls -la ~/Documents"), false);
  assert.equal(isDestructiveCommand("mkdir ~/Documents/archive"), false);
  assert.equal(isDestructiveCommand("df -h"), false);
  assert.equal(isDestructiveCommand("mv fichier.txt archive/"), false);
});
