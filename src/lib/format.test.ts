import assert from "node:assert/strict";
import { test } from "node:test";

import { compteARebours, lienSur, lirePrenoms } from "./format";

test("prénoms : lignes, virgules, doublons", () => {
  assert.deepEqual(lirePrenoms("Léa\n  Tom , léa;\n\nMamie  Jo"), ["Léa", "Tom", "Mamie Jo"]);
});

test("liens : seuls http(s) passent", () => {
  assert.equal(lienSur("javascript:alert(1)"), "");
  assert.equal(lienSur("amazon.fr/x"), "https://amazon.fr/x");
  assert.equal(lienSur(""), "");
});

test("compte à rebours", () => {
  const now = new Date("2026-12-01T10:00:00Z");
  assert.equal(compteARebours(new Date("2026-12-01T20:00:00Z"), now), "c'est aujourd'hui !");
  assert.equal(compteARebours(new Date("2026-12-02T10:00:00Z"), now), "c'est demain");
  assert.equal(compteARebours(new Date("2026-12-25T10:00:00Z"), now), "dans 24 jours");
  assert.equal(compteARebours(new Date("2026-11-25T10:00:00Z"), now), null);
});
