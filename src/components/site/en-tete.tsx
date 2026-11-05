import { Gift } from "lucide-react";
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
        <Link href="/" className="flex items-center gap-2 text-cerise">
          <Gift size={24} aria-hidden />
          <span className="font-titre text-lg font-semibold">Qui Offre</span>
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
