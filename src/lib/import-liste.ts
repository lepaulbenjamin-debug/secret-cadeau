/**
 * Importer une liste d'idées tenue ailleurs.
 *
 * Deux entrées :
 *  - du TEXTE : une idée par ligne, avec ou sans lien (« Un casque https://… ») ;
 *  - le LIEN d'une liste publique sur un autre site : on lit la page.
 *
 * Pour une page, deux lectures, de la plus fiable à la plus approximative :
 *  1. les données structurées (JSON-LD : Product, ItemList) que beaucoup de sites
 *     publient pour Google ;
 *  2. à défaut, les liens de la page qui mènent vers une autre boutique, avec leur
 *     texte comme titre.
 *
 * ⚠️ RIEN N'EST IMPORTÉ SANS ÊTRE MONTRÉ : la personne coche ce qu'elle garde.
 * ⚠️ Les listes Amazon ne sont jamais lues (contrat Partenaires) : on garde leur lien.
 */

import { decoder, lirePrix } from "./apercu";

export type IdeeImportee = { titre: string; lien: string; image: string; prix: number | null };

export const MAX_IMPORT = 30;

const URL_DANS_TEXTE = /https?:\/\/[^\s<>"']+/i;

/** Une idée par ligne ; les puces et numéros en tête de ligne sont retirés. */
export function lireLignes(texte: string): { titre: string; lien: string }[] {
  const sortie: { titre: string; lien: string }[] = [];
  for (const brute of texte.split(/\r?\n/)) {
    const ligne = brute.trim();
    if (!ligne) continue;
    const lien = ligne.match(URL_DANS_TEXTE)?.[0].replace(/[),.;]+$/, "") ?? "";
    const titre = ligne
      .replace(URL_DANS_TEXTE, " ")
      .replace(/^\s*(?:[-*•·–]|\d+[.)])\s*/, "")
      .replace(/\s*[:\-–—]\s*$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    if (!titre && !lien) continue;
    sortie.push({ titre, lien });
    if (sortie.length >= MAX_IMPORT) break;
  }
  return sortie;
}

/** Le texte n'est-il qu'un lien, seul ? (alors c'est une liste à lire, pas une idée) */
export function lienSeul(texte: string): string | null {
  const t = texte.trim();
  return /^https?:\/\/\S+$/i.test(t) ? t : null;
}

type Noeud = Record<string, unknown>;

function chaine(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return chaine(v[0]);
  if (v && typeof v === "object") return chaine((v as Noeud).url ?? (v as Noeud)["@id"] ?? (v as Noeud).contentUrl);
  return "";
}

function absolue(brut: string, base: string): string {
  if (!brut) return "";
  try {
    const u = new URL(brut, base);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

/** 1. Les produits des données structurées (JSON-LD), où qu'ils soient dans la page. */
function depuisJsonLd(html: string, base: string): IdeeImportee[] {
  const vus = new Map<string, IdeeImportee>();
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
      if (Array.isArray(n)) {
        pile.push(...n);
        continue;
      }
      if (!n || typeof n !== "object") continue;
      const o = n as Noeud;
      const type = o["@type"];
      const estProduit = type === "Product" || (Array.isArray(type) && type.includes("Product"));
      if (estProduit && typeof o.name === "string") {
        const offre = (Array.isArray(o.offers) ? o.offers[0] : o.offers) as Noeud | undefined;
        const lien = absolue(chaine(o.url) || chaine(offre?.url), base);
        const titre = decoder(o.name).slice(0, 120);
        const cle = lien || titre.toLowerCase();
        if (titre && !vus.has(cle)) {
          vus.set(cle, { titre, lien, image: absolue(chaine(o.image), base).replace(/^http:/, "https:"), prix: lirePrix(offre?.price ?? offre?.lowPrice) });
        }
      }
      for (const cle of ["@graph", "itemListElement", "item", "mainEntity", "hasPart"]) if (o[cle]) pile.push(o[cle]);
    }
  }
  return [...vus.values()];
}

const HOTES_IGNORES = /(^|\.)(facebook|instagram|twitter|x|pinterest|tiktok|youtube|linkedin|whatsapp|google|apple|play\.google|t\.me|telegram|mailto)\./i;
const TEXTES_IGNORES = /^(voir|acheter|ajouter|partager|connexion|se connecter|s'inscrire|accueil|menu|contact|aide|en savoir plus|plus|suivant|précédent|cookies?|mentions? légales|confidentialité|cgu|cgv|offrir|réserver)\b/i;

/** 2. À défaut : les liens vers d'autres sites, avec leur texte. */
function depuisLiens(html: string, base: string): IdeeImportee[] {
  let hoteBase = "";
  try {
    hoteBase = new URL(base).hostname.replace(/^www\./, "");
  } catch {}
  const vus = new Map<string, IdeeImportee>();
  for (const [, href, interieur] of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const lien = absolue(decoder(href), base);
    if (!lien) continue;
    const u = new URL(lien);
    const hote = u.hostname.replace(/^www\./, "");
    if (!hote || hote === hoteBase || hote.endsWith(`.${hoteBase}`) || HOTES_IGNORES.test(`${hote}.`)) continue;
    if (u.pathname.length < 3) continue; // une page d'accueil n'est pas un cadeau
    const titre = decoder(interieur.replace(/<[^>]+>/g, " ")).slice(0, 120);
    if (titre.length < 3 || TEXTES_IGNORES.test(titre) || /^https?:/i.test(titre)) continue;
    if (!vus.has(lien)) vus.set(lien, { titre, lien, image: "", prix: null });
  }
  return [...vus.values()];
}

export function extraireListe(html: string, base: string): { idees: IdeeImportee[]; methode: "donnees" | "liens" | "aucune" } {
  const structurees = depuisJsonLd(html, base);
  if (structurees.length >= 2) return { idees: structurees.slice(0, MAX_IMPORT), methode: "donnees" };
  const liens = depuisLiens(html, base);
  if (liens.length >= 2) return { idees: liens.slice(0, MAX_IMPORT), methode: "liens" };
  if (structurees.length === 1) return { idees: structurees, methode: "donnees" };
  return { idees: [], methode: "aucune" };
}
