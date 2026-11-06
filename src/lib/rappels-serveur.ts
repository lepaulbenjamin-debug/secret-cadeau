import "server-only";

import { envoyerEmail } from "./email";
import { contenuBienvenue, contenuRelanceOrganisateur, relanceOrganisateurDue } from "./emails-organisateur";
import { prisma } from "./prisma";
import { contenuRappel, rappelDu, type TypeRappel } from "./rappels";
import { SITE_URL } from "./site";

export type Bilan = { envoyes: number; echecs: number; ignores: number; motifs: string[] };

/**
 * Envoie les rappels dus aujourd'hui. Appelée chaque matin par la tâche
 * planifiée, et juste après un tirage pour le seul groupe concerné.
 *
 * Le rappel est noté AVANT l'envoi (contrainte unique participant × type) :
 * deux exécutions simultanées ne peuvent pas envoyer deux fois le même
 * message. Si l'envoi échoue, la note est retirée et la tâche réessaiera.
 */
export async function envoyerRappels({ groupeId, maintenant = new Date() }: { groupeId?: string; maintenant?: Date } = {}): Promise<Bilan> {
  const bilan: Bilan = { envoyes: 0, echecs: 0, ignores: 0, motifs: [] };
  if (!process.env.RESEND_API_KEY) {
    bilan.motifs.push("RESEND_API_KEY absente : aucun e-mail envoyé.");
    return bilan;
  }

  const veille = new Date(maintenant.getTime() - 24 * 60 * 60 * 1000);
  const groupes = await prisma.groupe.findMany({
    where: {
      ...(groupeId ? { id: groupeId } : {}),
      // Un groupe sans date ne reçoit que l'e-mail du tirage ; un échange passé, rien.
      OR: [{ dateEchange: { gte: veille } }, { dateEchange: null, tirageLe: { not: null } }],
      participants: { some: { email: { not: "" }, rappelsEmail: true } },
    },
    include: {
      participants: {
        where: { email: { not: "" }, rappelsEmail: true },
        include: { rappels: { select: { type: true, envoyeLe: true } }, _count: { select: { souhaits: true } } },
      },
    },
  });

  await relancerOrganisateurs({ groupeId, maintenant, bilan });

  for (const g of groupes) {
    for (const p of g.participants) {
      const vue = {
        prenom: p.prenom,
        email: p.email,
        jeton: p.jeton,
        rappelsEmail: p.rappelsEmail,
        nomDeCode: p.nomDeCode,
        nbSouhaits: p._count.souhaits,
        dejaEnvoyes: p.rappels.map((r) => r.type as TypeRappel),
        dernierEnvoi: p.rappels.reduce<Date | null>((d, r) => (!d || r.envoyeLe > d ? r.envoyeLe : d), null),
      };
      const type = rappelDu(g, vue, maintenant);
      if (!type) {
        bilan.ignores++;
        continue;
      }
      try {
        await prisma.rappel.create({ data: { participantId: p.id, type } });
      } catch {
        bilan.ignores++; // déjà noté par une exécution concurrente
        continue;
      }
      const c = contenuRappel(type, g, vue, { site: SITE_URL, maintenant });
      const r = await envoyerEmail({ a: p.email, ...c }).catch((e: Error) => ({ ok: false, motif: e.message }));
      if (r.ok) bilan.envoyes++;
      else {
        bilan.echecs++;
        if (r.motif && bilan.motifs.length < 5) bilan.motifs.push(r.motif);
        await prisma.rappel.deleteMany({ where: { participantId: p.id, type } });
      }
    }
  }
  return bilan;
}

/**
 * Relance l'organisateur dont l'échange approche sans tirage. Notée avant
 * l'envoi (mise à jour conditionnelle), annulée si l'envoi échoue.
 */
async function relancerOrganisateurs({ groupeId, maintenant, bilan }: { groupeId?: string; maintenant: Date; bilan: Bilan }) {
  const dans8jours = new Date(maintenant.getTime() + 8 * 24 * 60 * 60 * 1000);
  const groupes = await prisma.groupe.findMany({
    where: {
      ...(groupeId ? { id: groupeId } : {}),
      tirageLe: null,
      relanceTirageLe: null,
      rappelsOrganisateur: true,
      emailOrganisateur: { not: "" },
      dateEchange: { lte: dans8jours, gte: new Date(maintenant.getTime() - 24 * 60 * 60 * 1000) },
    },
    include: { participants: { select: { prenom: true, _count: { select: { souhaits: true } } } } },
  });
  for (const g of groupes) {
    if (!relanceOrganisateurDue(g, maintenant)) continue;
    const { count } = await prisma.groupe.updateMany({ where: { id: g.id, relanceTirageLe: null }, data: { relanceTirageLe: maintenant } });
    if (!count) continue;
    const c = contenuRelanceOrganisateur(g, {
      site: SITE_URL,
      prenom: "",
      nbParticipants: g.participants.length,
      listesVides: g.participants.filter((p) => p._count.souhaits === 0).map((p) => p.prenom),
      maintenant,
    });
    const r = await envoyerEmail({ a: g.emailOrganisateur, ...c }).catch((e: Error) => ({ ok: false, motif: e.message }));
    if (r.ok) bilan.envoyes++;
    else {
      bilan.echecs++;
      if (r.motif && bilan.motifs.length < 5) bilan.motifs.push(r.motif);
      await prisma.groupe.update({ where: { id: g.id }, data: { relanceTirageLe: null } });
    }
  }
}

/** L'e-mail de bienvenue de l'organisateur, juste après la création du groupe. Une seule fois. */
export async function envoyerBienvenueOrganisateur(groupeId: string, { prenom, jetonPerso }: { prenom: string; jetonPerso: string | null }) {
  if (!process.env.RESEND_API_KEY) return { ok: false, motif: "RESEND_API_KEY absente" };
  const g = await prisma.groupe.findUnique({ where: { id: groupeId } });
  if (!g || !g.emailOrganisateur || g.bienvenueEnvoyeeLe) return { ok: false, motif: "rien à envoyer" };
  const { count } = await prisma.groupe.updateMany({ where: { id: g.id, bienvenueEnvoyeeLe: null }, data: { bienvenueEnvoyeeLe: new Date() } });
  if (!count) return { ok: false, motif: "déjà envoyé" };
  const r = await envoyerEmail({ a: g.emailOrganisateur, ...contenuBienvenue(g, { site: SITE_URL, prenom, jetonPerso }) }).catch(
    (e: Error) => ({ ok: false, motif: e.message }),
  );
  if (!r.ok) await prisma.groupe.update({ where: { id: g.id }, data: { bienvenueEnvoyeeLe: null } });
  return r;
}
