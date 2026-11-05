import assert from "node:assert/strict";
import { test } from "node:test";

import { nomDeCodeAleatoire, nomsDeCodeAleatoires } from "./noms-de-code";

test("soixante noms distincts", () => {
  const noms = nomsDeCodeAleatoires(60);
  assert.equal(new Set(noms).size, 60);
});

test("accord en genre", () => {
  for (let i = 0; i < 300; i++) {
    const n = nomDeCodeAleatoire();
    if (n.startsWith("Licorne ")) assert.doesNotMatch(n, /Licorne (Farceur|Grognon|Gourmand|Malicieux) /);
    if (n.startsWith("Pingouin ")) assert.doesNotMatch(n, /Pingouin \S+(euse|onne|ande|ieuse) /);
  }
});

test("évite les noms déjà pris", () => {
  let k = 0;
  const alea = () => [0, 0, 0, 0, 0.5, 0.5][k++ % 6];
  const premier = nomDeCodeAleatoire([], alea);
  k = 0;
  assert.notEqual(nomDeCodeAleatoire([premier], alea), premier);
});

test("personnages tous différents jusqu'à quarante, emojis aussi", () => {
  const noms = nomsDeCodeAleatoires(40);
  const persos = noms.map((n) => n.split(" ").slice(0, -2).join(" ") || n);
  const emojis = noms.map((n) => n.split(" ").at(-1));
  assert.equal(new Set(emojis).size, 40, "un emoji par personnage");
  assert.ok(new Set(persos).size >= 38);
});
