import assert from "node:assert/strict";
import { test } from "node:test";

import { adresseAutorisation, defiPkce, identiteGoogle } from "./google";

test("Google : adresse d'autorisation avec PKCE et état", () => {
  process.env.GOOGLE_CLIENT_ID = "id-test";
  const u = new URL(adresseAutorisation({ origine: "https://www.quioffre.fr", etat: "e1", verificateur: "v1" }));
  assert.equal(u.searchParams.get("redirect_uri"), "https://www.quioffre.fr/api/connexion/google/retour");
  assert.equal(u.searchParams.get("state"), "e1");
  assert.equal(u.searchParams.get("code_challenge"), defiPkce("v1"));
  assert.equal(u.searchParams.get("code_challenge_method"), "S256");
});

const faux = (profil: object) =>
  (async (url: string) =>
    new Response(JSON.stringify(String(url).includes("token") ? { access_token: "a" } : profil), { status: 200 })) as unknown as typeof fetch;

test("Google : l'adresse doit être vérifiée", async () => {
  const o = { origine: "https://www.quioffre.fr", code: "c", verificateur: "v" };
  assert.deepEqual(await identiteGoogle(o, faux({ email: "lea@gmail.com", email_verified: true, given_name: "Léa" })), { email: "lea@gmail.com", nom: "Léa" });
  assert.equal(await identiteGoogle(o, faux({ email: "lea@gmail.com", email_verified: false })), null);
  assert.equal(await identiteGoogle(o, faux({})), null);
});
