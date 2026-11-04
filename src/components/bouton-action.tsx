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
  action: () => Promise<void>;
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
            await action();
          } catch (e) {
            alert((e as Error).message || "Ça n'a pas marché, réessayez.");
          }
        });
      }}
    >
      {children}
    </button>
  );
}
