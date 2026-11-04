import { randomBytes } from "node:crypto";

/**
 * Un jeton de lien personnel : 128 bits d'aléa, en base64url (22 caractères).
 * Impossible à deviner, assez court pour tenir dans un SMS.
 */
export function nouveauJeton(): string {
  return randomBytes(16).toString("base64url");
}
