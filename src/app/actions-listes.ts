"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import type { Etat, Refus } from "@/app/actions";
import { lirePrenoms } from "@/lib/format";
import { nouveauJeton } from "@/lib/jeton";
import { occasion } from "@/lib/occasions";
import { compteCourant } from "@/lib/compte/session";
import { prisma } from "@/lib/prisma";
import { envoyerBienvenueListe } from "@/lib/rappels-serveur";
import { dateOuNull, emailFacultatif, lireIdee, texte } from "@/lib/saisie";

/**
 * Les listes de cadeaux hors Secret Santa (anniversaire, naissance…).
 *
 * Deux liens, comme pour les groupes : `jetonProprio` (la personne fêtée remplit
 * sa liste) et `jetonPartage` (ses proches réservent). Le propriétaire ne voit
 * JAMAIS les réservations : ni qui, ni quoi.
 */

const MAX_IDEES = 80;

async function listeProprio(jetonProprio: string) {
  return prisma.liste.findUnique({ where: { jetonProprio } });
}

export type ListeCreee = { jetonProprio: string; jetonPartage: string; prenom: string; occasion: string } | { erreur: string };

export async function creerListe(_: unknown, f: FormData): Promise<ListeCreee> {
  const prenom = lirePrenoms(texte(f, "prenom", 40))[0];
  if (!prenom) return { erreur: "Pour qui est cette liste ? Indiquez un prénom." };
  const email = emailFacultatif(f, "email");
  if (email === null) return { erreur: "Cette adresse e-mail ne semble pas valide." };
  const liste = await prisma.liste.create({
    data: {
      prenom,
      occasion: occasion(texte(f, "occasion", 20)),
      date: dateOuNull(texte(f, "date", 10)),
      message: texte(f, "message", 500),
      emailProprio: email,
      compteId: (await compteCourant())?.id,
      jetonProprio: nouveauJeton(),
      jetonPartage: nouveauJeton(),
    },
  });
  if (email) {
    after(() => envoyerBienvenueListe(liste.id).then((r) => console.log("Bienvenue liste :", JSON.stringify(r))));
  }
  return { jetonProprio: liste.jetonProprio, jetonPartage: liste.jetonPartage, prenom, occasion: liste.occasion };
}

export async function modifierListe(jetonProprio: string, _: Etat, f: FormData): Promise<Etat> {
  const liste = await listeProprio(jetonProprio);
  if (!liste) return { erreur: "Cette liste n'existe plus." };
  const prenom = lirePrenoms(texte(f, "prenom", 40))[0];
  if (!prenom) return { erreur: "Le prénom ne peut pas être vide." };
  const email = emailFacultatif(f, "email");
  if (email === null) return { erreur: "Cette adresse e-mail ne semble pas valide." };
  await prisma.liste.update({
    where: { id: liste.id },
    data: { prenom, occasion: occasion(texte(f, "occasion", 20)), date: dateOuNull(texte(f, "date", 10)), message: texte(f, "message", 500), emailProprio: email },
  });
  revalidatePath(`/ma-liste/${jetonProprio}`);
  return { ok: "Enregistré." };
}

export async function ajouterIdeeListe(jetonProprio: string, _: Etat, f: FormData): Promise<Etat> {
  const liste = await listeProprio(jetonProprio);
  if (!liste) return { erreur: "Cette liste n'existe plus." };
  const idee = await lireIdee(f);
  if (!idee.titre) return { erreur: "Quel cadeau ?" };
  if ((await prisma.ideeListe.count({ where: { listeId: liste.id } })) >= MAX_IDEES) return { erreur: `${MAX_IDEES} idées au maximum.` };
  await prisma.ideeListe.create({ data: { ...idee, listeId: liste.id } });
  revalidatePath(`/ma-liste/${jetonProprio}`);
  return { ok: "Ajouté à votre liste." };
}

export async function modifierIdeeListe(jetonProprio: string, ideeId: string, _: Etat, f: FormData): Promise<Etat> {
  const liste = await listeProprio(jetonProprio);
  if (!liste) return { erreur: "Cette liste n'existe plus." };
  const idee = await lireIdee(f);
  if (!idee.titre) return { erreur: "Quel cadeau ?" };
  const { count } = await prisma.ideeListe.updateMany({ where: { id: ideeId, listeId: liste.id }, data: idee });
  if (!count) return { erreur: "Idée introuvable." };
  revalidatePath(`/ma-liste/${jetonProprio}`);
  return { ok: "Modifié." };
}

export async function supprimerIdeeListe(jetonProprio: string, ideeId: string): Promise<Refus> {
  const liste = await listeProprio(jetonProprio);
  if (!liste) return { erreur: "Cette liste n'existe plus." };
  await prisma.ideeListe.deleteMany({ where: { id: ideeId, listeId: liste.id } });
  revalidatePath(`/ma-liste/${jetonProprio}`);
}

/** Supprime la liste et ses idées. Renvoie les jetons à oublier sur l'appareil. */
export async function supprimerListe(jetonProprio: string): Promise<{ jetons: string[] } | { erreur: string }> {
  const liste = await listeProprio(jetonProprio);
  if (!liste) return { erreur: "Cette liste n'existe plus." };
  await prisma.liste.delete({ where: { id: liste.id } });
  // Pas de revalidatePath : la page courante n'existe plus (voir supprimerGroupe).
  return { jetons: [liste.jetonProprio, liste.jetonPartage] };
}

/* ───────────────────────────── Réservations par les proches ───────────────────────────── */

const JETON_APPAREIL = /^[\w-]{16,64}$/;

/**
 * Un proche réserve une idée. Son prénom est montré aux autres proches (« Déjà
 * réservé par Tom »), jamais à la personne fêtée ; le jeton de son appareil lui
 * permet d'annuler, et à personne d'autre.
 */
export async function reserverIdee(jetonPartage: string, ideeId: string, prenomBrut: string, jetonAppareil: string): Promise<Refus> {
  const prenom = lirePrenoms(String(prenomBrut).slice(0, 40))[0];
  if (!prenom) return { erreur: "Indiquez votre prénom pour réserver." };
  if (!JETON_APPAREIL.test(jetonAppareil)) return { erreur: "Réservation impossible depuis ce navigateur." };
  const liste = await prisma.liste.findUnique({ where: { jetonPartage } });
  if (!liste) return { erreur: "Cette liste n'existe plus." };
  // Conditionnel : deux proches qui touchent « réserver » à la même seconde ne s'écrasent pas.
  const { count } = await prisma.ideeListe.updateMany({
    where: { id: ideeId, listeId: liste.id, jetonReserve: "" },
    data: { reservePar: prenom, jetonReserve: jetonAppareil, reserveLe: new Date(), reserveCompteId: (await compteCourant())?.id ?? null },
  });
  if (!count) return { erreur: "Quelqu'un vient de la réserver." };
  revalidatePath(`/liste/${jetonPartage}`);
}

export async function annulerReservation(jetonPartage: string, ideeId: string, jetonAppareil: string): Promise<Refus> {
  const liste = await prisma.liste.findUnique({ where: { jetonPartage } });
  if (!liste) return { erreur: "Cette liste n'existe plus." };
  // Depuis l'appareil de la réservation, ou depuis n'importe quel appareil connecté au même compte.
  const compte = await compteCourant();
  const qui = [{ jetonReserve: jetonAppareil || "—" }, ...(compte ? [{ reserveCompteId: compte.id }] : [])];
  const { count } = await prisma.ideeListe.updateMany({
    where: { id: ideeId, listeId: liste.id, NOT: { jetonReserve: "" }, OR: qui },
    data: { reservePar: "", jetonReserve: "", reserveLe: null, reserveCompteId: null },
  });
  if (!count) return { erreur: "Seule la personne qui a réservé peut annuler, depuis son appareil." };
  revalidatePath(`/liste/${jetonPartage}`);
}
