import {
  Bell,
  Cake,
  EyeOff,
  Gift,
  Link2,
  ListChecks,
  MessageCircleQuestion,
  ShieldCheck,
  Shuffle,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { MesGroupes } from "@/components/mes-groupes";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { GUIDES } from "@/lib/guides";
import { NOM_SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Qui Offre — Secret Santa en ligne gratuit : tirage au sort et listes de cadeaux" },
  description:
    "Organisez votre Secret Santa en 2 minutes : tirage au sort en ligne avec exclusions, listes de cadeaux partagées et rappels. Gratuit, sans compte.",
  alternates: { canonical: "/" },
};

const ETAPES = [
  { titre: "Créez le groupe", texte: "Un nom, une date, un budget. Ajoutez les prénoms, ou partagez un lien d'invitation pour que chacun s'inscrive." },
  { titre: "Lancez le tirage", texte: "Personne ne se tire soi-même et les couples peuvent s'exclure. Même l'organisateur ne voit pas les résultats." },
  { titre: "Chacun découvre sa personne", texte: "Sur son lien personnel, avec la liste d'envies de la personne tirée et des rappels avant l'échange." },
];

const FONCTIONS = [
  { icone: Shuffle, titre: "Tirage au sort juste", texte: "Personne ne se tire soi-même, et les exclusions (couples, frères et sœurs…) sont respectées dans les deux sens." },
  { icone: EyeOff, titre: "Vraiment secret", texte: "L'organisateur participe comme les autres : sa page ne montre jamais qui offre à qui." },
  { icone: Link2, titre: "Un lien d'invitation", texte: "Postez un seul lien dans la conversation de famille : chacun s'inscrit avec son prénom." },
  { icone: ListChecks, titre: "Listes d'envies", texte: "Collez un lien de boutique, le titre, l'image et le prix se remplissent. « Je m'en occupe » évite les doublons." },
  { icone: MessageCircleQuestion, titre: "Questions anonymes", texte: "« Tu chausses du combien ? » : demandez sans vous trahir, la réponse s'affiche chez vous." },
  { icone: Bell, titre: "Rappels par e-mail", texte: "Le lien au moment du tirage, puis un rappel une semaine avant et la veille de l'échange." },
  { icone: Smartphone, titre: "Sur téléphone", texte: "S'installe sur l'écran d'accueil depuis le navigateur, sans passer par un store." },
  { icone: Cake, titre: "Listes d'anniversaire", texte: "Hors Secret Santa aussi : une liste à partager pour un anniversaire, une naissance, un mariage." },
  { icone: ShieldCheck, titre: "Gratuit, sans compte", texte: "Pas d'inscription, pas de mot de passe, pas de publicité. Chacun garde simplement son lien." },
];

const QUESTIONS = [
  {
    q: "Comment faire un Secret Santa en ligne ?",
    r: "Créez un groupe sur Qui Offre avec la date et le budget, ajoutez les participants ou partagez le lien d'invitation, puis lancez le tirage. Chaque participant découvre sur son lien personnel à qui il offre, avec la liste d'envies de cette personne.",
  },
  {
    q: "Qui Offre est-il gratuit ?",
    r: "Oui. Créer un groupe, faire le tirage, partager les listes et recevoir les rappels est gratuit, sans compte ni publicité.",
  },
  {
    q: "L'organisateur peut-il voir le résultat du tirage ?",
    r: "Non. La page de l'organisateur montre qui a ouvert son lien et combien d'idées chacun a notées, mais jamais qui offre à qui. L'organisateur peut donc participer au tirage comme les autres.",
  },
  {
    q: "Peut-on empêcher deux personnes de se tirer ?",
    r: "Oui, avec les exclusions : un couple, par exemple, ne se tirera pas l'un l'autre. Si les exclusions rendent le tirage impossible, Qui Offre le signale au lieu de tricher.",
  },
  {
    q: "Qu'est-ce que le mode mystère ?",
    r: "Une option où chacun reçoit un nom de code marrant, comme « Pingouin Farceur ». On offre à un nom de code sans savoir qui se cache derrière, en choisissant uniquement d'après sa liste d'envies, et on écrit ce nom sur le paquet.",
  },
  {
    q: "Combien faut-il de participants ?",
    r: "Au moins trois, pour que le secret tienne. Il n'y a pas de minimum à la création : vous pouvez créer le groupe seul et inviter les autres ensuite.",
  },
];

export default function Accueil() {
  return (
    <main>
      <JsonLd
        donnees={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", name: NOM_SITE, url: SITE_URL, inLanguage: "fr-FR" },
            { "@type": "Organization", name: NOM_SITE, url: SITE_URL, logo: `${SITE_URL}/icone-512.png` },
            {
              "@type": "WebApplication",
              name: NOM_SITE,
              url: SITE_URL,
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web, iOS, Android",
              inLanguage: "fr-FR",
              description:
                "Application gratuite pour organiser un Secret Santa : tirage au sort en ligne avec exclusions, listes de cadeaux partagées, réservations sans doublon, questions anonymes et rappels par e-mail.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
              featureList: FONCTIONS.map((f) => f.titre),
            },
          ],
        }}
      />

      {/* Accroche */}
      <section className="mx-auto max-w-5xl px-4 pt-10 sm:pt-16">
        <div className="grid items-center gap-10 sm:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-cerise-clair px-3 py-1 text-sm font-semibold text-cerise">
              <Sparkles size={14} aria-hidden /> Gratuit · sans compte
            </p>
            <h1 className="mt-4 font-titre text-4xl leading-tight font-bold sm:text-5xl">
              Le Secret Santa en ligne, sans prise de tête.
            </h1>
            <p className="mt-4 text-lg text-doux">
              Qui Offre organise votre Père Noël secret : tirage au sort avec exclusions, listes de cadeaux partagées,
              réservations sans doublon et rappels avant l&apos;échange. En famille, entre amis ou au bureau.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/nouveau" className="bouton bouton-cerise text-lg">Organiser un tirage au sort</Link>
              <Link href="/secret-santa" className="bouton bouton-discret">Comment ça marche ?</Link>
            </div>
            <p className="mt-2 text-sm text-doux">Vous avez reçu un lien ? Ouvrez-le simplement.</p>
          </div>
          <div aria-hidden className="carte mx-auto w-full max-w-sm rotate-1 !p-0 overflow-hidden shadow-sm">
            <div className="bg-sapin p-6 text-center text-carte">
              <p className="text-xs tracking-widest uppercase opacity-80">Vous offrez à</p>
              <p className="mt-1 font-titre text-3xl font-bold">Mamie Jo</p>
            </div>
            <ul className="divide-y divide-trait px-5 py-2 text-sm">
              <li className="flex justify-between py-2.5"><span>Un plaid tout doux</span><span className="text-doux">35 €</span></li>
              <li className="flex justify-between py-2.5"><span>Un puzzle 1000 pièces</span><span className="text-doux">20 €</span></li>
              <li className="flex justify-between py-2.5"><span className="text-doux line-through">Un livre de recettes</span><span className="text-doux">réservé</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-xl"><MesGroupes /></div>
      </section>

      {/* Étapes */}
      <section className="mx-auto max-w-5xl px-4 pt-16" aria-labelledby="etapes">
        <h2 id="etapes" className="font-titre text-3xl font-bold">Comment organiser un Secret Santa en 3 étapes</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {ETAPES.map((e, i) => (
            <li key={e.titre} className="carte">
              <span className="grid size-9 place-items-center rounded-full bg-sapin font-titre font-bold text-carte">{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{e.titre}</h3>
              <p className="mt-1 text-doux">{e.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Fonctions */}
      <section className="mx-auto max-w-5xl px-4 pt-16" aria-labelledby="fonctions">
        <h2 id="fonctions" className="font-titre text-3xl font-bold">Tout ce qu&apos;il faut, rien de plus</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {FONCTIONS.map(({ icone: Icone, titre, texte }) => (
            <li key={titre} className="carte flex gap-3">
              <Icone className="mt-0.5 shrink-0 text-sapin" size={22} aria-hidden />
              <div>
                <h3 className="font-semibold">{titre}</h3>
                <p className="text-sm text-doux">{texte}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Mode mystère */}
      <section className="mx-auto max-w-5xl px-4 pt-16">
        <div className="rounded-3xl bg-sapin p-8 text-carte sm:p-10">
          <p className="text-sm font-semibold tracking-widest uppercase opacity-80">🕵️ Mode mystère</p>
          <h2 className="mt-2 font-titre text-3xl font-bold">Offrir à « Pingouin Farceur 🐧 », sans savoir qui c&apos;est</h2>
          <p className="mt-3 max-w-2xl opacity-90">
            Chacun reçoit un nom de code marrant. Vous choisissez le cadeau uniquement d&apos;après la liste d&apos;envies, vous
            écrivez le nom de code sur le paquet, et le jour J chacun récupère le sien. Idéal au bureau, ou pour pimenter
            le Noël en famille.
          </p>
          <Link href="/nouveau" className="bouton bouton-cerise mt-5">Essayer le mode mystère</Link>
        </div>
      </section>

      {/* Listes d'anniversaire */}
      <section className="mx-auto max-w-5xl px-4 pt-16" aria-labelledby="anniversaires">
        <div className="grid items-center gap-6 rounded-3xl border border-trait bg-carte p-8 sm:grid-cols-[1.4fr_1fr] sm:p-10">
          <div>
            <p className="text-sm font-semibold tracking-widest text-cerise uppercase">🎂 Toute l&apos;année</p>
            <h2 id="anniversaires" className="mt-2 font-titre text-3xl font-bold">Une liste de cadeaux pour votre anniversaire</h2>
            <p className="mt-3 text-doux">
              Pas de tirage cette fois : vous notez vos envies, vous partagez le lien, vos proches réservent « Je m&apos;en
              occupe ». Plus de doublons, et vous ne voyez jamais ce qui a été réservé. Pour un anniversaire, une naissance,
              un mariage…
            </p>
            <Link href="/liste/nouvelle" className="bouton bouton-cerise mt-5">Créer ma liste de cadeaux</Link>
          </div>
          <ul aria-hidden className="space-y-2 text-sm">
            <li className="carte flex justify-between !py-3"><span>🎧 Un casque sans fil</span><span className="text-doux">60 €</span></li>
            <li className="carte flex justify-between !py-3"><span>📚 Le tome 3 de ma saga</span><span className="text-doux">18 €</span></li>
            <li className="carte flex justify-between !py-3 text-doux"><span className="line-through">🪴 Une plante</span><span>réservé par Tom</span></li>
          </ul>
        </div>
      </section>

      {/* Guides */}
      <section className="mx-auto max-w-5xl px-4 pt-16" aria-labelledby="guides">
        <h2 id="guides" className="font-titre text-3xl font-bold">Guides et idées</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {GUIDES.filter((g) => g.chemin !== "/faq").map((g) => (
            <li key={g.chemin}>
              <Link href={g.chemin} className="carte block h-full hover:border-sapin">
                <span className="flex items-center gap-2 font-semibold"><Gift size={16} className="text-cerise" aria-hidden /> {g.titre}</span>
                <span className="mt-1 block text-sm text-doux">{g.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="prose-qo mx-auto max-w-3xl px-4 pt-6">
        <Faq questions={QUESTIONS} />
        <p className="mt-4 text-sm">
          D&apos;autres questions ? Consultez la <Link href="/faq">FAQ complète</Link>.
        </p>
      </section>
    </main>
  );
}
