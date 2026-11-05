import type { MetadataRoute } from "next";

import { GUIDES, PAGES_LEGALES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const derniere = [...GUIDES].map((g) => g.maj).sort().at(-1)!;
  return [
    { url: SITE_URL, lastModified: derniere, changeFrequency: "weekly", priority: 1 },
    ...GUIDES.map((g) => ({ url: `${SITE_URL}${g.chemin}`, lastModified: g.maj, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...PAGES_LEGALES.map((g) => ({ url: `${SITE_URL}${g.chemin}`, lastModified: g.maj, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
