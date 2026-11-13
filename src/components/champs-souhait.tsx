"use client";

import { Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { apercuLien } from "@/app/actions";
import { prixSaisi } from "@/lib/format";

type Valeurs = { titre?: string; lien?: string; prix?: number | null; note?: string; image?: string };

/**
 * Les champs d'une idée de cadeau, partagés par l'ajout et la modification.
 *
 * Le lien vient en premier : on le colle, et le titre, l'image et le prix se
 * remplissent tout seuls quand le site les publie. Un champ déjà rempli par la
 * personne n'est jamais écrasé.
 */
export function ChampsSouhait({ v = {}, id, jeton }: { v?: Valeurs; id: string; jeton: string }) {
  const [image, setImage] = useState(v.image ?? "");
  const [message, setMessage] = useState("");
  const [enCours, demarrer] = useTransition();
  const titre = useRef<HTMLInputElement>(null);
  const prix = useRef<HTMLInputElement>(null);
  const dernier = useRef(v.lien ?? "");
  const conteneur = useRef<HTMLDivElement>(null);

  // Après un ajout réussi, le formulaire est remis à zéro : l'image aussi.
  useEffect(() => {
    const form = conteneur.current?.closest("form");
    if (!form) return;
    const vider = () => {
      setImage(v.image ?? "");
      setMessage("");
      dernier.current = v.lien ?? "";
    };
    form.addEventListener("reset", vider);
    return () => form.removeEventListener("reset", vider);
  }, [v.image, v.lien]);

  const chercher = (lien: string) => {
    const l = lien.trim();
    if (!l || l === dernier.current || !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/i.test(l)) return;
    dernier.current = l;
    demarrer(async () => {
      try {
        const a = await apercuLien(jeton, l);
        if (!a) return;
        const rempli: string[] = [];
        if (a.titre && titre.current && !titre.current.value.trim()) {
          titre.current.value = a.titre;
          rempli.push("le titre");
        }
        if (a.prix && prix.current && !prix.current.value.trim()) {
          prix.current.value = prixSaisi(a.prix);
          rempli.push("le prix");
        }
        if (a.image) {
          setImage(a.image);
          rempli.push("l'image");
        }
        setMessage(rempli.length ? `On a rempli ${rempli.join(", ").replace(/, ([^,]*)$/, " et $1")} — vérifiez !` : "");
      } catch {
        setMessage("");
      }
    });
  };

  return (
    <div ref={conteneur} className="space-y-3">
      <div>
        <label className="etiquette" htmlFor={`lien-${id}`}>Lien <span className="font-normal text-doux">(facultatif)</span></label>
        <div className="relative">
          <input
            id={`lien-${id}`}
            name="lien"
            className="champ pr-10"
            defaultValue={v.lien}
            inputMode="url"
            placeholder="Collez un lien Amazon, Fnac, Etsy…"
            onPaste={(e) => {
              const colle = e.clipboardData.getData("text");
              setTimeout(() => chercher(colle), 0);
            }}
            onBlur={(e) => chercher(e.target.value)}
          />
          {enCours && <Loader2 size={18} className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-doux" aria-label="Recherche…" />}
        </div>
        {message && (
          <p className="mt-1 flex items-center gap-1 text-sm text-sapin">
            <Sparkles size={14} /> {message}
          </p>
        )}
      </div>

      {image && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- image d'un site tiers, de n'importe quel domaine */}
          <img src={image} alt="" referrerPolicy="no-referrer" className="size-16 rounded-lg border border-trait bg-white object-contain" />
          <button type="button" onClick={() => setImage("")} className="inline-flex items-center gap-1 text-sm text-doux">
            <X size={14} /> Retirer l&apos;image
          </button>
        </div>
      )}
      <input type="hidden" name="image" value={image} />

      <div>
        <label className="etiquette" htmlFor={`titre-${id}`}>Idée de cadeau</label>
        <input ref={titre} id={`titre-${id}`} name="titre" className="champ" defaultValue={v.titre} required maxLength={120} placeholder="Un livre de recettes italiennes" />
      </div>
      <div className="grid grid-cols-[6rem_1fr] gap-3">
        <div>
          <label className="etiquette" htmlFor={`prix-${id}`}>Prix (€)</label>
          <input ref={prix} id={`prix-${id}`} name="prix" className="champ" defaultValue={prixSaisi(v.prix)} inputMode="decimal" placeholder="24,99" />
        </div>
        <div>
          <label className="etiquette" htmlFor={`note-${id}`}>Précision <span className="font-normal text-doux">(taille, couleur…)</span></label>
          <input id={`note-${id}`} name="note" className="champ" defaultValue={v.note} maxLength={300} />
        </div>
      </div>
    </div>
  );
}
