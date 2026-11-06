/**
 * Les liens ouverts sur cet appareil, pour les retrouver depuis l'accueil.
 *
 * Il n'y a pas de compte : sans cette mémoire, celui qui perd son SMS perd son
 * groupe. Elle reste sur l'appareil et n'est jamais envoyée au serveur.
 */
export type LienGarde = {
  /** admin : organisateur · perso : participant · liste-proprio : sa propre liste · liste : la liste d'un proche */
  type: "admin" | "perso" | "liste-proprio" | "liste";
  jeton: string;
  groupe: string;
  prenom?: string;
  /** Espace d'une autre personne, inscrite depuis cet appareil (un enfant, un proche). */
  pourAutre?: boolean;
  /** Pour « liste-proprio » : le lien de partage de la même liste (on y masque alors les réservations). */
  jetonPartage?: string;
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
    const jetonPartage = lien.jetonPartage ?? ancien?.jetonPartage;
    localStorage.setItem(CLE, JSON.stringify([{ ...lien, pourAutre, jetonPartage, vuLe: Date.now() }, ...autres].slice(0, 30)));
  } catch {
    // Navigation privée ou stockage bloqué : la page marche sans.
  }
}

/** Cet appareil est-il celui de la personne fêtée ? (elle a le lien propriétaire de cette liste) */
export function estProprioDe(jetonPartage: string): boolean {
  return lireLiens().some((l) => l.type === "liste-proprio" && l.jetonPartage === jetonPartage);
}

/** Un identifiant propre à cet appareil, pour annuler ses propres réservations. */
export function jetonAppareil(): string {
  try {
    let j = localStorage.getItem("quioffre:appareil");
    if (!j) {
      j = crypto.randomUUID().replace(/-/g, "");
      localStorage.setItem("quioffre:appareil", j);
    }
    return j;
  } catch {
    return "";
  }
}

export function oublierLien(type: LienGarde["type"], jeton: string) {
  try {
    localStorage.setItem(CLE, JSON.stringify(lireLiens().filter((l) => !(l.type === type && l.jeton === jeton))));
  } catch {}
}
