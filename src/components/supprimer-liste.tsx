"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { supprimerListe } from "@/app/actions-listes";

import { oublierLien } from "./memoire";

export function SupprimerListe({ jetonProprio }: { jetonProprio: string }) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  return (
    <button
      type="button"
      disabled={enCours}
      className="bouton bouton-cerise w-full"
      onClick={() => {
        if (!confirm("Supprimer définitivement cette liste et toutes ses idées ? Le lien partagé ne mènera plus nulle part.")) return;
        demarrer(async () => {
          const r = await supprimerListe(jetonProprio);
          if ("erreur" in r) return alert(r.erreur);
          for (const j of r.jetons) {
            oublierLien("liste-proprio", j);
            oublierLien("liste", j);
          }
          router.replace("/");
        });
      }}
    >
      <Trash2 size={16} aria-hidden /> {enCours ? "Suppression…" : "Supprimer ma liste"}
    </button>
  );
}
