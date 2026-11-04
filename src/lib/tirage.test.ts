import assert from "node:assert/strict";
import { test } from "node:test";

import { tirer } from "./tirage";

const valide = (ids: string[], r: Map<string, string>, excl: { a: string; b: string }[] = []) => {
  assert.equal(r.size, ids.length);
  assert.equal(new Set(r.values()).size, ids.length, "chacun reçoit une seule fois");
  for (const [de, pour] of r) {
    assert.notEqual(de, pour, "personne ne se tire soi-même");
    for (const { a, b } of excl) {
      assert.ok(!(de === a && pour === b) && !(de === b && pour === a), "exclusion respectée");
    }
  }
};

test("deux personnes s'offrent l'une à l'autre", () => {
  const r = tirer(["a", "b"]);
  assert.ok(r);
  assert.equal(r.get("a"), "b");
  assert.equal(r.get("b"), "a");
});

test("une seule personne : pas de tirage", () => {
  assert.equal(tirer(["a"]), null);
});

test("cent tirages de dix personnes sont tous valides", () => {
  const ids = Array.from({ length: 10 }, (_, i) => `p${i}`);
  for (let k = 0; k < 100; k++) valide(ids, tirer(ids)!);
});

test("les exclusions sont respectées dans les deux sens", () => {
  const ids = ["a", "b", "c", "d", "e", "f"];
  const excl = [{ a: "a", b: "b" }, { a: "c", b: "d" }, { a: "e", b: "f" }];
  for (let k = 0; k < 200; k++) valide(ids, tirer(ids, excl)!, excl);
});

test("impossible : trois personnes dont deux exclues ne laissent qu'un cycle… qui casse", () => {
  // a ne peut offrir qu'à c, b qu'à c : impossible.
  assert.equal(tirer(["a", "b", "c"], [{ a: "a", b: "b" }]), null);
});
