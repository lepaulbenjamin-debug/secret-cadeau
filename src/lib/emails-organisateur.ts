/**
 * Les e-mails à l'organisateur, quand il a laissé son adresse à la création :
 *  - « bienvenue » : tout de suite, avec son lien d'organisateur (qu'il ne
 *    perdra plus en changeant de téléphone), son lien personnel s'il participe,
 *    et le lien d'invitation à partager ;
 *  - « relance »  : une seule fois, quand l'échange est dans 7 jours ou moins
 *    et que le tirage n'est toujours pas fait.
 *
 * Son e-mail n'est montré à personne : il ne figure nulle part dans les pages.
 */

import { joursAvant } from "./format";
import { gabaritEmail } from "./rappels";

type Bouton = { lien: string; libelle: string; texte: string; discret?: boolean };

type GroupeOrga = {
  nom: string;
  dateEchange: Date | null;
  nomsDeCode: boolean;
  jetonAdmin: string;
  jetonInvitation: string | null;
};

function liens(site: string, g: GroupeOrga) {
  return {
    admin: `${site}/g/${g.jetonAdmin}`,
    invitation: g.jetonInvitation ? `${site}/rejoindre/${g.jetonInvitation}` : null,
    reglages: `${site}/g/${g.jetonAdmin}#reglages`,
    desabonnement: `${site}/api/desabonner?o=${encodeURIComponent(g.jetonAdmin)}`,
  };
}

export function contenuBienvenue(
  g: GroupeOrga,
  { site, prenom, jetonPerso }: { site: string; prenom: string; jetonPerso: string | null },
) {
  const l = liens(site, g);
  const lignes = [
    `Votre groupe « ${g.nom} » est créé. Voici vos liens : gardez cet e-mail, il vous permet de retrouver le groupe depuis n'importe quel appareil.`,
    "Le lien d'organisateur sert à gérer le groupe (participants, exclusions, tirage). Il ne montre jamais qui offre à qui.",
  ];
  if (l.invitation) lignes.push("Le lien d'invitation est à partager avec tout le groupe : chacun s'y inscrit avec son prénom.");
  if (jetonPerso) lignes.push("Vous participez aussi : votre espace personnel vous dira à qui vous offrez, après le tirage.");
  if (g.nomsDeCode) lignes.push("Mode mystère activé : chacun recevra un nom de code, et les listes d'envies seront obligatoires avant le tirage.");

  const boutons: Bouton[] = [{ lien: l.admin, libelle: "Gérer mon groupe", texte: "Lien d'organisateur" }];
  if (jetonPerso) boutons.push({ lien: `${site}/p/${jetonPerso}`, libelle: "Mon espace personnel", texte: "Votre espace personnel", discret: true });
  if (l.invitation) boutons.push({ lien: l.invitation, libelle: "Lien d'invitation à partager", texte: "Lien d'invitation", discret: true });

  const { html, texte } = gabaritEmail({
    site,
    groupe: g.nom,
    bonjour: prenom,
    lignes,
    boutons,
    avertissement: "Ne transférez pas le lien d'organisateur ni votre lien personnel : seul le lien d'invitation se partage.",
    raison: `vous organisez « ${g.nom} »`,
    reglages: l.reglages,
  });
  return { sujet: `🎁 ${g.nom} : vos liens d'organisateur`, html, texte, desabonnement: l.desabonnement };
}

export function relanceOrganisateurDue(
  g: { tirageLe: Date | null; dateEchange: Date | null; emailOrganisateur: string; rappelsOrganisateur: boolean; relanceTirageLe: Date | null },
  maintenant = new Date(),
): boolean {
  if (g.tirageLe || !g.dateEchange || !g.emailOrganisateur || !g.rappelsOrganisateur || g.relanceTirageLe) return false;
  const j = joursAvant(g.dateEchange, maintenant);
  return j >= 0 && j <= 7;
}

export function contenuRelanceOrganisateur(
  g: GroupeOrga,
  { site, prenom, nbParticipants, listesVides, maintenant = new Date() }: { site: string; prenom: string; nbParticipants: number; listesVides: string[]; maintenant?: Date },
) {
  const l = liens(site, g);
  const j = g.dateEchange ? joursAvant(g.dateEchange, maintenant) : null;
  const quand = j === 0 ? "aujourd'hui" : j === 1 ? "demain" : `dans ${j} jours`;
  const lignes = [`L'échange de « ${g.nom} » a lieu ${quand}, et le tirage au sort n'est pas encore fait.`];
  if (nbParticipants < 3) {
    lignes.push(`Il n'y a que ${nbParticipants} participant${nbParticipants > 1 ? "s" : ""} : il en faut au moins trois. Partagez le lien d'invitation !`);
  } else {
    lignes.push(`${nbParticipants} personnes sont inscrites : vous pouvez lancer le tirage dès maintenant.`);
  }
  if (listesVides.length) {
    lignes.push(`Encore sans liste d'envies : ${listesVides.join(", ")}.${g.nomsDeCode ? " En mode mystère, le tirage attend que chacun ait rempli la sienne." : ""}`);
  }
  const boutons: Bouton[] = [{ lien: l.admin, libelle: "Lancer le tirage", texte: "Lien d'organisateur" }];
  if (l.invitation && nbParticipants < 3) boutons.push({ lien: l.invitation, libelle: "Lien d'invitation à partager", texte: "Lien d'invitation", discret: true });
  const { html, texte } = gabaritEmail({
    site,
    groupe: g.nom,
    bonjour: prenom,
    lignes,
    boutons,
    raison: `vous organisez « ${g.nom} »`,
    reglages: l.reglages,
  });
  return { sujet: `⏰ ${g.nom} : le tirage n'est pas encore fait`, html, texte, desabonnement: l.desabonnement };
}
