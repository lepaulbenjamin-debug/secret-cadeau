import type { Metadata } from "next";
import Link from "next/link";

import { AppelAction, Article } from "@/components/site/article";
import { Faq } from "@/components/site/faq";
import { guide } from "@/lib/guides";

const page = guide("/faq");

export const metadata: Metadata = {
  title: page.titre,
  description: page.description,
  alternates: { canonical: page.chemin },
  openGraph: { title: page.titre, description: page.description, url: page.chemin, type: "article" },
};

const QUESTIONS = [
  {
    q: "Qu'est-ce que Qui Offre ?",
    r: "Qui Offre est une application web gratuite pour organiser un Secret Santa (Père Noël secret) : on crée un groupe, on fait le tirage au sort, et chacun partage une liste d'envies. Elle fonctionne dans le navigateur, sur téléphone comme sur ordinateur.",
  },
  {
    q: "Qui Offre est-il gratuit ?",
    r: "Oui, Qui Offre est gratuit pour l'organisateur comme pour les participants.",
  },
  {
    q: "Faut-il créer un compte ?",
    r: "Non. L'organisateur crée un groupe en deux minutes en indiquant un nom, une date d'échange, un budget et un message. Chaque participant accède au groupe par un lien, sans compte ni mot de passe.",
  },
  {
    q: "Comment les participants rejoignent-ils le groupe ?",
    r: "De deux façons. Soit l'organisateur saisit les prénoms et chacun reçoit un lien personnel et privé, que l'organisateur lui transmet. Soit l'organisateur partage un seul lien d'invitation, et chacun s'inscrit avec son prénom, plus un e-mail ou un téléphone facultatifs, visibles uniquement par l'organisateur.",
  },
  {
    q: "L'organisateur peut-il voir qui offre à qui ?",
    r: "Non. La page de l'organisateur montre qui a ouvert son lien et combien d'idées chacun a notées, mais jamais qui offre à qui. Il peut donc participer au tirage. En toute transparence : si c'est lui qui transmet les liens personnels, il pourrait en ouvrir un qui n'est pas le sien. Pour éviter tout soupçon, utilisez le lien d'invitation, où chacun s'inscrit lui-même.",
  },
  {
    q: "Comment fonctionne le tirage au sort ?",
    r: "Le tirage associe chaque participant à une autre personne du groupe, au hasard. Personne ne se tire soi-même et les exclusions sont respectées. Il faut au moins trois participants. Chacun découvre ensuite sa personne en touchant un paquet cadeau sur sa page ; le paquet se referme à chaque visite.",
  },
  {
    q: "Comment empêcher deux personnes de se tirer, par exemple un couple ?",
    r: "Ajoutez une exclusion entre ces deux personnes avant le tirage. Elles ne pourront pas se tirer l'une l'autre. Si trop d'exclusions rendent le tirage impossible, Qui Offre vous le signale.",
  },
  {
    q: "Peut-on refaire le tirage ?",
    r: "Oui. L'organisateur peut annuler le tirage, ajouter ou retirer un participant, modifier les exclusions, puis relancer. Chacun découvre alors sa nouvelle personne sur son lien. Prévenez le groupe avant, pour que personne n'achète un cadeau pour la mauvaise personne.",
  },
  {
    q: "Qu'est-ce que le mode mystère ?",
    r: "C'est une option du groupe. Chaque participant reçoit un nom de code amusant tiré au hasard, comme « Pingouin Farceur 🐧 ». Les participants ne voient que les noms de code, même pour la personne qu'ils ont tirée : on choisit le cadeau d'après sa liste d'envies et on écrit le nom de code sur le paquet. Dans ce mode, les listes d'envies sont obligatoires avant le tirage, sauf si l'organisateur décide de passer outre.",
  },
  {
    q: "Comment fonctionnent les questions anonymes ?",
    r: "Après le tirage, vous pouvez poser une question à la personne que vous avez tirée, par exemple sa pointure. Elle la voit sans savoir qui la pose et y répond ; la réponse s'affiche pour vous.",
  },
  {
    q: "Comment fonctionnent les listes d'envies ?",
    r: "Chaque participant note ses idées avec un titre et, s'il le souhaite, un lien, une image, un prix et une note. Les listes sont visibles par tout le groupe. Coller un lien remplit automatiquement le titre, l'image et le prix quand la boutique publie ces informations ; pour Amazon, seul le titre est repris du lien.",
  },
  {
    q: "La personne qui fait la liste voit-elle ce qui a été réservé ?",
    r: "Non. Le bouton « Je m'en occupe » permet de réserver une idée pour éviter les doublons : les autres membres voient qu'elle est prise, mais la personne à qui appartient la liste ne voit jamais ce qui a été réservé.",
  },
  {
    q: "Qui Offre envoie-t-il des rappels ?",
    r: "Oui, par e-mail, aux participants qui ont donné leur adresse : quand le tirage est fait, une semaine avant l'échange et la veille. Ces e-mails ne nomment jamais la personne que vous avez tirée, et un lien permet de se désabonner en un clic.",
  },
  {
    q: "Qui Offre fonctionne-t-il sur téléphone ?",
    r: "Oui, sur téléphone comme sur ordinateur, directement dans le navigateur. Vous pouvez aussi l'installer sur votre écran d'accueil depuis le navigateur avec « Ajouter à l'écran d'accueil ». Il n'y a rien à télécharger depuis un magasin d'applications.",
  },
  {
    q: "Quelles données sont conservées ?",
    r: "Uniquement ce qu'il faut pour faire fonctionner le groupe : son nom, sa date, son budget et son message ; les prénoms (et noms de code en mode mystère) ; l'e-mail ou le téléphone facultatifs, visibles par l'organisateur seul ; le résultat du tirage, visible par chacun pour lui seul ; les listes d'envies, réservations et questions anonymes. Le site n'utilise aucun cookie de mesure d'audience ni de publicité. Le détail figure dans la politique de confidentialité.",
  },
  {
    q: "Comment supprimer mes données ?",
    r: "Demandez à l'organisateur de votre groupe de vous retirer : vos données et votre liste sont alors effacées. Vous pouvez aussi demander la suppression d'un groupe ou de vos données en nous écrivant à l'adresse indiquée dans la politique de confidentialité et les mentions légales.",
  },
  {
    q: "Pourquoi certains liens Amazon contiennent-ils un identifiant partenaire ?",
    r: "Les liens Amazon ajoutés aux listes peuvent porter notre identifiant Partenaire Amazon. Si un achat est fait via ce lien, Qui Offre peut toucher une petite commission, ce qui aide à garder le service gratuit. Cela ne coûte rien de plus à l'acheteur.",
  },
];

export default function Page() {
  return (
    <Article
      page={page}
      resume={
        <p>
          Qui Offre est une application web gratuite et sans compte pour organiser un Secret Santa : tirage au sort avec
          exclusions, listes d&apos;envies partagées, réservations invisibles et rappels par e-mail. L&apos;organisateur
          ne voit jamais qui offre à qui, et l&apos;application fonctionne sur téléphone comme sur ordinateur.
        </p>
      }
    >
      <p>
        Vous trouverez ci-dessous les réponses aux questions les plus fréquentes sur le fonctionnement de Qui Offre :
        tirage, confidentialité, mode mystère, listes d&apos;envies et rappels. Pour découvrir le principe du jeu,
        commencez par notre <Link href="/secret-santa">guide du Secret Santa</Link> ou notre guide du{" "}
        <Link href="/tirage-au-sort-noel">tirage au sort de Noël en ligne</Link>.
      </p>

      <Faq titre="Toutes les questions" questions={QUESTIONS} />

      <h2>Une autre question ?</h2>
      <p>
        Pour toute question sur vos données ou pour nous contacter, consultez la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link> et les{" "}
        <Link href="/mentions-legales">mentions légales</Link>. Pour bien remplir votre liste, lisez notre guide pour{" "}
        <Link href="/liste-de-cadeaux">créer une liste de cadeaux</Link>.
      </p>

      <AppelAction />
    </Article>
  );
}
