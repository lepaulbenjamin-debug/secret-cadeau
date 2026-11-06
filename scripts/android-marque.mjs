/**
 * Pose l'identité de Qui Offre dans le projet Android généré par Capacitor :
 * icônes du lanceur, fond de l'icône adaptative, écran de démarrage.
 *
 *     node scripts/android-marque.mjs
 *
 * ⚠️ `android/` N'EST PAS VERSIONNÉ, et le gabarit de Capacitor livre SES icônes,
 * un fond d'icône BLANC et un écran de démarrage au logo de Capacitor. Rien de
 * tout ça ne fait échouer la construction : on publierait simplement une
 * application au mauvais visage. Ce script repasse donc à chaque construction.
 *
 * ⚠️ LES TAILLES SONT LUES DANS LES FICHIERS DU GABARIT, jamais recopiées à la
 * main : une icône à la mauvaise densité ne casse rien, elle est floue.
 *
 * Sources : public/icone-1024.png (fond corail plein) et public/icone-512.png
 * (arrondie, fond transparent).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

import sharp from "sharp";

const RES = "android/app/src/main/res";
const CORAIL = "#FC5A53";
const CREME = "#FAF6F0";
const PLEINE = "public/icone-1024.png";
const ARRONDIE = "public/icone-512.png";

if (!existsSync(RES)) {
  console.error("✗ Pas de projet Android : lancez d'abord `npx cap add android`.");
  process.exit(1);
}

const taille = async (fichier) => (await sharp(fichier).metadata()).width ?? 0;

/**
 * Le calque avant de l'icône adaptative (Android 8+). Le système le découpe en
 * cercle, goutte ou carré arrondi selon le téléphone, et seul le disque central
 * de 66 % est sûr d'être visible : le paquet est réduit à 62 % pour y tenir.
 * Le fond corail du dessin se confond avec la couleur de fond déclarée plus bas.
 */
async function calqueAvant(w) {
  const dessin = await sharp(PLEINE).resize(Math.round(w * 0.62)).png().toBuffer();
  return sharp({ create: { width: w, height: w, channels: 4, background: CORAIL } })
    .composite([{ input: dessin, gravity: "center" }])
    .png()
    .toBuffer();
}

/** Les lanceurs d'avant Android 8 affichent le PNG tel quel : à nous d'arrondir. */
const arrondie = (w) => sharp(ARRONDIE).resize(w).png().toBuffer();

async function ronde(w) {
  const masque = Buffer.from(`<svg width="${w}" height="${w}"><circle cx="${w / 2}" cy="${w / 2}" r="${w / 2}"/></svg>`);
  return sharp(PLEINE).resize(w).composite([{ input: masque, blend: "dest-in" }]).png().toBuffer();
}

// 1. Icônes du lanceur, densité par densité.
for (const densite of readdirSync(RES).filter((d) => d.startsWith("mipmap-") && !d.includes("anydpi"))) {
  for (const fichier of readdirSync(`${RES}/${densite}`)) {
    const chemin = `${RES}/${densite}/${fichier}`;
    const w = await taille(chemin);
    let image;
    if (fichier === "ic_launcher_foreground.png") image = await calqueAvant(w);
    else if (fichier === "ic_launcher_round.png") image = await ronde(w);
    else if (fichier === "ic_launcher.png") image = await arrondie(w);
    else continue;
    writeFileSync(chemin, image);
    console.log(`${chemin} — ${w}×${w}`);
  }
}

// 2. Le fond de l'icône adaptative : blanc dans le gabarit, corail chez nous.
writeFileSync(
  `${RES}/values/ic_launcher_background.xml`,
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${CORAIL}</color>\n</resources>\n`,
);
console.log(`fond de l'icône adaptative : ${CORAIL}`);

// 3. L'écran de démarrage : fond crème, icône au centre, à la taille de chaque fichier du gabarit.
for (const dossier of readdirSync(RES).filter((d) => d.startsWith("drawable"))) {
  const chemin = `${RES}/${dossier}/splash.png`;
  if (!existsSync(chemin)) continue;
  const { width = 0, height = 0 } = await sharp(chemin).metadata();
  const icone = await sharp(ARRONDIE).resize(Math.round(Math.min(width, height) * 0.3)).png().toBuffer();
  const image = await sharp({ create: { width, height, channels: 4, background: CREME } })
    .composite([{ input: icone, gravity: "center" }])
    .png()
    .toBuffer();
  writeFileSync(chemin, image);
  console.log(`${chemin} — ${width}×${height}`);
}

// 4. Android 12+ dessine son propre écran de démarrage (icône sur un fond) : le fond passe au crème.
const STYLES = `${RES}/values/styles.xml`;
let styles = readFileSync(STYLES, "utf8");
if (!styles.includes("windowSplashScreenBackground")) {
  const avant = styles;
  styles = styles.replace(
    /(<style name="AppTheme\.NoActionBarLaunch" parent="Theme\.SplashScreen">)/,
    `$1\n        <item name="windowSplashScreenBackground">${CREME}</item>`,
  );
  if (styles === avant) {
    console.error(`✗ ${STYLES} n'a pas la forme attendue : fond de l'écran de démarrage non posé.`);
    process.exit(1);
  }
  writeFileSync(STYLES, styles);
}
console.log(`écran de démarrage Android 12+ : fond ${CREME}`);
