"use server";

import { revalidatePath } from "next/cache";

import { groupeParJetonAdmin, participantParJeton } from "@/lib/acces";
import { deplierLienCourt } from "@/lib/affiliation";
import { lienSur, lirePrenoms } from "@/lib/format";
import { nouveauJeton } from "@/lib/jeton";
import { prisma } from "@/lib/prisma";
import { tirer } from "@/lib/tirage";

export type Etat = { erreur?: string; ok?: string } | null;

const texte = (f: FormData, cle: string, max = 200) => String(f.get(cle) ?? "").trim().slice(0, max);

function entierPositif(brut: string): number | null {
  const n = Number.parseInt(brut.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : null;
}

function dateOuNull(brut: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(brut)) return null;
  // Midi à Paris : la date reste la même quel que soit le fuseau de lecture.
  return new Date(`${brut}T12:00:00+01:00`);
}

const MAX_PARTICIPANTS = 60;

/* ───────────────────────────── Organisateur ───────────────────────────── */

export type GroupeCree = { jetonAdmin: string; nom: string; jetonPerso: string | null } | { erreur: string };

export async function creerGroupe(_: unknown, f: FormData): Promise<GroupeCree> {
  const nom = texte(f, "nom", 80);
  const organisateur = texte(f, "organisateur", 40);
  const participe = f.get("participe") === "on";
  const autres = lirePrenoms(String(f.get("participants") ?? ""));

  if (!nom) return { erreur: "Donnez un nom au groupe." };
  if (participe && !organisateur) return { erreur: "Indiquez votre prénom." };

  const prenoms = participe
    ? [organisateur, ...autres.filter((p) => p.toLowerCase() !== organisateur.toLowerCase())]
    : autres;
  if (prenoms.length < 3) return { erreur: "Il faut au moins trois participants pour garder le secret." };
  if (prenoms.length > MAX_PARTICIPANTS) return { erreur: `${MAX_PARTICIPANTS} participants au maximum.` };

  const groupe = await prisma.groupe.create({
    data: {
      nom,
      dateEchange: dateOuNull(texte(f, "date", 10)),
      budget: entierPositif(texte(f, "budget", 10)),
      message: texte(f, "message", 500),
      jetonAdmin: nouveauJeton(),
      participants: { create: prenoms.map((prenom) => ({ prenom, jeton: nouveauJeton() })) },
    },
    include: { participants: { orderBy: { creeLe: "asc" } } },
  });

  const perso = participe ? groupe.participants.find((p) => p.prenom === organisateur) : null;
  return { jetonAdmin: groupe.jetonAdmin, nom: groupe.nom, jetonPerso: perso?.jeton ?? null };
}

export async function modifierGroupe(jetonAdmin: string, _: Etat, f: FormData): Promise<Etat> {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  const nom = texte(f, "nom", 80);
  if (!nom) return { erreur: "Le nom ne peut pas être vide." };
  await prisma.groupe.update({
    where: { id: groupe.id },
    data: {
      nom,
      dateEchange: dateOuNull(texte(f, "date", 10)),
      budget: entierPositif(texte(f, "budget", 10)),
      message: texte(f, "message", 500),
    },
  });
  revalidatePath("/", "layout");
  return { ok: "Enregistré." };
}

export async function ajouterParticipants(jetonAdmin: string, _: Etat, f: FormData): Promise<Etat> {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  if (groupe.tirageLe) return { erreur: "Le tirage est fait : annulez-le pour ajouter quelqu'un." };
  const existants = await prisma.participant.findMany({ where: { groupeId: groupe.id }, select: { prenom: true } });
  const deja = new Set(existants.map((p) => p.prenom.toLowerCase()));
  const nouveaux = lirePrenoms(String(f.get("prenoms") ?? "")).filter((p) => !deja.has(p.toLowerCase()));
  if (!nouveaux.length) return { erreur: "Aucun nouveau prénom." };
  if (existants.length + nouveaux.length > MAX_PARTICIPANTS) return { erreur: `${MAX_PARTICIPANTS} participants au maximum.` };
  await prisma.participant.createMany({
    data: nouveaux.map((prenom) => ({ prenom, jeton: nouveauJeton(), groupeId: groupe.id })),
  });
  revalidatePath(`/g/${jetonAdmin}`);
  return { ok: nouveaux.length > 1 ? `${nouveaux.length} personnes ajoutées.` : `${nouveaux[0]} est ajouté·e.` };
}

export async function retirerParticipant(jetonAdmin: string, participantId: string) {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  if (groupe.tirageLe) throw new Error("Le tirage est fait : annulez-le d'abord.");
  await prisma.participant.deleteMany({ where: { id: participantId, groupeId: groupe.id } });
  revalidatePath(`/g/${jetonAdmin}`);
}

export async function basculerExclusion(jetonAdmin: string, x: string, y: string) {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  if (groupe.tirageLe) throw new Error("Le tirage est fait : annulez-le d'abord.");
  if (x === y) return;
  const [aId, bId] = [x, y].sort();
  const membres = await prisma.participant.count({ where: { id: { in: [aId, bId] }, groupeId: groupe.id } });
  if (membres !== 2) throw new Error("Participant inconnu.");
  const existante = await prisma.exclusion.findUnique({ where: { aId_bId: { aId, bId } } });
  if (existante) await prisma.exclusion.delete({ where: { id: existante.id } });
  else await prisma.exclusion.create({ data: { groupeId: groupe.id, aId, bId } });
  revalidatePath(`/g/${jetonAdmin}`);
}

export async function lancerTirage(jetonAdmin: string): Promise<Etat> {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  if (groupe.tirageLe) return { erreur: "Le tirage est déjà fait." };
  const [participants, exclusions] = await Promise.all([
    prisma.participant.findMany({ where: { groupeId: groupe.id }, select: { id: true } }),
    prisma.exclusion.findMany({ where: { groupeId: groupe.id }, select: { aId: true, bId: true } }),
  ]);
  if (participants.length < 3) return { erreur: "Il faut au moins trois participants." };

  const resultat = tirer(participants.map((p) => p.id), exclusions.map((e) => ({ a: e.aId, b: e.bId })));
  if (!resultat) return { erreur: "Impossible de faire un tirage avec ces exclusions. Retirez-en une ou deux." };

  await prisma.$transaction([
    // Libérer d'abord : `destinataireId` est unique, une écriture croisée échouerait sinon.
    prisma.participant.updateMany({ where: { groupeId: groupe.id }, data: { destinataireId: null } }),
    ...[...resultat].map(([de, pour]) => prisma.participant.update({ where: { id: de }, data: { destinataireId: pour } })),
    prisma.groupe.update({ where: { id: groupe.id }, data: { tirageLe: new Date() } }),
  ]);
  revalidatePath("/", "layout");
  return { ok: "Le tirage est fait ! Chacun découvre sa personne en ouvrant son lien." };
}

export async function annulerTirage(jetonAdmin: string) {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  await prisma.$transaction([
    // Les questions s'adressaient à un Père Noël qui n'est plus le bon.
    prisma.question.deleteMany({ where: { pere: { groupeId: groupe.id } } }),
    prisma.participant.updateMany({ where: { groupeId: groupe.id }, data: { destinataireId: null } }),
    prisma.groupe.update({ where: { id: groupe.id }, data: { tirageLe: null } }),
  ]);
  revalidatePath("/", "layout");
}

/* ─────────────────────────────── Liste de souhaits ─────────────────────────────── */

async function lireSouhait(f: FormData) {
  return {
    titre: texte(f, "titre", 120),
    // Un lien court Amazon (amzn.eu/…) est déplié : sinon il ne peut pas porter notre identifiant.
    lien: await deplierLienCourt(lienSur(texte(f, "lien", 1000))),
    prix: entierPositif(texte(f, "prix", 10)),
    note: texte(f, "note", 300),
  };
}

export async function ajouterSouhait(jeton: string, _: Etat, f: FormData): Promise<Etat> {
  const moi = await participantParJeton(jeton);
  const s = await lireSouhait(f);
  if (!s.titre) return { erreur: "Quel cadeau ?" };
  if ((await prisma.souhait.count({ where: { participantId: moi.id } })) >= 50) return { erreur: "50 idées au maximum." };
  await prisma.souhait.create({ data: { ...s, participantId: moi.id } });
  revalidatePath("/", "layout");
  return { ok: "Ajouté à votre liste." };
}

export async function modifierSouhait(jeton: string, souhaitId: string, _: Etat, f: FormData): Promise<Etat> {
  const moi = await participantParJeton(jeton);
  const s = await lireSouhait(f);
  if (!s.titre) return { erreur: "Quel cadeau ?" };
  const { count } = await prisma.souhait.updateMany({ where: { id: souhaitId, participantId: moi.id }, data: s });
  if (!count) return { erreur: "Idée introuvable." };
  revalidatePath("/", "layout");
  return { ok: "Modifié." };
}

export async function supprimerSouhait(jeton: string, souhaitId: string) {
  const moi = await participantParJeton(jeton);
  await prisma.souhait.deleteMany({ where: { id: souhaitId, participantId: moi.id } });
  revalidatePath("/", "layout");
}

/** Réserver (ou libérer) l'idée d'un autre membre du groupe, pour éviter les doublons. */
export async function basculerReservation(jeton: string, souhaitId: string) {
  const moi = await participantParJeton(jeton);
  const souhait = await prisma.souhait.findUnique({ where: { id: souhaitId }, include: { participant: true } });
  if (!souhait || souhait.participant.groupeId !== moi.groupeId) throw new Error("Idée introuvable.");
  if (souhait.participantId === moi.id) throw new Error("On ne réserve pas sa propre idée.");
  if (souhait.reserveParId === moi.id) {
    await prisma.souhait.update({ where: { id: souhaitId }, data: { reserveParId: null } });
  } else {
    // Conditionnel : deux personnes qui touchent « réserver » à la même seconde ne s'écrasent pas.
    const { count } = await prisma.souhait.updateMany({ where: { id: souhaitId, reserveParId: null }, data: { reserveParId: moi.id } });
    if (!count) throw new Error("Quelqu'un vient de la réserver.");
  }
  revalidatePath(`/p/${jeton}`);
}

/* ───────────────────────────── Questions anonymes ───────────────────────────── */

export async function poserQuestion(jeton: string, _: Etat, f: FormData): Promise<Etat> {
  const moi = await participantParJeton(jeton);
  if (!moi.destinataireId) return { erreur: "Le tirage n'est pas encore fait." };
  const t = texte(f, "texte", 400);
  if (!t) return { erreur: "Votre question est vide." };
  if ((await prisma.question.count({ where: { pereId: moi.id } })) >= 30) return { erreur: "30 questions au maximum." };
  await prisma.question.create({ data: { pereId: moi.id, destinataireId: moi.destinataireId, texte: t } });
  revalidatePath("/", "layout");
  return { ok: "Question envoyée, anonymement." };
}

export async function repondreQuestion(jeton: string, questionId: string, _: Etat, f: FormData): Promise<Etat> {
  const moi = await participantParJeton(jeton);
  const r = texte(f, "reponse", 400);
  if (!r) return { erreur: "Votre réponse est vide." };
  const { count } = await prisma.question.updateMany({ where: { id: questionId, destinataireId: moi.id }, data: { reponse: r } });
  if (!count) return { erreur: "Question introuvable." };
  revalidatePath("/", "layout");
  return { ok: "Réponse envoyée." };
}
