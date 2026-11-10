"use server";

import type { Etat } from "@/app/actions";
import { prisma } from "@/lib/prisma";

type Abonnement = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };

const CLE = /^[\w-]{10,200}={0,2}$/;

/** Abonne cet appareil aux notifications de l'espace de ce participant. */
export async function abonnerPush(jeton: string, a: Abonnement): Promise<Etat> {
  const moi = await prisma.participant.findUnique({ where: { jeton }, select: { id: true } });
  if (!moi) return { erreur: "Lien inconnu." };
  const endpoint = String(a?.endpoint ?? "");
  const p256dh = String(a?.keys?.p256dh ?? "");
  const auth = String(a?.keys?.auth ?? "");
  let valide = false;
  try {
    valide = new URL(endpoint).protocol === "https:" && endpoint.length <= 1000;
  } catch {}
  if (!valide || !CLE.test(p256dh) || !CLE.test(auth)) return { erreur: "Abonnement invalide." };
  await prisma.abonnementPush.upsert({
    where: { endpoint_participantId: { endpoint, participantId: moi.id } },
    create: { endpoint, p256dh, auth, participantId: moi.id },
    update: { p256dh, auth },
  });
  return { ok: "Notifications activées sur cet appareil." };
}

export async function desabonnerPush(jeton: string, endpoint: string): Promise<Etat> {
  const moi = await prisma.participant.findUnique({ where: { jeton }, select: { id: true } });
  if (!moi) return { erreur: "Lien inconnu." };
  await prisma.abonnementPush.deleteMany({ where: { participantId: moi.id, endpoint: String(endpoint).slice(0, 1000) } });
  return { ok: "Notifications désactivées sur cet appareil." };
}
