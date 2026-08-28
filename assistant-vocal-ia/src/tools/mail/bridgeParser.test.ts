import { test } from "node:test";
import assert from "node:assert/strict";
import type { gmail_v1 } from "googleapis";
import { parseCommandEmail, extractPlainTextBody, buildRawEmail } from "./bridgeParser.js";

test("parseCommandEmail reconnait le declencheur avec apostrophe droite", () => {
  const result = parseCommandEmail("Serv'IA x7Qk9 range mes photos", "");
  assert.deepEqual(result, { passphrase: "x7Qk9", commandText: "range mes photos" });
});

test("parseCommandEmail reconnait 'ServIA' sans separateur", () => {
  const result = parseCommandEmail("ServIA secret42 ouvre spotify", "");
  assert.deepEqual(result, { passphrase: "secret42", commandText: "ouvre spotify" });
});

test("parseCommandEmail reconnait 'Serv IA' avec espace", () => {
  const result = parseCommandEmail("Serv IA secret42 ouvre spotify", "");
  assert.deepEqual(result, { passphrase: "secret42", commandText: "ouvre spotify" });
});

test("parseCommandEmail prend la commande dans le corps si absente du sujet", () => {
  const result = parseCommandEmail("Serv'IA x7Qk9", "range mes photos dans /tmp/photos");
  assert.deepEqual(result, {
    passphrase: "x7Qk9",
    commandText: "range mes photos dans /tmp/photos",
  });
});

test("parseCommandEmail renvoie null sans declencheur", () => {
  assert.equal(parseCommandEmail("Bonjour", "peu importe"), null);
});

test("parseCommandEmail renvoie null sans commande ni dans le sujet ni dans le corps", () => {
  assert.equal(parseCommandEmail("Serv'IA x7Qk9", ""), null);
});

test("parseCommandEmail renvoie null sans phrase secrete", () => {
  assert.equal(parseCommandEmail("Serv'IA", "range mes photos"), null);
});

test("extractPlainTextBody decode un payload text/plain simple", () => {
  const text = "Bonjour le monde";
  const payload: gmail_v1.Schema$MessagePart = {
    mimeType: "text/plain",
    body: { data: Buffer.from(text, "utf8").toString("base64url") },
  };
  assert.equal(extractPlainTextBody(payload), text);
});

test("extractPlainTextBody trouve le text/plain dans un multipart imbrique", () => {
  const text = "Range mes photos stp";
  const payload: gmail_v1.Schema$MessagePart = {
    mimeType: "multipart/alternative",
    parts: [
      {
        mimeType: "text/html",
        body: { data: Buffer.from("<p>Range mes photos stp</p>", "utf8").toString("base64url") },
      },
      {
        mimeType: "text/plain",
        body: { data: Buffer.from(text, "utf8").toString("base64url") },
      },
    ],
  };
  assert.equal(extractPlainTextBody(payload), text);
});

test("extractPlainTextBody renvoie une chaine vide sans partie text/plain", () => {
  const payload: gmail_v1.Schema$MessagePart = { mimeType: "text/html", body: {} };
  assert.equal(extractPlainTextBody(payload), "");
});

test("buildRawEmail produit un base64url decodable contenant le corps", () => {
  const raw = buildRawEmail("moi@example.com", "Re: Serv'IA", "Photos rangees.");
  const decoded = Buffer.from(raw, "base64url").toString("utf8");
  assert.match(decoded, /^To: moi@example\.com/);
  assert.match(decoded, /Photos rangees\.$/);
});
