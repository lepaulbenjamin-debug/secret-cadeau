import { CalendarDays, Crown, Eye, EyeOff, Link2, Mail, MessageSquare, Pencil, Shuffle, Trash2, UserMinus, Wallet, X } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ajouterParticipants,
  annulerTirage,
  basculerExclusion,
  desisterApresTirage,
  echangerTirage,
  lancerTirage,
  modifierGroupe,
  modifierParticipant,
  regenererInvitation,
  retirerParticipant,
} from "@/app/actions";
import { AjoutExclusion } from "@/components/ajout-exclusion";
import { BoutonAction } from "@/components/bouton-action";
import { ChampsParticipant } from "@/components/champs-participant";
import { CopierLien } from "@/components/copier-lien";
import { EchangeTirages } from "@/components/echange-tirages";
import { OuvrirSiAncre } from "@/components/ouvrir-si-ancre";
import { Formulaire } from "@/components/formulaire";
import { Partager } from "@/components/partager";
import { RattacherCompte } from "@/components/rattacher-compte";
import { SeSouvenir } from "@/components/se-souvenir";
import { SupprimerGroupe } from "@/components/supprimer-groupe";
import { compteARebours, dateLongue } from "@/lib/format";
import { assurerNomsDeCode } from "@/lib/acces";
import { nouveauJeton } from "@/lib/jeton";
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
        select: { id: true, prenom: true, nomDeCode: true, jeton: true, email: true, telephone: true, ouvertLe: true, _count: { select: { souhaits: true } } },
      },
      exclusions: { include: { a: { select: { prenom: true } }, b: { select: { prenom: true } } } },
    },
  });
  if (!groupe) notFound();
  if (groupe.participants.some((p) => !p.nomDeCode)) {
    await assurerNomsDeCode(groupe.id);
    redirect(`/g/${jeton}`);
  }

  // Les groupes créés avant le lien d'invitation en reçoivent un à la première visite.
  const jetonInvitation =
    groupe.jetonInvitation ??
    (await prisma.groupe.update({ where: { id: groupe.id }, data: { jetonInvitation: nouveauJeton() } })).jetonInvitation!;

  // L'adresse complète, pour les SMS et e-mails préremplis (qui n'acceptent pas de lien relatif).
  const h = await headers();
  const origine = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const messagePerso = (prenom: string) =>
    `🎁 ${prenom}, voici ton lien pour le tirage « ${groupe.nom} » sur Qui Offre. Il est personnel, ne le transfère pas !`;

  const tire = Boolean(groupe.tirageLe);
  const anonyme = groupe.nomsDeCode;
  const listesVides = groupe.participants.filter((p) => p._count.souhaits === 0).map((p) => p.prenom);
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

      <RattacherCompte sorte="admin" jeton={jeton} compteId={groupe.compteOrganisateurId} email={groupe.emailOrganisateur} chemin={`/g/${jeton}`} />

      {nouveau && (
        <div className="carte border-or/50 bg-[color-mix(in_oklab,var(--or)_10%,var(--carte))]">
          <p className="font-semibold">🎉 Le groupe est créé !</p>
          <p className="mt-1 text-sm">
            Cette page est <strong>votre lien d&apos;organisateur</strong>. Il est gardé sur cet appareil ; copiez-le aussi
            quelque part pour pouvoir y revenir d&apos;un autre téléphone.
          </p>
          {groupe.emailOrganisateur && (
            <p className="mt-2 text-sm">
              📩 Il vient aussi de vous être envoyé à <strong>{groupe.emailOrganisateur}</strong>.
            </p>
          )}
          <div className="mt-3"><CopierLien chemin={`/g/${jeton}`} libelle="Copier mon lien d'organisateur" /></div>
        </div>
      )}

      {/* Le lien d'invitation */}
      {!tire && (
        <section className="carte">
          <h2 className="flex items-center gap-2 font-titre text-xl font-semibold"><Link2 size={20} /> Lien d&apos;invitation</h2>
          <p className="mt-1 text-sm text-doux">
            Un seul lien pour tout le groupe : chacun s&apos;inscrit avec son prénom et ses coordonnées. Envoyez-le dans la
            conversation de famille.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Partager
              chemin={`/rejoindre/${jetonInvitation}`}
              texte={`🎁 Tirage au sort « ${groupe.nom} » : inscris-toi ici pour participer !`}
              libelle="Partager l'invitation"
            />
            <CopierLien chemin={`/rejoindre/${jetonInvitation}`} />
          </div>
          <div className="mt-3">
            <BoutonAction
              action={regenererInvitation.bind(null, jeton)}
              confirmation="Créer un nouveau lien d'invitation ? L'ancien ne marchera plus (les inscrits restent inscrits)."
              className="text-sm text-doux underline"
            >
              Le lien a trop circulé ? En créer un nouveau
            </BoutonAction>
          </div>
        </section>
      )}

      {/* Le tirage */}
      <section className="carte">
        {tire ? (
          <>
            <h2 className="flex items-center gap-2 font-titre text-xl font-semibold text-sapin"><Shuffle size={20} /> Le tirage est fait</h2>
            <p className="mt-1 text-sm text-doux">
              Envoyez à chacun son lien : il y découvrira à qui il offre. {ouverts}/{groupe.participants.length} l&apos;ont déjà ouvert.
            </p>
            <p className="mt-2 text-sm text-doux">
              Quelqu&apos;un se désiste ? Touchez <UserMinus size={14} className="inline align-[-2px]" aria-label="se désiste" /> à côté
              de son prénom : le tirage s&apos;ajuste pour une ou deux personnes seulement, sans tout refaire.
            </p>
            <details className="mt-4 rounded-xl bg-creme p-3">
              <summary className="cursor-pointer text-sm font-semibold text-sapin">Échanger les tirages de deux personnes</summary>
              <p className="mt-2 mb-3 text-sm text-doux">
                Chacune offrira à la personne que l&apos;autre avait tirée. Vous ne verrez toujours pas qui offre à qui.
              </p>
              <EchangeTirages
                participants={groupe.participants.map(({ id, prenom }) => ({ id, prenom }))}
                action={echangerTirage.bind(null, jeton)}
              />
            </details>
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
            {anonyme && (
              <p className="mb-4 rounded-xl bg-creme p-3 text-sm">
                🕵️ <strong>Mode mystère</strong> : chacun offrira à un nom de code sans savoir qui c&apos;est. Les listes sont
                donc obligatoires.
                {listesVides.length > 0 ? (
                  <span className="mt-1 block font-medium text-cerise">Liste vide : {listesVides.join(", ")}.</span>
                ) : (
                  <span className="mt-1 block font-medium text-sapin">Toutes les listes sont remplies ✓</span>
                )}
              </p>
            )}
            <Formulaire action={lancerTirage.bind(null, jeton)} bouton="Lancer le tirage au sort" boutonClass="bouton bouton-cerise w-full">
              {anonyme && listesVides.length > 0 ? (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="forcer" className="size-4 accent-[var(--cerise)]" />
                  Lancer quand même, malgré les listes vides
                </label>
              ) : null}
            </Formulaire>
          </>
        )}
      </section>

      {/* Les participants */}
      <section className="carte">
        <h2 className="font-titre text-xl font-semibold">Participants · {groupe.participants.length}</h2>
        <p className="mt-1 text-sm text-doux">
          Chacun a son lien personnel. Ceux qui se sont inscrits avec le lien d&apos;invitation l&apos;ont déjà ; envoyez-le aux autres.
        </p>
        <ul className="mt-4 divide-y divide-trait">
          {groupe.participants.map((p) => (
            <li key={p.id} className="py-3">
              <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {p.prenom}
                  {anonyme && <span className="ml-1.5 text-sm font-normal text-doux">alias {p.nomDeCode}</span>}
                </p>
                <p className="flex items-center gap-1 text-xs text-doux">
                  {p.ouvertLe ? <><Eye size={13} /> a ouvert son lien</> : <><EyeOff size={13} /> pas encore ouvert</>}
                  {" · "}{p._count.souhaits} idée{p._count.souhaits > 1 ? "s" : ""}
                </p>
                {(p.telephone || p.email) && (
                  <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs">
                    {p.telephone && (
                      <a
                        className="inline-flex items-center gap-1 text-sapin underline"
                        href={`sms:${p.telephone}?&body=${encodeURIComponent(`${messagePerso(p.prenom)}\n${origine}/p/${p.jeton}`)}`}
                      >
                        <MessageSquare size={12} /> {p.telephone}
                      </a>
                    )}
                    {p.email && (
                      <a
                        className="inline-flex items-center gap-1 text-sapin underline"
                        href={`mailto:${p.email}?subject=${encodeURIComponent(`Ton lien pour « ${groupe.nom} »`)}&body=${encodeURIComponent(`${messagePerso(p.prenom)}\n\n${origine}/p/${p.jeton}`)}`}
                      >
                        <Mail size={12} /> {p.email}
                      </a>
                    )}
                  </p>
                )}
              </div>
              <Partager chemin={`/p/${p.jeton}`} texte={messagePerso(p.prenom)} compact />
              {tire && (
                <BoutonAction
                  action={desisterApresTirage.bind(null, jeton, p.id)}
                  confirmation={`${p.prenom} se désiste ? Sa liste est effacée, et le tirage est ajusté pour une ou deux personnes seulement (prévenues dans leur espace et par e-mail). Les autres gardent leur tirage.`}
                  className="grid size-9 place-items-center rounded-full text-doux hover:bg-cerise-clair hover:text-cerise"
                  titre={`${p.prenom} se désiste`}
                >
                  <UserMinus size={16} />
                </BoutonAction>
              )}
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
              </div>
              <details className="mt-1">
                <summary className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-sapin">
                  <Pencil size={12} aria-hidden /> Prénom et coordonnées
                </summary>
                <div className="mt-2 rounded-xl bg-creme p-3">
                  <Formulaire
                    key={`participant-${p.id}`}
                    action={modifierParticipant.bind(null, jeton, p.id)}
                    bouton="Enregistrer"
                    boutonClass="bouton bouton-discret !min-h-9 w-full text-sm"
                    className="space-y-2"
                  >
                    <ChampsParticipant id={p.id} v={p} />
                  </Formulaire>
                </div>
              </details>
            </li>
          ))}
        </ul>
        {!tire && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold text-sapin">+ Ajouter un participant</summary>
            <div className="mt-3 rounded-xl bg-creme p-3">
              <Formulaire key="ajout-un" action={ajouterParticipants.bind(null, jeton)} bouton="Ajouter" vider className="space-y-2">
                <ChampsParticipant id="nouveau" />
                <p className="text-xs text-doux">
                  Avec un e-mail, la personne recevra son lien au moment du tirage, puis les rappels. Visible de vous seul.
                </p>
              </Formulaire>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-doux">Ajouter plusieurs prénoms d&apos;un coup</summary>
              <div className="mt-2">
                <Formulaire key="ajout-plusieurs" action={ajouterParticipants.bind(null, jeton)} bouton="Ajouter" vider className="space-y-2">
                  <textarea name="prenoms" rows={3} className="champ" placeholder="Un prénom par ligne" aria-label="Prénoms à ajouter" />
                </Formulaire>
              </div>
            </details>
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
      <details id="reglages" className="carte">
        <summary className="cursor-pointer font-titre text-xl font-semibold">Modifier le groupe</summary>
        <OuvrirSiAncre id="reglages" />
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
              <label className="etiquette" htmlFor="emailOrganisateur">Votre e-mail d&apos;organisateur</label>
              <input
                id="emailOrganisateur"
                name="emailOrganisateur"
                type="email"
                className="champ"
                defaultValue={groupe.emailOrganisateur}
                maxLength={120}
                autoComplete="email"
              />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" name="rappelsOrganisateur" defaultChecked={groupe.rappelsOrganisateur} className="size-4 accent-[var(--sapin)]" />
                Me relancer si le tirage n&apos;est pas fait une semaine avant l&apos;échange
              </label>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="nomsDeCode" defaultChecked={groupe.nomsDeCode} className="mt-0.5 size-4 accent-[var(--sapin)]" />
              <span>
                <strong>Mode mystère</strong> : les participants ne voient que des noms de code marrants, même pour la
                personne qu&apos;ils ont tirée. Listes obligatoires.
              </span>
            </label>
            <div>
              <label className="etiquette" htmlFor="message">Mot pour le groupe</label>
              <textarea id="message" name="message" rows={2} className="champ" defaultValue={groupe.message} maxLength={500} />
            </div>
          </Formulaire>
        </div>
      </details>

      <details className="carte border-cerise/30">
        <summary className="cursor-pointer font-titre text-xl font-semibold text-cerise">Supprimer le groupe</summary>
        <div className="mt-4">
          <SupprimerGroupe jetonAdmin={jeton} nom={groupe.nom} />
        </div>
      </details>

      <p className="text-center text-xs text-doux">
        Gardez ce lien pour vous : il permet de gérer le groupe. <CopierLien chemin={`/g/${jeton}`} libelle="Copier" />
      </p>
    </main>
  );
}
