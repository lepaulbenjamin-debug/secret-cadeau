/**
 * Une réservation faite depuis un tirage porte la marque du participant (jamais
 * montrée). Le « : » la distingue d'un jeton d'appareil ([\w-] seulement) : un
 * appareil ne peut pas se faire passer pour un participant.
 */
export const marqueParticipant = (participantId: string) => `p:${participantId}`;

/** Les champs d'une idée de liste rattachée, lus pour un tirage. */
export const champsIdeeListe = { id: true, titre: true, lien: true, image: true, prix: true, note: true, jetonReserve: true } as const;
