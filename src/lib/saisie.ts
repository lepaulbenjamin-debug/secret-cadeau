/**
 * Lecture des formulaires, partagée par les actions des groupes et des listes.
 * Tout ce qui vient d'un formulaire est tronqué, nettoyé, et validé ici.
 */
import { deplierLienCourt } from "./affiliation";
import { lienSur } from "./format";

export const texte = (f: FormData, cle: string, max = 200) => String(f.get(cle) ?? "").trim().slice(0, max);

export function entierPositif(brut: string): number | null {
  const n = Number.parseInt(brut.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : null;
}

/** Un prix en euros, centimes compris : « 12,99 », « 12.99 », « 1 299,90 € ». `null` si vide ou absurde. */
export function prixPositif(brut: string): number | null {
  const nettoye = brut.replace(/[^\d,.]/g, "");
  // La dernière virgule ou le dernier point suivi d'un ou deux chiffres sépare les centimes.
  const m = nettoye.match(/^(.*?)[,.](\d{1,2})$/);
  const n = m ? Number(`${m[1].replace(/[,.]/g, "") || "0"}.${m[2]}`) : Number(nettoye.replace(/[,.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n * 100) / 100, 100000) : null;
}

export const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Un e-mail facultatif : vide, ou valide. `null` = invalide. */
export function emailFacultatif(f: FormData, cle: string): string | null {
  const e = texte(f, cle, 120).toLowerCase();
  return !e || EMAIL_VALIDE.test(e) ? e : null;
}

export function dateOuNull(brut: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(brut)) return null;
  // Midi à Paris : la date reste la même quel que soit le fuseau de lecture.
  return new Date(`${brut}T12:00:00+01:00`);
}

/** Une image d'idée : seulement en https, sinon rien (elle est affichée chez les autres). */
export function imageSure(brut: string): string {
  const lien = lienSur(brut);
  return lien.startsWith("https://") ? lien : "";
}

/** Une idée de cadeau (liste d'un participant ou liste d'anniversaire). */
export async function lireIdee(f: FormData) {
  return {
    image: imageSure(texte(f, "image", 1000)),
    titre: texte(f, "titre", 120),
    // Un lien court Amazon (amzn.eu/…) est déplié : sinon il ne peut pas porter notre identifiant.
    lien: await deplierLienCourt(lienSur(texte(f, "lien", 1000))),
    prix: prixPositif(texte(f, "prix", 15)),
    note: texte(f, "note", 300),
  };
}
