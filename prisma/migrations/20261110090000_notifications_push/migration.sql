-- Notifications web (push) : un abonnement par appareil et par espace de participant.
CREATE TABLE "AbonnementPush" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbonnementPush_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AbonnementPush_endpoint_participantId_key" ON "AbonnementPush"("endpoint", "participantId");
CREATE INDEX "AbonnementPush_participantId_idx" ON "AbonnementPush"("participantId");

ALTER TABLE "AbonnementPush" ADD CONSTRAINT "AbonnementPush_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
