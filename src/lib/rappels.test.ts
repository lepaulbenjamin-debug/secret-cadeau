import assert from "node:assert/strict";
import { test } from "node:test";

import { envoyerEmail } from "./email";
import { contenuRappel, rappelDu, type GroupeRappel, type ParticipantRappel } from "./rappels";

const maintenant = new Date("2026-12-10T08:00:00Z");
const jour = (n: number) => new Date(maintenant.getTime() + n * 86400000 + 4 * 3600000);
const g = (o: Partial<GroupeRappel> = {}): GroupeRappel => ({ nom: "Noël", dateEchange: jour(14), budget: 30, tirageLe: null, nomsDeCode: false, ...o });
const p = (o: Partial<ParticipantRappel> = {}): ParticipantRappel => ({
  prenom: "Léa", email: "lea@ex.fr", jeton: "JETON123", rappelsEmail: true, nomDeCode: "Pingouin Farceur 🐧", nbSouhaits: 2, dejaEnvoyes: [], ...o,
});

test("quel rappel, quand", () => {
  assert.equal(rappelDu(g(), p(), maintenant), null, "rien à J-14 sans tirage");
  assert.equal(rappelDu(g({ tirageLe: maintenant }), p(), maintenant), "tirage");
  assert.equal(rappelDu(g({ tirageLe: maintenant }), p({ dejaEnvoyes: ["tirage"] }), maintenant), null);
  assert.equal(rappelDu(g({ dateEchange: jour(7) }), p(), maintenant), "j7");
  assert.equal(rappelDu(g({ dateEchange: jour(7), tirageLe: maintenant }), p(), maintenant), "tirage", "un par jour : le tirage d'abord");
  assert.equal(rappelDu(g({ dateEchange: jour(5) }), p({ dejaEnvoyes: ["j7"] }), maintenant), null);
  assert.equal(rappelDu(g({ dateEchange: jour(1) }), p({ dejaEnvoyes: ["j7"] }), maintenant), "veille");
  assert.equal(rappelDu(g({ dateEchange: jour(0) }), p(), maintenant), "veille");
  assert.equal(rappelDu(g({ dateEchange: jour(-1) }), p(), maintenant), null, "échange passé");
  assert.equal(rappelDu(g({ dateEchange: null, tirageLe: maintenant }), p(), maintenant), "tirage");
});

test("pas d'e-mail, ou rappels coupés : rien", () => {
  assert.equal(rappelDu(g({ tirageLe: maintenant }), p({ email: "" }), maintenant), null);
  assert.equal(rappelDu(g({ tirageLe: maintenant }), p({ rappelsEmail: false }), maintenant), null);
});

test("contenu : lien, désinscription, liste vide, mode mystère, jamais de nom tiré", () => {
  const c = contenuRappel("j7", g({ dateEchange: jour(5), tirageLe: maintenant, nomsDeCode: true }), p({ nbSouhaits: 0 }), { site: "https://www.quioffre.fr", maintenant });
  assert.match(c.sujet, /Noël/);
  assert.match(c.texte, /https:\/\/www\.quioffre\.fr\/p\/JETON123/);
  assert.match(c.texte, /dans 5 jours/);
  assert.match(c.texte, /Pingouin Farceur/);
  assert.match(c.texte, /liste d'envies est vide/);
  assert.equal(c.desabonnement, "https://www.quioffre.fr/api/desabonner?j=JETON123");
  const t = contenuRappel("tirage", g({ tirageLe: maintenant }), p({ prenom: "<script>" }), { site: "https://x.fr", maintenant });
  assert.ok(!t.html.includes("<script>"), "prénom échappé dans le HTML");
});

test("envoi : sans clé, rien ne part ; avec clé, en-têtes de désinscription", async () => {
  delete process.env.RESEND_API_KEY;
  assert.deepEqual(await envoyerEmail({ a: "x@y.fr", sujet: "s", html: "h", texte: "t" }), { ok: false, motif: "RESEND_API_KEY absente" });
  process.env.RESEND_API_KEY = "re_test";
  let corps: Record<string, unknown> = {};
  const f = (async (_u: string, init: RequestInit) => { corps = JSON.parse(String(init.body)); return new Response("{}", { status: 200 }); }) as unknown as typeof fetch;
  assert.deepEqual(await envoyerEmail({ a: "x@y.fr", sujet: "s", html: "h", texte: "t", desabonnement: "https://d" }, f), { ok: true });
  assert.deepEqual(corps.to, ["x@y.fr"]);
  assert.equal((corps.headers as Record<string, string>)["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  delete process.env.RESEND_API_KEY;
});

test("pas deux rappels en moins de 20 h, sauf la veille", () => {
  const hier = new Date(maintenant.getTime() - 3 * 3600000);
  assert.equal(rappelDu(g({ dateEchange: jour(5) }), p({ dejaEnvoyes: ["tirage"], dernierEnvoi: hier }), maintenant), null);
  assert.equal(rappelDu(g({ dateEchange: jour(1) }), p({ dejaEnvoyes: ["tirage"], dernierEnvoi: hier }), maintenant), "veille");
});

test("sans e-mail mais avec notifications : le rappel est dû", () => {
  assert.equal(rappelDu(g({ tirageLe: maintenant }), p({ email: "", push: true }), maintenant), "tirage");
  assert.equal(rappelDu(g({ tirageLe: maintenant }), p({ email: "", push: false }), maintenant), null);
});
