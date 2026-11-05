import { CalendarDays, Gift, Users, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormulaireRejoindre } from "@/components/formulaire-rejoindre";
import { compteARebours, dateLongue } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Rejoindre un groupe", robots: { index: false, follow: false } };

export default async function Rejoindre({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const groupe = await prisma.groupe.findUnique({
    where: { jetonInvitation: jeton },
    // Les prénoms seulement : ni jetons ni coordonnées des autres sur une page ouverte à quiconque a le lien.
    include: { participants: { select: { prenom: true }, orderBy: { prenom: "asc" } } },
  });
  if (!groupe) notFound();

  const rebours = groupe.dateEchange ? compteARebours(groupe.dateEchange) : null;

  return (
    <main className="space-y-6 pt-10">
      <div className="text-center">
        <Gift size={44} className="mx-auto text-cerise" />
        <p className="mt-3 text-doux">Vous êtes invité·e à</p>
        <h1 className="font-titre text-3xl font-bold">{groupe.nom}</h1>
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-doux">
          {groupe.dateEchange && (
            <span className="inline-flex items-center gap-1"><CalendarDays size={15} /> {dateLongue(groupe.dateEchange)}{rebours && ` · ${rebours}`}</span>
          )}
          {groupe.budget && <span className="inline-flex items-center gap-1"><Wallet size={15} /> {groupe.budget} € environ</span>}
        </div>
        {groupe.message && <p className="carte mt-4 !py-3 text-sm italic">« {groupe.message} »</p>}
      </div>

      {groupe.tirageLe ? (
        <div className="carte text-center">
          <p className="font-semibold">Le tirage a déjà eu lieu.</p>
          <p className="mt-1 text-sm text-doux">Pour participer, demandez à l&apos;organisateur de vous ajouter et de relancer le tirage.</p>
        </div>
      ) : (
        <div className="carte">
          <FormulaireRejoindre jetonInvitation={jeton} />
        </div>
      )}

      {groupe.nomsDeCode && (
        <p className="carte text-center text-sm">
          🕵️ <strong>Mode mystère</strong> : vous recevrez un nom de code marrant, et vous offrirez à un nom de code sans
          savoir qui c&apos;est. Pensez à remplir votre liste, c&apos;est obligatoire !
        </p>
      )}
      {groupe.participants.length > 0 && (
        <p className="flex items-start justify-center gap-1.5 text-center text-sm text-doux">
          <Users size={15} className="mt-0.5 shrink-0" />
          {groupe.nomsDeCode
            ? `Déjà ${groupe.participants.length} inscrit${groupe.participants.length > 1 ? "s" : ""}`
            : `Déjà inscrits : ${groupe.participants.map((p) => p.prenom).join(", ")}`}
        </p>
      )}
      <p className="text-center text-sm"><Link href="/" className="text-doux underline">Qu&apos;est-ce que Qui Offre ?</Link></p>
    </main>
  );
}
