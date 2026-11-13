-- Prix avec centimes (12,99 €) : les prix entiers existants sont conservés tels quels.
-- AlterTable
ALTER TABLE "IdeeListe" ALTER COLUMN "prix" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Souhait" ALTER COLUMN "prix" SET DATA TYPE DOUBLE PRECISION;
