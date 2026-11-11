import assert from "node:assert/strict";
import { test } from "node:test";

import { codeASixChiffres, empreinte, normaliserEmail, secretAleatoire, suiteSure } from "./secret";

test("adresse de retour : seulement un chemin du site", () => {
  assert.equal(suiteSure("/p/abc?x=1"), "/p/abc?x=1");
  assert.equal(suiteSure("//pirate.fr"), "/compte");
  assert.equal(suiteSure("/\\pirate.fr"), "/compte");
  assert.equal(suiteSure("https://pirate.fr"), "/compte");
  assert.equal(suiteSure("javascript:alert(1)"), "/compte");
  assert.equal(suiteSure(undefined, "/"), "/");
});

test("secrets, codes, empreintes", () => {
  assert.notEqual(secretAleatoire(), secretAleatoire());
  assert.match(codeASixChiffres(), /^\d{6}$/);
  assert.equal(empreinte("a"), empreinte("a"));
  assert.notEqual(empreinte("a"), "a");
  assert.equal(normaliserEmail("  Lea@Exemple.FR "), "lea@exemple.fr");
});
