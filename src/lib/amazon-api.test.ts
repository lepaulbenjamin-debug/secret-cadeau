import assert from "node:assert/strict";
import { test } from "node:test";

import { infosAmazon } from "./amazon-api";

test("Amazon : appel de l'API officielle, jamais la page produit", async () => {
  const appels: string[] = [];
  const faux = (async (url: string, init?: RequestInit) => {
    appels.push(String(url));
    if (String(url).includes("/auth/o2/token")) return new Response(JSON.stringify({ access_token: "t", expires_in: 3600 }));
    const corps = JSON.parse(String(init?.body));
    assert.deepEqual(corps.itemIds, ["B0TEST1234"]);
    assert.equal(corps.partnerTag, "quioffre-21");
    assert.equal(corps.marketplace, "www.amazon.fr");
    return new Response(JSON.stringify({ itemsResult: { items: [{ itemInfo: { title: { displayValue: "Lampe" } } }] } }));
  }) as unknown as typeof fetch;
  const env = { AMAZON_CREATORS_ID: "i", AMAZON_CREATORS_SECRET: "s", AMAZON_TAG_FR: "quioffre-21" };
  assert.deepEqual(await infosAmazon("https://www.amazon.fr/dp/B0TEST1234?th=1", env, faux), { titre: "Lampe", image: "", prix: null });
  assert.equal(appels[0], "https://api.amazon.co.uk/auth/o2/token");
  assert.equal(appels[1], "https://creatorsapi.amazon/catalog/v1/getItems");
  assert(!appels.some((u) => u.includes("www.amazon.")));
  // Non configuré : rien n'est appelé.
  assert.equal(await infosAmazon("https://www.amazon.fr/dp/B0TEST1234", {}, faux), null);
});

test("Amazon : identifiants 2.x (Cognito, formulaire, Version dans l'en-tête)", async () => {
  const appels: { url: string; init?: RequestInit }[] = [];
  const faux = (async (url: string, init?: RequestInit) => {
    appels.push({ url: String(url), init });
    if (String(url).includes("oauth2/token")) return new Response(JSON.stringify({ access_token: "t2", expires_in: 3600 }));
    return new Response(JSON.stringify({ itemsResult: { items: [{ itemInfo: { title: { displayValue: "Lampe" } } }] } }));
  }) as unknown as typeof fetch;
  const env = { AMAZON_CREATORS_ID: " i ", AMAZON_CREATORS_SECRET: "s", AMAZON_CREATORS_VERSION: "v2.2", AMAZON_TAG_FR: "quioffre-21" };
  assert.equal((await infosAmazon("https://www.amazon.fr/dp/B0F65QGXBR?ref=x", env, faux))?.titre, "Lampe");
  assert.equal(appels[0].url, "https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token");
  assert.match(String(appels[0].init?.body), /scope=creatorsapi%2Fdefault/);
  assert.match(String(appels[0].init?.body), /client_id=i&/);
  assert.equal((appels[1].init?.headers as Record<string, string>).authorization, "Bearer t2, Version 2.2");
});
