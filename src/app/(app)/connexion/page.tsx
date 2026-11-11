import { ArrowLeft, Laptop, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Connexion } from "@/components/connexion";
import { googleConfigure } from "@/lib/compte/google";
import { suiteSure } from "@/lib/compte/secret";
import { compteCourant } from "@/lib/compte/session";

export const metadata: Metadata = {
  title: "Se connecter",
  description: "Retrouvez vos groupes, vos listes et vos réservations sur tous vos appareils.",
  robots: { index: false, follow: false },
};

export default async function PageConnexion({ searchParams }: { searchParams: Promise<{ suite?: string; erreur?: string }> }) {
  const { suite: brut, erreur } = await searchParams;
  const suite = suiteSure(brut);
  if (await compteCourant()) redirect(suite);

  return (
    <main className="pt-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-doux"><ArrowLeft size={16} /> Accueil</Link>
      <h1 className="mt-4 font-titre text-3xl font-bold">Se connecter</h1>
      <p className="mt-1 text-doux">
        Facultatif : vos liens marchent sans compte. Connecté, vous retrouvez vos groupes, vos listes et vos réservations sur
        tous vos appareils.
      </p>
      {erreur === "google" && (
        <p role="alert" className="mt-4 text-sm font-medium text-cerise">La connexion avec Google n&apos;a pas abouti. Réessayez, ou recevez un lien par e-mail.</p>
      )}
      <div className="mt-6">
        <Connexion suite={suite} google={googleConfigure()} />
      </div>
      <div className="mt-6 space-y-2 text-sm text-doux">
        <p className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden /> Pas de mot de passe. Le compte se crée à la première connexion.</p>
        <p className="flex gap-2"><Laptop size={16} className="mt-0.5 shrink-0" aria-hidden /> Les groupes et listes où vous avez indiqué cette adresse apparaissent d&apos;eux-mêmes dans votre espace.</p>
      </div>
    </main>
  );
}
