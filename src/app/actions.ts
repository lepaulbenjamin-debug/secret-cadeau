"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { groupeParJetonAdmin, participantParJeton } from "@/lib/acces";
import { deplierLienCourt } from "@/lib/affiliation";
import { apercuDuLien, type Apercu } from "@/lib/apercu";
import { lienSur, lirePrenoms } from "@/lib/format";
import { nouveauJeton } from "@/lib/jeton";
import { nomDeCodeAleatoire, nomsDeCodeAleatoires } from "@/lib/noms-de-code";
import { prisma } from "@/lib/prisma";
import { envoyerBienvenueOrganisateur, envoyerRappels } from "@/lib/rappels-serveur";
import { tirer } from "@/lib/tirage";

export type Etat = { erreur?: string; ok?: string } | null;

const texte = (f: FormData, cle: string, max = 200) => String(f.get(cle) ?? "").trim().slice(0, max);

function entierPositif(brut: string): number | null {
  const n = Number.parseInt(brut.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : null;
}

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** E-mail de l'organisateur : vide, ou valide. `null` = invalide. */
function emailOrganisateur(f: FormData): string | null {
  const e = texte(f, "emailOrganisateur", 120).toLowerCase();
  return !e || EMAIL_VALIDE.test(e) ? e : null;
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
  const email = emailOrganisateur(f);
  if (email === null) return { erreur: "Cette adresse e-mail ne semble pas valide." };

  // La liste peut rester vide : chacun peut s'inscrire avec le lien d'invitation.
  // Le minimum de trois participants est exigé au tirage, pas ici.
  const prenoms = participe
    ? [organisateur, ...autres.filter((p) => p.toLowerCase() !== organisateur.toLowerCase())]
    : autres;
  if (prenoms.length > MAX_PARTICIPANTS) return { erreur: `${MAX_PARTICIPANTS} participants au maximum.` };

  const noms = nomsDeCodeAleatoires(prenoms.length);
  const groupe = await prisma.groupe.create({
    data: {
      nom,
      dateEchange: dateOuNull(texte(f, "date", 10)),
      budget: entierPositif(texte(f, "budget", 10)),
      message: texte(f, "message", 500),
      nomsDeCode: f.get("nomsDeCode") === "on",
      emailOrganisateur: email,
      jetonAdmin: nouveauJeton(),
      jetonInvitation: nouveauJeton(),
      participants: {
        // L'organisateur qui participe reçoit aussi les rappels des participants, à la même adresse.
        create: prenoms.map((prenom, i) => ({
          prenom,
          nomDeCode: noms[i],
          jeton: nouveauJeton(),
          email: participe && i === 0 ? email : "",
        })),
      },
    },
    include: { participants: { orderBy: { creeLe: "asc" } } },
  });

  const perso = participe ? groupe.participants.find((p) => p.prenom === organisateur) : null;
  if (email) {
    // Son lien d'organisateur par e-mail, après la réponse : la création n'attend pas l'envoi.
    after(() =>
      envoyerBienvenueOrganisateur(groupe.id, { prenom: participe ? organisateur : "", jetonPerso: perso?.jeton ?? null }).then((r) =>
        console.log("Bienvenue organisateur :", JSON.stringify(r)),
      ),
    );
  }
  return { jetonAdmin: groupe.jetonAdmin, nom: groupe.nom, jetonPerso: perso?.jeton ?? null };
}

export async function modifierGroupe(jetonAdmin: string, _: Etat, f: FormData): Promise<Etat> {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  const nom = texte(f, "nom", 80);
  if (!nom) return { erreur: "Le nom ne peut pas être vide." };
  const email = emailOrganisateur(f);
  if (email === null) return { erreur: "Cette adresse e-mail ne semble pas valide." };
  await prisma.groupe.update({
    where: { id: groupe.id },
    data: {
      nom,
      dateEchange: dateOuNull(texte(f, "date", 10)),
      budget: entierPositif(texte(f, "budget", 10)),
      message: texte(f, "message", 500),
      nomsDeCode: f.get("nomsDeCode") === "on",
      emailOrganisateur: email,
      rappelsOrganisateur: f.get("rappelsOrganisateur") === "on",
    },
  });
  revalidatePath("/", "layout");
  return { ok: "Enregistré." };
}

export async function ajouterParticipants(jetonAdmin: string, _: Etat, f: FormData): Promise<Etat> {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  if (groupe.tirageLe) return { erreur: "Le tirage est fait : annulez-le pour ajouter quelqu'un." };
  const existants = await prisma.participant.findMany({ where: { groupeId: groupe.id }, select: { prenom: true, nomDeCode: true } });
  const deja = new Set(existants.map((p) => p.prenom.toLowerCase()));
  const nouveaux = lirePrenoms(String(f.get("prenoms") ?? "")).filter((p) => !deja.has(p.toLowerCase()));
  if (!nouveaux.length) return { erreur: "Aucun nouveau prénom." };
  if (existants.length + nouveaux.length > MAX_PARTICIPANTS) return { erreur: `${MAX_PARTICIPANTS} participants au maximum.` };
  const noms = nomsDeCodeAleatoires(nouveaux.length, existants.map((p) => p.nomDeCode));
  await prisma.participant.createMany({
    data: nouveaux.map((prenom, i) => ({ prenom, nomDeCode: noms[i], jeton: nouveauJeton(), groupeId: groupe.id })),
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

export async function lancerTirage(jetonAdmin: string, _etat: Etat, f: FormData): Promise<Etat> {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  if (groupe.tirageLe) return { erreur: "Le tirage est déjà fait." };
  const [participants, exclusions] = await Promise.all([
    prisma.participant.findMany({
      where: { groupeId: groupe.id },
      select: { id: true, prenom: true, _count: { select: { souhaits: true } } },
    }),
    prisma.exclusion.findMany({ where: { groupeId: groupe.id }, select: { aId: true, bId: true } }),
  ]);
  if (participants.length < 3) return { erreur: "Il faut au moins trois participants." };

  // Mode mystère : on offre à un nom de code, sans savoir qui c'est. Sans liste,
  // le Père Noël n'a strictement rien pour choisir.
  const vides = participants.filter((p) => p._count.souhaits === 0).map((p) => p.prenom);
  if (groupe.nomsDeCode && vides.length && f?.get("forcer") !== "on") {
    return {
      erreur: `Mode mystère : la liste est obligatoire, et ${vides.length > 1 ? `${vides.length} personnes n'ont` : "1 personne n'a"} encore rien noté (${vides.join(", ")}). Relancez-les, ou cochez « Lancer quand même ».`,
    };
  }

  const resultat = tirer(participants.map((p) => p.id), exclusions.map((e) => ({ a: e.aId, b: e.bId })));
  if (!resultat) return { erreur: "Impossible de faire un tirage avec ces exclusions. Retirez-en une ou deux." };

  await prisma.$transaction([
    // Libérer d'abord : `destinataireId` est unique, une écriture croisée échouerait sinon.
    prisma.participant.updateMany({ where: { groupeId: groupe.id }, data: { destinataireId: null } }),
    ...[...resultat].map(([de, pour]) => prisma.participant.update({ where: { id: de }, data: { destinataireId: pour } })),
    prisma.groupe.update({ where: { id: groupe.id }, data: { tirageLe: new Date() } }),
  ]);
  // L'e-mail « le tirage est fait » part après la réponse : l'organisateur n'attend pas les envois.
  after(() => envoyerRappels({ groupeId: groupe.id }).then((b) => console.log("Rappels du tirage :", JSON.stringify(b))));
  revalidatePath("/", "layout");
  return { ok: "Le tirage est fait ! Chacun découvre sa personne en ouvrant son lien." };
}

export async function annulerTirage(jetonAdmin: string) {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  await prisma.$transaction([
    // Les questions s'adressaient à un Père Noël qui n'est plus le bon.
    prisma.question.deleteMany({ where: { pere: { groupeId: groupe.id } } }),
    // Un nouveau tirage mérite un nouvel e-mail « le tirage est fait ».
    prisma.rappel.deleteMany({ where: { type: "tirage", participant: { groupeId: groupe.id } } }),
    prisma.participant.updateMany({ where: { groupeId: groupe.id }, data: { destinataireId: null } }),
    prisma.groupe.update({ where: { id: groupe.id }, data: { tirageLe: null } }),
  ]);
  revalidatePath("/", "layout");
}

export type Suppression = { jetons: string[] } | { erreur: string };

/**
 * Supprime le groupe et tout ce qu'il contient : participants, listes,
 * réservations, questions, tirage, rappels (suppression en cascade).
 *
 * Le nom du groupe doit être retapé : un appui distrait ne doit pas effacer
 * les listes de toute une famille. Renvoie les liens du groupe pour que
 * l'appareil de l'organisateur les oublie.
 */
export async function supprimerGroupe(jetonAdmin: string, _: unknown, f: FormData): Promise<Suppression> {
  const groupe = await prisma.groupe.findUnique({ where: { jetonAdmin }, include: { participants: { select: { jeton: true } } } });
  if (!groupe) return { erreur: "Ce groupe n'existe plus." };
  const tape = texte(f, "confirmation", 80).toLowerCase().replace(/\s+/g, " ");
  if (tape !== groupe.nom.toLowerCase().replace(/\s+/g, " ")) return { erreur: `Tapez exactement « ${groupe.nom} » pour confirmer.` };
  await prisma.groupe.delete({ where: { id: groupe.id } });
  // ⚠️ Pas de revalidatePath ici : il re-rendrait la page courante, qui n'existe
  // plus, et la page « introuvable » remplacerait le formulaire avant qu'il ait
  // pu nettoyer l'appareil et rediriger. Les pages du groupe sont dynamiques :
  // elles tombent d'elles-mêmes en 404.
  return { jetons: [jetonAdmin, ...groupe.participants.map((p) => p.jeton)] };
}

/** Un nouveau lien d'invitation : l'ancien cesse de marcher (utile s'il a trop circulé). */
export async function regenererInvitation(jetonAdmin: string) {
  const groupe = await groupeParJetonAdmin(jetonAdmin);
  await prisma.groupe.update({ where: { id: groupe.id }, data: { jetonInvitation: nouveauJeton() } });
  revalidatePath(`/g/${jetonAdmin}`);
}

/* ─────────────────────────────── Inscription et coordonnées ─────────────────────────────── */

function lireCoordonnees(f: FormData): { email: string; telephone: string } | { erreur: string } {
  const email = texte(f, "email", 120).toLowerCase();
  const telephone = texte(f, "telephone", 30).replace(/[^\d+]/g, "");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { erreur: "Cette adresse e-mail ne semble pas valide." };
  if (telephone && !/^\+?\d{6,15}$/.test(telephone)) return { erreur: "Ce numéro de téléphone ne semble pas valide." };
  return { email, telephone };
}

export type Inscription = { jeton: string; nom: string; prenom: string } | { erreur: string };

export async function rejoindreGroupe(jetonInvitation: string, _: unknown, f: FormData): Promise<Inscription> {
  const groupe = await prisma.groupe.findUnique({
    where: { jetonInvitation },
    include: { participants: { select: { prenom: true, nomDeCode: true } } },
  });
  if (!groupe) return { erreur: "Ce lien d'invitation n'est plus valable. Demandez-en un nouveau à l'organisateur." };
  if (groupe.tirageLe) return { erreur: "Le tirage est déjà fait : demandez à l'organisateur de vous ajouter." };
  if (groupe.participants.length >= MAX_PARTICIPANTS) return { erreur: "Le groupe est complet." };

  const prenom = lirePrenoms(texte(f, "prenom", 40))[0];
  if (!prenom) return { erreur: "Indiquez votre prénom." };
  if (groupe.participants.some((p) => p.prenom.toLowerCase() === prenom.toLowerCase())) {
    return { erreur: `Il y a déjà un « ${prenom} » dans le groupe. Ajoutez l'initiale de votre nom (ex. « ${prenom} B. »). Si c'est vous, retrouvez votre lien auprès de l'organisateur.` };
  }
  const coordonnees = lireCoordonnees(f);
  if ("erreur" in coordonnees) return coordonnees;

  const p = await prisma.participant.create({
    data: {
      groupeId: groupe.id,
      prenom,
      nomDeCode: nomDeCodeAleatoire(groupe.participants.map((x) => x.nomDeCode)),
      jeton: nouveauJeton(),
      ...coordonnees,
    },
  });
  revalidatePath("/", "layout");
  return { jeton: p.jeton, nom: groupe.nom, prenom };
}

/** « Tirer un autre nom de code » : un nouveau, toujours unique dans le groupe. */
export async function changerNomDeCode(jeton: string) {
  const moi = await participantParJeton(jeton);
  // Après le tirage, le nom de code est écrit sur le paquet : il ne bouge plus.
  if (moi.groupe.tirageLe) throw new Error("Le tirage est fait : votre nom de code est figé, c'est lui qui sera écrit sur votre paquet.");
  const autres = await prisma.participant.findMany({ where: { groupeId: moi.groupeId }, select: { nomDeCode: true } });
  await prisma.participant.update({
    where: { id: moi.id },
    data: { nomDeCode: nomDeCodeAleatoire(autres.map((p) => p.nomDeCode)) },
  });
  revalidatePath("/", "layout");
}

export async function modifierCoordonnees(jeton: string, _: Etat, f: FormData): Promise<Etat> {
  const moi = await participantParJeton(jeton);
  const coordonnees = lireCoordonnees(f);
  if ("erreur" in coordonnees) return coordonnees;
  await prisma.participant.update({ where: { id: moi.id }, data: { ...coordonnees, rappelsEmail: f.get("rappelsEmail") === "on" } });
  revalidatePath("/", "layout");
  return { ok: "Coordonnées enregistrées." };
}

/* ─────────────────────────────── Liste de souhaits ─────────────────────────────── */

/** Une image d'idée : seulement en https, sinon rien (elle est affichée chez les autres). */
function imageSure(brut: string): string {
  const lien = lienSur(brut);
  return lien.startsWith("https://") ? lien : "";
}

async function lireSouhait(f: FormData) {
  return {
    image: imageSure(texte(f, "image", 1000)),
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

/**
 * Ce qu'on peut deviner d'un lien collé (titre, image, prix), pour remplir le
 * formulaire. Réservé aux participants : sans jeton, ce serait un service
 * public de récupération de pages au nom de notre serveur.
 */
export async function apercuLien(jeton: string, brut: string): Promise<Apercu | null> {
  await participantParJeton(jeton);
  const lien = await deplierLienCourt(lienSur(brut.slice(0, 1000)));
  if (!lien) return null;
  return apercuDuLien(lien);
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
