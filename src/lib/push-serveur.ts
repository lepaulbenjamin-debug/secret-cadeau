import "server-only";

import webpush from "web-push";

import { prisma } from "./prisma";
import { messageNouvelleIdee, type MessagePush } from "./push";
import { SITE_URL } from "./site";

/**
 * Envoi des notifications web (Web Push, clés VAPID).
 *
 * Variables : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUJET (mailto:…).
 * Sans elles, rien ne part et rien ne casse.
 *
 * Un abonnement que le service de notifications déclare mort (404 / 410 :
 * application désinstallée, notifications coupées dans les réglages) est effacé.
 */
export function pushConfigure(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

type Envoyeur = (abonnement: webpush.PushSubscription, charge: string) => Promise<unknown>;

const envoyeurParDefaut: Envoyeur = (abonnement, charge) => {
  webpush.setVapidDetails(
    process.env.VAPID_SUJET ?? "mailto:contact@creawebconseil.fr",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  return webpush.sendNotification(abonnement, charge, { TTL: 24 * 3600, urgency: "normal" });
};

/** Envoie le message à tous les appareils abonnés de ces participants. Renvoie le nombre d'envois réussis. */
export async function envoyerPush(participantIds: string[], message: MessagePush, envoyer: Envoyeur = envoyeurParDefaut): Promise<number> {
  if (!participantIds.length || (envoyer === envoyeurParDefaut && !pushConfigure())) return 0;
  const abonnements = await prisma.abonnementPush.findMany({ where: { participantId: { in: participantIds } } });
  const charge = JSON.stringify({ ...message, url: new URL(message.url, SITE_URL).toString() });
  let reussis = 0;
  await Promise.all(
    abonnements.map(async (a) => {
      try {
        await envoyer({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, charge);
        reussis++;
      } catch (e) {
        const statut = (e as { statusCode?: number }).statusCode;
        if (statut === 404 || statut === 410) await prisma.abonnementPush.delete({ where: { id: a.id } }).catch(() => {});
        else console.log("Notification non remise :", statut ?? (e as Error).message);
      }
    }),
  );
  return reussis;
}

const DELAI_IDEES_MS = 30 * 60 * 1000;

/**
 * La personne `participantId` vient d'ajouter des idées : on prévient celui qui
 * l'a tirée (s'il a activé les notifications). Une notification toutes les 30
 * minutes au plus, pour qu'une liste remplie d'un coup n'en envoie pas dix.
 */
export async function signalerNouvellesIdees(participantId: string, nombre: number, maintenant = new Date(), envoyer: Envoyeur = envoyeurParDefaut): Promise<number> {
  if (envoyer === envoyeurParDefaut && !pushConfigure()) return 0;
  const pere = await prisma.participant.findUnique({
    where: { destinataireId: participantId },
    select: { id: true, jeton: true, groupe: { select: { nom: true, tirageLe: true } } },
  });
  if (!pere || !pere.groupe.tirageLe) return 0;
  // Conditionnel : deux ajouts à la même seconde ne notifient qu'une fois.
  const { count } = await prisma.participant.updateMany({
    where: { id: pere.id, OR: [{ ideeSignaleeLe: null }, { ideeSignaleeLe: { lt: new Date(maintenant.getTime() - DELAI_IDEES_MS) } }] },
    data: { ideeSignaleeLe: maintenant },
  });
  if (!count) return 0;
  return envoyerPush([pere.id], messageNouvelleIdee(pere.groupe.nom, pere.jeton, nombre), envoyer);
}
