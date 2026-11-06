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
        <Link href="/nouveau" className="bouton bouton-cerise ml-auto !min-h-9 text-sm sm:ml-0">Organiser</Link>
      </div>
    </header>
  );
}
