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
  /** Espace d'une autre personne, inscrite depuis cet appareil (un enfant, un proche). */
  pourAutre?: boolean;
  vuLe: number;
};

const CLE = "quioffre:liens";

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
    const liens = lireLiens();
    const ancien = liens.find((l) => l.type === lien.type && l.jeton === lien.jeton);
    const autres = liens.filter((l) => l !== ancien);
    // Rouvrir l'espace de Léo depuis ce téléphone ne doit pas en faire « votre » espace.
    const pourAutre = lien.pourAutre ?? ancien?.pourAutre;
    localStorage.setItem(CLE, JSON.stringify([{ ...lien, pourAutre, vuLe: Date.now() }, ...autres].slice(0, 30)));
  } catch {
    // Navigation privée ou stockage bloqué : la page marche sans.
  }
}

export function oublierLien(type: LienGarde["type"], jeton: string) {
  try {
    localStorage.setItem(CLE, JSON.stringify(lireLiens().filter((l) => !(l.type === type && l.jeton === jeton))));
  } catch {}
}
