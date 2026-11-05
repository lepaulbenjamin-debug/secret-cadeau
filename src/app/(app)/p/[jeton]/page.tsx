import { CalendarDays, Gift, MessageCircleQuestion, Pencil, Trash2, Users, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  ajouterSouhait,
  basculerReservation,
  changerNomDeCode,
  modifierCoordonnees,
  modifierSouhait,
  poserQuestion,
  repondreQuestion,
  supprimerSouhait,
} from "@/app/actions";
import { BoutonAction } from "@/components/bouton-action";
import { ChampsSouhait } from "@/components/champs-souhait";
import { CopierLien } from "@/components/copier-lien";
import { OuvrirSiAncre } from "@/components/ouvrir-si-ancre";
import { Formulaire } from "@/components/formulaire";
import { Revelation } from "@/components/revelation";
import { SeSouvenir } from "@/components/se-souvenir";
import { Souhait, type SouhaitAffiche } from "@/components/souhait";
import { assurerNomsDeCode, nomVisible, participantOu404 } from "@/lib/acces";
import { compteARebours, dateLongue } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false, follow: false } };

const champsSouhait = { id: true, titre: true, lien: true, image: true, prix: true, note: true, reserveParId: true } as const;

export default async function EspacePerso({
  params,
  searchParams,
}: {
  params: Promise<{ jeton: string }>;
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const { jeton } = await params;
  const { bienvenue } = await searchParams;
  const moi = await participantOu404(jeton);
  const groupe = moi.groupe;

  if (!moi.ouvertLe) await prisma.participant.update({ where: { id: moi.id }, data: { ouvertLe: new Date() } });

  const anonyme = groupe.nomsDeCode;
  await assurerNomsDeCode(groupe.id);
  const monNomDeCode =
    moi.nomDeCode || (await prisma.participant.findUnique({ where: { id: moi.id }, select: { nomDeCode: true } }))!.nomDeCode;

  const [mesSouhaits, autres, questionsRecues, questionsPosees] = await Promise.all([
    // Ma liste : sans `reserveParId`, je ne dois pas savoir ce qu'on m'offre.
    prisma.souhait.findMany({
      where: { participantId: moi.id },
      orderBy: { creeLe: "asc" },
      select: { id: true, titre: true, lien: true, image: true, prix: true, note: true },
    }),
    // ⚠️ Ni `jeton` ni `destinataireId` des autres : ce sont leurs secrets.
    prisma.participant.findMany({
      where: { groupeId: groupe.id, id: { not: moi.id } },
      orderBy: { prenom: "asc" },
      select: { id: true, prenom: true, nomDeCode: true, souhaits: { orderBy: { creeLe: "asc" }, select: champsSouhait } },
    }),
    prisma.question.findMany({ where: { destinataireId: moi.id }, orderBy: { creeLe: "asc" } }),
    prisma.question.findMany({ where: { pereId: moi.id }, orderBy: { creeLe: "asc" } }),
  ]);

  const destinataire = autres.find((p) => p.id === moi.destinataireId) ?? null;
  // En mode mystère, les autres ne sont que des noms de code — triés comme tels,
  // pour que l'ordre alphabétique des vrais prénoms ne trahisse rien.
  const restants = autres
    .filter((p) => p.id !== moi.destinataireId)
    .sort((a, b) => nomVisible(a, anonyme).localeCompare(nomVisible(b, anonyme), "fr"));
  const rebours = groupe.dateEchange ? compteARebours(groupe.dateEchange) : null;

  const pied = (s: SouhaitAffiche & { reserveParId: string | null }) => {
    const parMoi = s.reserveParId === moi.id;
    if (s.reserveParId && !parMoi) return <span className="text-sm text-doux">🎁 Déjà réservé par quelqu&apos;un</span>;
    return (
      <BoutonAction
        action={basculerReservation.bind(null, jeton, s.id)}
        className={parMoi ? "bouton !min-h-8 !px-3 text-sm" : "bouton bouton-discret !min-h-8 !px-3 text-sm"}
      >
        {parMoi ? "✓ Je m'en occupe — annuler" : "Je m'en occupe"}
      </BoutonAction>
    );
  };

  return (
    <main className="space-y-6 pt-6">
      <SeSouvenir type="perso" jeton={jeton} groupe={groupe.nom} prenom={moi.prenom} />

      <header>
        <Link href="/" className="text-sm text-doux">← Accueil</Link>
        <h1 className="mt-4 font-titre text-3xl font-bold">Bonjour {moi.prenom} 👋</h1>
        <p className="text-lg">{groupe.nom}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-doux">
          {groupe.dateEchange && (
            <span className="inline-flex items-center gap-1"><CalendarDays size={15} /> {dateLongue(groupe.dateEchange)}{rebours && ` · ${rebours}`}</span>
          )}
          {groupe.budget && <span className="inline-flex items-center gap-1"><Wallet size={15} /> {groupe.budget} € environ</span>}
        </div>
        {groupe.message && <p className="carte mt-4 !py-3 text-sm italic">« {groupe.message} »</p>}
      </header>

      {anonyme && (
        <section className="carte text-center">
          <p className="text-sm font-semibold tracking-wide text-cerise uppercase">🕵️ Mode mystère</p>
          <p className="mt-1 text-sm text-doux">Pour les autres, vous êtes</p>
          <p className="font-titre text-2xl font-bold">{monNomDeCode}</p>
          <p className="mt-2 text-sm text-doux">
            Retenez-le : le jour J, votre cadeau portera ce nom. Votre Père Noël ne sait pas qui vous êtes, il choisira
            uniquement d&apos;après votre liste.
          </p>
          {!groupe.tirageLe && (
            <div className="mt-3">
              <BoutonAction action={changerNomDeCode.bind(null, jeton)} className="bouton bouton-discret !min-h-9 text-sm">
                🎲 Tirer un autre nom de code
              </BoutonAction>
            </div>
          )}
        </section>
      )}

      {bienvenue && (
        <div className="carte border-or/50 bg-[color-mix(in_oklab,var(--or)_10%,var(--carte))]">
          <p className="font-semibold">🎉 Vous êtes inscrit·e !</p>
          <p className="mt-1 text-sm">
            Cette page est <strong>votre espace personnel</strong> : vous y découvrirez à qui vous offrez après le tirage.
            Elle est retenue sur cet appareil ; gardez aussi le lien pour l&apos;ouvrir ailleurs.
          </p>
          <div className="mt-3"><CopierLien chemin={`/p/${jeton}`} libelle="Copier mon lien" /></div>
        </div>
      )}

      {/* Ma personne */}
      {destinataire ? (
        <section className="space-y-4">
          <Revelation prenom={nomVisible(destinataire, anonyme)} mystere={anonyme} />

          <div className="carte">
            <h2 className="flex items-center gap-2 font-titre text-xl font-semibold"><Gift size={20} /> Ses idées</h2>
            {destinataire.souhaits.length ? (
              <ul className="mt-2 divide-y divide-trait">
                {destinataire.souhaits.map((s) => (
                  <Souhait key={s.id} s={s} barre={Boolean(s.reserveParId && s.reserveParId !== moi.id)} pied={pied(s)} />
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-doux">Pas encore d&apos;idée sur sa liste. Posez-lui une question ci-dessous !</p>
            )}
          </div>

          <div className="carte">
            <h2 className="flex items-center gap-2 font-titre text-xl font-semibold"><MessageCircleQuestion size={20} /> Lui poser une question</h2>
            <p className="mt-1 text-sm text-doux">Votre question arrive sans votre nom. Sa réponse s&apos;affiche ici.</p>
            {questionsPosees.length > 0 && (
              <ul className="mt-3 space-y-2">
                {questionsPosees.map((q) => (
                  <li key={q.id} className="rounded-xl bg-creme p-3 text-sm">
                    <p className="font-medium">{q.texte}</p>
                    <p className={q.reponse ? "mt-1 text-sapin" : "mt-1 text-doux italic"}>{q.reponse ? `↳ ${q.reponse}` : "En attente de réponse…"}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <Formulaire action={poserQuestion.bind(null, jeton)} bouton="Envoyer anonymement" vider>
                <textarea name="texte" rows={2} className="champ" maxLength={400} placeholder="Tu préfères le thé ou le café ?" aria-label="Votre question" />
              </Formulaire>
            </div>
          </div>
        </section>
      ) : (
        <section className="carte text-center">
          <Gift size={40} className="mx-auto text-cerise" />
          <p className="mt-2 font-titre text-lg font-semibold">Le tirage n&apos;a pas encore eu lieu</p>
          <p className="text-sm text-doux">Revenez sur ce lien quand l&apos;organisateur l&apos;aura lancé. En attendant, remplissez votre liste !</p>
        </section>
      )}

      {/* Questions reçues */}
      {questionsRecues.length > 0 && (
        <section className="carte">
          <h2 className="font-titre text-xl font-semibold">🤫 Votre Père Noël secret demande…</h2>
          <ul className="mt-3 space-y-3">
            {questionsRecues.map((q) => (
              <li key={q.id} className="rounded-xl bg-creme p-3">
                <p className="font-medium">{q.texte}</p>
                <div className="mt-2">
                  <Formulaire
                    action={repondreQuestion.bind(null, jeton, q.id)}
                    bouton={q.reponse ? "Modifier ma réponse" : "Répondre"}
                    boutonClass="bouton bouton-discret !min-h-9 text-sm"
                    className="space-y-2"
                  >
                    <input name="reponse" className="champ" defaultValue={q.reponse} maxLength={400} aria-label="Votre réponse" />
                  </Formulaire>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ma liste */}
      <section className="carte">
        <h2 className="font-titre text-xl font-semibold">Ma liste d&apos;envies</h2>
        <p className="mt-1 text-sm text-doux">Tout le groupe la voit. Vous ne saurez jamais ce qui a été réservé : surprise garantie.</p>
        {anonyme && mesSouhaits.length === 0 && (
          <p role="alert" className="mt-3 rounded-xl bg-cerise-clair p-3 text-sm font-medium text-cerise">
            Obligatoire en mode mystère : sans liste, votre Père Noël n&apos;a aucune idée de qui vous êtes… ni de ce qui
            vous ferait plaisir !
          </p>
        )}
        {mesSouhaits.length > 0 && (
          <ul className="mt-2 divide-y divide-trait">
            {mesSouhaits.map((s) => (
              <Souhait
                key={s.id}
                s={s}
                pied={
                  <div className="flex items-start gap-2">
                    <details className="flex-1">
                      <summary className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-sapin"><Pencil size={13} /> Modifier</summary>
                      <div className="mt-3">
                        <Formulaire key={`modif-${s.id}`} action={modifierSouhait.bind(null, jeton, s.id)} bouton="Enregistrer">
                          <ChampsSouhait v={s} id={s.id} jeton={jeton} />
                        </Formulaire>
                      </div>
                    </details>
                    <BoutonAction
                      action={supprimerSouhait.bind(null, jeton, s.id)}
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
          <Formulaire key="ajout" action={ajouterSouhait.bind(null, jeton)} bouton="Ajouter à ma liste" vider>
            <ChampsSouhait id="nouveau" jeton={jeton} />
          </Formulaire>
        </div>
      </section>

      {/* Mes coordonnées */}
      <details id="rappels" className="carte">
        <summary className="cursor-pointer font-titre text-xl font-semibold">Mes coordonnées et rappels</summary>
        <OuvrirSiAncre id="rappels" />
        <p className="mt-2 text-sm text-doux">
          Visibles uniquement par l&apos;organisateur. Avec un e-mail, vous recevez votre lien au moment du tirage et un
          rappel une semaine puis la veille de l&apos;échange.
        </p>
        <div className="mt-3">
          <Formulaire key="coordonnees" action={modifierCoordonnees.bind(null, jeton)} bouton="Enregistrer">
            <div>
              <label className="etiquette" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" className="champ" defaultValue={moi.email} maxLength={120} autoComplete="email" />
            </div>
            <div>
              <label className="etiquette" htmlFor="telephone">Téléphone</label>
              <input id="telephone" name="telephone" type="tel" className="champ" defaultValue={moi.telephone} maxLength={30} autoComplete="tel" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="rappelsEmail" defaultChecked={moi.rappelsEmail} className="size-4 accent-[var(--sapin)]" />
              Recevoir les rappels par e-mail
            </label>
          </Formulaire>
        </div>
      </details>

      {/* Les autres listes */}
      {restants.length > 0 && (
        <section className="carte">
          <h2 className="flex items-center gap-2 font-titre text-xl font-semibold"><Users size={20} /> Les listes du groupe</h2>
          <p className="mt-1 text-sm text-doux">Pour un cadeau en plus, ou pour piocher des idées.</p>
          <div className="mt-3 divide-y divide-trait">
            {restants.map((p) => (
              <details key={p.id} className="py-2">
                <summary className="cursor-pointer py-1 font-semibold">
                  {nomVisible(p, anonyme)} <span className="font-normal text-doux">· {p.souhaits.length} idée{p.souhaits.length > 1 ? "s" : ""}</span>
                </summary>
                {p.souhaits.length ? (
                  <ul className="divide-y divide-trait">
                    {p.souhaits.map((s) => (
                      <Souhait key={s.id} s={s} barre={Boolean(s.reserveParId && s.reserveParId !== moi.id)} pied={pied(s)} />
                    ))}
                  </ul>
                ) : (
                  <p className="pb-2 text-sm text-doux">Liste vide pour l&apos;instant.</p>
                )}
              </details>
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-doux">Ce lien est personnel : ne le transférez pas, il dévoilerait votre tirage.</p>
    </main>
  );
}
