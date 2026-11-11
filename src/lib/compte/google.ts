import { createHash } from "node:crypto";

/**
 * « Continuer avec Google » (OpenID Connect, code + PKCE), sans bibliothèque.
 * Variables : GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET. Adresse de retour à
 * déclarer chez Google : https://www.quioffre.fr/api/connexion/google/retour
 */
export const COOKIE_GOOGLE = "qo_google";
export const googleConfigure = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const retourGoogle = (origine: string) => `${origine}/api/connexion/google/retour`;
export const defiPkce = (verificateur: string) => createHash("sha256").update(verificateur).digest("base64url");

export function adresseAutorisation(o: { origine: string; etat: string; verificateur: string }) {
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: retourGoogle(o.origine),
    response_type: "code",
    scope: "openid email profile",
    state: o.etat,
    code_challenge: defiPkce(o.verificateur),
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

/** Échange le code contre l'identité. `null` si Google refuse ou si l'adresse n'est pas vérifiée. */
export async function identiteGoogle(o: { origine: string; code: string; verificateur: string }, fetcher: typeof fetch = fetch) {
  const jeton = await fetcher("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(10000),
    body: new URLSearchParams({
      code: o.code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: retourGoogle(o.origine),
      grant_type: "authorization_code",
      code_verifier: o.verificateur,
    }),
  });
  if (!jeton.ok) return null;
  const { access_token } = (await jeton.json()) as { access_token?: string };
  if (!access_token) return null;
  const r = await fetcher("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${access_token}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) return null;
  const u = (await r.json()) as { email?: string; email_verified?: boolean; given_name?: string; name?: string };
  if (!u.email || u.email_verified !== true) return null;
  return { email: u.email, nom: u.given_name ?? u.name ?? "" };
}
