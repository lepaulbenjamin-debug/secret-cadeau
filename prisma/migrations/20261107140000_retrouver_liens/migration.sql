-- « Retrouver mes liens » : limite d'un envoi par adresse toutes les 10 minutes.
CREATE TABLE "EnvoiLiens" (
    "email" TEXT NOT NULL,
    "dernierEnvoi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvoiLiens_pkey" PRIMARY KEY ("email")
);
