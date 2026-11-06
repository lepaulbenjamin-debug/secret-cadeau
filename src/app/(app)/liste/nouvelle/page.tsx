import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FormulaireListe } from "@/components/formulaire-liste";

export const metadata: Metadata = {
  title: "Créer une liste de cadeaux",
  description: "Créez votre liste de cadeaux d'anniversaire en 30 secondes, partagez-la, et vos proches réservent sans doublon. Gratuit, sans compte.",
};

export default function NouvelleListe() {
  return (
    <main className="pt-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-doux"><ArrowLeft size={16} /> Accueil</Link>
      <h1 className="mt-4 font-titre text-3xl font-bold">Créer une liste de cadeaux</h1>
      <p className="mt-1 text-doux">Anniversaire, naissance, mariage… Vos proches réservent, vous gardez la surprise.</p>
      <div className="carte mt-6">
        <FormulaireListe />
      </div>
    </main>
  );
}
