import { EnTeteSite } from "@/components/site/en-tete";
import { PiedDeSite } from "@/components/site/pied";

/** Les pages publiques (accueil, guides) : un en-tête, une colonne de lecture, un pied de page riche en liens. */
export default function MiseEnPageSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EnTeteSite />
      {children}
      <PiedDeSite />
    </>
  );
}
