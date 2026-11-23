"use client";

import { Link2 } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";

import { rattacherListe } from "@/app/actions-rattacher";

import { lireLiens } from "./memoire";

type Candidate = { jetonProprio: string; titre: string };

let cache = { brut: "", liste: [] as Candidate[] };
const deLAppareil = () => {
  // Les listes dont CET appareil a le lien propriétaire (ouvertes ou créées ici).
  const liste = lireLiens()
    .filter((l) => l.type === "liste-proprio")
    .map((l) => ({ jetonProprio: l.jeton, titre: l.groupe }));
  const brut = JSON.stringify(liste);
  if (brut !== cache.brut) cache = { brut, liste };
  return cache.liste;
};
const VIDE: Candidate[] = [];

/**
 * « Rattacher une liste que j'ai déjà » : une liste de cadeaux tenue sur Qui Offre
 * (anniversaire, Noël…), trouvée sur cet appareil ou dans le compte connecté.
 */
export function ChoisirListe({ jeton, duCompte }: { jeton: string; duCompte: Candidate[] }) {
  const appareil = useSyncExternalStore(() => () => {}, deLAppareil, () => VIDE);
  const candidates = [...duCompte, ...appareil.filter((a) => !duCompte.some((c) => c.jetonProprio === a.jetonProprio))];
  const [choix, setChoix] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, demarrer] = useTransition();
  const valeur = choix || candidates[0]?.jetonProprio || "";

  return (
    <div className="mt-4 space-y-2 rounded-2xl border border-trait p-4 text-sm">
      <p className="flex items-center gap-2 font-semibold"><Link2 size={16} aria-hidden /> Vous avez déjà une liste de cadeaux ?</p>
      {candidates.length ? (
        <>
          <p className="text-doux">
            Rattachez-la à ce tirage : ses idées s&apos;ajoutent ici, et restent à jour quand vous la modifiez. La même liste peut
            servir à tous vos tirages.
          </p>
          <div className="space-y-2">
            <label htmlFor={`liste-${jeton}`} className="sr-only">Liste à rattacher</label>
            <select id={`liste-${jeton}`} className="champ" value={valeur} onChange={(e) => setChoix(e.target.value)}>
              {candidates.map((c) => (
                <option key={c.jetonProprio} value={c.jetonProprio}>{c.titre}</option>
              ))}
            </select>
            <button
              type="button"
              className="bouton w-full"
              disabled={enCours || !valeur}
              onClick={() =>
                demarrer(async () => {
                  const r = await rattacherListe(jeton, valeur);
                  setErreur(r && "erreur" in r ? r.erreur : "");
                })
              }
            >
              {enCours ? "Un instant…" : "Rattacher"}
            </button>
          </div>
          {erreur && <p role="alert" className="font-medium text-cerise">{erreur}</p>}
        </>
      ) : (
        <p className="text-doux">
          Une liste tenue sur Qui Offre peut servir à tous vos tirages. Ouvrez-la une fois sur ce téléphone (ou{" "}
          <Link href={`/connexion?suite=/p/${jeton}`} className="underline">connectez-vous</Link>) pour la retrouver ici, ou{" "}
          <Link href="/liste/nouvelle" className="underline">créez-en une</Link>.
        </p>
      )}
    </div>
  );
}
