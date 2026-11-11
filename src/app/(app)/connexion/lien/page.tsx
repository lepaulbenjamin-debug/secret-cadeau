import type { Metadata } from "next";

import { connexionParLien } from "@/app/actions-compte";
import { Formulaire } from "@/components/formulaire";
import { suiteSure } from "@/lib/compte/secret";

export const metadata: Metadata = { title: "Se connecter", robots: { index: false, follow: false } };

/**
 * ⚠️ UN BOUTON, PAS UNE CONNEXION À L'OUVERTURE : les messageries ouvrent les
 * liens des e-mails pour les analyser, ce qui consommerait le lien avant vous.
 */
export default async function LienConnexion({ searchParams }: { searchParams: Promise<{ j?: string; suite?: string }> }) {
  const { j = "", suite } = await searchParams;
  return (
    <main className="pt-10">
      <h1 className="font-titre text-3xl font-bold">Se connecter à Qui Offre</h1>
      <p className="mt-1 text-doux">Un dernier geste pour ouvrir votre espace sur cet appareil.</p>
      <div className="carte mt-6">
        <Formulaire action={connexionParLien} bouton="Me connecter">
          <input type="hidden" name="j" value={j} />
          <input type="hidden" name="suite" value={suiteSure(suite)} />
        </Formulaire>
      </div>
    </main>
  );
}
