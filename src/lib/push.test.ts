import assert from "node:assert/strict";
import { test } from "node:test";

import { messageNouvelleIdee } from "./push";

test("notification « nouvelle idée » : sans nom, vers l'espace du Père Noël", () => {
  const m = messageNouvelleIdee("Noël en famille", "jetonDuPere", 1);
  assert.equal(m.url, "/p/jetonDuPere");
  assert.match(m.corps, /personne que vous avez tirée/);
  assert.match(messageNouvelleIdee("Noël", "j", 4).corps, /^Des nouvelles idées/);
});
