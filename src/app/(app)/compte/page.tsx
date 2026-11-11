import { ArrowLeft, Cake, Crown, Gift, LogOut, Plus, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { deconnecter, supprimerCompte } from "@/app/actions-compte";
import { BoutonAction } from "@/components/bouton-action";
import { LiensAppareil } from "@/components/liens-appareil";
import { monEspace } from "@/lib/compte/espace";
import { compteCourant } from "@/lib/compte/session";
import { compteARebours, dateLongue } from "@/lib/format";
import { titreListe } from "@/lib/occasions";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false, follow: false } };

function Ligne({ href, titre, detail, icone }: { href: string; titre: string; detail: string; icone: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-creme">
        <span className="shrink-0 text-cerise" aria-hidden>{icone}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{titre}</span>
          <span className="block truncate text-sm text-doux">{detail}</span>
        </span>
      </Link>
    </li>
  );
}

const quand = (d: Date | null) => (d ? compteARebours(d) ?? dateLongue(d) : null);

export default async function MonEspace() {
  const moi = await compteCourant();
  if (!moi) redirect("/connexion?suite=/compte");
  const e = await monEspace(moi);
  const connus = [...e.participations.map((p) => p.jeton), ...e.organisations.map((o) => o.jetonAdmin), ...e.listes.map((l) => l.jetonProprio)];
  const vide = connus.length + e.reservations.length === 0;

  return (
    <main className="space-y-6 pt-6">
      <header>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-doux"><ArrowLeft size={16} /> Accueil</Link>
        <h1 className="mt-4 font-titre text-3xl font-bold">Mon espace</h1>
        <p className="mt-1 break-all text-doux">{moi.nom ? `${moi.nom} · ` : ""}{moi.email}</p>
      </header>

      <LiensAppareil connus={connus} />

      {vide && (
        <section className="carte space-y-2">
          <p>Rien pour l&apos;instant. Créez un groupe ou une liste : connecté, ils s&apos;ajoutent ici tout seuls.</p>
          <p className="text-sm text-doux">Vous avez déjà un lien ? Ouvrez-le et touchez « Ajouter à mon compte ».</p>
        </section>
      )}

      {(e.participations.length > 0 || e.organisations.length > 0) && (
        <section className="carte">
          <h2 className="font-titre text-xl font-semibold">Mes Secret Santa</h2>
          <ul className="mt-2 divide-y divide-trait">
            {e.participations.map((p) => (
              <Ligne
                key={p.jeton}
                href={`/p/${p.jeton}`}
                icone={<Gift size={20} />}
                titre={p.groupe.nom}
                detail={[`Espace de ${p.prenom}`, p.tire ? "tirage fait" : "en attente du tirage", quand(p.groupe.dateEchange)].filter(Boolean).join(" · ")}
              />
            ))}
            {e.organisations.map((o) => (
              <Ligne
                key={o.jetonAdmin}
                href={`/g/${o.jetonAdmin}`}
                icone={<Crown size={20} />}
                titre={o.nom}
                detail={["Organisation", `${o._count.participants} participant${o._count.participants > 1 ? "s" : ""}`, o.tirageLe ? "tirage fait" : null].filter(Boolean).join(" · ")}
              />
            ))}
          </ul>
        </section>
      )}

      {e.listes.length > 0 && (
        <section className="carte">
          <h2 className="font-titre text-xl font-semibold">Mes listes</h2>
          <ul className="mt-2 divide-y divide-trait">
            {e.listes.map((l) => (
              <Ligne
                key={l.jetonProprio}
                href={`/ma-liste/${l.jetonProprio}`}
                icone={<Cake size={20} />}
                titre={titreListe(l)}
                detail={[`${l._count.idees} idée${l._count.idees > 1 ? "s" : ""}`, quand(l.date)].filter(Boolean).join(" · ")}
              />
            ))}
          </ul>
        </section>
      )}

      {e.reservations.length > 0 && (
        <section className="carte">
          <h2 className="font-titre text-xl font-semibold">Mes réservations</h2>
          <ul className="mt-2 divide-y divide-trait">
            {e.reservations.map((r) => (
              <Ligne
                key={r.id}
                href={`/liste/${r.liste.jetonPartage}`}
                icone={<ShoppingBag size={20} />}
                titre={r.titre}
                detail={[titreListe(r.liste), quand(r.liste.date)].filter(Boolean).join(" · ")}
              />
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/nouveau" className="bouton bouton-cerise"><Plus size={16} aria-hidden /> Organiser un tirage</Link>
        <Link href="/liste/nouvelle" className="bouton bouton-discret"><Plus size={16} aria-hidden /> Créer une liste</Link>
      </div>

      <section className="space-y-3 border-t border-trait pt-6 text-sm">
        <form action={deconnecter}>
          <button type="submit" className="inline-flex items-center gap-2 font-medium underline"><LogOut size={16} aria-hidden /> Me déconnecter</button>
        </form>
        <BoutonAction
          action={supprimerCompte}
          className="text-doux underline"
          confirmation="Supprimer votre compte ? Vos groupes et vos listes restent accessibles par leurs liens ; seul le regroupement dans « Mon espace » disparaît."
        >
          Supprimer mon compte
        </BoutonAction>
      </section>
    </main>
  );
}
