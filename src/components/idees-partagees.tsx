"use client";

import { ExternalLink } from "lucide-react";
import { useState, useSyncExternalStore, useTransition } from "react";

import { annulerReservation, reserverIdee } from "@/app/actions-listes";

import { estProprioDe, jetonAppareil } from "./memoire";

export type IdeePartagee = {
  id: string;
  titre: string;
  url: string;
  affilie: boolean;
  domaine: string;
  image: string;
  prix: number | null;
  note: string;
  reservePar: string;
};

const CLE_PRENOM = "quioffre:prenom";
const CLE_MIENNES = "quioffre:reservations";

function lireMiennes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CLE_MIENNES) ?? "[]");
  } catch {
    return [];
  }
}
function ecrireMiennes(ids: string[]) {
  try {
    localStorage.setItem(CLE_MIENNES, JSON.stringify(ids.slice(-200)));
  } catch {}
  window.dispatchEvent(new Event("quioffre:reservations"));
}
const abonner = (f: () => void) => {
  window.addEventListener("quioffre:reservations", f);
  window.addEventListener("storage", f);
  return () => {
    window.removeEventListener("quioffre:reservations", f);
    window.removeEventListener("storage", f);
  };
};
let cache = { brut: "", ids: [] as string[] };
const miennesInstantane = () => {
  const brut = JSON.stringify(lireMiennes());
  if (brut !== cache.brut) cache = { brut, ids: JSON.parse(brut) };
  return cache.ids;
};
const VIDE: string[] = [];

/**
 * Les idées d'une liste vues par les proches, avec « Je m'en occupe ».
 *
 * Sur l'appareil de la personne fêtée (qui a le lien propriétaire de cette
 * liste), les réservations sont masquées : elle peut regarder la page partagée
 * sans gâcher sa surprise.
 */
export function IdeesPartagees({
  jetonPartage,
  idees,
  duCompte = VIDE,
  proprioConnecte = false,
}: {
  jetonPartage: string;
  idees: IdeePartagee[];
  /** Les idées réservées par le compte connecté (depuis n'importe quel appareil). */
  duCompte?: string[];
  /** La personne fêtée, reconnue par son compte : le serveur n'a même pas envoyé les réservations. */
  proprioConnecte?: boolean;
}) {
  const proprioAppareil = useSyncExternalStore(() => () => {}, () => estProprioDe(jetonPartage), () => false);
  const proprio = proprioConnecte || proprioAppareil;
  const miennes = useSyncExternalStore(abonner, miennesInstantane, () => VIDE);
  const [demande, setDemande] = useState<string | null>(null);
  const [prenom, setPrenom] = useState("");
  const [enCours, demarrer] = useTransition();

  const reserver = (id: string, nom: string) =>
    demarrer(async () => {
      const r = await reserverIdee(jetonPartage, id, nom, jetonAppareil());
      if (r && "erreur" in r) return alert(r.erreur);
      try {
        localStorage.setItem(CLE_PRENOM, nom);
      } catch {}
      ecrireMiennes([...lireMiennes(), id]);
      setDemande(null);
    });

  const annuler = (id: string) =>
    demarrer(async () => {
      const r = await annulerReservation(jetonPartage, id, jetonAppareil());
      if (r && "erreur" in r) return alert(r.erreur);
      ecrireMiennes(lireMiennes().filter((x) => x !== id));
    });

  return (
    <>
      {proprio && (
        <p className="mb-3 rounded-xl bg-or/20 p-3 text-sm">
          🙈 C&apos;est votre liste : les réservations sont masquées sur cet appareil, pour garder la surprise.
        </p>
      )}
      <ul className="divide-y divide-trait">
        {idees.map((s) => {
          const reservee = !proprio && Boolean(s.reservePar);
          const parMoi = reservee && (miennes.includes(s.id) || duCompte.includes(s.id));
          return (
            <li key={s.id} className="py-3">
              <div className="flex items-start gap-3">
                {s.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- image d'un site tiers, de n'importe quel domaine
                  <img src={s.image} alt="" loading="lazy" referrerPolicy="no-referrer" className={`size-16 shrink-0 rounded-lg border border-trait bg-white object-contain ${reservee && !parMoi ? "opacity-50" : ""}`} />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${reservee && !parMoi ? "text-doux line-through" : ""}`}>{s.titre}</p>
                  {s.note && <p className="text-sm text-doux">{s.note}</p>}
                  {s.url && (
                    <a href={s.url} target="_blank" rel={s.affilie ? "sponsored noopener nofollow" : "noopener noreferrer nofollow"} className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-sapin underline">
                      {s.domaine || "Voir"} <ExternalLink size={13} />
                    </a>
                  )}
                </div>
                {s.prix != null && <span className="shrink-0 rounded-full bg-creme px-2.5 py-0.5 text-sm font-semibold">{s.prix} €</span>}
              </div>
              {!proprio && (
                <div className="mt-2">
                  {parMoi ? (
                    <button type="button" disabled={enCours} onClick={() => annuler(s.id)} className="bouton !min-h-8 !px-3 text-sm">
                      ✓ Je m&apos;en occupe — annuler
                    </button>
                  ) : reservee ? (
                    <span className="text-sm text-doux">🎁 Déjà réservé par {s.reservePar}</span>
                  ) : demande === s.id ? (
                    <form
                      className="flex flex-wrap items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (prenom.trim()) reserver(s.id, prenom.trim());
                      }}
                    >
                      <input
                        autoFocus
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        maxLength={40}
                        placeholder="Votre prénom"
                        aria-label="Votre prénom"
                        className="champ !w-auto flex-1 !py-1.5"
                      />
                      <button type="submit" disabled={enCours || !prenom.trim()} className="bouton !min-h-9 !px-3 text-sm">Réserver</button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      disabled={enCours}
                      className="bouton bouton-discret !min-h-8 !px-3 text-sm"
                      onClick={() => {
                        let connu = "";
                        try {
                          connu = localStorage.getItem(CLE_PRENOM) ?? "";
                        } catch {}
                        if (connu) reserver(s.id, connu);
                        else {
                          setPrenom("");
                          setDemande(s.id);
                        }
                      }}
                    >
                      Je m&apos;en occupe
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {!proprio && (
        <p className="mt-3 text-xs text-doux">
          La personne fêtée ne voit jamais ce qui est réservé. Les autres proches voient votre prénom, pour éviter les doublons.
        </p>
      )}
    </>
  );
}
