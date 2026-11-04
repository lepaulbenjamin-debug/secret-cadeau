"use client";

import { useEffect } from "react";

import { garderLien, type LienGarde } from "./memoire";

/** Retient, sur cet appareil, le lien qu'on est en train de consulter. */
export function SeSouvenir(props: Omit<LienGarde, "vuLe">) {
  const { type, jeton, groupe, prenom } = props;
  useEffect(() => garderLien({ type, jeton, groupe, prenom }), [type, jeton, groupe, prenom]);
  return null;
}
