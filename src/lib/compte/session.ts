import "server-only";

import { cookies } from "next/headers";

import { prisma } from "../prisma";

import { empreinte, secretAleatoire } from "./secret";

/**
 * La session : un cookie `httpOnly` qui porte un secret ; la base n'en garde que
 * l'empreinte. 90 jours. `SameSite=Lax` : le cookie suit un lien venu d'un
 * e-mail ou de Google, mais pas une requête forgée depuis un autre site.
 */
export const COOKIE_SESSION = "qo_session";
const DUREE_S = 90 * 24 * 3600;

export const optionsCookie = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

/** Crée la session et renvoie le secret du cookie (à poser par l'appelant). */
export async function creerSession(compteId: string): Promise<string> {
  const secret = secretAleatoire();
  await prisma.session.create({ data: { id: empreinte(secret), compteId, expireLe: new Date(Date.now() + DUREE_S * 1000) } });
  return secret;
}

/** Ouvre la session dans une action serveur (pose le cookie). */
export async function ouvrirSession(compteId: string) {
  const secret = await creerSession(compteId);
  (await cookies()).set(COOKIE_SESSION, secret, optionsCookie(DUREE_S));
}

export const DUREE_SESSION_S = DUREE_S;

/** Le compte connecté, ou `null`. */
export async function compteCourant() {
  const secret = (await cookies()).get(COOKIE_SESSION)?.value;
  if (!secret) return null;
  const s = await prisma.session.findUnique({ where: { id: empreinte(secret) }, include: { compte: true } });
  if (!s || s.expireLe < new Date()) return null;
  return s.compte;
}

export async function fermerSession() {
  const jar = await cookies();
  const secret = jar.get(COOKIE_SESSION)?.value;
  if (secret) await prisma.session.deleteMany({ where: { id: empreinte(secret) } });
  jar.set(COOKIE_SESSION, "", optionsCookie(0));
}
