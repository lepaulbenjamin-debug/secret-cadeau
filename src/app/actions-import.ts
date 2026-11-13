"use server";

import { revalidatePath } from "next/cache";

import type { Etat } from "@/app/actions";
import { boutiqueAmazon, deplierLienCourt } from "@/lib/affiliation";
import { apercuDuLien, extraireApercu, recupererPage, suivreRedirections } from "@/lib/apercu";
import { domaine, lienSur } from "@/lib/format";
import {
  cadresListy,
  estListy,
  extraireListe,
  extraireListy,
  lienMarchand,
  lienSeul,
  lireLignes,
  MAX_IMPORT,
  pagePrivee,
  pageProduit,
  type IdeeImportee,
} from "@/lib/import-liste";
import { prisma } from "@/lib/prisma";
import { imageSure, prixPositif } from "@/lib/saisie";

/**
 * Importer une liste tenue ailleurs, et « Ma liste ailleurs ».
 *
 * Le même jeton sert aux deux sortes de listes : celui d'un participant (Secret
 * Santa) ou celui du propriétaire d'une liste d'anniversaire.
 */

type Proprietaire = { sorte: "participant" | "liste"; id: string; max: number };

async function proprietaire(jeton: string): Promise<Proprietaire | null> {
  const p = await prisma.participant.findUnique({ where: { jeton }, select: { id: true } });
  if (p) return { sorte: "participant", id: p.id, max: 50 };
  const l = await prisma.liste.findUnique({ where: { jetonProprio: jeton }, select: { id: true } });
  if (l) return { sorte: "liste", id: l.id, max: 80 };
  return null;
}

async function nombreIdees(p: Proprietaire): Promise<number> {
  return p.sorte === "participant"
    ? prisma.souhait.count({ where: { participantId: p.id } })
    : prisma.ideeListe.count({ where: { listeId: p.id } });
}

export type Previsualisation =
  | { idees: IdeeImportee[]; note?: string; lienListe?: string }
  | { erreur: string };

/** Lit ce qui a été collé et montre ce qui serait importé. N'écrit RIEN. */
export async function previsualiserImport(jeton: string, texteBrut: string): Promise<Previsualisation> {
  if (!(await proprietaire(jeton))) return { erreur: "Lien inconnu." };
  const texte = String(texteBrut).slice(0, 20000);
  const seul = lienSeul(texte);

  // Un lien seul : une liste à lire sur un autre site.
  if (seul) {
    const lien = await deplierLienCourt(lienSur(seul));
    if (!lien) return { erreur: "Ce lien ne semble pas valide." };
    if (boutiqueAmazon(lien)) {
      return {
        idees: [],
        lienListe: lien,
        note: "Amazon ne permet pas d'importer ses listes. Enregistrez ce lien comme « Ma liste ailleurs » : vos proches pourront l'ouvrir depuis Qui Offre.",
      };
    }
    const page = await recupererPage(lien, { jusquALaFin: true });
    if (!page || "amazon" in page) {
      return {
        idees: [],
        lienListe: lien,
        note: `Impossible de lire la page de ${domaine(lien) || "ce site"} (privée, ou le site refuse les robots). Enregistrez-la comme « Ma liste ailleurs », ou collez vos idées une par ligne.`,
      };
    }
    if (pagePrivee(page.html, page.url)) {
      const site = estListy(page.url) ? "Listy" : domaine(lien) || "ce site";
      return {
        idees: [],
        lienListe: lien,
        note: `Cette liste ${site} est privée : seules les personnes invitées peuvent la voir, Qui Offre non plus. Rendez-la publique sur ${site} puis réessayez, ou collez vos idées une par ligne.`,
      };
    }

    // Listy : une lecture dédiée, puis le vrai lien de la boutique, pris sur la page de chaque idée.
    if (estListy(page.url)) {
      const idees = extraireListy(page.html, page.url);
      // Les idées déjà réservées sont chargées à part par Listy : on les ajoute.
      for (const cadre of cadresListy(page.html, page.url)) {
        const p = await recupererPage(cadre, { jusquALaFin: true });
        if (!p || "amazon" in p) continue;
        for (const i of extraireListy(p.html, p.url)) if (!idees.some((x) => x.lien === i.lien)) idees.push(i);
      }
      idees.splice(MAX_IMPORT);
      if (idees.length) {
        await liensMarchands(idees);
        return { idees, lienListe: lien };
      }
    }

    const { idees, methode } = extraireListe(page.html, page.url);
    if (idees.length) {
      return {
        idees,
        lienListe: lien,
        note: methode === "liens" ? "Lu à partir des liens de la page : vérifiez les titres avant d'importer." : undefined,
      };
    }
    // Pas une liste : peut-être la page d'un seul produit. Seulement si la page le dit
    // (sinon on proposerait d'importer… le titre de la liste).
    const a = extraireApercu(page.html, page.url);
    if (a.titre && (a.prix != null || pageProduit(page.html))) return { idees: [{ titre: a.titre, lien, image: a.image, prix: a.prix }] };
    return {
      idees: [],
      lienListe: lien,
      note: `Aucune idée trouvée sur cette page de ${domaine(lien)}. Enregistrez-la comme « Ma liste ailleurs », ou collez vos idées une par ligne.`,
    };
  }

  // Du texte : une idée par ligne, chaque lien complété par son aperçu.
  const lignes = lireLignes(texte);
  if (!lignes.length) return { erreur: "Collez le lien de votre liste, ou vos idées (une par ligne)." };
  const idees: IdeeImportee[] = [];
  for (let i = 0; i < lignes.length; i += 5) {
    const lot = await Promise.all(
      lignes.slice(i, i + 5).map(async ({ titre, lien: brut }) => {
        const lien = brut ? await deplierLienCourt(lienSur(brut)) : "";
        if (!lien) return titre ? { titre, lien: "", image: "", prix: null } : null;
        const a = await apercuDuLien(lien);
        const t = titre || a.titre;
        return t ? { titre: t, lien, image: a.image, prix: a.prix } : null;
      }),
    );
    idees.push(...lot.filter((x): x is IdeeImportee => x !== null));
  }
  return { idees };
}

/** Importe les idées cochées, revalidées une à une. */
export async function importerIdees(jeton: string, choisies: IdeeImportee[]): Promise<Etat> {
  const p = await proprietaire(jeton);
  if (!p) return { erreur: "Lien inconnu." };
  const propres = (Array.isArray(choisies) ? choisies : [])
    .slice(0, MAX_IMPORT)
    .map((i) => ({
      titre: String(i?.titre ?? "").trim().slice(0, 120),
      lien: lienSur(String(i?.lien ?? "").slice(0, 1000)),
      image: imageSure(String(i?.image ?? "").slice(0, 1000)),
      prix: typeof i?.prix === "number" ? prixPositif(String(i.prix)) : null,
      note: "",
    }))
    .filter((i) => i.titre);
  if (!propres.length) return { erreur: "Aucune idée à importer." };
  const place = p.max - (await nombreIdees(p));
  if (place <= 0) return { erreur: `${p.max} idées au maximum.` };
  const retenues = propres.slice(0, place);
  if (p.sorte === "participant") {
    await prisma.souhait.createMany({ data: retenues.map((i) => ({ ...i, participantId: p.id })) });
  } else {
    await prisma.ideeListe.createMany({ data: retenues.map((i) => ({ ...i, listeId: p.id })) });
  }
  revalidatePath("/", "layout");
  const n = retenues.length;
  return {
    ok: `${n} idée${n > 1 ? "s importées" : " importée"}${retenues.length < propres.length ? ` (limite de ${p.max} idées atteinte)` : ""}.`,
  };
}

/** « Ma liste ailleurs » : le lien d'une liste tenue sur un autre site (vide pour le retirer). */
export async function enregistrerListeExterne(jeton: string, brut: string): Promise<Etat> {
  const p = await proprietaire(jeton);
  if (!p) return { erreur: "Lien inconnu." };
  const lien = String(brut ?? "").trim() ? lienSur(String(brut).slice(0, 1000)) : "";
  if (String(brut ?? "").trim() && !lien) return { erreur: "Ce lien ne semble pas valide." };
  if (p.sorte === "participant") await prisma.participant.update({ where: { id: p.id }, data: { listeExterne: lien } });
  else await prisma.liste.update({ where: { id: p.id }, data: { listeExterne: lien } });
  revalidatePath("/", "layout");
  return { ok: lien ? "Lien enregistré : il est visible des autres." : "Lien retiré." };
}

/**
 * Remplace le lien de chaque idée (sa page sur le site de listes) par celui de la
 * boutique, lu sur cette page : c'est lui que les proches veulent ouvrir, et c'est
 * sur lui que s'applique notre identifiant Amazon. Huit pages à la fois ; une page
 * illisible garde son lien d'origine.
 */
async function liensMarchands(idees: IdeeImportee[]) {
  for (let i = 0; i < idees.length; i += 8) {
    await Promise.all(
      idees.slice(i, i + 8).map(async (idee) => {
        const page = await recupererPage(idee.lien, { jusquALaFin: true });
        if (!page || "amazon" in page) return;
        const marchand = lienMarchand(page.html, page.url);
        if (!marchand) return;
        // Un lien interne (« /envies/…/redirection ») : on suit la redirection jusqu'à la boutique.
        const memeSite = new URL(marchand).hostname === new URL(page.url).hostname;
        const final = memeSite ? await suivreRedirections(marchand) : marchand;
        if (final) idee.lien = await deplierLienCourt(lienSur(final));
      }),
    );
  }
}

/**
 * Vider sa liste d'un coup (après un import raté, ou pour repartir de zéro).
 * Les réservations faites par d'autres sur ces idées partent avec elles.
 */
export async function viderListe(jeton: string): Promise<{ erreur: string } | void> {
  const p = await proprietaire(jeton);
  if (!p) return { erreur: "Lien inconnu." };
  if (p.sorte === "participant") await prisma.souhait.deleteMany({ where: { participantId: p.id } });
  else await prisma.ideeListe.deleteMany({ where: { listeId: p.id } });
  revalidatePath("/", "layout");
}
