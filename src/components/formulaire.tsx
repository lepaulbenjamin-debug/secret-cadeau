"use client";

import { useActionState, useEffect, useRef } from "react";

import type { Etat } from "@/app/actions";

/**
 * Un formulaire branché sur une action serveur, avec son message de retour.
 * `vider` remet les champs à zéro après un succès (ajout d'une idée, d'une question…).
 */
export function Formulaire({
  action,
  children,
  bouton,
  vider = false,
  className = "space-y-3",
  boutonClass = "bouton w-full",
}: {
  action: (etat: Etat, f: FormData) => Promise<Etat>;
  children: React.ReactNode;
  bouton: string;
  vider?: boolean;
  className?: string;
  boutonClass?: string;
}) {
  const [etat, agir, enCours] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (vider && etat?.ok) ref.current?.reset();
  }, [etat, vider]);

  return (
    <form ref={ref} action={agir} className={className}>
      {children}
      <button type="submit" className={boutonClass} disabled={enCours}>
        {enCours ? "Un instant…" : bouton}
      </button>
      {etat?.erreur && <p role="alert" className="text-sm font-medium text-cerise">{etat.erreur}</p>}
      {etat?.ok && <p role="status" className="text-sm font-medium text-sapin">{etat.ok}</p>}
    </form>
  );
}
