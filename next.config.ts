import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les liens personnels et d'organisateur ne doivent jamais être indexés.
  async headers() {
    return ["/p", "/g", "/rejoindre", "/liste", "/ma-liste"].map((prefixe) => ({
      source: `${prefixe}/:path*`,
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        // Un lien cliqué depuis une liste de cadeaux ne doit pas emporter le jeton dans le Referer.
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }));
  },
};

export default nextConfig;
