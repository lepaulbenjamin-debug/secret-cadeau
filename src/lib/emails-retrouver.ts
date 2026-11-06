import { titreListe } from "./occasions";
import { gabaritEmail } from "./rappels";

export type LiensRetrouves = {
  participations: { groupe: string; prenom: string; jeton: string }[];
  organisations: { groupe: string; jetonAdmin: string }[];
  listes: { prenom: string; occasion: string; jetonProprio: string; jetonPartage: string }[];
};

export function aDesLiens(l: LiensRetrouves): boolean {
  return l.participations.length + l.organisations.length + l.listes.length > 0;
}

/** Tous les liens d'une adresse e-mail, en un seul message. */
export function contenuRetrouver(l: LiensRetrouves, { site }: { site: string }) {
  const boutons: { lien: string; libelle: string; texte: string; discret?: boolean }[] = [];
  for (const p of l.participations) {
    boutons.push({ lien: `${site}/p/${p.jeton}`, libelle: `🎁 ${p.groupe} — espace de ${p.prenom}`, texte: `${p.groupe}, espace de ${p.prenom}`, discret: true });
  }
  for (const o of l.organisations) {
    boutons.push({ lien: `${site}/g/${o.jetonAdmin}`, libelle: `👑 ${o.groupe} — page d'organisateur`, texte: `${o.groupe}, page d'organisateur`, discret: true });
  }
  for (const li of l.listes) {
    const t = titreListe(li);
    boutons.push({ lien: `${site}/ma-liste/${li.jetonProprio}`, libelle: `${t} — remplir ma liste`, texte: `${t}, pour la remplir`, discret: true });
    boutons.push({ lien: `${site}/liste/${li.jetonPartage}`, libelle: `${t} — lien à partager`, texte: `${t}, à partager`, discret: true });
  }
  const n = boutons.length;
  const { html, texte } = gabaritEmail({
    site,
    groupe: "Vos liens",
    bonjour: "",
    lignes: [
      n > 1 ? `Voici les ${n} liens associés à votre adresse e-mail sur Qui Offre.` : "Voici le lien associé à votre adresse e-mail sur Qui Offre.",
      "Gardez cet e-mail pour les retrouver facilement.",
    ],
    boutons,
    avertissement: "Ces liens sont personnels : ne les transférez pas, ils dévoileraient votre tirage ou permettraient de modifier vos listes.",
    raison: "quelqu'un (sans doute vous) a demandé à retrouver ses liens avec cette adresse. Si ce n'est pas vous, ignorez ce message",
    reglages: `${site}/retrouver`,
  });
  return { sujet: "🎁 Vos liens Qui Offre", html, texte };
}
