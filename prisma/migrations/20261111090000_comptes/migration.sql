-- Comptes facultatifs : connexion par Google ou par e-mail (lien et code), sessions, liens vers les groupes, espaces, listes et réservations.
-- AlterTable
ALTER TABLE "Groupe" ADD COLUMN     "compteOrganisateurId" TEXT;

-- AlterTable
ALTER TABLE "IdeeListe" ADD COLUMN     "reserveCompteId" TEXT;

-- AlterTable
ALTER TABLE "Liste" ADD COLUMN     "compteId" TEXT;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "compteId" TEXT;

-- CreateTable
CREATE TABLE "Compte" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL DEFAULT '',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vuLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Compte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JetonConnexion" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "essais" INTEGER NOT NULL DEFAULT 0,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "utiliseLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JetonConnexion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Compte_email_key" ON "Compte"("email");

-- CreateIndex
CREATE INDEX "Session_compteId_idx" ON "Session"("compteId");

-- CreateIndex
CREATE INDEX "JetonConnexion_email_idx" ON "JetonConnexion"("email");

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_compteOrganisateurId_fkey" FOREIGN KEY ("compteOrganisateurId") REFERENCES "Compte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liste" ADD CONSTRAINT "Liste_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeeListe" ADD CONSTRAINT "IdeeListe_reserveCompteId_fkey" FOREIGN KEY ("reserveCompteId") REFERENCES "Compte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

