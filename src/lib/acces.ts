import "server-only";

import { notFound } from "next/navigation";

import { prisma } from "./prisma";

/** Le groupe d'un lien d'organisateur, ou une erreur. */
export async function groupeParJetonAdmin(jetonAdmin: string) {
  const groupe = await prisma.groupe.findUnique({ where: { jetonAdmin } });
  if (!groupe) throw new Error("Lien d'organisateur inconnu.");
  return groupe;
}

/** Le participant d'un lien personnel, ou une erreur. */
export async function participantParJeton(jeton: string) {
  const moi = await prisma.participant.findUnique({ where: { jeton }, include: { groupe: true } });
  if (!moi) throw new Error("Lien personnel inconnu.");
  return moi;
}

/** Variante pour les pages : un lien inconnu donne la page 404, pas une erreur. */
export async function participantOu404(jeton: string) {
  const moi = await prisma.participant.findUnique({ where: { jeton }, include: { groupe: true } });
  if (!moi) notFound();
  return moi;
}
