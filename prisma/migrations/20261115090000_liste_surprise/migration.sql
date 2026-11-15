-- Mode surprise des listes de cadeaux (activé par défaut, y compris pour les listes existantes).
-- AlterTable
ALTER TABLE "Liste" ADD COLUMN     "surprise" BOOLEAN NOT NULL DEFAULT true;
