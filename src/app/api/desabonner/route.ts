import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Désinscription en un clic (RFC 8058) : Gmail et les autres envoient un POST
 * sur l'adresse de l'en-tête List-Unsubscribe quand on touche « Se désabonner ».
 *
 * ⚠️ PAS DE GET : les antivirus des messageries ouvrent les liens des e-mails
 * pour les inspecter. Un GET qui désabonne désabonnerait tout le monde. Le lien
 * visible dans l'e-mail mène donc à l'espace personnel, où un interrupteur
 * attend un vrai geste.
 */
export async function POST(requete: Request) {
  const params = new URL(requete.url).searchParams;
  const jeton = params.get("j") ?? "";
  const jetonAdmin = params.get("o") ?? "";
  if (jeton) await prisma.participant.updateMany({ where: { jeton }, data: { rappelsEmail: false } });
  // Un organisateur (lien d'organisateur) : plus de relance ni d'e-mail d'organisation.
  if (jetonAdmin) await prisma.groupe.updateMany({ where: { jetonAdmin }, data: { rappelsOrganisateur: false } });
  return NextResponse.json({ ok: true });
}
