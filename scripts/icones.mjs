// Génère les icônes PNG (manifeste, Apple, stores) à partir de src/app/icon.svg.
// Usage : node scripts/icones.mjs   (nécessite Playwright et Chromium)
import { readFileSync } from "node:fs";
import { chromium } from "playwright"; // installé globalement ou en devDependency

const svg = readFileSync(new URL("../src/app/icon.svg", import.meta.url), "utf8");
const navigateur = await chromium.launch();
for (const [taille, sortie] of [[192, "public/icone-192.png"], [512, "public/icone-512.png"], [180, "src/app/apple-icon.png"], [1024, "public/icone-1024.png"]]) {
  const page = await navigateur.newPage({ viewport: { width: taille, height: taille } });
  await page.setContent(`<style>*{margin:0}svg{display:block;width:${taille}px;height:${taille}px}</style>${svg.replace('rx="112"', "")}`);
  await page.screenshot({ path: sortie, omitBackground: false });
  await page.close();
}
await navigateur.close();
console.log("Icônes générées.");
