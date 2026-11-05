import { ExternalLink } from "lucide-react";

import { lienAffiche } from "@/lib/affiliation";
import { domaine } from "@/lib/format";

export type SouhaitAffiche = { id: string; titre: string; lien: string; prix: number | null; note: string };

/** L'affichage d'une idée ; les actions (réserver, modifier…) sont passées en `pied`. */
export function Souhait({ s, pied, barre = false }: { s: SouhaitAffiche; pied?: React.ReactNode; barre?: boolean }) {
  // Le lien affiché porte notre identifiant Partenaires quand c'est Amazon (voir affiliation.ts).
  const lien = s.lien ? lienAffiche(s.lien) : null;
  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${barre ? "text-doux line-through" : ""}`}>{s.titre}</p>
          {s.note && <p className="text-sm text-doux">{s.note}</p>}
          {lien && (
            <a href={lien.url} target="_blank" rel={lien.affilie ? "sponsored noopener nofollow" : "noopener noreferrer nofollow"} className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-sapin underline">
              {domaine(s.lien) || "Voir"} <ExternalLink size={13} />
            </a>
          )}
        </div>
        {s.prix != null && <span className="shrink-0 rounded-full bg-creme px-2.5 py-0.5 text-sm font-semibold">{s.prix} €</span>}
      </div>
      {pied && <div className="mt-2">{pied}</div>}
    </li>
  );
}
