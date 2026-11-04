-- CreateTable
CREATE TABLE "Groupe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "dateEchange" TIMESTAMP(3),
    "budget" INTEGER,
    "message" TEXT NOT NULL DEFAULT '',
    "jetonAdmin" TEXT NOT NULL,
    "tirageLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "groupeId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "jeton" TEXT NOT NULL,
    "destinataireId" TEXT,
    "ouvertLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exclusion" (
    "id" TEXT NOT NULL,
    "groupeId" TEXT NOT NULL,
    "aId" TEXT NOT NULL,
    "bId" TEXT NOT NULL,

    CONSTRAINT "Exclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Souhait" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "lien" TEXT NOT NULL DEFAULT '',
    "prix" INTEGER,
    "note" TEXT NOT NULL DEFAULT '',
    "reserveParId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Souhait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "pereId" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "reponse" TEXT NOT NULL DEFAULT '',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Groupe_jetonAdmin_key" ON "Groupe"("jetonAdmin");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_jeton_key" ON "Participant"("jeton");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_destinataireId_key" ON "Participant"("destinataireId");

-- CreateIndex
CREATE INDEX "Participant_groupeId_idx" ON "Participant"("groupeId");

-- CreateIndex
CREATE INDEX "Exclusion_groupeId_idx" ON "Exclusion"("groupeId");

-- CreateIndex
CREATE UNIQUE INDEX "Exclusion_aId_bId_key" ON "Exclusion"("aId", "bId");

-- CreateIndex
CREATE INDEX "Souhait_participantId_idx" ON "Souhait"("participantId");

-- CreateIndex
CREATE INDEX "Question_destinataireId_idx" ON "Question"("destinataireId");

-- CreateIndex
CREATE INDEX "Question_pereId_idx" ON "Question"("pereId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exclusion" ADD CONSTRAINT "Exclusion_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exclusion" ADD CONSTRAINT "Exclusion_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exclusion" ADD CONSTRAINT "Exclusion_bId_fkey" FOREIGN KEY ("bId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Souhait" ADD CONSTRAINT "Souhait_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Souhait" ADD CONSTRAINT "Souhait_reserveParId_fkey" FOREIGN KEY ("reserveParId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_pereId_fkey" FOREIGN KEY ("pereId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
