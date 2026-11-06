/** Lecture et réglage de `android/app/build.gradle`, sans dépendance (testé dans android-gradle.test.mjs). */

export const IDENTIFIANT = "fr.quioffre.app";

export function lireGradle(texte) {
  return {
    applicationId: texte.match(/applicationId\s+"([^"]+)"/)?.[1] ?? null,
    versionCode: Number(texte.match(/versionCode\s+(\d+)/)?.[1] ?? NaN),
    versionName: texte.match(/versionName\s+"([^"]*)"/)?.[1] ?? null,
  };
}

/** Règle le numéro de version. `null` si le fichier n'a pas la forme attendue. */
export function fixerLaVersion(texte, code, nom) {
  if (!/versionCode\s+\d+/.test(texte) || !/versionName\s+"[^"]*"/.test(texte)) return null;
  let t = texte.replace(/versionCode\s+\d+/, `versionCode ${code}`);
  if (nom) t = t.replace(/versionName\s+"[^"]*"/, `versionName "${nom.replace(/"/g, "")}"`);
  return t;
}
