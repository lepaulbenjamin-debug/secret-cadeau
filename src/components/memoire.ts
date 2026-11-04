/**
 * Les liens ouverts sur cet appareil, pour les retrouver depuis l'accueil.
 *
 * Il n'y a pas de compte : sans cette mémoire, celui qui perd son SMS perd son
 * groupe. Elle reste sur l'appareil et n'est jamais envoyée au serveur.
 */
export type LienGarde = {
  type: "admin" | "perso";
  jeton: string;
  groupe: string;
  prenom?: string;
  vuLe: number;
};

const CLE = "secret-cadeau:liens";

export function lireLiens(): LienGarde[] {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) ?? "[]");
    return Array.isArray(brut) ? brut : [];
  } catch {
    return [];
  }
}

export function garderLien(lien: Omit<LienGarde, "vuLe">) {
  try {
    const autres = lireLiens().filter((l) => !(l.type === lien.type && l.jeton === lien.jeton));
    localStorage.setItem(CLE, JSON.stringify([{ ...lien, vuLe: Date.now() }, ...autres].slice(0, 30)));
  } catch {
    // Navigation privée ou stockage bloqué : la page marche sans.
  }
}

export function oublierLien(type: LienGarde["type"], jeton: string) {
  try {
    localStorage.setItem(CLE, JSON.stringify(lireLiens().filter((l) => !(l.type === type && l.jeton === jeton))));
  } catch {}
}
