import assert from "node:assert/strict";
import { test } from "node:test";

import { lireArticle } from "./amazon-api";
import { euros, prixSaisi } from "./format";
import { prixPositif } from "./saisie";

test("prix saisis avec virgule ou point", () => {
  assert.equal(prixPositif("12,99"), 12.99);
  assert.equal(prixPositif("12.99"), 12.99);
  assert.equal(prixPositif("12,5 €"), 12.5);
  assert.equal(prixPositif("1 299,90"), 1299.9);
  assert.equal(prixPositif("1.299,90"), 1299.9);
  assert.equal(prixPositif("25"), 25);
  assert.equal(prixPositif(""), null);
  assert.equal(prixPositif("0"), null);
  assert.equal(prixPositif("abc"), null);
});

test("affichage des prix", () => {
  assert.equal(euros(25), "25 €");
  assert.equal(euros(12.99), "12,99 €");
  assert.equal(euros(12.5), "12,50 €");
  assert.equal(euros(1299.9), "1 299,90 €");
  assert.equal(prixSaisi(12.99), "12,99");
  assert.equal(prixSaisi(null), "");
});

test("Amazon : lecture de la réponse de l'API", () => {
  const r = {
    itemsResult: {
      items: [
        {
          asin: "B0TEST1234",
          itemInfo: { title: { displayValue: "Casque Bluetooth" } },
          images: { primary: { large: { url: "https://m.media-amazon.com/images/I/x.jpg" } } },
          offersV2: { listings: [{ price: { money: { amount: 79.99, currency: "EUR", displayAmount: "79,99 €" } } }] },
        },
      ],
    },
  };
  assert.deepEqual(lireArticle(r), { titre: "Casque Bluetooth", image: "https://m.media-amazon.com/images/I/x.jpg", prix: 79.99 });
  assert.equal(lireArticle({}), null);
});
