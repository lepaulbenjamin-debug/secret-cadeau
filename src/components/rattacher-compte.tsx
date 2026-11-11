import { UserRound } from "lucide-react";
import Link from "next/link";

import { lierAMonCompte } from "@/app/actions-compte";
import { compteCourant } from "@/lib/compte/session";

import { BoutonAction } from "./bouton-action";

/**
 * Sous l'en-tête d'un espace : « Ajouter à mon compte » si l'on est connecté et
 * que l'espace n'y est pas encore ; sinon une invitation discrète à se connecter.
 * Rien si l'espace est déjà dans le compte, ou à quelqu'un d'autre.
 */
export async function RattacherCompte({
  sorte,
  jeton,
  compteId,
  email,
  chemin,
}: {
  sorte: "perso" | "admin" | "liste";
  jeton: string;
  /** Le compte auquel l'espace est déjà rattaché. */
  compteId: string | null;
  /** L'adresse de l'espace : la même que celle du compte, il y apparaît déjà. */
  email: string;
  chemin: string;
}) {
  const moi = await compteCourant();
  if (compteId) return null;
  if (!moi) {
    return (
      <p className="flex items-center gap-2 text-sm text-doux">
        <UserRound size={16} className="shrink-0" aria-hidden />
        <span>
          <Link href={`/connexion?suite=${encodeURIComponent(chemin)}`} className="font-medium text-sapin underline">Connectez-vous</Link>{" "}
          pour retrouver cet espace sur tous vos appareils.
        </span>
      </p>
    );
  }
  if (email && email.toLowerCase() === moi.email) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-creme p-3 text-sm">
      <UserRound size={18} className="shrink-0 text-cerise" aria-hidden />
      <span className="min-w-0 flex-1">Gardez cet espace dans « Mon espace », sur tous vos appareils.</span>
      <BoutonAction action={lierAMonCompte.bind(null, sorte, jeton)} className="bouton !min-h-9 text-sm">Ajouter à mon compte</BoutonAction>
    </div>
  );
}
