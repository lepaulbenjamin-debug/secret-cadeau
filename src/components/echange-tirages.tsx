"use client";

import { ArrowLeftRight } from "lucide-react";
import { useState, useTransition } from "react";

/** Deux listes déroulantes et un bouton : échanger les destinataires de deux personnes. */
export function EchangeTirages({
  participants,
  action,
}: {
  participants: { id: string; prenom: string }[];
  action: (a: string, b: string) => Promise<{ erreur: string } | void>;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [message, setMessage] = useState("");
  const [enCours, demarrer] = useTransition();
  const nom = (id: string) => participants.find((p) => p.id === id)?.prenom ?? "";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select className="champ !w-auto flex-1" value={a} onChange={(e) => setA(e.target.value)} aria-label="Première personne">
          <option value="">Choisir…</option>
          {participants.map((p) => <option key={p.id} value={p.id}>{p.prenom}</option>)}
        </select>
        <ArrowLeftRight size={18} className="text-doux" aria-hidden />
        <select className="champ !w-auto flex-1" value={b} onChange={(e) => setB(e.target.value)} aria-label="Seconde personne">
          <option value="">Choisir…</option>
          {participants.filter((p) => p.id !== a).map((p) => <option key={p.id} value={p.id}>{p.prenom}</option>)}
        </select>
      </div>
      <button
        type="button"
        className="bouton bouton-discret w-full"
        disabled={!a || !b || a === b || enCours}
        onClick={() => {
          if (!confirm(`Échanger les tirages de ${nom(a)} et ${nom(b)} ? Chacun offrira à la personne que l'autre avait tirée. Ils seront prévenus, sans que personne ne voie de nom.`)) return;
          demarrer(async () => {
            try {
              const r = await action(a, b);
              if (r && "erreur" in r) return setMessage(r.erreur);
              setMessage(`C'est fait : ${nom(a)} et ${nom(b)} ont échangé leur tirage et sont prévenus.`);
              setA("");
              setB("");
            } catch {
              setMessage("Ça n'a pas marché. Vérifiez votre connexion et réessayez.");
            }
          });
        }}
      >
        Échanger leurs tirages
      </button>
      {message && <p role="status" className="text-sm font-medium">{message}</p>}
    </div>
  );
}
