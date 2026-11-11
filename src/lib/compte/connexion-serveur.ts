import "server-only";

import { prisma } from "../prisma";

import { codeASixChiffres, empreinte, normaliserEmail, secretAleatoire } from "./secret";

/**
 * Connexion par e-mail : un lien ET un code à 6 chiffres dans le même message.
 *
 * ⚠️ POURQUOI UN CODE EN PLUS DU LIEN. Sur iPhone, l'application installée depuis
 * Safari n'a pas les cookies de Safari : un lien reçu par e-mail s'ouvre dans
 * Safari et y ouvrirait la session, pas dans l'application. Le code se tape là
 * où l'on veut être connecté. Idem dans l'application des stores.
 *
 * Garde-fous : on ne garde que les empreintes ; 20 minutes ; usage unique ;
 * 5 essais de code par demande ; 5 demandes par heure et par adresse.
 */
const DUREE_MS = 20 * 60 * 1000;
const MAX_DEMANDES_HEURE = 5;
const MAX_ESSAIS = 5;

export async function preparerConnexion(emailBrut: string, maintenant = new Date()): Promise<{ lien: string; code: string } | null> {
  const email = normaliserEmail(emailBrut);
  const recentes = await prisma.jetonConnexion.count({ where: { email, creeLe: { gte: new Date(maintenant.getTime() - 3600_000) } } });
  if (recentes >= MAX_DEMANDES_HEURE) return null;
  const lien = secretAleatoire();
  const code = codeASixChiffres();
  await prisma.jetonConnexion.create({
    data: { id: empreinte(lien), email, code: empreinte(`${email}:${code}`), expireLe: new Date(maintenant.getTime() + DUREE_MS), creeLe: maintenant },
  });
  return { lien, code };
}

/** Le compte de cette adresse, créé au premier passage. L'adresse a été vérifiée par l'appelant. */
export async function compteVerifie(emailBrut: string, nom = "") {
  const email = normaliserEmail(emailBrut);
  return prisma.compte.upsert({
    where: { email },
    create: { email, nom: nom.slice(0, 80) },
    update: { vuLe: new Date(), ...(nom ? { nom: nom.slice(0, 80) } : {}) },
  });
}

/** Le lien du courriel : valable une fois, 20 minutes. */
export async function consommerLien(lien: string, maintenant = new Date()) {
  const id = empreinte(String(lien));
  const { count } = await prisma.jetonConnexion.updateMany({
    where: { id, utiliseLe: null, expireLe: { gt: maintenant } },
    data: { utiliseLe: maintenant },
  });
  if (!count) return null;
  const j = await prisma.jetonConnexion.findUnique({ where: { id } });
  return j ? compteVerifie(j.email) : null;
}

/** Le code à 6 chiffres. Un essai raté compte contre toutes les demandes encore valables de l'adresse. */
export async function verifierCode(emailBrut: string, codeBrut: string, maintenant = new Date()) {
  const email = normaliserEmail(emailBrut);
  const code = String(codeBrut).replace(/\D/g, "");
  const actives = await prisma.jetonConnexion.findMany({
    where: { email, utiliseLe: null, expireLe: { gt: maintenant }, essais: { lt: MAX_ESSAIS } },
    orderBy: { creeLe: "desc" },
  });
  const bonne = code.length === 6 ? actives.find((j) => j.code === empreinte(`${email}:${code}`)) : undefined;
  if (!bonne) {
    if (actives.length) await prisma.jetonConnexion.updateMany({ where: { id: { in: actives.map((j) => j.id) } }, data: { essais: { increment: 1 } } });
    return null;
  }
  const { count } = await prisma.jetonConnexion.updateMany({ where: { id: bonne.id, utiliseLe: null }, data: { utiliseLe: maintenant } });
  return count ? compteVerifie(email) : null;
}
