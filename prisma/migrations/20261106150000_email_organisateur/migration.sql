-- E-mail de l'organisateur : lien d'organisateur envoyé à la création, relance avant l'échange.
ALTER TABLE "Groupe" ADD COLUMN "emailOrganisateur" TEXT NOT NULL DEFAULT '',
ADD COLUMN "rappelsOrganisateur" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "bienvenueEnvoyeeLe" TIMESTAMP(3),
ADD COLUMN "relanceTirageLe" TIMESTAMP(3);
