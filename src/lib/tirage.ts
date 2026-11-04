/**
 * Le tirage au sort.
 *
 * Chacun offre à exactement une personne et reçoit d'exactement une personne,
 * personne ne se tire soi-même, et les exclusions (un couple, deux frères qui
 * se font déjà un cadeau…) sont respectées dans les deux sens.
 *
 * Retour arrière sur un ordre mélangé : pour quelques dizaines de personnes
 * c'est instantané, et contrairement au « on remélange jusqu'à ce que ça
 * passe », on sait répondre « impossible » quand les exclusions sont trop
 * nombreuses au lieu de tourner en rond.
 */

export type Paire = { a: string; b: string };

export function melanger<T>(liste: readonly T[], alea: () => number = Math.random): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * @returns une table « qui offre → à qui », ou `null` si aucun tirage ne
 *          respecte les exclusions.
 */
export function tirer(
  ids: readonly string[],
  exclusions: readonly Paire[] = [],
  alea: () => number = Math.random,
): Map<string, string> | null {
  if (ids.length < 2) return null;

  const interdit = new Set<string>();
  for (const { a, b } of exclusions) {
    interdit.add(`${a}>${b}`);
    interdit.add(`${b}>${a}`);
  }
  const possible = (de: string, pour: string) => de !== pour && !interdit.has(`${de}>${pour}`);

  // Les plus contraints d'abord : le retour arrière tombe vite sur les impasses.
  const donneurs = melanger(ids, alea).sort(
    (x, y) => ids.filter((p) => possible(x, p)).length - ids.filter((p) => possible(y, p)).length,
  );

  const pris = new Set<string>();
  const resultat = new Map<string, string>();

  const placer = (i: number): boolean => {
    if (i === donneurs.length) return true;
    const de = donneurs[i];
    for (const pour of melanger(ids, alea)) {
      if (pris.has(pour) || !possible(de, pour)) continue;
      pris.add(pour);
      resultat.set(de, pour);
      if (placer(i + 1)) return true;
      pris.delete(pour);
      resultat.delete(de);
    }
    return false;
  };

  return placer(0) ? resultat : null;
}
