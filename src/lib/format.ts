const JOUR_MS = 24 * 60 * 60 * 1000;

export function dateLongue(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(d);
}

/** Nombre de jours calendaires (heure de Paris) entre aujourd'hui et `d` : 0 = aujourd'hui, négatif = passé. */
export function joursAvant(d: Date, maintenant = new Date()): number {
  const jour = (x: Date) => Math.floor(new Date(x.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" })).getTime() / JOUR_MS);
  return jour(d) - jour(maintenant);
}

/** « dans 12 jours », « demain », « c'est aujourd'hui ! », ou rien une fois passé. */
export function compteARebours(d: Date, maintenant = new Date()): string | null {
  const n = joursAvant(d, maintenant);
  if (n < 0) return null;
  if (n === 0) return "c'est aujourd'hui !";
  if (n === 1) return "c'est demain";
  return `dans ${n} jours`;
}

export function euros(n: number): string {
  return `${n} €`;
}

/** Les prénoms saisis un par ligne (ou séparés par des virgules), nettoyés et dédoublonnés. */
export function lirePrenoms(texte: string): string[] {
  const vus = new Set<string>();
  const sortie: string[] = [];
  for (const brut of texte.split(/[\n,;]+/)) {
    const p = brut.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!p || vus.has(p.toLowerCase())) continue;
    vus.add(p.toLowerCase());
    sortie.push(p);
  }
  return sortie;
}

/** N'accepte que les liens http(s) : un `javascript:` dans une liste de cadeaux serait cliqué par les autres. */
export function lienSur(brut: string): string {
  const s = brut.trim();
  if (!s) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

export function domaine(lien: string): string {
  try {
    return new URL(lien).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
