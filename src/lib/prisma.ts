import { PrismaClient } from "@prisma/client";

// Une seule instance en développement, sinon le rechargement à chaud en ouvre une par module.
const globalPourPrisma = globalThis as unknown as { prisma?: PrismaClient };

/*
 * Sur un aperçu Vercel (une branche pas encore fusionnée), on n'ouvre que la
 * base d'aperçu : son adresse est publique, elle ne doit pas lire ni écrire
 * dans les vrais groupes.
 */
function ouvrir(): PrismaClient {
  if (process.env.VERCEL_ENV === "preview") {
    return new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_APERCU ?? "postgresql://aucune-base-d-apercu/configuree" } } });
  }
  return new PrismaClient();
}

export const prisma = globalPourPrisma.prisma ?? ouvrir();

if (process.env.NODE_ENV !== "production") globalPourPrisma.prisma = prisma;
