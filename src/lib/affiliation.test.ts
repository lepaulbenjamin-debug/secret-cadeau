import assert from "node:assert/strict";
import { test } from "node:test";

import { affiliationActive, deplierLienCourt, lienAffiche } from "./affiliation";

const env = { AMAZON_TAG_FR: "quioffre-21" };

test("fiche produit amazon.fr : forme canonique avec notre identifiant", () => {
  const r = lienAffiche("https://www.amazon.fr/Livre-Recettes/dp/2081512939/ref=sr_1_3?crid=XYZ&keywords=x&qid=1&sr=8-3", env);
  assert.deepEqual(r, { url: "https://www.amazon.fr/dp/2081512939?tag=quioffre-21", affilie: true });
});

test("l'identifiant d'un autre est remplacé", () => {
  const r = lienAffiche("https://amazon.fr/gp/product/B0CHX1W1XY?tag=quelquun-21&linkCode=ll1", env);
  assert.equal(r.url, "https://www.amazon.fr/dp/B0CHX1W1XY?tag=quioffre-21");
});

test("lien mobile et page de recherche", () => {
  assert.equal(lienAffiche("https://m.amazon.fr/gp/aw/d/B0CHX1W1XY", env).url, "https://www.amazon.fr/dp/B0CHX1W1XY?tag=quioffre-21");
  const s = new URL(lienAffiche("https://www.amazon.fr/s?k=lego+star+wars&tag=autre-21&ref=nb_sb", env).url);
  assert.equal(s.searchParams.get("k"), "lego star wars");
  assert.equal(s.searchParams.get("tag"), "quioffre-21");
  assert.equal(s.searchParams.get("ref"), null);
});

test("boutique sans identifiant, ou autre site : inchangé", () => {
  assert.deepEqual(lienAffiche("https://www.amazon.de/dp/B0CHX1W1XY", env), { url: "https://www.amazon.de/dp/B0CHX1W1XY", affilie: false });
  assert.equal(lienAffiche("https://www.fnac.com/a123", env).affilie, false);
  assert.equal(lienAffiche("https://amazon.fr.arnaque.com/dp/B0CHX1W1XY", env).affilie, false);
  assert.equal(lienAffiche("https://www.amazon.fr/dp/B0CHX1W1XY", {}).affilie, false);
});

test("plusieurs boutiques", () => {
  const e = { AMAZON_TAG_FR: "fr-21", AMAZON_TAG_CO_UK: "uk-21" };
  assert.equal(lienAffiche("https://www.amazon.co.uk/dp/B0CHX1W1XY", e).url, "https://www.amazon.co.uk/dp/B0CHX1W1XY?tag=uk-21");
  assert.ok(affiliationActive(e));
  assert.ok(!affiliationActive({}));
});

test("identifiant mal formé : ignoré", () => {
  assert.equal(lienAffiche("https://www.amazon.fr/dp/B0CHX1W1XY", { AMAZON_TAG_FR: "x&y=1" }).affilie, false);
});

test("lien court : suit les redirections jusqu'à Amazon", async () => {
  const sauts: Record<string, string> = {
    "https://amzn.eu/d/abc": "https://www.amazon.fr/dp/B0CHX1W1XY?ref=cm_sw",
  };
  const faux = (async (url: string) =>
    new Response(null, { status: 301, headers: { location: sauts[url] } })) as unknown as typeof fetch;
  assert.equal(await deplierLienCourt("https://amzn.eu/d/abc", faux), "https://www.amazon.fr/dp/B0CHX1W1XY?ref=cm_sw");
});

test("lien court qui ne mène pas chez Amazon, ou réseau en panne : lien d'origine", async () => {
  const ailleurs = (async () => new Response(null, { status: 302, headers: { location: "https://pirate.example/x" } })) as unknown as typeof fetch;
  assert.equal(await deplierLienCourt("https://a.co/d/xyz", ailleurs), "https://a.co/d/xyz");
  const panne = (async () => { throw new Error("réseau"); }) as unknown as typeof fetch;
  assert.equal(await deplierLienCourt("https://amzn.to/xyz", panne), "https://amzn.to/xyz");
  assert.equal(await deplierLienCourt("https://www.fnac.com/x"), "https://www.fnac.com/x");
});

test("lien court mort qui renvoie sur l'accueil d'Amazon : lien d'origine", async () => {
  const accueil = (async () => new Response(null, { status: 302, headers: { location: "http://www.amazon.com/" } })) as unknown as typeof fetch;
  assert.equal(await deplierLienCourt("https://amzn.to/mort", accueil), "https://amzn.to/mort");
});
