import { gabaritEmail } from "./rappels";

/** Le message de connexion : un bouton, et le code à taper ailleurs (application installée). */
export function contenuConnexion({ site, lien, code }: { site: string; lien: string; code: string }) {
  const { html, texte } = gabaritEmail({
    site,
    groupe: "Connexion",
    bonjour: "",
    lignes: [
      "Touchez le bouton pour vous connecter à Qui Offre.",
      `Ou tapez ce code dans l'application : ${code.slice(0, 3)} ${code.slice(3)}`,
      "Le lien et le code sont valables 20 minutes, une seule fois.",
    ],
    boutons: [{ lien, libelle: "Me connecter", texte: "Me connecter" }],
    avertissement: "Ne transférez pas ce message : il ouvre votre espace.",
    raison: "quelqu'un (sans doute vous) a demandé à se connecter avec cette adresse. Si ce n'est pas vous, ignorez ce message",
    reglages: `${site}/connexion`,
  });
  return { sujet: `${code} — votre connexion à Qui Offre`, html, texte };
}
