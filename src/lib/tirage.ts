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

/**
 * Quelqu'un se désiste après le tirage : on ajuste le moins possible.
 *
 * A offrait à X, X offrait à B. Une fois X retiré, A n'a plus personne et B
 * n'a plus de Père Noël.
 *  1. Le plus simple : A offre désormais à B. Une seule personne change.
 *  2. Si c'est impossible (A = B, ou A et B s'excluent), on raccroche ailleurs
 *     dans la chaîne : une flèche C → D devient C → B, et A offre à D.
 *     Deux personnes changent.
 *  3. Sinon : `null`, et il faut refaire le tirage en entier.
 *
 * @returns la nouvelle table (sans X) et les donneurs dont le destinataire a changé.
 */
export function retirerDuTirage(
  table: ReadonlyMap<string, string>,
  x: string,
  exclusions: readonly Paire[] = [],
  alea: () => number = Math.random,
): { table: Map<string, string>; changes: string[] } | null {
  if (!table.has(x)) return null;
  const interdit = new Set<string>();
  for (const { a, b } of exclusions) {
    if (a === x || b === x) continue;
    interdit.add(`${a}>${b}`);
    interdit.add(`${b}>${a}`);
  }
  const possible = (de: string, pour: string) => de !== pour && !interdit.has(`${de}>${pour}`);

  const b = table.get(x)!;
  const a = [...table].find(([, pour]) => pour === x)?.[0];
  if (!a) return null;

  const reste = new Map([...table].filter(([de]) => de !== x));
  if (reste.size < 3) return null;

  if (possible(a, b)) {
    reste.set(a, b);
    return { table: reste, changes: [a] };
  }

  const candidats = melanger(
    [...reste].filter(([c, d]) => c !== a && d !== b && c !== b && possible(c, b) && possible(a, d)),
    alea,
  );
  // `reste` contient encore A → X : on ne peut pas raccrocher sur cette flèche-là.
  const choix = candidats.find(([, d]) => d !== x);
  if (!choix) return null;
  const [c, d] = choix;
  reste.set(c, b);
  reste.set(a, d);
  return { table: reste, changes: [a, c] };
}

/**
 * L'organisateur échange les destinataires de deux personnes (une erreur à
 * corriger, deux personnes qui préfèrent s'inverser…), sans voir le tirage.
 *
 * A offrait à X, B offrait à Y : A offre désormais à Y, B à X. Refusé (`null`)
 * si quelqu'un s'offrirait à lui-même (A tirait B, ou B tirait A), ou si une
 * exclusion l'interdit.
 */
export function echangerTirages(
  table: ReadonlyMap<string, string>,
  a: string,
  b: string,
  exclusions: readonly Paire[] = [],
): Map<string, string> | null {
  const x = table.get(a);
  const y = table.get(b);
  if (!x || !y || a === b) return null;
  const interdit = new Set(exclusions.flatMap(({ a: p, b: q }) => [`${p}>${q}`, `${q}>${p}`]));
  if (y === a || x === b || interdit.has(`${a}>${y}`) || interdit.has(`${b}>${x}`)) return null;
  const nouvelle = new Map(table);
  nouvelle.set(a, y);
  nouvelle.set(b, x);
  return nouvelle;
}
