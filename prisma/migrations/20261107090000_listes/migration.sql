-- Listes de cadeaux hors Secret Santa (anniversaire, naissance…).
CREATE TABLE "Liste" (
    "id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "occasion" TEXT NOT NULL DEFAULT 'anniversaire',
    "date" TIMESTAMP(3),
    "message" TEXT NOT NULL DEFAULT '',
    "jetonProprio" TEXT NOT NULL,
    "jetonPartage" TEXT NOT NULL,
    "emailProprio" TEXT NOT NULL DEFAULT '',
    "bienvenueEnvoyeeLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Liste_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IdeeListe" (
    "id" TEXT NOT NULL,
    "listeId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "lien" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "prix" INTEGER,
    "note" TEXT NOT NULL DEFAULT '',
    "reservePar" TEXT NOT NULL DEFAULT '',
    "jetonReserve" TEXT NOT NULL DEFAULT '',
    "reserveLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeeListe_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Liste_jetonProprio_key" ON "Liste"("jetonProprio");
CREATE UNIQUE INDEX "Liste_jetonPartage_key" ON "Liste"("jetonPartage");
CREATE INDEX "IdeeListe_listeId_idx" ON "IdeeListe"("listeId");

ALTER TABLE "IdeeListe" ADD CONSTRAINT "IdeeListe_listeId_fkey" FOREIGN KEY ("listeId") REFERENCES "Liste"("id") ON DELETE CASCADE ON UPDATE CASCADE;
