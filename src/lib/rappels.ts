/**
 * Les rappels par e-mail : qui, quand, et quoi écrire.
 *
 * Trois messages par participant au plus, chacun envoyé une seule fois :
 *  - « tirage » : le tirage vient d'être fait, voici ton lien ;
 *  - « j7 »     : l'échange est dans 2 à 7 jours ;
 *  - « veille » : l'échange est demain ou aujourd'hui.
 *
 * ⚠️ AUCUN E-MAIL NE NOMME LA PERSONNE TIRÉE. Une boîte de réception se
 * consulte à plusieurs, se transfère, se lit sur l'écran verrouillé : le nom
 * reste derrière le lien, et le paquet à ouvrir.
 */

import { joursAvant } from "./format";

export type TypeRappel = "tirage" | "j7" | "veille";

export type ParticipantRappel = {
  prenom: string;
  email: string;
  jeton: string;
  rappelsEmail: boolean;
  nomDeCode: string;
  nbSouhaits: number;
  dejaEnvoyes: TypeRappel[];
  /** Date du dernier rappel envoyé, quel qu'il soit. */
  dernierEnvoi?: Date | null;
};

export type GroupeRappel = {
  nom: string;
  dateEchange: Date | null;
  budget: number | null;
  tirageLe: Date | null;
  nomsDeCode: boolean;
};

/** Le rappel à envoyer aujourd'hui à ce participant, ou rien. Un seul par jour. */
export function rappelDu(g: GroupeRappel, p: ParticipantRappel, maintenant = new Date()): TypeRappel | null {
  if (!p.email || !p.rappelsEmail) return null;
  const jours = g.dateEchange ? joursAvant(g.dateEchange, maintenant) : null;
  if (jours !== null && jours < 0) return null; // l'échange est passé
  const deja = new Set(p.dejaEnvoyes);

  if (jours !== null && jours <= 1) return deja.has("veille") ? null : "veille";
  // Pas deux e-mails dans la même journée (« tirage fait » puis « J-7 » le même matin).
  if (p.dernierEnvoi && maintenant.getTime() - p.dernierEnvoi.getTime() < 20 * 3600 * 1000) return null;
  if (g.tirageLe && !deja.has("tirage")) return "tirage";
  if (jours !== null && jours <= 7 && !deja.has("j7")) return "j7";
  return null;
}

export const echapper = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function quand(g: GroupeRappel, maintenant: Date): string {
  if (!g.dateEchange) return "";
  const j = joursAvant(g.dateEchange, maintenant);
  const date = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(g.dateEchange);
  if (j === 0) return `c'est aujourd'hui, ${date}`;
  if (j === 1) return `c'est demain, ${date}`;
  return `c'est dans ${j} jours, le ${date}`;
}

export function contenuRappel(
  type: TypeRappel,
  g: GroupeRappel,
  p: ParticipantRappel,
  { site, maintenant = new Date() }: { site: string; maintenant?: Date },
): { sujet: string; html: string; texte: string; desabonnement: string } {
  const lien = `${site}/p/${p.jeton}`;
  const desabonnement = `${site}/api/desabonner?j=${encodeURIComponent(p.jeton)}`;
  const reglages = `${lien}#rappels`;
  const echange = quand(g, maintenant);
  const budget = g.budget ? `Budget conseillé : environ ${g.budget} €.` : "";
  const listeVide = p.nbSouhaits === 0;
  const mystere = g.nomsDeCode && p.nomDeCode ? `Votre nom de code : ${p.nomDeCode}. C'est lui qui sera écrit sur votre paquet.` : "";

  const sujets: Record<TypeRappel, string> = {
    tirage: `🎁 ${g.nom} : le tirage est fait !`,
    j7: `🎄 ${g.nom} : l'échange approche`,
    veille: `🎁 ${g.nom} : ${g.dateEchange && joursAvant(g.dateEchange, maintenant) === 0 ? "c'est aujourd'hui" : "c'est demain"} !`,
  };

  const phrases: string[] = [];
  if (type === "tirage") {
    phrases.push("Le tirage au sort vient d'avoir lieu. Ouvrez votre espace pour découvrir à qui vous offrez (gardez le secret !).");
    if (echange) phrases.push(`L'échange des cadeaux : ${echange}.`);
  } else if (g.tirageLe) {
    phrases.push(`L'échange des cadeaux approche : ${echange}.`, "Votre cadeau est prêt ? Revoyez la liste de la personne que vous avez tirée dans votre espace.");
  } else {
    phrases.push(`L'échange des cadeaux approche : ${echange}.`, "Le tirage n'a pas encore eu lieu : l'organisateur va bientôt le lancer.");
  }
  if (budget) phrases.push(budget);
  if (mystere) phrases.push(mystere);
  if (listeVide) {
    phrases.push(
      g.nomsDeCode
        ? "⚠️ Votre liste d'envies est vide. En mode mystère, votre Père Noël ne sait pas qui vous êtes : sans liste, il choisira à l'aveugle !"
        : "⚠️ Votre liste d'envies est vide : ajoutez une ou deux idées pour aider votre Père Noël secret.",
    );
  }
  const lignes = phrases.filter(Boolean);

  const { html, texte } = gabaritEmail({
    site,
    groupe: g.nom,
    bonjour: p.prenom,
    lignes,
    boutons: [{ lien, libelle: "Ouvrir mon espace", texte: "Votre espace" }],
    avertissement: "Ce lien est personnel : ne le transférez pas, il dévoilerait votre tirage.",
    raison: `vous participez à « ${g.nom} »`,
    reglages,
  });

  return { sujet: sujets[type], html, texte, desabonnement };
}

/**
 * La mise en page commune à tous les e-mails : logo, nom du groupe, salutation,
 * paragraphes, un ou plusieurs boutons, puis le pied avec le lien pour ne plus
 * rien recevoir. Une version texte est produite en même temps.
 */
export function gabaritEmail(o: {
  site: string;
  groupe: string;
  bonjour: string;
  lignes: string[];
  boutons: { lien: string; libelle: string; texte: string; discret?: boolean }[];
  avertissement?: string;
  raison: string;
  reglages: string;
}): { html: string; texte: string } {
  const texte = [
    o.bonjour ? `Bonjour ${o.bonjour},` : "Bonjour,",
    "",
    ...o.lignes,
    "",
    ...o.boutons.map((b) => `${b.texte} : ${b.lien}`),
    ...(o.avertissement ? [`(${o.avertissement})`] : []),
    "",
    "—",
    "Qui Offre",
    `Vous recevez ce message car ${o.raison}.`,
    `Ne plus recevoir ces e-mails : ${o.reglages}`,
  ].join("\n");

  const bouton = (b: (typeof o.boutons)[number]) =>
    b.discret
      ? `<p style="margin:0 0 10px;font-size:15px"><a href="${echapper(b.lien)}" style="color:#2b2a66;font-weight:600">${echapper(b.libelle)}</a></p>`
      : `<p style="margin:20px 0 10px"><a href="${echapper(b.lien)}" style="display:inline-block;background:#2b2a66;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${echapper(b.libelle)}</a></p>`;

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#faf6f0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#232246">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border:1px solid #e7e1d6;border-radius:20px" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 24px">
<img src="${echapper(o.site)}/logo-clair.png" alt="Qui Offre" width="99" height="44" style="display:block;margin:0 0 16px;border:0">
<p style="margin:0 0 4px;font-size:14px;color:#cc3a33;font-weight:600">${echapper(o.groupe)}</p>
<h1 style="margin:0 0 16px;font-size:24px;font-family:Georgia,serif">Bonjour${o.bonjour ? ` ${echapper(o.bonjour)}` : ""} !</h1>
${o.lignes.map((l) => `<p style="margin:0 0 12px;font-size:16px;line-height:1.5">${echapper(l)}</p>`).join("\n")}
${o.boutons.map(bouton).join("\n")}
${o.avertissement ? `<p style="margin:12px 0 0;font-size:13px;color:#66627a">${echapper(o.avertissement)}</p>` : ""}
</td></tr></table>
<p style="font-size:12px;color:#66627a;margin:16px 0 0">Vous recevez ce message car ${echapper(o.raison)}. <a href="${echapper(o.reglages)}" style="color:#66627a">Ne plus recevoir ces e-mails</a></p>
</td></tr></table></body></html>`;

  return { html, texte };
}

/**
 * Le tirage de cette personne a été ajusté après un désistement : elle offre
 * désormais à quelqu'un d'autre. Comme les autres e-mails, sans aucun nom.
 */
export function contenuAjustement(g: { nom: string; nomsDeCode: boolean }, p: { prenom: string; jeton: string }, { site }: { site: string }) {
  const lien = `${site}/p/${p.jeton}`;
  const { html, texte } = gabaritEmail({
    site,
    groupe: g.nom,
    bonjour: p.prenom,
    lignes: [
      "Un participant s'est désisté, et le tirage a été ajusté : la personne à qui vous offrez a changé.",
      g.nomsDeCode
        ? "Ouvrez votre espace pour découvrir votre nouveau nom de code et sa liste d'envies."
        : "Ouvrez votre espace pour la découvrir, avec sa liste d'envies. Si vous aviez déjà acheté un cadeau, gardez-le pour une autre occasion… ou demandez conseil à l'organisateur !",
    ],
    boutons: [{ lien, libelle: "Découvrir à qui j'offre", texte: "Votre espace" }],
    avertissement: "Ce lien est personnel : ne le transférez pas, il dévoilerait votre tirage.",
    raison: `vous participez à « ${g.nom} »`,
    reglages: `${lien}#rappels`,
  });
  return {
    sujet: `🔄 ${g.nom} : votre tirage a changé`,
    html,
    texte,
    desabonnement: `${site}/api/desabonner?j=${encodeURIComponent(p.jeton)}`,
  };
}
