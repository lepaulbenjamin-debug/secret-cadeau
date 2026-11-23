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

const MAX_IDEES_LISTE = 80;
const cle = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Transfère les idées notées directement dans ce tirage vers la liste rattachée :
 * elles servent alors à tous les tirages, sans doublon à l'affichage. Une idée
 * déjà présente dans la liste (même titre ou même lien) n'est pas recopiée. Une
 * réservation faite dans le groupe suit l'idée (même personne, même anonymat).
 */
export async function transfererIdees(jeton: string): Promise<{ erreur?: string; n?: number }> {
  const moi = await prisma.participant.findUnique({ where: { jeton: String(jeton) }, select: { id: true, listeId: true } });
  if (!moi) return { erreur: "Lien personnel inconnu." };
  if (!moi.listeId) return { erreur: "Rattachez d'abord une liste." };
  const listeId = moi.listeId;
  const [souhaits, existantes] = await Promise.all([
    prisma.souhait.findMany({ where: { participantId: moi.id }, orderBy: { creeLe: "asc" } }),
    prisma.ideeListe.findMany({ where: { listeId }, select: { id: true, titre: true, lien: true, jetonReserve: true } }),
  ]);
  if (!souhaits.length) return { n: 0 };
  const nouvelles = souhaits.filter((s) => !existantes.some((e) => cle(e.titre) === cle(s.titre) || (s.lien && e.lien === s.lien)));
  if (existantes.length + nouvelles.length > MAX_IDEES_LISTE) {
    return { erreur: `Votre liste dépasserait ${MAX_IDEES_LISTE} idées : faites un peu de place avant de transférer.` };
  }
  const base = Date.now();
  await prisma.$transaction([
    // Les doublons : la réservation éventuelle passe sur l'idée déjà dans la liste, si elle est libre.
    ...souhaits
      .filter((s) => !nouvelles.includes(s) && s.reserveParId)
      .flatMap((s) => {
        const e = existantes.find((x) => cle(x.titre) === cle(s.titre) || (s.lien && x.lien === s.lien));
        return e && !e.jetonReserve
          ? [prisma.ideeListe.update({ where: { id: e.id }, data: { jetonReserve: marqueParticipant(s.reserveParId!), reserveLe: new Date() } })]
          : [];
      }),
    ...nouvelles.map((s, i) =>
      prisma.ideeListe.create({
        data: {
          listeId,
          titre: s.titre,
          lien: s.lien,
          image: s.image,
          prix: s.prix,
          note: s.note,
          // Un ordre stable : à la suite de la liste, dans l'ordre du tirage.
          creeLe: new Date(base + i),
          ...(s.reserveParId ? { jetonReserve: marqueParticipant(s.reserveParId), reserveLe: new Date() } : {}),
        },
      }),
    ),
    prisma.souhait.deleteMany({ where: { id: { in: souhaits.map((s) => s.id) } } }),
  ]);
  revalidatePath("/", "layout");
  return { n: nouvelles.length };
}
