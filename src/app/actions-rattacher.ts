"use server";

import { revalidatePath } from "next/cache";

import type { Refus } from "@/app/actions";
import { participantParJeton } from "@/lib/acces";
import { marqueParticipant } from "@/lib/liste-rattachee";
import { prisma } from "@/lib/prisma";

/**
 * Rattacher une liste de cadeaux (anniversaire, Noël…) à un tirage : ses idées
 * s'ajoutent à celles du participant, en direct. La même liste peut servir à
 * plusieurs tirages. Le lien propriétaire de la liste (`jetonProprio`) prouve
 * qu'elle est à la personne.
 */
export async function rattacherListe(jeton: string, jetonProprio: string): Promise<Refus> {
  const moi = await prisma.participant.findUnique({ where: { jeton: String(jeton) }, select: { id: true } });
  if (!moi) return { erreur: "Lien personnel inconnu." };
  const liste = await prisma.liste.findUnique({ where: { jetonProprio: String(jetonProprio) }, select: { id: true } });
  if (!liste) return { erreur: "Cette liste n'existe plus." };
  await prisma.participant.update({ where: { id: moi.id }, data: { listeId: liste.id } });
  revalidatePath("/", "layout");
}

export async function detacherListe(jeton: string): Promise<Refus> {
  const moi = await prisma.participant.findUnique({ where: { jeton: String(jeton) }, select: { id: true } });
  if (!moi) return { erreur: "Lien personnel inconnu." };
  // Les réservations faites depuis ce tirage restent : la liste vit sa vie ailleurs.
  await prisma.participant.update({ where: { id: moi.id }, data: { listeId: null } });
  revalidatePath("/", "layout");
}

/**
 * « Je m'en occupe » sur une idée d'une liste rattachée, depuis un tirage. Même
 * réservation que sur le lien partagé de la liste : un cadeau pris dans un
 * tirage est « Déjà réservé » partout (autres tirages, proches), anonymement.
 */
export async function basculerReservationListe(jeton: string, ideeId: string): Promise<Refus> {
  const moi = await participantParJeton(jeton);
  const idee = await prisma.ideeListe.findUnique({ where: { id: String(ideeId) }, select: { id: true, listeId: true, jetonReserve: true } });
  if (!idee) return { erreur: "Idée introuvable." };
  // La liste doit être rattachée à un AUTRE participant du même groupe.
  const titulaire = await prisma.participant.findFirst({ where: { groupeId: moi.groupeId, listeId: idee.listeId }, select: { id: true } });
  if (!titulaire) return { erreur: "Idée introuvable." };
  if (moi.listeId === idee.listeId) return { erreur: "On ne réserve pas sa propre idée." };
  const marque = marqueParticipant(moi.id);
  if (idee.jetonReserve === marque) {
    await prisma.ideeListe.updateMany({ where: { id: idee.id, jetonReserve: marque }, data: { jetonReserve: "", reserveLe: null, reserveCompteId: null } });
  } else {
    const { count } = await prisma.ideeListe.updateMany({ where: { id: idee.id, jetonReserve: "" }, data: { jetonReserve: marque, reserveLe: new Date() } });
    if (!count) return { erreur: "Quelqu'un vient de la réserver." };
  }
  revalidatePath("/", "layout");
}
