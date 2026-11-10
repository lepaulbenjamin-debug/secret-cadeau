/**
 * Les messages des notifications web. Comme les e-mails : JAMAIS le nom de la
 * personne tirée (une notification s'affiche sur l'écran verrouillé).
 */
export type MessagePush = { titre: string; corps: string; url: string; etiquette?: string };

export function messageRappel(type: "tirage" | "j7" | "veille", groupe: string, jeton: string, jours: number | null): MessagePush {
  const url = `/p/${jeton}`;
  if (type === "tirage") return { titre: `🎁 ${groupe}`, corps: "Le tirage est fait ! Ouvrez votre espace pour découvrir à qui vous offrez.", url, etiquette: `tirage-${jeton}` };
  if (type === "veille") {
    return { titre: `🎁 ${groupe}`, corps: jours === 0 ? "C'est aujourd'hui ! Votre cadeau est prêt ?" : "C'est demain ! Votre cadeau est prêt ?", url, etiquette: `veille-${jeton}` };
  }
  return { titre: `🎄 ${groupe}`, corps: `L'échange approche${jours != null ? ` : dans ${jours} jours` : ""}. Revoyez la liste de la personne que vous avez tirée.`, url, etiquette: `j7-${jeton}` };
}

export function messageAjustement(groupe: string, jeton: string): MessagePush {
  return { titre: `🔄 ${groupe}`, corps: "Votre tirage a changé : ouvrez le paquet pour découvrir à qui vous offrez maintenant.", url: `/p/${jeton}`, etiquette: `ajustement-${jeton}` };
}

export function messageQuestion(groupe: string, jeton: string): MessagePush {
  return { titre: `🤫 ${groupe}`, corps: "Votre Père Noël secret vous a posé une question.", url: `/p/${jeton}`, etiquette: `question-${jeton}` };
}

export function messageReponse(groupe: string, jeton: string): MessagePush {
  return { titre: `💬 ${groupe}`, corps: "La personne que vous avez tirée a répondu à votre question.", url: `/p/${jeton}`, etiquette: `reponse-${jeton}` };
}
