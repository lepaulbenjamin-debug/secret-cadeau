/**
 * Les visuels de la fiche Play Store, dans store/play/ :
 *   icone-512.png            l'icône de la fiche (512×512)
 *   banniere-1024x500.png    l'image de présentation (1024×500)
 *   capture-1…6.png          captures téléphone (1080×1920, 9:16)
 *
 *     DATABASE_URL=… BASE=http://localhost:3100 NODE_PATH=$(npm root -g) node scripts/visuels-play.mjs
 *
 * Il faut l'application lancée (`npm run build:local && npx next start -p 3100`)
 * sur une base de DÉVELOPPEMENT : le script y crée un groupe et une liste de
 * démonstration, les photographie, puis les supprime. Jamais sur la production.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");
const sharp = require("sharp");

const BASE = process.env.BASE ?? "http://localhost:3100";
const SORTIE = "store/play";
if (/neon\.tech|vercel/.test(process.env.DATABASE_URL ?? "")) {
  console.error("✗ Ce script crée des données de démonstration : jamais sur la base de production.");
  process.exit(1);
}
mkdirSync(SORTIE, { recursive: true });

// 1. L'icône de la fiche.
await sharp("public/icone-1024.png").resize(512).png().toFile(`${SORTIE}/icone-512.png`);

const db = new PrismaClient();
const t = Date.now();
const j = (p) => `${p}${t}`;

// 2. Les données de démonstration : un Noël en famille tiré, et une liste d'anniversaire.
const groupe = await db.groupe.create({
  data: {
    nom: "Noël en famille",
    dateEchange: new Date(Date.now() + 18 * 86400000),
    budget: 30,
    message: "Rendez-vous chez Mamie le 24 au soir !",
    jetonAdmin: j("demo-adm"),
    jetonInvitation: j("demo-inv"),
    participants: {
      create: ["Camille", "Léa", "Tom", "Mamie Jo", "Paul", "Zoé"].map((prenom, i) => ({
        prenom,
        jeton: j(`demo-p${i}`),
        nomDeCode: ["Pingouin Farceur 🐧", "Licorne Rêveuse 🦄", "Renne Grognon 🦌", "Loutre Câline 🦦", "Hibou Masqué 🦉", "Fée Pétillante 🧚"][i],
        ouvertLe: i < 4 ? new Date() : null,
      })),
    },
  },
  include: { participants: true },
});
const p = Object.fromEntries(groupe.participants.map((x) => [x.prenom, x]));
const cycle = ["Camille", "Mamie Jo", "Tom", "Léa", "Zoé", "Paul"];
for (let i = 0; i < cycle.length; i++) {
  await db.participant.update({ where: { id: p[cycle[i]].id }, data: { destinataireId: p[cycle[(i + 1) % cycle.length]].id } });
}
await db.groupe.update({ where: { id: groupe.id }, data: { tirageLe: new Date() } });
const idees = [
  ["Mamie Jo", "Un plaid tout doux", 35, "Couleur crème ou vert sapin"],
  ["Mamie Jo", "Un puzzle de 1000 pièces", 20, "Paysages de montagne"],
  ["Mamie Jo", "Un livre de recettes italiennes", 25, ""],
  ["Camille", "Des gants tactiles", 15, "Taille M"],
];
for (const [qui, titre, prix, note] of idees) await db.souhait.create({ data: { participantId: p[qui].id, titre, prix, note } });
const livre = await db.souhait.findFirst({ where: { participantId: p["Mamie Jo"].id, titre: { contains: "recettes" } } });
await db.souhait.update({ where: { id: livre.id }, data: { reserveParId: p["Tom"].id } });
await db.question.create({ data: { pereId: p["Camille"].id, destinataireId: p["Mamie Jo"].id, texte: "Tu préfères le thé ou le café ?", reponse: "Le thé, sans hésiter !" } });

const liste = await db.liste.create({
  data: {
    prenom: "Léa",
    date: new Date(Date.now() + 40 * 86400000),
    message: "Merci d'avance ! Toutes les idées sont des suggestions 😊",
    jetonProprio: j("demo-lp"),
    jetonPartage: j("demo-ls"),
    idees: {
      create: [
        { titre: "Un casque sans fil", prix: 60, note: "Noir ou bleu nuit" },
        { titre: "Le tome 3 de ma saga préférée", prix: 18, note: "Format poche" },
        { titre: "Une plante pour mon bureau", prix: 25, reservePar: "Tom", jetonReserve: "demo-appareil-tom-000000" },
        { titre: "Un cours de poterie", prix: 45, note: "Le samedi matin" },
      ],
    },
  },
});

// 3. Les captures, au format téléphone 9:16.
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "fr-FR" });
const page = await ctx.newPage();
const capture = async (n, chemin, avant) => {
  await page.goto(`${BASE}${chemin}`, { waitUntil: "networkidle" });
  if (avant) await avant();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SORTIE}/capture-${n}.png` });
  console.log(`capture-${n}.png — ${chemin}`);
};
await capture(1, "/");
await capture(2, `/p/${p["Camille"].jeton}`, async () => {
  await page.click("text=Touchez pour découvrir");
  await page.locator("text=Vous offrez à").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -120));
});
await capture(3, `/p/${p["Camille"].jeton}`, async () => {
  await page.click("text=Touchez pour découvrir");
  const titre = page.locator("h2:has-text('Lui poser une question')");
  await titre.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 24));
});
await capture(4, `/g/${groupe.jetonAdmin}`);
await capture(5, `/liste/${liste.jetonPartage}`);
// ⚠️ Pas de page avec un champ date : Chromium sans interface l'affiche au format américain.
await capture(6, "/", async () => {
  const bloc = page.locator("h2:has-text('Pingouin Farceur')");
  await bloc.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 80));
});

// 4. La bannière, dessinée en HTML aux couleurs de la marque.
const banniere = await nav.newPage({ viewport: { width: 1024, height: 500 } });
const logo = (await sharp("public/logo-grand.png").png().toBuffer()).toString("base64");
await banniere.setContent(`<!doctype html><html><head><style>
  body{margin:0;width:1024px;height:500px;background:#faf6f0;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif;color:#2b2a66;border-bottom:18px solid #fc5a53;box-sizing:border-box}
  .b{display:flex;flex-direction:column;align-items:center;gap:22px}
  img{width:470px} p{margin:0;font-size:38px;font-weight:700;font-family:Georgia,serif} small{font-size:24px;color:#cc3a33}
</style></head><body><div class="b"><img src="data:image/png;base64,${logo}"><p>Le Secret Santa sans prise de tête</p><small>Tirage au sort · Listes de cadeaux · Gratuit, sans compte</small></div></body></html>`);
await banniere.screenshot({ path: `${SORTIE}/banniere-1024x500.png` });
await nav.close();

// 5. Ménage.
await db.groupe.delete({ where: { id: groupe.id } });
await db.liste.delete({ where: { id: liste.id } });
await db.$disconnect();
console.log(`✓ Visuels dans ${SORTIE}/`);
