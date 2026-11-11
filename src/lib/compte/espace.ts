import "server-only";

import { prisma } from "../prisma";

type CompteMin = { id: string; email: string };

/**
 * Tout ce qui revient à ce compte : ce qui y est rattaché, ET ce qui porte son
 * adresse e-mail (vérifiée à la connexion) — les groupes et listes créés avant
 * le compte y apparaissent donc d'eux-mêmes.
 */
export async function monEspace(c: CompteMin) {
  const [participations, organisations, listes, reservations] = await Promise.all([
    prisma.participant.findMany({
      where: { OR: [{ compteId: c.id }, { compteId: null, email: { equals: c.email, mode: "insensitive" } }] },
      select: {
        jeton: true,
        prenom: true,
        destinataireId: true,
        groupe: { select: { nom: true, dateEchange: true, tirageLe: true } },
        _count: { select: { souhaits: true } },
      },
      orderBy: { creeLe: "desc" },
      take: 100,
    }),
    prisma.groupe.findMany({
      where: { OR: [{ compteOrganisateurId: c.id }, { compteOrganisateurId: null, emailOrganisateur: { equals: c.email, mode: "insensitive" } }] },
      select: { jetonAdmin: true, nom: true, dateEchange: true, tirageLe: true, _count: { select: { participants: true } } },
      orderBy: { creeLe: "desc" },
      take: 100,
    }),
    prisma.liste.findMany({
      where: { OR: [{ compteId: c.id }, { compteId: null, emailProprio: { equals: c.email, mode: "insensitive" } }] },
      select: { jetonProprio: true, prenom: true, occasion: true, date: true, _count: { select: { idees: true } } },
      orderBy: { creeLe: "desc" },
      take: 100,
    }),
    prisma.ideeListe.findMany({
      where: { reserveCompteId: c.id },
      select: { id: true, titre: true, liste: { select: { jetonPartage: true, prenom: true, occasion: true, date: true } } },
      orderBy: { reserveLe: "desc" },
      take: 100,
    }),
  ]);
  return {
    participations: participations.map(({ destinataireId, ...p }) => ({ ...p, tire: Boolean(destinataireId) })),
    organisations,
    listes,
    reservations,
  };
}
