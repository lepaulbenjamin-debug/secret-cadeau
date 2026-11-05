-- Rappels par e-mail : consentement par participant et journal des envois.
ALTER TABLE "Participant" ADD COLUMN "rappelsEmail" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "Rappel" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "envoyeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rappel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Rappel_participantId_type_key" ON "Rappel"("participantId", "type");

ALTER TABLE "Rappel" ADD CONSTRAINT "Rappel_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
