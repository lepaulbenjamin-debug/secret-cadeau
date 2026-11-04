"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { creerGroupe, type GroupeCree } from "@/app/actions";

import { garderLien } from "./memoire";

export function FormulaireCreation() {
  const [etat, agir, enCours] = useActionState<GroupeCree | null, FormData>(creerGroupe, null);
  const router = useRouter();

  useEffect(() => {
    if (!etat || "erreur" in etat) return;
    garderLien({ type: "admin", jeton: etat.jetonAdmin, groupe: etat.nom });
    if (etat.jetonPerso) garderLien({ type: "perso", jeton: etat.jetonPerso, groupe: etat.nom });
    router.push(`/g/${etat.jetonAdmin}?nouveau=1`);
  }, [etat, router]);

  return (
    <form action={agir} className="space-y-5">
      <div>
        <label className="etiquette" htmlFor="nom">Nom du groupe</label>
        <input id="nom" name="nom" className="champ" placeholder="Noël en famille 2026" required maxLength={80} />
      </div>

      <div>
        <label className="etiquette" htmlFor="organisateur">Votre prénom</label>
        <input id="organisateur" name="organisateur" className="champ" placeholder="Camille" maxLength={40} autoComplete="given-name" />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="participe" defaultChecked className="size-4 accent-[var(--sapin)]" />
          Je participe aussi au tirage
        </label>
      </div>

      <div>
        <label className="etiquette" htmlFor="participants">Les autres participants</label>
        <textarea id="participants" name="participants" rows={6} className="champ" placeholder={"Un prénom par ligne\nLéa\nTom\nMamie Jo"} />
        <p className="mt-1 text-sm text-doux">Au moins trois personnes en tout. Vous pourrez en ajouter ensuite.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="etiquette" htmlFor="date">Date de l&apos;échange</label>
          <input id="date" name="date" type="date" className="champ" />
        </div>
        <div>
          <label className="etiquette" htmlFor="budget">Budget (€)</label>
          <input id="budget" name="budget" inputMode="numeric" className="champ" placeholder="30" />
        </div>
      </div>

      <div>
        <label className="etiquette" htmlFor="message">Un mot pour le groupe <span className="font-normal text-doux">(facultatif)</span></label>
        <textarea id="message" name="message" rows={2} className="champ" maxLength={500} placeholder="Rendez-vous chez Mamie le 24 au soir !" />
      </div>

      <button type="submit" className="bouton w-full" disabled={enCours}>
        {enCours ? "Création…" : "Créer le groupe"}
      </button>
      {etat && "erreur" in etat && <p role="alert" className="text-sm font-medium text-cerise">{etat.erreur}</p>}
    </form>
  );
}
