
import { FormulaireCreation } from "@/components/formulaire-creation";
import { LienRetour } from "@/components/lien-retour";

export const metadata = { title: "Nouveau groupe" };

export default function Nouveau() {
  return (
    <main className="pt-6">
      <LienRetour />
      <h1 className="mt-4 font-titre text-3xl font-bold">Nouveau groupe</h1>
      <p className="mt-1 text-doux">Deux minutes, pas de compte à créer.</p>
      <div className="carte mt-6">
        <FormulaireCreation />
      </div>
    </main>
  );
}
