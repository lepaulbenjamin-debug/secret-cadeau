/** Les occasions d'une liste de cadeaux (hors Secret Santa). */
export const OCCASIONS = {
  anniversaire: { libelle: "Anniversaire", emoji: "🎂", titre: (p: string) => `L'anniversaire de ${p}` },
  naissance: { libelle: "Naissance", emoji: "👶", titre: (p: string) => `La naissance de ${p}` },
  mariage: { libelle: "Mariage", emoji: "💍", titre: (p: string) => `Le mariage de ${p}` },
  noel: { libelle: "Noël", emoji: "🎄", titre: (p: string) => `Le Noël de ${p}` },
  autre: { libelle: "Autre occasion", emoji: "🎁", titre: (p: string) => `La liste de ${p}` },
} as const;

export type Occasion = keyof typeof OCCASIONS;

export function occasion(brut: string): Occasion {
  return brut in OCCASIONS ? (brut as Occasion) : "anniversaire";
}

/** « 🎂 L'anniversaire de Léa » */
export function titreListe(l: { prenom: string; occasion: string }): string {
  const o = OCCASIONS[occasion(l.occasion)];
  return `${o.emoji} ${o.titre(l.prenom)}`;
}
