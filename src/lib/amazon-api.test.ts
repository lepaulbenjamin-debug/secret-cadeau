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
