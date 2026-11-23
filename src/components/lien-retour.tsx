import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { compteCourant } from "@/lib/compte/session";

/** Le retour en haut des pages : vers « Mon espace » si l'on est connecté, sinon vers l'accueil. */
export async function LienRetour() {
  const connecte = Boolean(await compteCourant());
  return (
    <Link href={connecte ? "/compte" : "/"} className="inline-flex items-center gap-1 text-sm text-doux">
      <ArrowLeft size={16} aria-hidden /> {connecte ? "Mon espace" : "Accueil"}
    </Link>
  );
}
