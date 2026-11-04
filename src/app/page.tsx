import { EyeOff, Gift, ListChecks, MessageCircleQuestion, Shuffle } from "lucide-react";
import Link from "next/link";

import { MesGroupes } from "@/components/mes-groupes";

const POINTS = [
  { icone: Shuffle, titre: "Tirage au sort juste", texte: "Personne ne se tire soi-même, et les couples peuvent s'exclure." },
  { icone: EyeOff, titre: "Vraiment secret", texte: "Même l'organisateur ne sait pas qui offre à qui." },
  { icone: ListChecks, titre: "Listes de cadeaux", texte: "Chacun note ses envies ; on réserve une idée pour éviter les doublons." },
  { icone: MessageCircleQuestion, titre: "Questions anonymes", texte: "« Tu chausses du combien ? » — sans trahir le secret." },
];

export default function Accueil() {
  return (
    <main className="pt-10">
      <div className="flex items-center gap-2 text-cerise">
        <Gift size={28} />
        <span className="font-titre text-lg font-semibold">Secret Cadeau</span>
      </div>
      <h1 className="mt-6 font-titre text-4xl font-bold leading-tight">
        Le Père Noël secret,<br />sans prise de tête.
      </h1>
      <p className="mt-3 text-lg text-doux">
        Tirez au sort, partagez vos listes d&apos;envies, et laissez la magie faire le reste.
      </p>
      <Link href="/nouveau" className="bouton bouton-cerise mt-6 w-full text-lg">
        Organiser un Secret Cadeau
      </Link>
      <p className="mt-2 text-center text-sm text-doux">Vous avez reçu un lien ? Ouvrez-le simplement.</p>

      <MesGroupes />

      <ul className="mt-10 grid gap-3">
        {POINTS.map(({ icone: Icone, titre, texte }) => (
          <li key={titre} className="carte flex gap-3">
            <Icone className="mt-0.5 shrink-0 text-sapin" size={22} />
            <div>
              <h2 className="font-semibold">{titre}</h2>
              <p className="text-sm text-doux">{texte}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
