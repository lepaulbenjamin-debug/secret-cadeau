"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

/**
 * Envoie un lien personnel : la feuille de partage du téléphone quand elle
 * existe (SMS, WhatsApp, mail…), sinon le presse-papiers.
 */
export function Partager({ chemin, prenom, groupe, compact = false }: { chemin: string; prenom: string; groupe: string; compact?: boolean }) {
  const [copie, setCopie] = useState(false);

  const partager = async () => {
    const url = new URL(chemin, window.location.origin).toString();
    const texte = `🎁 ${prenom}, voici ton lien pour le Secret Cadeau « ${groupe} ». Il est personnel, ne le transfère pas !`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Secret Cadeau", text: texte, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${texte}\n${url}`);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      prompt("Copiez ce lien :", url);
    }
  };

  const Icone = copie ? Check : typeof navigator !== "undefined" && "share" in navigator ? Share2 : Copy;
  return (
    <button type="button" onClick={partager} className={compact ? "bouton bouton-discret !min-h-9 !px-3 text-sm" : "bouton"}>
      <Icone size={16} />
      {copie ? "Copié !" : "Envoyer"}
    </button>
  );
}
