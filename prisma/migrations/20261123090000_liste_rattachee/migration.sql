-- Une liste de cadeaux rattachée à un ou plusieurs tirages : ses idées s'affichent dans chacun, en direct.
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "listeId" TEXT;

-- CreateIndex
CREATE INDEX "Participant_listeId_idx" ON "Participant"("listeId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_listeId_fkey" FOREIGN KEY ("listeId") REFERENCES "Liste"("id") ON DELETE SET NULL ON UPDATE CASCADE;

