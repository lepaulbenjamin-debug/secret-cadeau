"use client";

import { useTransition } from "react";

/** Un bouton qui lance une action serveur, avec confirmation facultative. */
export function BoutonAction({
  action,
  confirmation,
  children,
  className = "bouton bouton-discret",
  titre,
}: {
  /** Rien si tout va bien, `{ erreur }` pour un refus (voir `Refus` dans actions.ts). */
  action: () => Promise<{ erreur: string } | void>;
  confirmation?: string;
  children: React.ReactNode;
  className?: string;
  titre?: string;
}) {
  const [enCours, demarrer] = useTransition();
  return (
    <button
      type="button"
      title={titre}
      aria-label={titre}
      disabled={enCours}
      className={className}
      onClick={() => {
        if (confirmation && !confirm(confirmation)) return;
        demarrer(async () => {
          try {
            const r = await action();
            if (r && "erreur" in r) alert(r.erreur);
          } catch {
            alert("Ça n'a pas marché. Vérifiez votre connexion et réessayez.");
          }
        });
      }}
    >
      {children}
    </button>
  );
}
