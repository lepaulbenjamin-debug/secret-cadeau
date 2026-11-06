import assert from "node:assert/strict";
import { test } from "node:test";

import { contenuBienvenue, contenuRelanceOrganisateur, relanceOrganisateurDue } from "./emails-organisateur";

const maintenant = new Date("2026-12-10T08:00:00Z");
const dans = (n: number) => new Date(maintenant.getTime() + n * 86400000 + 4 * 3600000);
const g = { nom: "Noël", dateEchange: dans(5), nomsDeCode: false, jetonAdmin: "ADM", jetonInvitation: "INV" };
const base = { tirageLe: null, dateEchange: dans(5), emailOrganisateur: "o@ex.fr", rappelsOrganisateur: true, relanceTirageLe: null };

test("bienvenue : lien d'organisateur, invitation, espace perso s'il participe", () => {
  const c = contenuBienvenue(g, { site: "https://s.fr", prenom: "Camille", jetonPerso: "PERSO" });
  assert.match(c.texte, /https:\/\/s\.fr\/g\/ADM/);
  assert.match(c.texte, /https:\/\/s\.fr\/rejoindre\/INV/);
  assert.match(c.texte, /https:\/\/s\.fr\/p\/PERSO/);
  assert.equal(c.desabonnement, "https://s.fr/api/desabonner?o=ADM");
  const sans = contenuBienvenue(g, { site: "https://s.fr", prenom: "", jetonPerso: null });
  assert.doesNotMatch(sans.texte, /\/p\//);
  assert.match(sans.texte, /^Bonjour,/);
});

test("relance : seulement sans tirage, à 7 jours ou moins, une fois", () => {
  assert.ok(relanceOrganisateurDue(base, maintenant));
  assert.ok(!relanceOrganisateurDue({ ...base, dateEchange: dans(10) }, maintenant));
  assert.ok(!relanceOrganisateurDue({ ...base, dateEchange: dans(-1) }, maintenant));
  assert.ok(!relanceOrganisateurDue({ ...base, tirageLe: maintenant }, maintenant));
  assert.ok(!relanceOrganisateurDue({ ...base, relanceTirageLe: maintenant }, maintenant));
  assert.ok(!relanceOrganisateurDue({ ...base, emailOrganisateur: "" }, maintenant));
  assert.ok(!relanceOrganisateurDue({ ...base, rappelsOrganisateur: false }, maintenant));
});

test("relance : contenu", () => {
  const c = contenuRelanceOrganisateur({ ...g, nomsDeCode: true }, { site: "https://s.fr", prenom: "Camille", nbParticipants: 4, listesVides: ["Tom", "Léa"], maintenant });
  assert.match(c.texte, /dans 5 jours/);
  assert.match(c.texte, /Tom, Léa/);
  assert.match(c.texte, /mode mystère/);
  const peu = contenuRelanceOrganisateur(g, { site: "https://s.fr", prenom: "", nbParticipants: 2, listesVides: [], maintenant });
  assert.match(peu.texte, /au moins trois/);
  assert.match(peu.texte, /rejoindre\/INV/);
});
