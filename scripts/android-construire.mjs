/**
 * Construit et signe le bundle Android (`.aab`) pour le Play Store, sans Android
 * Studio. Lancé par `.github/workflows/android.yml` ; utilisable sur toute
 * machine qui a Node, Java 21 et le SDK Android.
 *
 *     node scripts/android-construire.mjs
 *
 * Même chemin que Petsitia, sans Firebase (Qui Offre n'envoie pas de
 * notifications natives) :
 *   1. `android/` n'est pas versionné : regénéré s'il manque ;
 *   2. logo, fond d'icône et écran de démarrage posés (android-marque.mjs) ;
 *   3. numéro de version réglé — Google Play refuse un `versionCode` qui ne monte pas ;
 *   4. identifiant contrôlé — se tromper publierait une SECONDE application ;
 *   5. bundle construit, signé avec `jarsigner`, vérifié.
 *
 * ⚠️ Les mots de passe ne passent jamais sur la ligne de commande (elle finit
 * dans les journaux) : `jarsigner` les lit dans l'environnement.
 *
 * Variables :
 *   ANDROID_KEYSTORE_FILE      chemin du magasin de clés (.p12)     obligatoire
 *   ANDROID_KEYSTORE_PASSWORD  son mot de passe                     obligatoire
 *   ANDROID_KEY_ALIAS          alias de la clé (défaut : quioffre)
 *   ANDROID_VERSION_CODE       numéro de version, entier ≥ 1        obligatoire
 *   ANDROID_VERSION_NAME       texte affiché (défaut : 1.0)
 *   ANDROID_SORTIE             dossier du bundle (défaut : sortie-android)
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";

import { IDENTIFIANT, fixerLaVersion, lireGradle } from "./android-gradle.mjs";

const GRADLE = "android/app/build.gradle";

function echec(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function lancer(commande, args, options = {}) {
  console.log(`\n$ ${commande} ${args.join(" ")}`);
  execFileSync(commande, args, { stdio: "inherit", ...options });
}

const env = process.env;
const cle = env.ANDROID_KEYSTORE_FILE;
const alias = env.ANDROID_KEY_ALIAS || "quioffre";
const sortie = env.ANDROID_SORTIE || "sortie-android";
const code = Number(env.ANDROID_VERSION_CODE);

if (!cle || !existsSync(cle) || statSync(cle).size === 0) {
  echec("ANDROID_KEYSTORE_FILE : la clé de téléversement est absente ou vide (secret ANDROID_KEYSTORE_BASE64 non renseigné ?).");
}
if (!env.ANDROID_KEYSTORE_PASSWORD) echec("ANDROID_KEYSTORE_PASSWORD est vide.");
if (!Number.isInteger(code) || code < 1) echec("ANDROID_VERSION_CODE doit être un entier supérieur ou égal à 1.");

// 1. Le projet natif.
if (!existsSync("android")) lancer("npx", ["cap", "add", "android"]);

// 2. Le visage de l'application.
lancer("node", ["scripts/android-marque.mjs"]);

// 3. La version.
const regle = fixerLaVersion(readFileSync(GRADLE, "utf8"), code, env.ANDROID_VERSION_NAME || "1.0");
if (regle === null) echec(`${GRADLE} n'a pas la forme attendue : impossible de régler la version.`);
writeFileSync(GRADLE, regle);

// 4. L'identité : contrôlée AVANT de construire.
const { applicationId } = lireGradle(readFileSync(GRADLE, "utf8"));
if (applicationId !== IDENTIFIANT) echec(`applicationId vaut « ${applicationId} » au lieu de « ${IDENTIFIANT} ». Rien n'est construit.`);

lancer("npx", ["cap", "sync", "android"]);

// 5. Le bundle, non signé…
lancer("./gradlew", ["bundleRelease", "--no-daemon", "--stacktrace"], { cwd: "android" });
const brut = "android/app/build/outputs/bundle/release/app-release.aab";
if (!existsSync(brut)) echec(`${brut} introuvable après la construction.`);

// … puis signé. Un .aab se signe avec jarsigner, pas avec apksigner.
const final = `${sortie}/quioffre-${code}.aab`;
mkdirSync(sortie, { recursive: true });
copyFileSync(brut, final);
lancer("jarsigner", [
  "-keystore", cle,
  "-storetype", "pkcs12",
  "-storepass:env", "ANDROID_KEYSTORE_PASSWORD",
  "-sigalg", "SHA256withRSA",
  "-digestalg", "SHA-256",
  final,
  alias,
]);
lancer("jarsigner", ["-verify", final]);

const v = lireGradle(readFileSync(GRADLE, "utf8"));
console.log(`\n✓ ${final} — ${v.applicationId}, versionCode ${v.versionCode}, versionName ${v.versionName}`);
