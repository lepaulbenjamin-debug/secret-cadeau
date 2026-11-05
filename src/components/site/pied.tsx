import Link from "next/link";

import { GUIDES, PAGES_LEGALES } from "@/lib/guides";

export function PiedDeSite() {
  return (
    <footer className="mt-16 border-t border-trait">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-titre text-lg font-semibold">Qui Offre</p>
          <p className="mt-2 text-doux">
            Tirage au sort du Père Noël secret et listes de cadeaux partagées. Gratuit, sans compte, sur téléphone et
            ordinateur.
          </p>
          <Link href="/nouveau" className="mt-3 inline-block font-semibold text-sapin underline">Organiser un tirage</Link>
        </div>
        <nav aria-label="Guides">
          <p className="font-semibold">Guides</p>
          <ul className="mt-2 space-y-1.5">
            {GUIDES.map((g) => (
              <li key={g.chemin}><Link href={g.chemin} className="text-doux hover:text-encre">{g.court}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informations">
          <p className="font-semibold">Informations</p>
          <ul className="mt-2 space-y-1.5">
            {PAGES_LEGALES.map((g) => (
              <li key={g.chemin}><Link href={g.chemin} className="text-doux hover:text-encre">{g.court}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
