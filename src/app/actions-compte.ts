"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Etat, Refus } from "@/app/actions";
import { consommerLien, preparerConnexion, verifierCode } from "@/lib/compte/connexion-serveur";
import { normaliserEmail, suiteSure } from "@/lib/compte/secret";
import { compteCourant, fermerSession, ouvrirSession } from "@/lib/compte/session";
import { envoyerEmail } from "@/lib/email";
import { contenuConnexion } from "@/lib/emails-compte";
import { prisma } from "@/lib/prisma";
import { emailFacultatif } from "@/lib/saisie";
import { SITE_URL } from "@/lib/site";

export type EtatConnexion = { erreur?: string; email?: string; suite?: string } | null;

/**
 * Étape 1 : l'adresse. ⚠️ LA MÊME RÉPONSE QU'ELLE SOIT CONNUE OU NON : le compte
 * se crée à la première connexion, il n'y a donc rien à deviner.
 */
export async function demanderConnexion(_: EtatConnexion, f: FormData): Promise<EtatConnexion> {
  const email = emailFacultatif(f, "email");
  const suite = suiteSure(f.get("suite"));
  if (!email) return { erreur: "Indiquez une adresse e-mail valide." };
  const prep = await preparerConnexion(email);
  if (!prep) return { erreur: "Trop de demandes pour cette adresse. Réessayez dans une heure, ou utilisez le dernier code reçu.", email, suite };
  const site = SITE_URL;
  const lien = `${site}/connexion/lien?j=${prep.lien}&suite=${encodeURIComponent(suite)}`;
  const r = await envoyerEmail({ a: normaliserEmail(email), ...contenuConnexion({ site, lien, code: prep.code }) }).catch((e: Error) => ({ ok: false, motif: e.message }));
  if (!r.ok) {
    console.log("Connexion par e-mail :", r.motif);
    return { erreur: "L'e-mail n'a pas pu partir. Réessayez dans un instant." };
  }
  return { email: normaliserEmail(email), suite };
}

/** Étape 2 : le code à 6 chiffres. */
export async function connexionParCode(_: EtatConnexion, f: FormData): Promise<EtatConnexion> {
  const email = String(f.get("email") ?? "");
  const suite = suiteSure(f.get("suite"));
  const compte = await verifierCode(email, String(f.get("code") ?? ""));
  if (!compte) return { erreur: "Ce code n'est pas le bon, ou il a expiré. Vérifiez le dernier e-mail reçu.", email, suite };
  await ouvrirSession(compte.id);
  redirect(suite);
}

/** Le bouton de la page ouverte depuis l'e-mail (un clic : les robots des messageries ne cliquent pas). */
export async function connexionParLien(_: Etat, f: FormData): Promise<Etat> {
  const compte = await consommerLien(String(f.get("j") ?? ""));
  if (!compte) return { erreur: "Ce lien a déjà servi ou a expiré. Demandez-en un nouveau." };
  await ouvrirSession(compte.id);
  redirect(suiteSure(f.get("suite")));
}

export async function deconnecter() {
  await fermerSession();
  redirect("/");
}

type Sorte = "perso" | "admin" | "liste";

/** Rattache à mon compte un espace dont j'ai le lien (le lien prouve le droit). */
export async function lierAMonCompte(sorte: Sorte, jeton: string): Promise<Refus> {
  const moi = await compteCourant();
  if (!moi) return { erreur: "Connectez-vous d'abord." };
  const n = await lier(moi.id, sorte, String(jeton));
  if (!n) return { erreur: "Cet espace est déjà rattaché à un autre compte." };
  revalidatePath("/", "layout");
}

async function lier(compteId: string, sorte: Sorte, jeton: string): Promise<number> {
  if (sorte === "perso") {
    return (await prisma.participant.updateMany({ where: { jeton, OR: [{ compteId: null }, { compteId }] }, data: { compteId } })).count;
  }
  if (sorte === "admin") {
    return (await prisma.groupe.updateMany({ where: { jetonAdmin: jeton, OR: [{ compteOrganisateurId: null }, { compteOrganisateurId: compteId }] }, data: { compteOrganisateurId: compteId } })).count;
  }
  return (await prisma.liste.updateMany({ where: { jetonProprio: jeton, OR: [{ compteId: null }, { compteId }] }, data: { compteId } })).count;
}

/**
 * Les liens gardés sur cet appareil (accueil) : rattachés d'un coup. On ne
 * reçoit que les espaces de la personne elle-même, jamais ceux qu'elle a
 * inscrits pour quelqu'un d'autre.
 */
export async function lierLiensAppareil(liens: { sorte: Sorte; jeton: string }[]): Promise<{ erreur?: string; n?: number }> {
  const moi = await compteCourant();
  if (!moi) return { erreur: "Connectez-vous d'abord." };
  let n = 0;
  for (const l of liens.slice(0, 30)) {
    if (["perso", "admin", "liste"].includes(l.sorte) && /^[\w-]{8,64}$/.test(l.jeton)) n += await lier(moi.id, l.sorte, l.jeton);
  }
  revalidatePath("/", "layout");
  return { n };
}

/** Supprime le compte : les groupes et listes restent, accessibles par leurs liens. */
export async function supprimerCompte(): Promise<Refus> {
  const moi = await compteCourant();
  if (!moi) return { erreur: "Vous n'êtes pas connecté." };
  await prisma.compte.delete({ where: { id: moi.id } });
  await fermerSession();
  redirect("/?compte=supprime");
}
