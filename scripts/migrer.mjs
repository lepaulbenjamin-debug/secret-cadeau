/**
 * Les migrations, au déploiement — jamais depuis un aperçu.
 *
 * Vercel construit chaque branche poussée (« aperçu ») avec la même commande
 * que la production. Si un aperçu migrait, une branche pas encore relue
 * pourrait modifier la vraie base. Un aperçu ne migre donc que SA base
 * (`DATABASE_URL_APERCU`), et rien s'il n'en a pas.
 */
import { spawnSync } from "node:child_process";

const env = process.env.VERCEL_ENV;
let url = process.env.DATABASE_URL;

if (env === "preview") {
  url = process.env.DATABASE_URL_APERCU;
  if (!url) {
    console.log("Aperçu sans DATABASE_URL_APERCU : aucune migration.");
    process.exit(0);
  }
  if (url === process.env.DATABASE_URL) {
    console.error("DATABASE_URL_APERCU est la base de production : refusé.");
    process.exit(1);
  }
}

const r = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});
process.exit(r.status ?? 1);
