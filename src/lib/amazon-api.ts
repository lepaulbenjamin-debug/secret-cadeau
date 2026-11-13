/**
 * Titre, image et prix d'un produit Amazon par son API OFFICIELLE (Creators API,
 * qui remplace PA-API 5), la seule voie permise par le contrat Partenaires :
 * jamais la page produit elle-même.
 *
 * Variables (Partenaires → Outils → Creators API → identifiants) :
 *   AMAZON_CREATORS_ID, AMAZON_CREATORS_SECRET, et AMAZON_CREATORS_VERSION
 *   (« 3.2 » pour l'Europe, par défaut). Il faut aussi l'identifiant de la
 *   boutique (AMAZON_TAG_FR…) : l'API l'exige.
 * Sans elles, ou si Amazon refuse (compte pas encore éligible, quota), on
 * retombe sur le titre écrit dans l'adresse.
 */
import { asinDe, boutiqueAmazon, identifiant } from "./affiliation";

export type InfosAmazon = { titre: string; image: string; prix: number | null };

type Env = Record<string, string | undefined>;

const JETON_PAR_VERSION: Record<string, string> = {
  "3.1": "https://api.amazon.com/auth/o2/token",
  "3.2": "https://api.amazon.co.uk/auth/o2/token",
  "3.3": "https://api.amazon.co.jp/auth/o2/token",
};

let jeton: { valeur: string; expire: number } | null = null;

async function jetonAcces(env: Env, fetcher: typeof fetch): Promise<string | null> {
  if (jeton && jeton.expire > Date.now()) return jeton.valeur;
  const r = await fetcher(JETON_PAR_VERSION[env.AMAZON_CREATORS_VERSION ?? "3.2"] ?? JETON_PAR_VERSION["3.2"], {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(6000),
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: env.AMAZON_CREATORS_ID,
      client_secret: env.AMAZON_CREATORS_SECRET,
      scope: "creatorsapi::default",
    }),
  });
  if (!r.ok) return null;
  const d = (await r.json()) as { access_token?: string; expires_in?: number };
  if (!d.access_token) return null;
  // Une heure de validité : on le garde, avec une marge.
  jeton = { valeur: d.access_token, expire: Date.now() + Math.max(60, (d.expires_in ?? 3600) - 120) * 1000 };
  return jeton.valeur;
}

export const amazonApiConfiguree = (env: Env = process.env) => Boolean(env.AMAZON_CREATORS_ID && env.AMAZON_CREATORS_SECRET);

type Noeud = Record<string, unknown>;
const en = (o: unknown, ...chemin: string[]): unknown =>
  chemin.reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Noeud)[k] : undefined), o);

/** Lit la réponse de getItems (les deux orthographes vues dans la documentation). */
export function lireArticle(d: unknown): InfosAmazon | null {
  const resultat = en(d, "itemsResult") ?? en(d, "itemResults") ?? en(d, "ItemsResult");
  const items = en(resultat, "items") ?? en(resultat, "Items");
  const item = Array.isArray(items) ? (items[0] as Noeud) : null;
  if (!item) return null;
  const titre = String(en(item, "itemInfo", "title", "displayValue") ?? "").trim();
  const image = String(
    en(item, "images", "primary", "large", "url") ?? en(item, "images", "primary", "medium", "url") ?? en(item, "images", "primary", "small", "url") ?? "",
  );
  const offres = en(item, "offersV2", "listings");
  const prixBrut = Array.isArray(offres) ? (en(offres[0], "price", "money", "amount") ?? en(offres[0], "price", "amount")) : undefined;
  const prix = typeof prixBrut === "number" && prixBrut > 0 ? Math.round(prixBrut * 100) / 100 : null;
  if (!titre) return null;
  return { titre: titre.slice(0, 120), image: image.startsWith("https://") ? image : "", prix };
}

export async function infosAmazon(lien: string, env: Env = process.env, fetcher: typeof fetch = fetch): Promise<InfosAmazon | null> {
  if (!amazonApiConfiguree(env)) return null;
  const boutique = boutiqueAmazon(lien);
  const asin = asinDe(lien);
  const tag = boutique && identifiant(boutique, env);
  if (!boutique || !asin || !tag) return null;
  try {
    const acces = await jetonAcces(env, fetcher);
    if (!acces) return null;
    const marche = `www.amazon.${boutique}`;
    const r = await fetcher("https://creatorsapi.amazon/catalog/v1/getItems", {
      method: "POST",
      headers: { authorization: `Bearer ${acces}`, "content-type": "application/json", "x-marketplace": marche },
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({
        itemIds: [asin],
        itemIdType: "ASIN",
        marketplace: marche,
        partnerTag: tag,
        resources: ["itemInfo.title", "images.primary.large", "offersV2.listings.price"],
      }),
    });
    if (r.status === 401) jeton = null;
    if (!r.ok) {
      console.log("Amazon Creators API :", r.status, (await r.text().catch(() => "")).slice(0, 200));
      return null;
    }
    return lireArticle(await r.json());
  } catch {
    return null;
  }
}
