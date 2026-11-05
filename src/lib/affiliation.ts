/**
 * Les liens Amazon des listes d'envies portent NOTRE identifiant Partenaires.
 *
 * ⚠️ RÉÉCRITS À L'AFFICHAGE, PAS À L'ENREGISTREMENT. La base garde le lien
 * collé par la personne ; l'identifiant est posé au moment d'afficher. Changer
 * d'identifiant (ou l'enlever) vaut donc pour toutes les listes, anciennes
 * comprises, sans migration — et la personne qui modifie son idée retrouve
 * son lien tel qu'elle l'a collé.
 *
 * Un identifiant ne vaut que pour SA boutique : celui d'amazon.fr ne rapporte
 * rien sur amazon.de. D'où une variable par boutique, déduite du domaine :
 *
 *   amazon.fr    → AMAZON_TAG_FR
 *   amazon.de    → AMAZON_TAG_DE
 *   amazon.co.uk → AMAZON_TAG_CO_UK
 *   amazon.com   → AMAZON_TAG_COM
 *
 * Sans variable pour une boutique, le lien est laissé tel quel.
 */

const HOTE_AMAZON = /^(?:www\.|m\.|smile\.)?amazon\.((?:com?\.)?[a-z]{2,3})$/i;
const HOTES_COURTS = new Set(["amzn.eu", "amzn.to", "a.co", "amzn.com"]);

/** ASIN : l'identifiant produit, 10 caractères, dans les formes d'adresse courantes. */
const ASIN = /\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/ASIN|o\/ASIN)\/([A-Z0-9]{10})(?:[/?]|$)/i;

/** Paramètres de suivi ou d'affiliation d'un tiers, retirés avant de poser le nôtre. */
const PARAMS_A_RETIRER = [
  "tag", "ascsubtag", "linkCode", "linkId", "camp", "creative", "creativeASIN",
  "ref", "ref_", "pf_rd_r", "pf_rd_p", "pf_rd_m", "pf_rd_s", "pf_rd_t", "pf_rd_i",
  "pd_rd_r", "pd_rd_w", "pd_rd_wg", "pd_rd_i", "content-id", "psc", "smid", "spLa", "sp_csd", "qid", "sr", "crid", "sprefix", "dib", "dib_tag", "th",
];

type Env = Record<string, string | undefined>;

export function boutiqueAmazon(lien: string): string | null {
  try {
    const m = new URL(lien).hostname.match(HOTE_AMAZON);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

export function estLienCourtAmazon(lien: string): boolean {
  try {
    return HOTES_COURTS.has(new URL(lien).hostname.toLowerCase().replace(/^www\./, ""));
  } catch {
    return false;
  }
}

function identifiant(boutique: string, env: Env): string | null {
  const v = env[`AMAZON_TAG_${boutique.toUpperCase().replace(/\./g, "_")}`]?.trim();
  // Un identifiant Partenaires : lettres, chiffres, tirets (ex. « quioffre-21 »).
  return v && /^[\w-]{3,64}$/.test(v) ? v : null;
}

/** Y a-t-il au moins un identifiant configuré ? (pour afficher la mention obligatoire) */
export function affiliationActive(env: Env = process.env): boolean {
  return Object.keys(env).some((k) => k.startsWith("AMAZON_TAG_") && env[k]?.trim());
}

/**
 * Le lien à afficher : avec notre identifiant si c'est une boutique Amazon
 * configurée, sinon inchangé.
 */
export function lienAffiche(lien: string, env: Env = process.env): { url: string; affilie: boolean } {
  const boutique = boutiqueAmazon(lien);
  const tag = boutique && identifiant(boutique, env);
  if (!boutique || !tag) return { url: lien, affilie: false };

  const u = new URL(lien);
  const asin = u.pathname.match(ASIN)?.[1];
  if (asin) {
    // La forme canonique : courte, propre, sans le suivi de la personne qui a collé le lien.
    return { url: `https://www.amazon.${boutique}/dp/${asin.toUpperCase()}?tag=${encodeURIComponent(tag)}`, affilie: true };
  }
  // Recherche, page de marque, liste… : on garde l'adresse, on change l'identifiant.
  for (const p of PARAMS_A_RETIRER) u.searchParams.delete(p);
  u.searchParams.set("tag", tag);
  u.protocol = "https:";
  return { url: u.toString(), affilie: true };
}

/**
 * Déplie un lien court Amazon (amzn.eu/…, a.co/…) en lien complet, pour
 * pouvoir y poser l'identifiant. Appelé à l'enregistrement d'une idée.
 *
 * On ne suit que des redirections, sans télécharger les pages, et on ne
 * garde le résultat que s'il aboutit chez Amazon : sinon, le lien d'origine.
 */
export async function deplierLienCourt(lien: string, fetcher: typeof fetch = fetch): Promise<string> {
  if (!estLienCourtAmazon(lien)) return lien;
  let courant = lien;
  try {
    for (let i = 0; i < 5; i++) {
      const r = await fetcher(courant, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(4000),
        headers: { "user-agent": "Mozilla/5.0 (compatible; QuiOffre/1.0)" },
      });
      const suivant = r.headers.get("location");
      if (!suivant || r.status < 300 || r.status >= 400) break;
      courant = new URL(suivant, courant).toString();
      if (boutiqueAmazon(courant)) {
        // Un lien court mort renvoie sur l'accueil d'Amazon : ce n'est pas l'idée de la personne.
        return new URL(courant).pathname.length > 1 ? courant : lien;
      }
      // On ne va jamais frapper ailleurs que chez Amazon et ses raccourcisseurs.
      if (!estLienCourtAmazon(courant)) break;
    }
  } catch {
    // Réseau lent ou lien mort : on garde le lien tel quel, l'idée s'enregistre quand même.
  }
  return lien;
}

export const MENTION_AMAZON = "En tant que Partenaire Amazon, Qui Offre réalise un bénéfice sur les achats remplissant les conditions requises.";
