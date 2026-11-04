import { PrismaClient } from "@prisma/client";

// Une seule instance en développement, sinon le rechargement à chaud en ouvre une par module.
const globalPourPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalPourPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalPourPrisma.prisma = prisma;
