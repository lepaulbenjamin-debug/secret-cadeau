/**
 * Remplir une idée de cadeau à partir d'un lien collé : titre, image, prix.
 *
 * ⚠️ AMAZON N'EST JAMAIS LU. Le contrat Partenaires interdit d'aspirer ses
 * pages : les informations produit — et surtout les prix — doivent venir de son
 * API officielle. On se contente donc du titre écrit dans l'adresse elle-même
 * (`amazon.fr/Livre-Recettes-Italiennes/dp/…`), sans aucune requête chez Amazon.
 * L'image et le prix viendront de l'API Partenaires le jour où elle sera ouverte.
 *
 * Pour les autres sites, on lit les métadonnées de partage que la page publie
 * elle-même pour les réseaux sociaux (Open Graph, JSON-LD) : ce qu'un aperçu
 * de lien WhatsApp afficherait. Beaucoup de grandes enseignes refusent les
 * robots (403) : on retombe alors, là aussi, sur le titre tiré de l'adresse.
 */

import { boutiqueAmazon } from "./affiliation";

export type Apercu = { titre: string; image: string; prix: number | null };

const VIDE: Apercu = { titre: "", image: "", prix: null };

/* ───────────────────────── Lecture du HTML ───────────────────────── */

const ENTITES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", euro: "€" };

export function decoder(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITES[n.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

/** Les balises <meta>, en dictionnaire `property|name → content` (la première l'emporte). */
function metas(html: string): Map<string, string> {
  const sortie = new Map<string, string>();
  for (const balise of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attr = (nom: string) => balise.match(new RegExp(`\\b${nom}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2];
    const cle = (attr("property") ?? attr("name") ?? attr("itemprop"))?.toLowerCase();
    const valeur = attr("content");
    if (cle && valeur && !sortie.has(cle)) sortie.set(cle, decoder(valeur));
  }
  return sortie;
}

type Noeud = Record<string, unknown>;

/** Le premier objet JSON-LD de type Product (y compris dans un @graph ou une liste). */
function produitJsonLd(html: string): Noeud | null {
  for (const [, brut] of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let donnees: unknown;
    try {
      donnees = JSON.parse(brut.trim());
    } catch {
      continue;
    }
    const pile: unknown[] = [donnees];
    while (pile.length) {
      const n = pile.shift();
      if (Array.isArray(n)) pile.push(...n);
      else if (n && typeof n === "object") {
        const o = n as Noeud;
        const type = o["@type"];
        if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) return o;
        if (o["@graph"]) pile.push(o["@graph"]);
      }
    }
  }
  return null;
}

function premiereChaine(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return premiereChaine(v[0]);
  if (v && typeof v === "object") return premiereChaine((v as Noeud).url ?? (v as Noeud).contentUrl);
  return "";
}

/** « 29,99 € », « 1 299.00 », 29.99 → euros entiers arrondis. */
export function lirePrix(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) && v > 0 ? Math.round(v) : null;
  if (typeof v !== "string") return null;
  const nettoye = v.replace(/[^\d,.]/g, "");
  // Une virgule suivie de 1-2 chiffres en fin de chaîne est un séparateur décimal.
  const normalise = /,\d{1,2}$/.test(nettoye) ? nettoye.replace(/\./g, "").replace(",", ".") : nettoye.replace(/,/g, "");
  const n = Number.parseFloat(normalise);
  return Number.isFinite(n) && n > 0 && n < 1_000_000 ? Math.round(n) : null;
}

function prixJsonLd(produit: Noeud): number | null {
  const offres = produit.offers;
  const liste = Array.isArray(offres) ? offres : offres ? [offres] : [];
  for (const o of liste as Noeud[]) {
    const p = lirePrix(o.price ?? o.lowPrice ?? (o.priceSpecification as Noeud | undefined)?.price);
    if (p) return p;
  }
  return null;
}

/** « Chaussures Trail XYZ | Decathlon » → « Chaussures Trail XYZ ». */
function sansNomDuSite(titre: string): string {
  // « | » sépare toujours le nom du site ; un tiret seulement s'il est le dernier
  // (« L'Atelier — Puzzle - MonShop »). Le tiret long fait partie du titre.
  const morceaux = titre.split(/\s+\|\s+|\s+-\s+(?=[^-]+$)/);
  return (morceaux[0]?.length ?? 0) >= 4 ? morceaux[0] : titre;
}

function imageSure(brut: string, base: string): string {
  if (!brut) return "";
  try {
    const u = new URL(brut, base);
    if (u.protocol === "http:") u.protocol = "https:";
    return u.protocol === "https:" && u.toString().length <= 1000 ? u.toString() : "";
  } catch {
    return "";
  }
}

export function extraireApercu(html: string, url: string): Apercu {
  const m = metas(html);
  const produit = produitJsonLd(html);
  const titreBalise = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  const titre = sansNomDuSite(
    decoder(
      (typeof produit?.name === "string" ? produit.name : "") ||
        m.get("og:title") ||
        m.get("twitter:title") ||
        titreBalise ||
        "",
    ),
  ).slice(0, 120);

  const image = imageSure(premiereChaine(produit?.image) || m.get("og:image") || m.get("og:image:url") || m.get("twitter:image") || "", url);

  const prix =
    (produit && prixJsonLd(produit)) ??
    lirePrix(m.get("product:price:amount") ?? m.get("og:price:amount") ?? m.get("price"));

  return { titre, image, prix };
}

/* ───────────────────────── Titre tiré de l'adresse ───────────────────────── */

/** `/Livre-Recettes-Italiennes/dp/B0…` → « Livre Recettes Italiennes ». */
export function titreDepuisAdresse(lien: string): string {
  let u: URL;
  try {
    u = new URL(lien);
  } catch {
    return "";
  }
  const segments = u.pathname.split("/").filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  const iDp = segments.findIndex((s) => s === "dp" || s === "gp");
  const candidats = boutiqueAmazon(lien) && iDp > 0 ? [segments[iDp - 1]] : [...segments].reverse();
  const lisible = candidats.find((s) => /[a-zà-ÿ]{3,}.*[-_].*[a-zà-ÿ]{2,}/i.test(s) && !/^\d+$/.test(s));
  if (!lisible) return "";
  const mots = lisible
    .replace(/\.(html?|php|aspx?)$/i, "")
    .replace(/[-_+]+/g, " ")
    .replace(/\b[a-z]{0,2}\d{4,}\b$/i, "") // un identifiant en fin de segment (« -p12345 »), pas « xt5 »
    .replace(/\s+/g, " ")
    .trim();
  return mots ? (mots[0].toUpperCase() + mots.slice(1)).slice(0, 120) : "";
}

/* ───────────────────────── Récupération sûre ───────────────────────── */

/**
 * ⚠️ LE SERVEUR VA CHERCHER UNE ADRESSE QU'UN INCONNU A TAPÉE. Sans garde-fou,
 * « http://169.254.169.254/… » ou « http://localhost:5432 » ferait interroger
 * nos propres machines. On refuse tout ce qui n'est pas une adresse publique,
 * à chaque redirection.
 */
export function ipPrivee(ip: string): boolean {
  const v4 = ip.replace(/^::ffff:/i, "");
  if (/^\d+\.\d+\.\d+\.\d+$/.test(v4)) {
    const [a, b] = v4.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80") || v6.startsWith("ff");
}

type Resolveur = (hote: string) => Promise<string[]>;

async function resolveurParDefaut(hote: string): Promise<string[]> {
  const { lookup } = await import("node:dns/promises");
  return (await lookup(hote, { all: true })).map((r) => r.address);
}

async function adressePublique(lien: string, resoudre: Resolveur): Promise<boolean> {
  let u: URL;
  try {
    u = new URL(lien);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  if (u.port && u.port !== "80" && u.port !== "443") return false;
  if (u.username || u.password) return false;
  const hote = u.hostname.replace(/^\[|\]$/g, "");
  if (hote === "localhost" || hote.endsWith(".local") || hote.endsWith(".internal")) return false;
  try {
    const ips = /^[\d.]+$|:/.test(hote) ? [hote] : await resoudre(hote);
    return ips.length > 0 && ips.every((ip) => !ipPrivee(ip));
  } catch {
    return false;
  }
}

const TAILLE_MAX = 1_500_000;

async function lireDebut(r: Response): Promise<string> {
  if (!r.body) return "";
  const lecteur = r.body.getReader();
  const morceaux: Uint8Array[] = [];
  let total = 0;
  while (total < TAILLE_MAX) {
    const { done, value } = await lecteur.read();
    if (done) break;
    morceaux.push(value);
    total += value.length;
    // Les métadonnées sont dans <head> : inutile de lire la suite.
    if (new TextDecoder().decode(value).includes("</head>")) break;
  }
  await lecteur.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(morceaux));
}

export async function apercuDuLien(
  lien: string,
  { fetcher = fetch, resoudre = resolveurParDefaut }: { fetcher?: typeof fetch; resoudre?: Resolveur } = {},
): Promise<Apercu> {
  const deLAdresse = { ...VIDE, titre: titreDepuisAdresse(lien) };

  // Amazon : jamais de requête (voir en tête de fichier).
  if (boutiqueAmazon(lien)) return deLAdresse;

  let courant = lien;
  try {
    for (let saut = 0; saut < 5; saut++) {
      if (!(await adressePublique(courant, resoudre))) return deLAdresse;
      const r = await fetcher(courant, {
        redirect: "manual",
        signal: AbortSignal.timeout(6000),
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; QuiOffreBot/1.0; +https://www.quioffre.fr)",
          accept: "text/html,application/xhtml+xml",
          "accept-language": "fr-FR,fr;q=0.9",
        },
      });
      const suivant = r.headers.get("location");
      if (r.status >= 300 && r.status < 400 && suivant) {
        courant = new URL(suivant, courant).toString();
        if (boutiqueAmazon(courant)) return { ...VIDE, titre: titreDepuisAdresse(courant) || deLAdresse.titre };
        continue;
      }
      if (!r.ok || !(r.headers.get("content-type") ?? "").includes("html")) return deLAdresse;
      const lu = extraireApercu(await lireDebut(r), courant);
      return { titre: lu.titre || deLAdresse.titre, image: lu.image, prix: lu.prix };
    }
  } catch {
    // Site lent, refus, coupure : on garde ce que l'adresse dit.
  }
  return deLAdresse;
}
