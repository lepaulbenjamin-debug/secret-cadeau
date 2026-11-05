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

/**
 * Les participants inscrits avant les noms de code n'en ont pas : on leur en
 * attribue un à la première visite (organisateur ou participant).
 */
export async function assurerNomsDeCode(groupeId: string) {
  const sans = await prisma.participant.findMany({ where: { groupeId, nomDeCode: "" }, select: { id: true } });
  if (!sans.length) return;
  const { nomsDeCodeAleatoires } = await import("./noms-de-code");
  const pris = await prisma.participant.findMany({ where: { groupeId, NOT: { nomDeCode: "" } }, select: { nomDeCode: true } });
  const noms = nomsDeCodeAleatoires(sans.length, pris.map((p) => p.nomDeCode));
  await prisma.$transaction(sans.map((p, i) => prisma.participant.update({ where: { id: p.id }, data: { nomDeCode: noms[i] } })));
}

/** Le nom montré aux autres participants : le nom de code si le groupe est anonymisé. */
export function nomVisible(p: { prenom: string; nomDeCode: string }, anonyme: boolean): string {
  return anonyme && p.nomDeCode ? p.nomDeCode : p.prenom;
}
