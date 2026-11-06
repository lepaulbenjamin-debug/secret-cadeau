import { CalendarDays, Pencil, Share2, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ajouterIdeeListe, modifierIdeeListe, modifierListe, supprimerIdeeListe } from "@/app/actions-listes";
import { BoutonAction } from "@/components/bouton-action";
import { ChampsSouhait } from "@/components/champs-souhait";
import { CopierLien } from "@/components/copier-lien";
import { Formulaire } from "@/components/formulaire";
import { OuvrirSiAncre } from "@/components/ouvrir-si-ancre";
import { Partager } from "@/components/partager";
import { SeSouvenir } from "@/components/se-souvenir";
import { Souhait } from "@/components/souhait";
import { SupprimerListe } from "@/components/supprimer-liste";
import { compteARebours, dateLongue } from "@/lib/format";
import { OCCASIONS, titreListe } from "@/lib/occasions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ma liste de cadeaux", robots: { index: false, follow: false } };

export default async function MaListe({ params, searchParams }: { params: Promise<{ jeton: string }>; searchParams: Promise<{ nouveau?: string }> }) {
  const { jeton } = await params;
  const { nouveau } = await searchParams;
  const liste = await prisma.liste.findUnique({
    where: { jetonProprio: jeton },
    // ⚠️ Ni `reservePar` ni `jetonReserve` : la personne fêtée ne doit pas savoir ce qu'on lui offre.
    include: { idees: { orderBy: { creeLe: "asc" }, select: { id: true, titre: true, lien: true, image: true, prix: true, note: true } } },
  });
  if (!liste) notFound();

  const titre = titreListe(liste);
  const rebours = liste.date ? compteARebours(liste.date) : null;
  const texteInvitation = `${titre} : voici ma liste d'idées cadeaux. Réservez celle que vous m'offrez, pour éviter les doublons !`;

  return (
    <main className="space-y-6 pt-6">
      <SeSouvenir type="liste-proprio" jeton={jeton} jetonPartage={liste.jetonPartage} groupe={titre} prenom={liste.prenom} />

      <header>
        <Link href="/" className="text-sm text-doux">← Accueil</Link>
        <p className="mt-4 text-sm font-semibold text-cerise">Ma liste de cadeaux</p>
        <h1 className="font-titre text-3xl font-bold">{titre}</h1>
        {liste.date && (
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-doux">
            <CalendarDays size={15} /> {dateLongue(liste.date)}{rebours && ` · ${rebours}`}
          </p>
        )}
      </header>

      {nouveau && (
        <div className="carte border-or/50 bg-[color-mix(in_oklab,var(--or)_10%,var(--carte))]">
          <p className="font-semibold">🎉 Votre liste est créée !</p>
          <p className="mt-1 text-sm">
            Cette page est <strong>votre lien personnel</strong> pour la remplir : il est gardé sur cet appareil.
            {liste.emailProprio ? " Il vient aussi de vous être envoyé par e-mail." : " Copiez-le quelque part pour le retrouver d'un autre téléphone."}
          </p>
          <div className="mt-3"><CopierLien chemin={`/ma-liste/${jeton}`} libelle="Copier mon lien personnel" /></div>
        </div>
      )}

      <section className="carte">
        <h2 className="flex items-center gap-2 font-titre text-xl font-semibold"><Share2 size={20} /> Partager ma liste</h2>
        <p className="mt-1 text-sm text-doux">
          Envoyez ce lien à vos proches : ils voient vos idées et réservent celle qu&apos;ils vous offrent. Vous ne saurez
          jamais ce qui a été réservé, ni par qui.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Partager chemin={`/liste/${liste.jetonPartage}`} texte={texteInvitation} libelle="Partager ma liste" />
          <CopierLien chemin={`/liste/${liste.jetonPartage}`} />
        </div>
      </section>

      <section className="carte">
        <h2 className="font-titre text-xl font-semibold">Mes idées · {liste.idees.length}</h2>
        {liste.idees.length > 0 && (
          <ul className="mt-2 divide-y divide-trait">
            {liste.idees.map((s) => (
              <Souhait
                key={s.id}
                s={s}
                pied={
                  <div className="flex items-start gap-2">
                    <details className="flex-1">
                      <summary className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-sapin"><Pencil size={13} /> Modifier</summary>
                      <div className="mt-3">
                        <Formulaire key={`modif-${s.id}`} action={modifierIdeeListe.bind(null, jeton, s.id)} bouton="Enregistrer">
                          <ChampsSouhait v={s} id={s.id} jeton={jeton} />
                        </Formulaire>
                      </div>
                    </details>
                    <BoutonAction
                      action={supprimerIdeeListe.bind(null, jeton, s.id)}
                      confirmation={`Retirer « ${s.titre} » de votre liste ?`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-cerise"
                    >
                      <Trash2 size={13} /> Retirer
                    </BoutonAction>
                  </div>
                }
              />
            ))}
          </ul>
        )}
        <div className="mt-4 rounded-2xl bg-creme p-4">
          <h3 className="mb-3 font-semibold text-sapin">+ Ajouter une idée</h3>
          <Formulaire key="ajout" action={ajouterIdeeListe.bind(null, jeton)} bouton="Ajouter à ma liste" vider>
            <ChampsSouhait id="nouveau" jeton={jeton} />
          </Formulaire>
        </div>
      </section>

      <details id="reglages" className="carte">
        <summary className="cursor-pointer font-titre text-xl font-semibold">Modifier la liste</summary>
        <OuvrirSiAncre id="reglages" />
        <div className="mt-4">
          <Formulaire key="reglages" action={modifierListe.bind(null, jeton)} bouton="Enregistrer">
            <div>
              <label className="etiquette" htmlFor="occasion">L&apos;occasion</label>
              <select id="occasion" name="occasion" className="champ" defaultValue={liste.occasion}>
                {Object.entries(OCCASIONS).map(([cle, o]) => (
                  <option key={cle} value={cle}>{o.emoji} {o.libelle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="etiquette" htmlFor="prenom">Prénom</label>
              <input id="prenom" name="prenom" className="champ" defaultValue={liste.prenom} required maxLength={40} />
            </div>
            <div>
              <label className="etiquette" htmlFor="date">Date</label>
              <input id="date" name="date" type="date" className="champ" defaultValue={liste.date?.toISOString().slice(0, 10) ?? ""} />
            </div>
            <div>
              <label className="etiquette" htmlFor="message">Mot pour vos proches</label>
              <textarea id="message" name="message" rows={2} className="champ" defaultValue={liste.message} maxLength={500} />
            </div>
            <div>
              <label className="etiquette" htmlFor="email">Votre e-mail</label>
              <input id="email" name="email" type="email" className="champ" defaultValue={liste.emailProprio} maxLength={120} autoComplete="email" />
            </div>
          </Formulaire>
        </div>
      </details>

      <details className="carte border-cerise/30">
        <summary className="cursor-pointer font-titre text-xl font-semibold text-cerise">Supprimer la liste</summary>
        <p className="my-3 text-sm text-doux">Toutes les idées sont effacées, et le lien partagé ne mènera plus nulle part.</p>
        <SupprimerListe jetonProprio={jeton} />
      </details>

      <p className="text-center text-xs text-doux">Ce lien est personnel : ne le partagez pas, il permet de modifier votre liste.</p>
    </main>
  );
}
