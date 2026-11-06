import assert from "node:assert/strict";
import { test } from "node:test";

import { fixerLaVersion, lireGradle } from "./android-gradle.mjs";

const GABARIT = `android {
    defaultConfig {
        applicationId "fr.quioffre.app"
        minSdkVersion rootProject.ext.minSdkVersion
        versionCode 1
        versionName "1.0"
    }
}`;

test("lecture du gabarit", () => {
  assert.deepEqual(lireGradle(GABARIT), { applicationId: "fr.quioffre.app", versionCode: 1, versionName: "1.0" });
});

test("réglage de la version", () => {
  const t = fixerLaVersion(GABARIT, 42, "1.2");
  assert.deepEqual(lireGradle(t), { applicationId: "fr.quioffre.app", versionCode: 42, versionName: "1.2" });
  assert.equal(lireGradle(fixerLaVersion(GABARIT, 7)).versionName, "1.0");
  assert.equal(fixerLaVersion("rien", 3), null);
});
