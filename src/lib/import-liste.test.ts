import assert from "node:assert/strict";
import { test } from "node:test";

import { extraireListe, lienSeul, lireLignes } from "./import-liste";

test("texte : une idée par ligne, puces retirées, lien séparé du titre", () => {
  assert.deepEqual(
    lireLignes("- Un casque sans fil https://shop.fr/casque\n\n2) Le tome 3\n• https://autre.fr/puzzle-1000\nUn plaid : https://x.fr/p."),
    [
      { titre: "Un casque sans fil", lien: "https://shop.fr/casque" },
      { titre: "Le tome 3", lien: "" },
      { titre: "", lien: "https://autre.fr/puzzle-1000" },
      { titre: "Un plaid", lien: "https://x.fr/p" },
    ],
  );
  assert.equal(lireLignes(Array.from({ length: 50 }, (_, i) => `Idée ${i}`).join("\n")).length, 30);
});

test("lien seul", () => {
  assert.equal(lienSeul("  https://listes.fr/lea  "), "https://listes.fr/lea");
  assert.equal(lienSeul("Un casque https://x.fr"), null);
});

test("page : ItemList en JSON-LD", () => {
  const html = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","itemListElement":[
    {"@type":"ListItem","position":1,"item":{"@type":"Product","name":"Casque sans fil","url":"/p/1","image":"//cdn.fr/1.jpg","offers":{"price":"59.90"}}},
    {"@type":"ListItem","position":2,"item":{"@type":"Product","name":"Th&eacute; vert","offers":{"url":"https://the.fr/vert","price":12}}}]}</script>`;
  const r = extraireListe(html, "https://listes.fr/lea");
  assert.equal(r.methode, "donnees");
  assert.deepEqual(r.idees, [
    { titre: "Casque sans fil", lien: "https://listes.fr/p/1", image: "https://cdn.fr/1.jpg", prix: 60 },
    { titre: "Thé vert", lien: "https://the.fr/vert", image: "", prix: 12 },
  ]);
});

test("page sans données : les liens vers d'autres boutiques", () => {
  const html = `<nav><a href="/">Accueil</a><a href="https://facebook.com/x">Partager</a></nav>
    <a href="https://www.fnac.com/a123/Casque-Sony">Casque <b>Sony</b> WH-1000</a>
    <a href="https://www.cultura.com/p-puzzle">Puzzle 1000 pièces</a>
    <a href="https://www.cultura.com/p-puzzle">Puzzle 1000 pièces</a>
    <a href="https://listes.fr/autre">Une autre liste du même site</a>
    <a href="https://www.fnac.com/">Fnac</a>`;
  const r = extraireListe(html, "https://listes.fr/lea");
  assert.equal(r.methode, "liens");
  assert.deepEqual(r.idees.map((i) => i.titre), ["Casque Sony WH-1000", "Puzzle 1000 pièces"]);
});

test("page illisible : rien", () => {
  assert.deepEqual(extraireListe("<div id=app></div><script src=app.js></script>", "https://listes.fr/lea"), { idees: [], methode: "aucune" });
});
