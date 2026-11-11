import { UserRound } from "lucide-react";
import Link from "next/link";

const MENU = [
  { href: "/secret-santa", libelle: "Le Secret Santa" },
  { href: "/idees-cadeaux-secret-santa", libelle: "Idées cadeaux" },
  { href: "/faq", libelle: "FAQ" },
];

export function EnTeteSite() {
  return (
    <header className="border-b border-trait">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" aria-label="Qui Offre, accueil" className="shrink-0">
          {/* Le texte du logo est bleu marine : illisible sur fond sombre, d'où une seconde version. */}
          <picture>
            <source srcSet="/logo-sombre.png" media="(prefers-color-scheme: dark)" />
            <img src="/logo-clair.png" alt="Qui Offre" width={99} height={44} className="h-11 w-auto" />
          </picture>
        </Link>
        <nav aria-label="Menu principal" className="ml-auto hidden items-center gap-5 text-sm font-medium sm:flex">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="hover:text-sapin">{m.libelle}</Link>
          ))}
        </nav>
        {/* Un simple lien : l'en-tête reste statique (pages du site pré-rendues). /compte renvoie vers la connexion au besoin. */}
        <Link href="/compte" className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium hover:text-sapin sm:ml-0" aria-label="Mon espace">
          <UserRound size={18} aria-hidden /> <span className="hidden sm:inline">Mon espace</span>
        </Link>
        <Link href="/nouveau" className="bouton bouton-cerise !min-h-9 text-sm">Organiser</Link>
      </div>
    </header>
  );
}
