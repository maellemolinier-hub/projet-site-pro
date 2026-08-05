import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeForWakeWord, containsWakeWord } from "./wakeWordUtils.js";

test("normalizeForWakeWord retire accents, apostrophes et espaces", () => {
  assert.equal(normalizeForWakeWord("Hey Serv'IA"), "heyservia");
  assert.equal(normalizeForWakeWord("Hé Servia"), "heservia");
});

test("containsWakeWord detecte les variantes courantes", () => {
  assert.equal(containsWakeWord("Hey Serv'IA, range mes photos"), true);
  assert.equal(containsWakeWord("ServIA lance Spotify"), true);
  assert.equal(containsWakeWord("Serv IA ouvre mes mails"), true);
});

test("containsWakeWord renvoie false sans le mot-cle", () => {
  assert.equal(containsWakeWord("bonjour comment ca va"), false);
  assert.equal(containsWakeWord(""), false);
});
