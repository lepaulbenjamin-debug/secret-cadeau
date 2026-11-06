import assert from "node:assert/strict";
import { test } from "node:test";

import { aDesLiens, contenuRetrouver } from "./emails-retrouver";

test("retrouver : tous les liens d'une adresse, en un message", () => {
  const c = contenuRetrouver(
    {
      participations: [{ groupe: "Noël famille", prenom: "Léa", jeton: "P1" }],
      organisations: [{ groupe: "Bureau", jetonAdmin: "A1" }],
      listes: [{ prenom: "Léa", occasion: "anniversaire", jetonProprio: "LP", jetonPartage: "LS" }],
    },
    { site: "https://s.fr" },
  );
  for (const l of ["/p/P1", "/g/A1", "/ma-liste/LP", "/liste/LS"]) assert.match(c.texte, new RegExp(`https://s\\.fr${l}`));
  assert.match(c.texte, /les 4 liens/);
  assert.match(c.texte, /Si ce n'est pas vous/);
});

test("retrouver : rien à envoyer", () => {
  assert.equal(aDesLiens({ participations: [], organisations: [], listes: [] }), false);
});
