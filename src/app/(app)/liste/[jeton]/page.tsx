import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IdeesPartagees } from "@/components/idees-partagees";
import { SeSouvenir } from "@/components/se-souvenir";
import { lienAffiche } from "@/lib/affiliation";
import { compteARebours, dateLongue, domaine } from "@/lib/format";
import { titreListe } from "@/lib/occasions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Liste de cadeaux", robots: { index: false, follow: false } };

export default async function ListePartagee({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const liste = await prisma.liste.findUnique({
    where: { jetonPartage: jeton },
    // ⚠️ Jamais `jetonReserve` (il permet d'annuler) ni `jetonProprio` vers le navigateur.
    include: {
      idees: {
        orderBy: { creeLe: "asc" },
        select: { id: true, titre: true, lien: true, image: true, prix: true, note: true, reservePar: true },
      },
    },
  });
  if (!liste) notFound();

  const titre = titreListe(liste);
  const rebours = liste.date ? compteARebours(liste.date) : null;
  const idees = liste.idees.map((i) => {
    const l = i.lien ? lienAffiche(i.lien) : { url: "", affilie: false };
    return { id: i.id, titre: i.titre, url: l.url, affilie: l.affilie, domaine: i.lien ? domaine(i.lien) : "", image: i.image, prix: i.prix, note: i.note, reservePar: i.reservePar };
  });
  const libres = idees.filter((i) => !i.reservePar).length;

  return (
    <main className="space-y-6 pt-6">
      <SeSouvenir type="liste" jeton={jeton} groupe={titre} prenom={liste.prenom} />
      <header className="text-center">
        <h1 className="mt-6 font-titre text-3xl font-bold">{titre}</h1>
        {liste.date && (
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-doux">
            <CalendarDays size={15} /> {dateLongue(liste.date)}{rebours && ` · ${rebours}`}
          </p>
        )}
        {liste.message && <p className="carte mt-4 !py-3 text-sm italic">« {liste.message} »</p>}
      </header>

      <section className="carte">
        <h2 className="font-titre text-xl font-semibold">Ses idées de cadeaux</h2>
        <p className="mt-1 mb-2 text-sm text-doux">
          {idees.length === 0
            ? `${liste.prenom} n'a pas encore ajouté d'idée. Revenez bientôt !`
            : `Touchez « Je m'en occupe » sur le cadeau que vous offrez : ${liste.prenom} ne le saura pas, et les autres éviteront le doublon.`}
        </p>
        {idees.length > 0 && <IdeesPartagees jetonPartage={jeton} idees={idees} />}
        {idees.length > 0 && libres === 0 && <p className="mt-3 text-sm font-medium text-sapin">Toutes les idées sont réservées 🎉</p>}
      </section>

      <aside className="carte text-center">
        <p className="font-semibold">Vous aussi, un anniversaire approche ?</p>
        <Link href="/liste/nouvelle" className="bouton bouton-discret mt-3">Créer ma liste de cadeaux</Link>
      </aside>
    </main>
  );
}
