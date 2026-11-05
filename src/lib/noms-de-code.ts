/**
 * Les noms de code : « Pingouin Farceur 🐧 », « Licorne Grognonne 🦄 »…
 *
 * Un personnage et un adjectif accordé en genre. Le personnage est unique dans
 * le groupe jusqu'à 40 personnes ; au-delà, seul le nom complet l'est (1 600 combinaisons).
 */

type Personnage = { nom: string; f: boolean; emoji: string };

const PERSONNAGES: Personnage[] = [
  { nom: "Pingouin", f: false, emoji: "🐧" },
  { nom: "Renne", f: false, emoji: "🦌" },
  { nom: "Lutin", f: false, emoji: "🧝" },
  { nom: "Bonhomme de neige", f: false, emoji: "⛄" },
  { nom: "Ours polaire", f: false, emoji: "🐻‍❄️" },
  { nom: "Hérisson", f: false, emoji: "🦔" },
  { nom: "Écureuil", f: false, emoji: "🐿️" },
  { nom: "Hibou", f: false, emoji: "🦉" },
  { nom: "Raton laveur", f: false, emoji: "🦝" },
  { nom: "Panda", f: false, emoji: "🐼" },
  { nom: "Koala", f: false, emoji: "🐨" },
  { nom: "Flamant rose", f: false, emoji: "🦩" },
  { nom: "Paresseux", f: false, emoji: "🦥" },
  { nom: "Morse", f: false, emoji: "🦭" },
  { nom: "Lama", f: false, emoji: "🦙" },
  { nom: "Renard", f: false, emoji: "🦊" },
  { nom: "Bretzel", f: false, emoji: "🥨" },
  { nom: "Marron chaud", f: false, emoji: "🌰" },
  { nom: "Sapin", f: false, emoji: "🎄" },
  { nom: "Grelot", f: false, emoji: "🔔" },
  { nom: "Licorne", f: true, emoji: "🦄" },
  { nom: "Loutre", f: true, emoji: "🦦" },
  { nom: "Patate", f: true, emoji: "🥔" },
  { nom: "Marmotte", f: true, emoji: "🐹" },
  { nom: "Girafe", f: true, emoji: "🦒" },
  { nom: "Baleine", f: true, emoji: "🐋" },
  { nom: "Tortue", f: true, emoji: "🐢" },
  { nom: "Grenouille", f: true, emoji: "🐸" },
  { nom: "Pieuvre", f: true, emoji: "🐙" },
  { nom: "Abeille", f: true, emoji: "🐝" },
  { nom: "Fée", f: true, emoji: "🧚" },
  { nom: "Étoile filante", f: true, emoji: "🌠" },
  { nom: "Bûche", f: true, emoji: "🪵" },
  { nom: "Cacahuète", f: true, emoji: "🥜" },
  { nom: "Guirlande", f: true, emoji: "✨" },
  { nom: "Chaussette", f: true, emoji: "🧦" },
  { nom: "Papillote", f: true, emoji: "🍬" },
  { nom: "Mandarine", f: true, emoji: "🍊" },
  { nom: "Crêpe", f: true, emoji: "🥞" },
  { nom: "Boule à neige", f: true, emoji: "🔮" },
];

/** [masculin, féminin] */
const ADJECTIFS: [string, string][] = [
  ["Farceur", "Farceuse"],
  ["Grognon", "Grognonne"],
  ["Gourmand", "Gourmande"],
  ["Malicieux", "Malicieuse"],
  ["Rigolo", "Rigolote"],
  ["Mystérieux", "Mystérieuse"],
  ["Câlin", "Câline"],
  ["Distrait", "Distraite"],
  ["Pétillant", "Pétillante"],
  ["Ronchon", "Ronchonne"],
  ["Endormi", "Endormie"],
  ["Frileux", "Frileuse"],
  ["Chanceux", "Chanceuse"],
  ["Masqué", "Masquée"],
  ["Discret", "Discrète"],
  ["Pressé", "Pressée"],
  ["Rêveur", "Rêveuse"],
  ["Têtu", "Têtue"],
  ["Coquin", "Coquine"],
  ["Joyeux", "Joyeuse"],
  ["Fanfaron", "Fanfaronne"],
  ["Timide", "Timide"],
  ["Pirate", "Pirate"],
  ["Magique", "Magique"],
  ["Scintillant", "Scintillante"],
  ["Enrhumé", "Enrhumée"],
  ["Danseur", "Danseuse"],
  ["Chanteur", "Chanteuse"],
  ["Curieux", "Curieuse"],
  ["Bavard", "Bavarde"],
  ["Gaffeur", "Gaffeuse"],
  ["Dodu", "Dodue"],
  ["Futé", "Futée"],
  ["Secret", "Secrète"],
  ["Sautillant", "Sautillante"],
  ["Glacé", "Glacée"],
  ["Paresseux", "Paresseuse"],
  ["Élégant", "Élégante"],
  ["Ninja", "Ninja"],
  ["Cosmique", "Cosmique"],
];

export function nomDeCodeAleatoire(dejaPris: Iterable<string> = [], alea: () => number = Math.random): string {
  const liste = [...dejaPris];
  const pris = new Set(liste.map((n) => n.toLowerCase()));
  // Un personnage déjà présent dans le groupe est évité tant qu'il en reste :
  // « Mandarine Pirate » qui offre à « Mandarine Ronchonne », c'est la confusion assurée.
  const persoPris = new Set(PERSONNAGES.filter((p) => liste.some((n) => n.startsWith(`${p.nom} `))).map((p) => p.nom));
  const libres = PERSONNAGES.filter((p) => !persoPris.has(p.nom));
  const vivier = libres.length ? libres : PERSONNAGES;
  for (let essai = 0; essai < 200; essai++) {
    const p = vivier[Math.floor(alea() * vivier.length)];
    const [m, f] = ADJECTIFS[Math.floor(alea() * ADJECTIFS.length)];
    // Pas de « Paresseux Paresseux ».
    if (m === p.nom) continue;
    const nom = `${p.nom} ${p.f ? f : m} ${p.emoji}`;
    if (!pris.has(nom.toLowerCase())) return nom;
  }
  // Groupe improbablement plein : un numéro départage.
  return `Lutin n°${pris.size + 1} 🧝`;
}

/** Plusieurs noms distincts d'un coup (création d'un groupe). */
export function nomsDeCodeAleatoires(n: number, dejaPris: Iterable<string> = []): string[] {
  const pris = [...dejaPris];
  const sortie: string[] = [];
  for (let i = 0; i < n; i++) {
    const nom = nomDeCodeAleatoire(pris);
    pris.push(nom);
    sortie.push(nom);
  }
  return sortie;
}
