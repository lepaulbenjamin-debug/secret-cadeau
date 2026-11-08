import assert from "node:assert/strict";
import { test } from "node:test";

import { echangerTirages, retirerDuTirage, tirer } from "./tirage";

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


/** Une table est valide : chacun offre à un autre, chacun reçoit une fois, exclusions respectées. */
const tableValide = (t: Map<string, string>, excl: { a: string; b: string }[] = []) => {
  assert.equal(new Set(t.values()).size, t.size, "chacun reçoit une seule fois");
  for (const [de, pour] of t) {
    assert.notEqual(de, pour);
    assert.ok(t.has(pour), "le destinataire fait partie du groupe");
    for (const { a, b } of excl) assert.ok(!(de === a && pour === b) && !(de === b && pour === a));
  }
};

test("désistement : A → X → B devient A → B, une seule personne change", () => {
  const t = new Map([["a", "x"], ["x", "b"], ["b", "c"], ["c", "a"]]);
  const r = retirerDuTirage(t, "x")!;
  assert.deepEqual(r.changes, ["a"]);
  assert.equal(r.table.get("a"), "b");
  assert.equal(r.table.has("x"), false);
  tableValide(r.table);
});

test("désistement dans un couple A ↔ X : A est raccroché ailleurs, deux personnes changent", () => {
  const t = new Map([["a", "x"], ["x", "a"], ["b", "c"], ["c", "d"], ["d", "b"]]);
  const r = retirerDuTirage(t, "x")!;
  assert.equal(r.changes.length, 2);
  assert.ok(r.changes.includes("a"));
  tableValide(r.table);
  assert.equal(r.table.size, 4);
});

test("désistement : A et B s'excluent, on raccroche ailleurs", () => {
  const t = new Map([["a", "x"], ["x", "b"], ["b", "c"], ["c", "d"], ["d", "a"]]);
  const excl = [{ a: "a", b: "b" }];
  const r = retirerDuTirage(t, "x", excl)!;
  assert.equal(r.changes.length, 2);
  tableValide(r.table, excl);
});

test("désistement : cent cas au hasard restent valides", () => {
  for (let k = 0; k < 100; k++) {
    const ids = Array.from({ length: 8 }, (_, i) => `p${i}`);
    const t = tirer(ids)!;
    const r = retirerDuTirage(t, ids[k % 8]);
    assert.ok(r);
    tableValide(r.table);
    assert.ok(r.changes.length >= 1 && r.changes.length <= 2);
    for (const [de, pour] of r.table) if (!r.changes.includes(de)) assert.equal(pour, t.get(de), "les autres ne changent pas");
  }
});

test("désistement : moins de trois restants, impossible", () => {
  assert.equal(retirerDuTirage(new Map([["a", "b"], ["b", "c"], ["c", "a"]]), "a"), null);
});

test("échange de deux tirages : A ↔ B échangent leurs destinataires", () => {
  const t = new Map([["a", "x"], ["x", "b"], ["b", "y"], ["y", "a"]]);
  const r = echangerTirages(t, "a", "b")!;
  assert.equal(r.get("a"), "y");
  assert.equal(r.get("b"), "x");
  tableValide(r);
});

test("échange refusé : quelqu'un s'offrirait à lui-même, ou exclusion", () => {
  const t = new Map([["a", "b"], ["b", "c"], ["c", "a"]]);
  assert.equal(echangerTirages(t, "a", "b"), null, "a tirait b : b s'offrirait à lui-même");
  const t2 = new Map([["a", "x"], ["x", "b"], ["b", "y"], ["y", "a"]]);
  assert.equal(echangerTirages(t2, "a", "b", [{ a: "a", b: "y" }]), null);
  assert.equal(echangerTirages(t2, "a", "a"), null);
});
