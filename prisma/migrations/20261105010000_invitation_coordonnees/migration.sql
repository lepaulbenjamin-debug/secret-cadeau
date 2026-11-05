-- Lien d'invitation (facultatif, unique) et coordonnées des participants.
ALTER TABLE "Groupe" ADD COLUMN "jetonInvitation" TEXT;
CREATE UNIQUE INDEX "Groupe_jetonInvitation_key" ON "Groupe"("jetonInvitation");

ALTER TABLE "Participant" ADD COLUMN "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN "telephone" TEXT NOT NULL DEFAULT '';
