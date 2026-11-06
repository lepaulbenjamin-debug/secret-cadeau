import assert from "node:assert/strict";
import { test } from "node:test";

import { cadresListy, extraireListe, extraireListy, lienMarchand, lienSeul, lireLignes, pagePrivee, pageProduit } from "./import-liste";

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


const BLOC = (slug: string, titre: string, prix: string) => `<div id="product_${slug}" class="x"><a href="/envies/${slug}"><img alt="${titre}" src="https://images.listy.fr/store/${slug}.webp" /></a>
  <a href="/envies/${slug}/reservation/creer">Réserver ce cadeau</a><a href="/envies/${slug}">${titre}</a><span>${prix}</span><span>boutique.fr</span></div>`;

test("Listy : idées, images, prix, et le cadre des idées réservées", () => {
  const html = `<h1>Liste</h1>${BLOC("lampe-1", "LAMPE DISCO", "14,99 €")}${BLOC("the-2", "• Th&eacute; vert", "")}
    <turbo-frame id="reserved_products" src="/listes/ma-liste/envies-reservees" target="_top"></turbo-frame>`;
  const idees = extraireListy(html, "https://www.listy.fr/listes/ma-liste");
  assert.deepEqual(idees, [
    { titre: "LAMPE DISCO", lien: "https://www.listy.fr/envies/lampe-1", image: "https://images.listy.fr/store/lampe-1.webp", prix: 15 },
    { titre: "Thé vert", lien: "https://www.listy.fr/envies/the-2", image: "https://images.listy.fr/store/the-2.webp", prix: null },
  ]);
  assert.deepEqual(cadresListy(html, "https://www.listy.fr/listes/ma-liste"), ["https://www.listy.fr/listes/ma-liste/envies-reservees"]);
});

test("lien marchand : le libellé « site marchand », même interne, sinon le premier lien externe", () => {
  const listy = `<a href="https://www.facebook.com/x">FB</a><a href="/envies/x/redirection">Voir sur le site marchand</a>`;
  assert.equal(lienMarchand(listy, "https://www.listy.fr/envies/x"), "https://www.listy.fr/envies/x/redirection");
  const autre = `<a href="/compte">Mon compte</a><a href="https://www.fnac.com/a1/Casque">Casque</a>`;
  assert.equal(lienMarchand(autre, "https://listes.fr/i/1"), "https://www.fnac.com/a1/Casque");
});

test("liste privée, et page produit", () => {
  assert.ok(pagePrivee("<p>Cette liste est privée</p>", "https://www.listy.fr/listes/x"));
  assert.ok(pagePrivee("<p>…</p>", "https://www.listy.fr/listes/x/demande-acces/creer"));
  assert.ok(!pagePrivee("<p>Ma liste</p>", "https://www.listy.fr/listes/x"));
  assert.ok(pageProduit('<meta property="og:type" content="product">'));
  assert.ok(!pageProduit('<meta property="og:title" content="Liste de Noël de Ben">'));
});
