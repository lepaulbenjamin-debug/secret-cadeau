import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { dateLongue } from "@/lib/format";
import type { PageSite } from "@/lib/guides";
import { NOM_SITE, SITE_URL } from "@/lib/site";

import { JsonLd } from "./json-ld";

/**
 * La mise en page d'un guide : fil d'Ariane, titre, résumé, date de mise à
 * jour, puis le contenu.
 *
 * Pour le référencement par les moteurs d'IA (GEO), le `resume` doit répondre
 * à la question de la page en deux ou trois phrases autonomes : c'est le
 * passage qu'un assistant citera. La date visible et `dateModified` disent
 * que le contenu est entretenu.
 */
export function Article({ page, resume, children }: { page: PageSite; resume: React.ReactNode; children: React.ReactNode }) {
  const url = `${SITE_URL}${page.chemin}`;
  return (
    <main className="mx-auto max-w-3xl px-4 pt-6">
      <JsonLd
        donnees={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: page.titre,
              description: page.description,
              url,
              mainEntityOfPage: url,
              inLanguage: "fr-FR",
              dateModified: page.maj,
              datePublished: page.maj,
              author: { "@type": "Organization", name: NOM_SITE, url: SITE_URL },
              publisher: { "@type": "Organization", name: NOM_SITE, url: SITE_URL, logo: `${SITE_URL}/icone-512.png` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: page.court, item: url },
              ],
            },
          ],
        }}
      />
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm text-doux">
        <Link href="/" className="hover:text-encre">Accueil</Link>
        <ChevronRight size={14} aria-hidden />
        <span>{page.court}</span>
      </nav>
      <article className="prose-qo mt-4">
        <h1>{page.titre}</h1>
        <div className="resume">{resume}</div>
        <p className="text-sm text-doux">
          Mis à jour le <time dateTime={page.maj}>{dateLongue(new Date(`${page.maj}T12:00:00Z`))}</time>
        </p>
        {children}
      </article>
    </main>
  );
}

/** L'encart « Organiser un tirage », à placer une ou deux fois par guide. */
export function AppelAction({
  titre = "Prêt à organiser votre tirage ?",
  texte,
  href = "/nouveau",
  bouton = "Créer mon groupe",
}: {
  titre?: string;
  texte?: string;
  href?: string;
  bouton?: string;
}) {
  return (
    <aside className="not-prose my-8 rounded-2xl bg-sapin p-6 text-center text-carte">
      <p className="font-titre text-xl font-semibold">{titre}</p>
      <p className="mt-1 text-sm opacity-90">
        {texte ?? "Tirage au sort, exclusions, listes d'envies et rappels : c'est gratuit et sans compte."}
      </p>
      <Link href={href} className="bouton bouton-cerise mt-4">{bouton}</Link>
    </aside>
  );
}
