"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { creerListe, type ListeCreee } from "@/app/actions-listes";
import { OCCASIONS, titreListe } from "@/lib/occasions";

import { garderLien } from "./memoire";

export function FormulaireListe() {
  const [etat, agir, enCours] = useActionState<ListeCreee | null, FormData>(creerListe, null);
  const router = useRouter();

  useEffect(() => {
    if (!etat || "erreur" in etat) return;
    const titre = titreListe(etat);
    garderLien({ type: "liste-proprio", jeton: etat.jetonProprio, jetonPartage: etat.jetonPartage, groupe: titre, prenom: etat.prenom });
    router.push(`/ma-liste/${etat.jetonProprio}?nouveau=1`);
  }, [etat, router]);

  return (
    <form action={agir} className="space-y-5">
      <div>
        <label className="etiquette" htmlFor="occasion">L&apos;occasion</label>
        <select id="occasion" name="occasion" className="champ" defaultValue="anniversaire">
          {Object.entries(OCCASIONS).map(([cle, o]) => (
            <option key={cle} value={cle}>{o.emoji} {o.libelle}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="etiquette" htmlFor="prenom">Le prénom de la personne fêtée</label>
        <input id="prenom" name="prenom" className="champ" required maxLength={40} placeholder="Léa (vous, ou votre enfant…)" />
      </div>
      <div>
        <label className="etiquette" htmlFor="date">La date <span className="font-normal text-doux">(facultatif)</span></label>
        <input id="date" name="date" type="date" className="champ" />
      </div>
      <div>
        <label className="etiquette" htmlFor="message">Un mot pour vos proches <span className="font-normal text-doux">(facultatif)</span></label>
        <textarea id="message" name="message" rows={2} className="champ" maxLength={500} placeholder="Merci d'avance ! Toutes les idées sont des suggestions 😊" />
      </div>
      <div>
        <label className="etiquette" htmlFor="email">Votre e-mail <span className="font-normal text-doux">(facultatif)</span></label>
        <input id="email" name="email" type="email" className="champ" maxLength={120} autoComplete="email" placeholder="lea@exemple.fr" />
        <p className="mt-1 text-sm text-doux">Pour recevoir vos deux liens et ne jamais les perdre. Visible de personne.</p>
      </div>
      <button type="submit" className="bouton bouton-cerise w-full" disabled={enCours}>
        {enCours ? "Création…" : "Créer ma liste"}
      </button>
      {etat && "erreur" in etat && <p role="alert" className="text-sm font-medium text-cerise">{etat.erreur}</p>}
    </form>
  );
}
