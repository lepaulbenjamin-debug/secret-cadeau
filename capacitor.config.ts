import type { CapacitorConfig } from "@capacitor/cli";

/**
 * La coquille native (App Store / Play Store).
 *
 * Elle CHARGE le site en ligne au lieu de l'embarquer : les pages sont rendues
 * côté serveur avec la base derrière, il n'y a rien à exporter en statique.
 * Même choix que Petsitia. Le dossier `coquille/` ne sert qu'à l'écran affiché
 * quand le site est injoignable au lancement.
 *
 * ⚠️ `appId` ne change plus jamais une fois publié : c'est l'identité de
 * l'application sur les deux stores.
 */
const HOTE = process.env.HOTE_PUBLIC ?? "secret-cadeau.vercel.app";

const config: CapacitorConfig = {
  appId: "fr.secretcadeau.app",
  appName: "Secret Cadeau",
  webDir: "coquille",
  server: {
    url: `https://${HOTE}/`,
    // Sans quoi la première navigation hors de `url` partirait dans Safari / Chrome.
    allowNavigation: [HOTE],
    hostname: HOTE,
    androidScheme: "https",
    cleartext: false,
  },
  ios: { backgroundColor: "#f8f2e7" },
  android: { backgroundColor: "#f8f2e7" },
};

export default config;
