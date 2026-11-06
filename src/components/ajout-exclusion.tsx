"use client";

import { useState, useTransition } from "react";

export function AjoutExclusion({
  participants,
  action,
}: {
  participants: { id: string; prenom: string }[];
  action: (a: string, b: string) => Promise<{ erreur: string } | void>;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [enCours, demarrer] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="champ !w-auto flex-1" value={a} onChange={(e) => setA(e.target.value)} aria-label="Première personne">
        <option value="">Choisir…</option>
        {participants.map((p) => <option key={p.id} value={p.id}>{p.prenom}</option>)}
      </select>
      <span className="text-doux">et</span>
      <select className="champ !w-auto flex-1" value={b} onChange={(e) => setB(e.target.value)} aria-label="Seconde personne">
        <option value="">Choisir…</option>
        {participants.filter((p) => p.id !== a).map((p) => <option key={p.id} value={p.id}>{p.prenom}</option>)}
      </select>
      <button
        type="button"
        className="bouton bouton-discret w-full"
        disabled={!a || !b || a === b || enCours}
        onClick={() =>
          demarrer(async () => {
            try {
              const r = await action(a, b);
              if (r && "erreur" in r) return alert(r.erreur);
              setA("");
              setB("");
            } catch {
              alert("Ça n'a pas marché. Vérifiez votre connexion et réessayez.");
            }
          })
        }
      >
        Ne pas les tirer l&apos;un l&apos;autre
      </button>
    </div>
  );
}
