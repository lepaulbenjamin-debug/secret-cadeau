-- « Ma liste ailleurs » : lien d'une liste tenue sur un autre site.
ALTER TABLE "Participant" ADD COLUMN "listeExterne" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Liste" ADD COLUMN "listeExterne" TEXT NOT NULL DEFAULT '';
