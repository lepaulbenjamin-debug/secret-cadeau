import type { Metadata } from "next";

import { Article } from "@/components/site/article";
import { affiliationActive, MENTION_AMAZON } from "@/lib/affiliation";
import { EDITEUR } from "@/lib/editeur";
import { guide } from "@/lib/guides";

const page = guide("/mentions-legales");

export const metadata: Metadata = {
  title: page.titre,
  description: page.description,
  alternates: { canonical: page.chemin },
};

export default function MentionsLegales() {
  return (
    <Article page={page} resume={<p>Qui édite le site Qui Offre, qui l&apos;héberge, et comment nous contacter.</p>}>
      <h2>Éditeur</h2>
      <p>
        {EDITEUR.nom}, {EDITEUR.forme}
        <br />
        {EDITEUR.adresse}
        <br />
        {EDITEUR.siren}
        <br />
        {EDITEUR.tva}
        <br />
        Téléphone : {EDITEUR.telephone}
        <br />
        Contact : <a href={`mailto:${EDITEUR.contact}`}>{EDITEUR.contact}</a>
      </p>
      <p>Directeur de la publication : {EDITEUR.directeurPublication}</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com). Les
        pages sont servies depuis la région de Paris.
      </p>
      <p>La base de données est hébergée par Neon (neon.tech), dans la région de Francfort (Union européenne).</p>

      {affiliationActive() && (
        <>
          <h2>Liens d&apos;affiliation</h2>
          <p>
            {MENTION_AMAZON} Les liens Amazon ajoutés aux listes d&apos;envies peuvent porter notre identifiant Partenaires ;
            cela ne change rien au prix payé.
          </p>
        </>
      )}

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, l&apos;interface et le logo de Qui Offre sont protégés. Les listes d&apos;envies et les messages appartiennent à
        celles et ceux qui les écrivent.
      </p>
    </Article>
  );
}
