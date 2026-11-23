"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { quitterGroupe } from "@/app/actions";

import { oublierLien } from "./memoire";

/** « Quitter ce groupe » (avant le tirage) : l'espace est effacé, puis retour à l'accueil. */
export function QuitterGroupe({ jeton, groupe }: { jeton: string; groupe: string }) {
  const [enCours, demarrer] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={enCours}
      className="bouton bouton-discret !border-cerise/40 text-cerise"
      onClick={() => {
        if (!confirm(`Quitter « ${groupe} » ? Votre espace et votre liste d'envies de ce groupe seront effacés.`)) return;
        demarrer(async () => {
          const r = await quitterGroupe(jeton);
          if (r && "erreur" in r) return alert(r.erreur);
          oublierLien("perso", jeton);
          router.push("/compte");
        });
      }}
    >
      {enCours ? "Un instant…" : "Quitter ce groupe"}
    </button>
  );
}
