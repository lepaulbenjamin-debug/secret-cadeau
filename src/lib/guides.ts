/**
 * Le plan du site public : une seule liste, lue par le menu, le pied de page,
 * le sitemap et llms.txt. Une page ajoutée ici apparaît partout à la fois.
 */
export type PageSite = {
  chemin: string;
  titre: string;
  /** Libellé court pour les menus. */
  court: string;
  description: string;
  /** Date de dernière mise à jour du contenu (AAAA-MM-JJ). */
  maj: string;
};

export const GUIDES: PageSite[] = [
  {
    chemin: "/secret-santa",
    titre: "Secret Santa : les règles, l'organisation et nos conseils",
    court: "Le Secret Santa",
    description: "Tout savoir sur le Secret Santa (Père Noël secret) : principe, règles, budget, organisation pas à pas et erreurs à éviter.",
    maj: "2026-11-06",
  },
  {
    chemin: "/tirage-au-sort-noel",
    titre: "Tirage au sort de Noël en ligne : comment faire",
    court: "Tirage au sort en ligne",
    description: "Faire un tirage au sort de Noël en ligne, gratuit et sans compte : exclusions, envoi des résultats, et comment garder le secret.",
    maj: "2026-11-06",
  },
  {
    chemin: "/secret-santa-entre-collegues",
    titre: "Secret Santa entre collègues : organiser l'échange au bureau",
    court: "Entre collègues",
    description: "Organiser un Secret Santa au travail : budget, télétravail, inclusion, mode anonyme et idées de cadeaux adaptées au bureau.",
    maj: "2026-11-06",
  },
  {
    chemin: "/secret-santa-en-famille",
    titre: "Secret Santa en famille : un Noël plus simple et moins cher",
    court: "En famille",
    description: "Remplacer la montagne de cadeaux par un Secret Santa familial : exclusions des couples, enfants, budget et listes d'envies.",
    maj: "2026-11-06",
  },
  {
    chemin: "/idees-cadeaux-secret-santa",
    titre: "Idées de cadeaux Secret Santa par budget : 10, 20, 30 et 50 €",
    court: "Idées de cadeaux",
    description: "Des idées de cadeaux Secret Santa classées par budget (10 €, 20 €, 30 €, 50 €) et par profil, pour ne plus sécher.",
    maj: "2026-11-06",
  },
  {
    chemin: "/liste-de-cadeaux",
    titre: "Liste de cadeaux en ligne : créer et partager sa liste d'envies",
    court: "Liste de cadeaux",
    description: "Créer une liste de cadeaux en ligne gratuite, la partager et éviter les doublons grâce aux réservations invisibles.",
    maj: "2026-11-06",
  },
  {
    chemin: "/liste-cadeaux-anniversaire",
    titre: "Liste de cadeaux d'anniversaire : la créer et la partager",
    court: "Liste d'anniversaire",
    description: "Créer une liste de cadeaux d'anniversaire en ligne, gratuite et sans compte, la partager et laisser vos proches réserver sans doublon.",
    maj: "2026-11-07",
  },
  {
    chemin: "/faq",
    titre: "Questions fréquentes sur Qui Offre",
    court: "FAQ",
    description: "Les réponses aux questions sur Qui Offre : tirage, confidentialité, mode mystère, rappels, listes et gratuité.",
    maj: "2026-11-06",
  },
];

export const PAGES_LEGALES: PageSite[] = [
  { chemin: "/mentions-legales", titre: "Mentions légales", court: "Mentions légales", description: "Mentions légales du site Qui Offre.", maj: "2026-11-06" },
  { chemin: "/confidentialite", titre: "Politique de confidentialité", court: "Confidentialité", description: "Quelles données Qui Offre collecte, pourquoi, et comment les supprimer.", maj: "2026-11-06" },
];

export function guide(chemin: string): PageSite {
  const g = [...GUIDES, ...PAGES_LEGALES].find((x) => x.chemin === chemin);
  if (!g) throw new Error(`Page inconnue : ${chemin}`);
  return g;
}
