import { CalendarDays, Crown, Eye, EyeOff, Shuffle, Trash2, Wallet, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ajouterParticipants,
  annulerTirage,
  basculerExclusion,
  lancerTirage,
  modifierGroupe,
  retirerParticipant,
} from "@/app/actions";
import { AjoutExclusion } from "@/components/ajout-exclusion";
import { BoutonAction } from "@/components/bouton-action";
import { CopierLien } from "@/components/copier-lien";
import { Formulaire } from "@/components/formulaire";
import { Partager } from "@/components/partager";
import { SeSouvenir } from "@/components/se-souvenir";
import { compteARebours, dateLongue } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Organisation", robots: { index: false, follow: false } };

export default async function Organisation({
  params,
  searchParams,
}: {
  params: Promise<{ jeton: string }>;
  searchParams: Promise<{ nouveau?: string }>;
}) {
  const { jeton } = await params;
  const { nouveau } = await searchParams;

  const groupe = await prisma.groupe.findUnique({
    where: { jetonAdmin: jeton },
    include: {
      // ⚠️ `destinataireId` n'est PAS lu : l'organisateur ne doit pas pouvoir découvrir le tirage.
      participants: {
        orderBy: { prenom: "asc" },
        select: { id: true, prenom: true, jeton: true, ouvertLe: true, _count: { select: { souhaits: true } } },
      },
      exclusions: { include: { a: { select: { prenom: true } }, b: { select: { prenom: true } } } },
    },
  });
  if (!groupe) notFound();

  const tire = Boolean(groupe.tirageLe);
  const rebours = groupe.dateEchange ? compteARebours(groupe.dateEchange) : null;
  const ouverts = groupe.participants.filter((p) => p.ouvertLe).length;
  const dateIso = groupe.dateEchange?.toISOString().slice(0, 10) ?? "";

  return (
    <main className="space-y-6 pt-6">
      <SeSouvenir type="admin" jeton={jeton} groupe={groupe.nom} />

      <header>
        <Link href="/" className="text-sm text-doux">← Accueil</Link>
        <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-cerise"><Crown size={16} /> Espace organisateur</p>
        <h1 className="font-titre text-3xl font-bold">{groupe.nom}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-doux">
          {groupe.dateEchange && (
            <span className="inline-flex items-center gap-1"><CalendarDays size={15} /> {dateLongue(groupe.dateEchange)}{rebours && ` · ${rebours}`}</span>
          )}
          {groupe.budget && <span className="inline-flex items-center gap-1"><Wallet size={15} /> {groupe.budget} € environ</span>}
        </div>
      </header>

      {nouveau && (
        <div className="carte border-or/50 bg-[color-mix(in_oklab,var(--or)_10%,var(--carte))]">
          <p className="font-semibold">🎉 Le groupe est créé !</p>
          <p className="mt-1 text-sm">
            Cette page est <strong>votre lien d&apos;organisateur</strong>. Il est gardé sur cet appareil ; copiez-le aussi
            quelque part pour pouvoir y revenir d&apos;un autre téléphone.
          </p>
          <div className="mt-3"><CopierLien chemin={`/g/${jeton}`} libelle="Copier mon lien d'organisateur" /></div>
        </div>
      )}

      {/* Le tirage */}
      <section className="carte">
        {tire ? (
          <>
            <h2 className="flex items-center gap-2 font-titre text-xl font-semibold text-sapin"><Shuffle size={20} /> Le tirage est fait</h2>
            <p className="mt-1 text-sm text-doux">
              Envoyez à chacun son lien : il y découvrira à qui il offre. {ouverts}/{groupe.participants.length} l&apos;ont déjà ouvert.
            </p>
            <div className="mt-4">
              <BoutonAction
                action={annulerTirage.bind(null, jeton)}
                confirmation="Annuler le tirage ? Chacun perdra la personne qu'il a tirée, et les questions anonymes seront effacées. Les listes de cadeaux sont conservées."
                className="text-sm font-medium text-cerise underline"
              >
                Annuler le tirage pour le refaire
              </BoutonAction>
            </div>
          </>
        ) : (
          <>
            <h2 className="flex items-center gap-2 font-titre text-xl font-semibold"><Shuffle size={20} /> Prêt pour le tirage ?</h2>
            <p className="mt-1 mb-4 text-sm text-doux">
              Vérifiez la liste et les exclusions. Personne, pas même vous, ne verra le résultat des autres.
            </p>
            <Formulaire action={lancerTirage.bind(null, jeton)} bouton="Lancer le tirage au sort" boutonClass="bouton bouton-cerise w-full">
              {null}
            </Formulaire>
          </>
        )}
      </section>

      {/* Les participants */}
      <section className="carte">
        <h2 className="font-titre text-xl font-semibold">Participants · {groupe.participants.length}</h2>
        <p className="mt-1 text-sm text-doux">Chacun a son lien personnel. Envoyez-le par SMS, WhatsApp ou e-mail.</p>
        <ul className="mt-4 divide-y divide-trait">
          {groupe.participants.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.prenom}</p>
                <p className="flex items-center gap-1 text-xs text-doux">
                  {p.ouvertLe ? <><Eye size={13} /> a ouvert son lien</> : <><EyeOff size={13} /> pas encore ouvert</>}
                  {" · "}{p._count.souhaits} idée{p._count.souhaits > 1 ? "s" : ""}
                </p>
              </div>
              <Partager chemin={`/p/${p.jeton}`} prenom={p.prenom} groupe={groupe.nom} compact />
              {!tire && (
                <BoutonAction
                  action={retirerParticipant.bind(null, jeton, p.id)}
                  confirmation={`Retirer ${p.prenom} du groupe ? Sa liste de cadeaux sera effacée.`}
                  className="grid size-9 place-items-center rounded-full text-doux hover:bg-cerise-clair hover:text-cerise"
                  titre={`Retirer ${p.prenom}`}
                >
                  <Trash2 size={16} />
                </BoutonAction>
              )}
            </li>
          ))}
        </ul>
        {!tire && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold text-sapin">+ Ajouter des participants</summary>
            <div className="mt-3">
              <Formulaire action={ajouterParticipants.bind(null, jeton)} bouton="Ajouter" vider>
                <textarea name="prenoms" rows={3} className="champ" placeholder="Un prénom par ligne" aria-label="Prénoms à ajouter" />
              </Formulaire>
            </div>
          </details>
        )}
      </section>

      {/* Les exclusions */}
      {(!tire || groupe.exclusions.length > 0) && (
        <section className="carte">
          <h2 className="font-titre text-xl font-semibold">Exclusions</h2>
          <p className="mt-1 text-sm text-doux">Les couples, ou ceux qui s&apos;offrent déjà un cadeau, ne se tireront pas l&apos;un l&apos;autre.</p>
          {groupe.exclusions.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {groupe.exclusions.map((e) => (
                <li key={e.id} className="inline-flex items-center gap-1 rounded-full bg-sapin-clair py-1 pr-1 pl-3 text-sm">
                  {e.a.prenom} ↮ {e.b.prenom}
                  {!tire && (
                    <BoutonAction
                      action={basculerExclusion.bind(null, jeton, e.aId, e.bId)}
                      className="grid size-6 place-items-center rounded-full hover:bg-carte"
                      titre="Retirer l'exclusion"
                    >
                      <X size={13} />
                    </BoutonAction>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!tire && groupe.participants.length >= 2 && (
            <div className="mt-4">
              <AjoutExclusion
                participants={groupe.participants.map(({ id, prenom }) => ({ id, prenom }))}
                action={basculerExclusion.bind(null, jeton)}
              />
            </div>
          )}
        </section>
      )}

      {/* Réglages */}
      <details className="carte">
        <summary className="cursor-pointer font-titre text-xl font-semibold">Modifier le groupe</summary>
        <div className="mt-4">
          <Formulaire action={modifierGroupe.bind(null, jeton)} bouton="Enregistrer">
            <div>
              <label className="etiquette" htmlFor="nom">Nom</label>
              <input id="nom" name="nom" className="champ" defaultValue={groupe.nom} required maxLength={80} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="etiquette" htmlFor="date">Date de l&apos;échange</label>
                <input id="date" name="date" type="date" className="champ" defaultValue={dateIso} />
              </div>
              <div>
                <label className="etiquette" htmlFor="budget">Budget (€)</label>
                <input id="budget" name="budget" inputMode="numeric" className="champ" defaultValue={groupe.budget ?? ""} />
              </div>
            </div>
            <div>
              <label className="etiquette" htmlFor="message">Mot pour le groupe</label>
              <textarea id="message" name="message" rows={2} className="champ" defaultValue={groupe.message} maxLength={500} />
            </div>
          </Formulaire>
        </div>
      </details>

      <p className="text-center text-xs text-doux">
        Gardez ce lien pour vous : il permet de gérer le groupe. <CopierLien chemin={`/g/${jeton}`} libelle="Copier" />
      </p>
    </main>
  );
}
