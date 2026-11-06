import { ExternalLink } from "lucide-react";

import { lienAffiche } from "@/lib/affiliation";
import { domaine } from "@/lib/format";

/** « Voir aussi sa liste sur amazon.fr ↗ » — avec notre identifiant si c'est Amazon. */
export function LienListeExterne({ lien, qui = "sa" }: { lien: string; qui?: string }) {
  if (!lien) return null;
  const l = lienAffiche(lien);
  return (
    <a
      href={l.url}
      target="_blank"
      rel={l.affilie ? "sponsored noopener nofollow" : "noopener noreferrer nofollow"}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sapin-clair px-3 py-1.5 text-sm font-medium text-sapin"
    >
      📋 Voir aussi {qui} liste sur {domaine(lien) || "un autre site"} <ExternalLink size={13} aria-hidden />
    </a>
  );
}
