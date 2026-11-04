import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { FormulaireCreation } from "@/components/formulaire-creation";

export const metadata = { title: "Nouveau groupe" };

export default function Nouveau() {
  return (
    <main className="pt-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-doux"><ArrowLeft size={16} /> Accueil</Link>
      <h1 className="mt-4 font-titre text-3xl font-bold">Nouveau groupe</h1>
      <p className="mt-1 text-doux">Deux minutes, pas de compte à créer.</p>
      <div className="carte mt-6">
        <FormulaireCreation />
      </div>
    </main>
  );
}
