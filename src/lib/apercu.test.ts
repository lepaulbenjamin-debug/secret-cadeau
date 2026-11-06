import assert from "node:assert/strict";
import { test } from "node:test";

import { apercuDuLien, extraireApercu, ipPrivee, lirePrix, titreDepuisAdresse } from "./apercu";

test("Open Graph", () => {
  const html = `<html><head>
    <meta property="og:title" content="Chaussures de trail XT-5 | Decathlon">
    <meta property="og:image" content="//cdn.example.com/xt5.jpg">
    <meta property="product:price:amount" content="89.99">
    <title>autre</title></head>`;
  assert.deepEqual(extraireApercu(html, "https://www.decathlon.fr/p/xt5"), {
    titre: "Chaussures de trail XT-5",
    image: "https://cdn.example.com/xt5.jpg",
    prix: 90,
  });
});

test("JSON-LD Product prioritaire, dans un @graph, entités décodées", () => {
  const html = `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage"},
    {"@type":"Product","name":"Th&eacute;i&egrave;re en fonte","image":["https://shop.fr/t.jpg"],"offers":{"@type":"Offer","price":"34,50","priceCurrency":"EUR"}}]}</script>
    <meta property="og:title" content="Mauvais titre">`;
  const a = extraireApercu(html, "https://shop.fr/theiere");
  assert.equal(a.image, "https://shop.fr/t.jpg");
  assert.equal(a.prix, 35);
});

test("titre seul via <title>, apostrophes encodées", () => {
  assert.equal(extraireApercu("<title>L&#39;Atelier du jouet &#x2014; Puzzle 1000 pièces - MonShop</title>", "https://a.fr").titre, "L'Atelier du jouet — Puzzle 1000 pièces");
});

test("prix", () => {
  assert.equal(lirePrix("29,99 €"), 30);
  assert.equal(lirePrix("1 299,00"), 1299);
  assert.equal(lirePrix("1,299.00"), 1299);
  assert.equal(lirePrix(12.4), 12);
  assert.equal(lirePrix("gratuit"), null);
});

test("titre tiré de l'adresse", () => {
  assert.equal(titreDepuisAdresse("https://www.amazon.fr/Livre-Recettes-Italiennes/dp/2081512939/ref=sr_1"), "Livre Recettes Italiennes");
  assert.equal(titreDepuisAdresse("https://www.fnac.com/a17235/Casque-Bluetooth-Sony-WH-1000XM5-Noir"), "Casque Bluetooth Sony WH 1000XM5 Noir");
  assert.equal(titreDepuisAdresse("https://www.decathlon.fr/p/chaussures-trail-homme-xt5/_/R-p-301234"), "Chaussures trail homme xt5");
  assert.equal(titreDepuisAdresse("https://www.amazon.fr/dp/B0CHX1W1XY"), "");
});

test("adresses internes reconnues", () => {
  for (const ip of ["127.0.0.1", "10.2.3.4", "169.254.169.254", "192.168.1.1", "172.20.0.1", "::1", "fd00::1", "::ffff:127.0.0.1", "0.0.0.0"]) assert.ok(ipPrivee(ip), ip);
  for (const ip of ["93.184.216.34", "2606:4700::1111", "172.32.0.1"]) assert.ok(!ipPrivee(ip), ip);
});

const pasDeReseau = (async () => { throw new Error("ne doit pas être appelé"); }) as unknown as typeof fetch;

test("Amazon : aucune requête, titre de l'adresse", async () => {
  const a = await apercuDuLien("https://www.amazon.fr/Lego-Star-Wars-Faucon/dp/B0CHX1W1XY", { fetcher: pasDeReseau });
  assert.deepEqual(a, { titre: "Lego Star Wars Faucon", image: "", prix: null });
});

test("adresse interne ou résolue en interne : refusée sans requête", async () => {
  for (const l of ["http://localhost:3000/x", "http://169.254.169.254/latest", "http://127.0.0.1/", "ftp://a.fr/x", "https://a.fr:8443/x"]) {
    assert.equal((await apercuDuLien(l, { fetcher: pasDeReseau })).image, "");
  }
  await apercuDuLien("https://piege.example/x", { fetcher: pasDeReseau, resoudre: async () => ["10.0.0.5"] });
});

test("redirection vers une adresse interne : stoppée", async () => {
  let appels = 0;
  const f = (async () => { appels++; return new Response(null, { status: 302, headers: { location: "http://127.0.0.1/admin" } }); }) as unknown as typeof fetch;
  await apercuDuLien("https://public.example/x", { fetcher: f, resoudre: async () => ["93.184.216.34"] });
  assert.equal(appels, 1);
});

test("page publique lue", async () => {
  const f = (async () => new Response(`<head><meta property="og:title" content="Puzzle 1000 pièces"><meta property="og:image" content="https://s.fr/p.jpg"></head>`, { headers: { "content-type": "text/html; charset=utf-8" } })) as unknown as typeof fetch;
  const a = await apercuDuLien("https://shop.example/puzzle", { fetcher: f, resoudre: async () => ["93.184.216.34"] });
  assert.deepEqual(a, { titre: "Puzzle 1000 pièces", image: "https://s.fr/p.jpg", prix: null });
});

test("site qui refuse les robots : titre de l'adresse", async () => {
  const f = (async () => new Response("interdit", { status: 403, headers: { "content-type": "text/html" } })) as unknown as typeof fetch;
  const a = await apercuDuLien("https://www.fnac.com/a17235/Casque-Bluetooth-Sony", { fetcher: f, resoudre: async () => ["93.184.216.34"] });
  assert.equal(a.titre, "Casque Bluetooth Sony");
});

test("entités françaises", async () => {
  const { decoder } = await import("./apercu");
  assert.equal(decoder("Th&eacute; &agrave; la menthe &laquo;&nbsp;bio&nbsp;&raquo; &Eacute;dition"), "Thé à la menthe « bio » Édition");
});
