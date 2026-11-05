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
  const jeton = new URL(requete.url).searchParams.get("j") ?? "";
  if (jeton) await prisma.participant.updateMany({ where: { jeton }, data: { rappelsEmail: false } });
  return NextResponse.json({ ok: true });
}
