"use client";

import { ExternalLink, Import, Link2 } from "lucide-react";
import { useState, useTransition } from "react";

import { enregistrerListeExterne, importerIdees, previsualiserImport } from "@/app/actions-import";
import type { IdeeImportee } from "@/lib/import-liste";
import { euros } from "@/lib/format";

/**
 * « Votre liste existe déjà ailleurs ? » : enregistrer son lien, et/ou en importer
 * les idées. Rien n'est importé sans être montré : on coche ce qu'on garde.
 */
export function ImportListe({ jeton, listeExterne, mystere = false }: { jeton: string; listeExterne: string; mystere?: boolean }) {
  const [lien, setLien] = useState(listeExterne);
  const [texte, setTexte] = useState("");
  const [apercu, setApercu] = useState<IdeeImportee[] | null>(null);
  const [coches, setCoches] = useState<boolean[]>([]);
  const [note, setNote] = useState("");
  const [lienListe, setLienListe] = useState("");
  const [message, setMessage] = useState<{ ok?: string; erreur?: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const previsualiser = (source: string) =>
    demarrer(async () => {
      setMessage(null);
      const r = await previsualiserImport(jeton, source);
      if ("erreur" in r) return setMessage({ erreur: r.erreur });
      setApercu(r.idees);
      setCoches(r.idees.map(() => true));
      setNote(r.note ?? "");
      setLienListe(r.lienListe ?? "");
    });

  const enregistrerLien = (valeur: string) =>
    demarrer(async () => {
      const r = await enregistrerListeExterne(jeton, valeur);
      setMessage(r);
      if (r?.ok) setLien(valeur);
    });

  const importer = () =>
    demarrer(async () => {
      const r = await importerIdees(jeton, (apercu ?? []).filter((_, i) => coches[i]));
      setMessage(r);
      if (r?.ok) {
        setApercu(null);
        setTexte("");
      }
    });

  const nbCoches = coches.filter(Boolean).length;

  return (
    <details className="mt-4 rounded-2xl border border-trait p-4">
      <summary className="cursor-pointer font-semibold text-sapin">
        <Import size={15} className="mr-1 inline align-[-2px]" aria-hidden /> Votre liste existe déjà ailleurs&nbsp;?
      </summary>

      <div className="mt-3 space-y-4">
        <div>
          <label className="etiquette" htmlFor={`liste-externe-${jeton}`}>Le lien de votre liste (Amazon, autre site…)</label>
          <input
            id={`liste-externe-${jeton}`}
            className="champ"
            inputMode="url"
            value={lien}
            onChange={(e) => setLien(e.target.value)}
            placeholder="https://…"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={enCours || !lien.trim()} onClick={() => previsualiser(lien)} className="bouton !min-h-9 !px-3 text-sm">
              Importer ses idées
            </button>
            <button type="button" disabled={enCours} onClick={() => enregistrerLien(lien)} className="bouton bouton-discret !min-h-9 !px-3 text-sm">
              <Link2 size={14} aria-hidden /> {lien.trim() ? "Afficher ce lien aux autres" : "Retirer le lien"}
            </button>
          </div>
          <p className="mt-1 text-xs text-doux">
            {mystere
              ? "Mode mystère : ce lien n'est pas montré aux autres (il pourrait dévoiler votre nom). Importez plutôt vos idées."
              : "Listes Listy publiques et la plupart des sites de listes : importables. Listes Amazon : leur lien peut être affiché aux autres, mais pas importé."}
          </p>
        </div>

        <div>
          <label className="etiquette" htmlFor={`idees-texte-${jeton}`}>Ou collez vos idées, une par ligne</label>
          <textarea
            id={`idees-texte-${jeton}`}
            className="champ"
            rows={4}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder={"Un casque sans fil https://…\nLe tome 3 de ma saga\nhttps://… (un lien seul suffit)"}
          />
          <button type="button" disabled={enCours || !texte.trim()} onClick={() => previsualiser(texte)} className="bouton bouton-discret mt-2 !min-h-9 !px-3 text-sm">
            Voir ce qui sera importé
          </button>
        </div>

        {enCours && <p className="text-sm text-doux">Lecture en cours… Pour une longue liste, comptez jusqu&apos;à une demi-minute.</p>}
        {note && <p className="rounded-xl bg-or/20 p-3 text-sm">{note}</p>}
        {note && lienListe && !apercu?.length && (
          <button type="button" disabled={enCours} onClick={() => enregistrerLien(lienListe)} className="bouton bouton-discret !min-h-9 !px-3 text-sm">
            <Link2 size={14} aria-hidden /> Enregistrer comme « Ma liste ailleurs »
          </button>
        )}

        {apercu && apercu.length > 0 && (
          <div className="rounded-xl bg-creme p-3">
            <p className="mb-2 text-sm font-semibold">{apercu.length} idée{apercu.length > 1 ? "s" : ""} trouvée{apercu.length > 1 ? "s" : ""} : cochez celles à importer</p>
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {apercu.map((i, n) => (
                <li key={`${i.titre}-${n}`}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 text-sm hover:bg-carte">
                    <input
                      type="checkbox"
                      checked={coches[n] ?? false}
                      onChange={(e) => setCoches((c) => c.map((v, k) => (k === n ? e.target.checked : v)))}
                      className="mt-0.5 size-4 shrink-0 accent-[var(--sapin)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{i.titre}</span>
                      {i.lien && (
                        <span className="inline-flex items-center gap-1 text-xs text-doux">
                          {new URL(i.lien).hostname.replace(/^www\./, "")} <ExternalLink size={11} aria-hidden />
                        </span>
                      )}
                    </span>
                    {i.prix != null && <span className="shrink-0 text-xs font-semibold">{euros(i.prix)}</span>}
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={enCours || nbCoches === 0} onClick={importer} className="bouton !min-h-9 !px-3 text-sm">
                Importer {nbCoches} idée{nbCoches > 1 ? "s" : ""}
              </button>
              <button type="button" onClick={() => setApercu(null)} className="text-sm text-doux underline">Annuler</button>
            </div>
          </div>
        )}

        {message?.ok && <p role="status" className="text-sm font-medium text-sapin">{message.ok}</p>}
        {message?.erreur && <p role="alert" className="text-sm font-medium text-cerise">{message.erreur}</p>}
      </div>
    </details>
  );
}
