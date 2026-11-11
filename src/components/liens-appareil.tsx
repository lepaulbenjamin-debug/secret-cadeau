"use client";

import { Smartphone } from "lucide-react";
import { useState, useSyncExternalStore, useTransition } from "react";

import { lierLiensAppareil } from "@/app/actions-compte";

import { lireLiens } from "./memoire";

type Sorte = "perso" | "admin" | "liste";
const SORTES: Record<string, Sorte> = { perso: "perso", admin: "admin", "liste-proprio": "liste" };

let cache: string | null = null;
const lire = () => {
  // Ni les espaces inscrits pour quelqu'un d'autre, ni les listes des proches (simples visites).
  const liens = lireLiens()
    .filter((l) => SORTES[l.type] && !l.pourAutre)
    .map((l) => ({ sorte: SORTES[l.type], jeton: l.jeton }));
  const s = JSON.stringify(liens);
  return cache === s ? cache : (cache = s);
};

/** « Ajouter les liens de cet appareil » : ceux de l'accueil, mémorisés avant la création du compte. */
export function LiensAppareil({ connus }: { connus: string[] }) {
  const brut = useSyncExternalStore(() => () => {}, lire, () => "[]");
  const [message, setMessage] = useState("");
  const [enCours, demarrer] = useTransition();
  const aLier = (JSON.parse(brut) as { sorte: Sorte; jeton: string }[]).filter((l) => !connus.includes(l.jeton));
  if (!aLier.length && !message) return null;

  return (
    <section className="carte space-y-3">
      <p className="flex gap-2 text-sm">
        <Smartphone size={18} className="mt-0.5 shrink-0" aria-hidden />
        {message ||
          (aLier.length > 1
            ? `${aLier.length} espaces ouverts sur cet appareil ne sont pas encore dans votre compte.`
            : "Un espace ouvert sur cet appareil n'est pas encore dans votre compte.")}
      </p>
      {aLier.length > 0 && !message && (
        <button
          type="button"
          className="bouton"
          disabled={enCours}
          onClick={() =>
            demarrer(async () => {
              const r = await lierLiensAppareil(aLier);
              setMessage(r.erreur ?? (r.n ? `C'est fait : ${r.n > 1 ? `${r.n} espaces ajoutés` : "1 espace ajouté"}.` : "Ces espaces sont déjà rattachés à un autre compte."));
            })
          }
        >
          {enCours ? "Un instant…" : "Les ajouter à mon compte"}
        </button>
      )}
    </section>
  );
}
