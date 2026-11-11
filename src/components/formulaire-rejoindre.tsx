"use client";

import { Check, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { rejoindreGroupe, type Inscription } from "@/app/actions";

import { garderLien } from "./memoire";
import { Partager } from "./partager";

const cle = (jetonInvitation: string) => `quioffre:rejoint:${jetonInvitation}`;

function lire(jetonInvitation: string): string | null {
  try {
    return localStorage.getItem(cle(jetonInvitation));
  } catch {
    return null;
  }
}

/**
 * L'inscription par le lien d'invitation : pour soi, ou pour quelqu'un d'autre
 * (un enfant, une grand-mère sans smartphone…).
 *
 * Pour soi : on part dans son espace, et l'appareil s'en souvient (il proposera
 * cet espace au lieu d'une seconde inscription).
 * Pour un autre : on reste ici, avec le lien de la personne à lui envoyer, ou
 * à ouvrir pour remplir sa liste à sa place. L'appareil le garde dans « Sur
 * cet appareil », sans le confondre avec sa propre inscription.
 */
export function FormulaireRejoindre({ jetonInvitation, groupe }: { jetonInvitation: string; groupe: string }) {
  const [etat, agir, enCours] = useActionState<Inscription | null, FormData>(rejoindreGroupe.bind(null, jetonInvitation), null);
  const router = useRouter();
  const [pourAutre, setPourAutre] = useState(false);
  const [inscrits, setInscrits] = useState<{ prenom: string; jeton: string }[]>([]);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const pourAutreAuMomentDeEnvoyer = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  // Cet appareil a-t-il déjà servi à s'inscrire soi-même ? On propose alors son espace.
  const deja = useSyncExternalStore(() => () => {}, () => lire(jetonInvitation), () => null);

  useEffect(() => {
    if (!etat || "erreur" in etat) return;
    garderLien({ type: "perso", jeton: etat.jeton, groupe: etat.nom, prenom: etat.prenom, pourAutre: pourAutreAuMomentDeEnvoyer.current });
    if (pourAutreAuMomentDeEnvoyer.current) {
      setInscrits((l) => (l.some((x) => x.jeton === etat.jeton) ? l : [...l, { prenom: etat.prenom, jeton: etat.jeton }]));
      setFormulaireOuvert(false);
      form.current?.reset();
      return;
    }
    try {
      localStorage.setItem(cle(jetonInvitation), etat.jeton);
    } catch {}
    router.push(`/p/${etat.jeton}?bienvenue=1`);
  }, [etat, router, jetonInvitation]);

  const afficherFormulaire = !(deja || inscrits.length) || formulaireOuvert;

  return (
    <div className="space-y-4">
      {inscrits.map((p) => (
        <div key={p.jeton} className="rounded-2xl bg-sapin-clair p-4">
          <p className="flex items-center gap-1.5 font-semibold">
            <Check size={18} className="text-sapin" aria-hidden /> {p.prenom} est inscrit·e
          </p>
          <p className="mt-1 text-sm text-doux">
            Envoyez-lui son lien personnel, ou ouvrez son espace pour remplir sa liste à sa place. Il est aussi gardé sur cet
            appareil.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Partager
              chemin={`/p/${p.jeton}`}
              texte={`🎁 ${p.prenom}, voici ton lien pour le tirage « ${groupe} » sur Qui Offre. Il est personnel, ne le transfère pas !`}
              compact
              libelle="Envoyer son lien"
            />
            <Link href={`/p/${p.jeton}`} className="bouton bouton-discret !min-h-9 !px-3 text-sm">Ouvrir son espace</Link>
          </div>
        </div>
      ))}

      {deja && !formulaireOuvert && (
        <div className="space-y-2 text-center">
          <p>Vous avez déjà rejoint ce groupe depuis cet appareil.</p>
          <Link href={`/p/${deja}`} className="bouton w-full">Ouvrir mon espace</Link>
        </div>
      )}

      {!afficherFormulaire && (
        <div className="flex flex-col gap-2 text-center">
          <button
            type="button"
            className="bouton bouton-discret w-full"
            onClick={() => {
              setPourAutre(true);
              setFormulaireOuvert(true);
            }}
          >
            <UserPlus size={16} aria-hidden /> Inscrire quelqu&apos;un d&apos;autre
          </button>
          {!deja && (
            <button
              type="button"
              className="text-sm text-doux underline"
              onClick={() => {
                setPourAutre(false);
                setFormulaireOuvert(true);
              }}
            >
              Et vous ? Inscrivez-vous aussi
            </button>
          )}
        </div>
      )}

      {afficherFormulaire && (
        <form
          ref={form}
          action={(f) => {
            pourAutreAuMomentDeEnvoyer.current = pourAutre;
            agir(f);
          }}
          className="space-y-4"
        >
          <fieldset className="grid grid-cols-2 gap-2" aria-label="Pour qui ?">
            {[
              { valeur: false, libelle: "C'est pour moi" },
              { valeur: true, libelle: "Pour quelqu'un d'autre" },
            ].map((o) => (
              <label
                key={o.libelle}
                className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold ${
                  pourAutre === o.valeur ? "border-sapin bg-sapin-clair text-sapin" : "border-trait"
                }`}
              >
                <input type="radio" name="pour" className="sr-only" checked={pourAutre === o.valeur} onChange={() => setPourAutre(o.valeur)} />
                {o.libelle}
              </label>
            ))}
          </fieldset>
          {pourAutre && (
            <p className="-mt-2 text-sm text-doux">Un enfant, un proche sans smartphone… Vous recevrez son lien pour le lui transmettre.</p>
          )}
          <div>
            <label className="etiquette" htmlFor="prenom">{pourAutre ? "Son prénom" : "Votre prénom"}</label>
            <input type="hidden" name="pourAutre" value={pourAutre ? "1" : ""} />
            <input id="prenom" name="prenom" className="champ" required maxLength={40} autoComplete={pourAutre ? "off" : "given-name"} placeholder={pourAutre ? "Léo" : "Léa"} />
          </div>
          <div>
            <label className="etiquette" htmlFor="email">{pourAutre ? "Son e-mail" : "E-mail"} <span className="font-normal text-doux">(facultatif)</span></label>
            <input id="email" name="email" type="email" className="champ" maxLength={120} autoComplete={pourAutre ? "off" : "email"} placeholder={pourAutre ? "" : "lea@exemple.fr"} />
          </div>
          <div>
            <label className="etiquette" htmlFor="telephone">{pourAutre ? "Son téléphone" : "Téléphone"} <span className="font-normal text-doux">(facultatif)</span></label>
            <input id="telephone" name="telephone" type="tel" className="champ" maxLength={30} autoComplete={pourAutre ? "off" : "tel"} placeholder="06 12 34 56 78" />
            <p className="mt-1 text-sm text-doux">
              Visibles uniquement par l&apos;organisateur. Avec un e-mail, {pourAutre ? "la personne recevra son" : "vous recevrez votre"} lien au tirage et
              un rappel avant l&apos;échange.
            </p>
          </div>
          <button type="submit" className="bouton bouton-cerise w-full" disabled={enCours}>
            {enCours ? "Un instant…" : pourAutre ? "Inscrire cette personne" : "Rejoindre le groupe"}
          </button>
          {etat && "erreur" in etat && <p role="alert" className="text-sm font-medium text-cerise">{etat.erreur}</p>}
        </form>
      )}
    </div>
  );
}
