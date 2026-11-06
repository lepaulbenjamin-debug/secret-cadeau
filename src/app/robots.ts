import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Tout le site public est ouvert, y compris aux robots des assistants d'IA
 * (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) : être cité par eux est
 * un objectif, pas un risque. Les espaces privés ne le sont pour personne.
 */
const PRIVE = ["/p/", "/g/", "/rejoindre/", "/api/", "/nouveau", "/liste/", "/ma-liste/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVE }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
