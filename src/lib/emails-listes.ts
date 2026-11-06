import { titreListe } from "./occasions";
import { gabaritEmail } from "./rappels";

/** Les deux liens d'une liste d'anniversaire, envoyés à sa création. */
export function contenuBienvenueListe(l: { prenom: string; occasion: string; jetonProprio: string; jetonPartage: string }, { site }: { site: string }) {
  const titre = titreListe(l);
  const proprio = `${site}/ma-liste/${l.jetonProprio}`;
  const partage = `${site}/liste/${l.jetonPartage}`;
  const { html, texte } = gabaritEmail({
    site,
    groupe: titre,
    bonjour: "",
    lignes: [
      "Votre liste de cadeaux est créée. Gardez cet e-mail : il vous permet de la retrouver depuis n'importe quel appareil.",
      "Le premier lien sert à ajouter et modifier vos idées. Vous n'y verrez jamais ce qui a été réservé : la surprise reste entière.",
      "Le second est à partager avec vos proches : ils y voient vos idées et réservent celle qu'ils vous offriront.",
    ],
    boutons: [
      { lien: proprio, libelle: "Remplir ma liste", texte: "Pour remplir votre liste" },
      { lien: partage, libelle: "Lien à partager avec mes proches", texte: "À partager", discret: true },
    ],
    avertissement: "Ne partagez pas le premier lien : il permet de modifier la liste.",
    raison: "vous avez créé une liste sur Qui Offre",
    reglages: `${proprio}#reglages`,
  });
  return { sujet: `${titre} : vos liens`, html, texte };
}
