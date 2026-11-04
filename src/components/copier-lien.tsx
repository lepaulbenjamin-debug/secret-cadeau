"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopierLien({ chemin, libelle = "Copier le lien" }: { chemin: string; libelle?: string }) {
  const [fait, setFait] = useState(false);
  return (
    <button
      type="button"
      className="bouton bouton-discret !min-h-9 text-sm"
      onClick={async () => {
        const url = new URL(chemin, window.location.origin).toString();
        try {
          await navigator.clipboard.writeText(url);
          setFait(true);
          setTimeout(() => setFait(false), 2000);
        } catch {
          prompt("Copiez ce lien :", url);
        }
      }}
    >
      {fait ? <Check size={15} /> : <Copy size={15} />} {fait ? "Copié !" : libelle}
    </button>
  );
}
