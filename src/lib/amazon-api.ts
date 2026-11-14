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

/**
 * Deux générations d'identifiants : 3.x (serveur de connexion Amazon, JSON) et
 * 2.x (les premiers, via Cognito, formulaire, et « Version » dans l'en-tête).
 * La version est affichée à la création des identifiants.
 */
const JETON_V3: Record<string, string> = {
  "3.1": "https://api.amazon.com/auth/o2/token",
  "3.2": "https://api.amazon.co.uk/auth/o2/token",
  "3.3": "https://api.amazon.co.jp/auth/o2/token",
};
const JETON_V2: Record<string, string> = {
  "2.1": "https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token",
  "2.2": "https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token",
  "2.3": "https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token",
};

const nettoyer = (v: string | undefined) => (v ?? "").trim().replace(/^v/i, "");
export const versionAmazon = (env: Env) => nettoyer(env.AMAZON_CREATORS_VERSION) || "3.2";

let jeton: { valeur: string; expire: number; version: string } | null = null;

/** Journal sans secret : l'étape qui a échoué et la réponse d'Amazon. */
const journal = (...m: unknown[]) => console.log("Amazon Creators API :", ...m);

async function jetonAcces(env: Env, fetcher: typeof fetch): Promise<string | null> {
  const version = versionAmazon(env);
  if (jeton && jeton.expire > Date.now() && jeton.version === version) return jeton.valeur;
  const id = (env.AMAZON_CREATORS_ID ?? "").trim();
  const secret = (env.AMAZON_CREATORS_SECRET ?? "").trim();
  const v2 = version.startsWith("2");
  const adresse = v2 ? JETON_V2[version] : JETON_V3[version];
  if (!adresse) {
    journal(`version « ${version} » inconnue (attendu 3.1, 3.2, 3.3, 2.1, 2.2 ou 2.3)`);
    return null;
  }
  const r = await fetcher(adresse, {
    method: "POST",
    headers: { "content-type": v2 ? "application/x-www-form-urlencoded" : "application/json" },
    signal: AbortSignal.timeout(6000),
    body: v2
      ? new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "creatorsapi/default" }).toString()
      : JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "creatorsapi::default" }),
  });
  if (!r.ok) {
    journal(`jeton refusé (version ${version}) :`, r.status, (await r.text().catch(() => "")).slice(0, 200));
    return null;
  }
  const d = (await r.json()) as { access_token?: string; expires_in?: number };
  if (!d.access_token) {
    journal("jeton absent de la réponse");
    return null;
  }
  // Une heure de validité : on le garde, avec une marge.
  jeton = { valeur: d.access_token, expire: Date.now() + Math.max(60, (d.expires_in ?? 3600) - 120) * 1000, version };
  return jeton.valeur;
}

export const amazonApiConfiguree = (env: Env = process.env) => Boolean(env.AMAZON_CREATORS_ID?.trim() && env.AMAZON_CREATORS_SECRET?.trim());

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
  if (!boutique || !asin || !tag) {
    journal(!asin ? "pas d'ASIN dans le lien" : `pas d'identifiant Partenaires pour amazon.${boutique}`);
    return null;
  }
  try {
    const acces = await jetonAcces(env, fetcher);
    if (!acces) return null;
    const version = versionAmazon(env);
    const marche = `www.amazon.${boutique}`;
    const r = await fetcher("https://creatorsapi.amazon/catalog/v1/getItems", {
      method: "POST",
      headers: {
        authorization: version.startsWith("2") ? `Bearer ${acces}, Version ${version}` : `Bearer ${acces}`,
        "content-type": "application/json",
        "x-marketplace": marche,
      },
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
      journal(`getItems ${asin} refusé :`, r.status, (await r.text().catch(() => "")).slice(0, 300));
      return null;
    }
    const d = await r.json();
    const article = lireArticle(d);
    if (!article) journal(`getItems ${asin} : réponse sans titre lisible`, JSON.stringify(d).slice(0, 300));
    return article;
  } catch (e) {
    journal("erreur réseau :", (e as Error).message);
    return null;
  }
}
