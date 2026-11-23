"use client";

import { ArrowRightLeft } from "lucide-react";
import { useState, useTransition } from "react";

import { transfererIdees } from "@/app/actions-rattacher";

/** « Transférer mes N idées dans ma liste » : celles notées dans ce tirage rejoignent la liste rattachée. */
export function TransfererIdees({ jeton, nombre, titre }: { jeton: string; nombre: number; titre: string }) {
  const [message, setMessage] = useState("");
  const [enCours, demarrer] = useTransition();
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={enCours}
        className="bouton bouton-discret w-full"
        onClick={() => {
          if (!confirm(`Transférer vos ${nombre > 1 ? `${nombre} idées` : "idée"} de ce tirage dans « ${titre} » ? Elles serviront à tous vos tirages.`)) return;
          demarrer(async () => {
            const r = await transfererIdees(jeton);
            setMessage(r.erreur ?? (r.n ? `C'est fait : ${r.n > 1 ? `${r.n} idées ajoutées` : "1 idée ajoutée"} à votre liste.` : "Ces idées étaient déjà dans votre liste."));
          });
        }}
      >
        <ArrowRightLeft size={16} aria-hidden /> {enCours ? "Un instant…" : `Transférer mes ${nombre > 1 ? `${nombre} idées` : "idée"} dans cette liste`}
      </button>
      {message && <p role="status" className="font-medium text-sapin">{message}</p>}
    </div>
  );
}
