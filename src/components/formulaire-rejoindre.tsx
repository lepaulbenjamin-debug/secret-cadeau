"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useSyncExternalStore } from "react";

import { rejoindreGroupe, type Inscription } from "@/app/actions";

import { garderLien } from "./memoire";

const cle = (jetonInvitation: string) => `quioffre:rejoint:${jetonInvitation}`;

function lire(jetonInvitation: string): string | null {
  try {
    return localStorage.getItem(cle(jetonInvitation));
  } catch {
    return null;
  }
}

export function FormulaireRejoindre({ jetonInvitation }: { jetonInvitation: string }) {
  const [etat, agir, enCours] = useActionState<Inscription | null, FormData>(rejoindreGroupe.bind(null, jetonInvitation), null);
  const router = useRouter();
  const [autre, setAutre] = useState(false);
  // Cet appareil a-t-il déjà servi à s'inscrire ? On propose alors de retrouver son espace.
  const deja = useSyncExternalStore(() => () => {}, () => lire(jetonInvitation), () => null);

  useEffect(() => {
    if (!etat || "erreur" in etat) return;
    garderLien({ type: "perso", jeton: etat.jeton, groupe: etat.nom, prenom: etat.prenom });
    try {
      localStorage.setItem(cle(jetonInvitation), etat.jeton);
    } catch {}
    router.push(`/p/${etat.jeton}?bienvenue=1`);
  }, [etat, router, jetonInvitation]);

  if (deja && !autre) {
    return (
      <div className="space-y-3 text-center">
        <p>Vous avez déjà rejoint ce groupe depuis cet appareil.</p>
        <Link href={`/p/${deja}`} className="bouton w-full">Ouvrir mon espace</Link>
        <button type="button" className="text-sm text-doux underline" onClick={() => setAutre(true)}>
          Inscrire quelqu&apos;un d&apos;autre
        </button>
      </div>
    );
  }

  return (
    <form action={agir} className="space-y-4">
      <div>
        <label className="etiquette" htmlFor="prenom">Votre prénom</label>
        <input id="prenom" name="prenom" className="champ" required maxLength={40} autoComplete="given-name" placeholder="Léa" />
      </div>
      <div>
        <label className="etiquette" htmlFor="email">E-mail <span className="font-normal text-doux">(facultatif)</span></label>
        <input id="email" name="email" type="email" className="champ" maxLength={120} autoComplete="email" placeholder="lea@exemple.fr" />
      </div>
      <div>
        <label className="etiquette" htmlFor="telephone">Téléphone <span className="font-normal text-doux">(facultatif)</span></label>
        <input id="telephone" name="telephone" type="tel" className="champ" maxLength={30} autoComplete="tel" placeholder="06 12 34 56 78" />
        <p className="mt-1 text-sm text-doux">
          Visibles uniquement par l&apos;organisateur, pour vous renvoyer votre lien si vous le perdez.
        </p>
      </div>
      <button type="submit" className="bouton bouton-cerise w-full" disabled={enCours}>
        {enCours ? "Un instant…" : "Rejoindre le groupe"}
      </button>
      {etat && "erreur" in etat && <p role="alert" className="text-sm font-medium text-cerise">{etat.erreur}</p>}
    </form>
  );
}
