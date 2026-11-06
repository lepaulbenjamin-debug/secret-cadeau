"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { supprimerGroupe, type Suppression } from "@/app/actions";

import { oublierLien } from "./memoire";

export function SupprimerGroupe({ jetonAdmin, nom }: { jetonAdmin: string; nom: string }) {
  const [etat, agir, enCours] = useActionState<Suppression | null, FormData>(supprimerGroupe.bind(null, jetonAdmin), null);
  const router = useRouter();

  useEffect(() => {
    if (!etat || "erreur" in etat) return;
    // Les liens gardés sur cet appareil mèneraient désormais à une page vide.
    for (const j of etat.jetons) {
      oublierLien("admin", j);
      oublierLien("perso", j);
    }
    router.replace("/?supprime=1");
  }, [etat, router]);

  return (
    <form action={agir} className="space-y-3">
      <p className="text-sm text-doux">
        Tout sera effacé définitivement : participants, listes d&apos;envies, tirage, questions et rappels. Les liens de chacun
        ne mèneront plus nulle part.
      </p>
      <div>
        <label className="etiquette" htmlFor="confirmation">
          Pour confirmer, tapez le nom du groupe : <span className="font-normal">« {nom} »</span>
        </label>
        <input id="confirmation" name="confirmation" className="champ" autoComplete="off" required />
      </div>
      <button type="submit" disabled={enCours} className="bouton bouton-cerise w-full">
        <Trash2 size={16} aria-hidden /> {enCours ? "Suppression…" : "Supprimer définitivement le groupe"}
      </button>
      {etat && "erreur" in etat && <p role="alert" className="text-sm font-medium text-cerise">{etat.erreur}</p>}
    </form>
  );
}
