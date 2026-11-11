import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les liens personnels et d'organisateur ne doivent jamais être indexés.
  async headers() {
    // Le service worker ne doit jamais rester en cache : une nouvelle version doit être prise aussitôt.
    const serviceWorker = {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    };
    return [serviceWorker, ...["/p", "/g", "/rejoindre", "/liste", "/ma-liste", "/compte", "/connexion"].map((prefixe) => ({
      source: `${prefixe}/:path*`,
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        // Un lien cliqué depuis une liste de cadeaux ne doit pas emporter le jeton dans le Referer.
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }))];
  },
};

export default nextConfig;
