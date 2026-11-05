"use client";

import { Gift } from "lucide-react";
import { useState } from "react";

/**
 * Le nom tiré, caché derrière un paquet à ouvrir — à chaque visite.
 * On consulte souvent sa liste à table, téléphone visible de tous.
 */
export function Revelation({ prenom, mystere = false }: { prenom: string; mystere?: boolean }) {
  const [ouvert, setOuvert] = useState(false);

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="group flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-cerise/40 bg-cerise-clair p-6 text-cerise"
      >
        <Gift size={56} className="transition group-active:scale-90" />
        <span className="font-titre text-lg font-semibold">Touchez pour découvrir à qui vous offrez</span>
        <span className="text-sm text-doux">Vérifiez que personne ne regarde par-dessus votre épaule 🤫</span>
      </button>
    );
  }

  return (
    <div className="apparition rounded-2xl bg-sapin p-6 text-center text-carte">
      <p className="text-sm uppercase tracking-widest opacity-80">Vous offrez à</p>
      <p className="mt-1 font-titre text-4xl font-bold">{prenom}</p>
      {mystere && (
        <p className="mx-auto mt-3 max-w-sm text-sm opacity-90">
          Qui se cache derrière ce nom de code ? Mystère ! Choisissez d&apos;après sa liste, et écrivez ce nom sur le
          paquet : le jour J, chacun récupère celui qui porte le sien.
        </p>
      )}
      <button type="button" className="mt-3 text-sm underline opacity-80" onClick={() => setOuvert(false)}>
        Cacher
      </button>
    </div>
  );
}
