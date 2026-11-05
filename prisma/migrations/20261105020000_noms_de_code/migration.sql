-- Noms de code : option du groupe, et un nom par participant (attribué par l'application).
ALTER TABLE "Groupe" ADD COLUMN "nomsDeCode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Participant" ADD COLUMN "nomDeCode" TEXT NOT NULL DEFAULT '';
