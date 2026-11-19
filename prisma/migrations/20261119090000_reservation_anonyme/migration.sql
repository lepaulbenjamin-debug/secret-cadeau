-- Réservations anonymes sur les listes de cadeaux : le prénom du proche n'est plus ni montré ni gardé.
-- Une idée reste réservée tant que "jetonReserve" n'est pas vide.
-- AlterTable
ALTER TABLE "IdeeListe" DROP COLUMN "reservePar";
