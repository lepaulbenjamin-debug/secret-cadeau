import "server-only";

import webpush from "web-push";

import { prisma } from "./prisma";
import type { MessagePush } from "./push";
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
