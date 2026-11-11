import { createHash, randomBytes, randomInt } from "node:crypto";

/** Un secret aléatoire (256 bits), en base64url. */
export const secretAleatoire = () => randomBytes(32).toString("base64url");

/** L'empreinte d'un secret : c'est elle, et jamais le secret, qui est gardée en base. */
export const empreinte = (s: string) => createHash("sha256").update(s).digest("hex");

/** Un code à 6 chiffres, à taper quand le lien s'ouvre ailleurs (application installée). */
export const codeASixChiffres = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

/** Une adresse de retour sûre : un chemin du site, jamais un autre domaine (« //pirate.fr »). */
export function suiteSure(brut: unknown, defaut = "/compte"): string {
  const s = String(brut ?? "");
  return /^\/(?![/\\])[^\s]*$/.test(s) && s.length < 500 ? s : defaut;
}

export const normaliserEmail = (e: string) => e.trim().toLowerCase();
