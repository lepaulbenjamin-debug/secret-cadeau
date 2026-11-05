import type { Metadata } from "next";
import Link from "next/link";

import { AppelAction, Article } from "@/components/site/article";
import { Faq } from "@/components/site/faq";
import { guide } from "@/lib/guides";

const page = guide("/secret-santa-entre-collegues");

export const metadata: Metadata = {
  title: page.titre,
  description: page.description,
  alternates: { canonical: page.chemin },
  openGraph: { title: page.titre, description: page.description, url: page.chemin, type: "article" },
};

export default function Page() {
  return (
    <Article
      page={page}
      resume={
        <p>
          Un Secret Santa entre collègues est un échange de cadeaux au travail : chaque participant tire au sort un
          collègue et lui offre un petit cadeau anonyme, souvent pour 10 à 20 €. Pour qu&apos;il soit réussi, il doit
          rester facultatif, avoir un budget modeste annoncé à l&apos;avance et fonctionner aussi pour les collègues en
          télétravail.
        </p>
      }
    >
      <h2>Pourquoi organiser un Secret Santa au bureau ?</h2>
      <p>
        Au bureau, impossible d&apos;offrir un cadeau à chacun. Le Secret Santa permet à toute l&apos;équipe de
        participer à un moment festif pour le prix d&apos;un seul petit cadeau. Il crée aussi des liens inattendus :
        le stagiaire de la compta se retrouve à chercher une idée pour la directrice commerciale, et c&apos;est souvent
        là que naissent les meilleures conversations de décembre.
      </p>

      <h2>Comment organiser un Secret Santa entre collègues ?</h2>
      <ol>
        <li>
          <strong>Proposez, n&apos;imposez pas.</strong> Envoyez une invitation claire, avec la date et le budget, et
          laissez chacun s&apos;inscrire. Un lien d&apos;invitation unique est idéal : chaque collègue s&apos;inscrit
          avec son prénom, en quelques secondes, sans créer de compte.
        </li>
        <li>
          <strong>Fixez une date de clôture des inscriptions</strong>, puis lancez le tirage. Comptez trois semaines
          minimum avant l&apos;échange.
        </li>
        <li>
          <strong>Demandez à chacun quelques idées.</strong> Au travail, on connaît mal les goûts des autres : une
          courte liste d&apos;envies évite les cadeaux à côté de la plaque.
        </li>
        <li>
          <strong>Prévoyez le jour J.</strong> Pot de fin d&apos;année, pause café prolongée ou visio : choisissez un
          moment où le plus de monde est présent.
        </li>
      </ol>
      <p>
        Bonne nouvelle pour l&apos;organisateur : avec Qui Offre, il peut participer comme les autres. Sa page montre
        qui a ouvert son lien et combien d&apos;idées chacun a notées, mais jamais qui offre à qui.
      </p>

      <h2>Quel budget pour un Secret Santa entre collègues ?</h2>
      <p>
        Entre collègues, le budget le plus courant se situe entre <strong>10 et 20 €</strong>. C&apos;est assez pour
        faire plaisir et assez peu pour que personne ne se sente obligé. Quelques conseils :
      </p>
      <ul>
        <li>Annoncez le budget dans l&apos;invitation, pas après le tirage.</li>
        <li>Précisez s&apos;il inclut les frais de port, important pour les équipes à distance.</li>
        <li>Rappelez qu&apos;un budget est un plafond, pas un objectif : un cadeau à 12 € bien choisi vaut mieux qu&apos;un cadeau à 20 € au hasard.</li>
        <li>Si l&apos;entreprise participe, elle peut par exemple offrir l&apos;emballage ou le goûter du jour J.</li>
      </ul>

      <h2>Comment faire un Secret Santa avec des collègues en télétravail ?</h2>
      <p>
        Les équipes hybrides ou entièrement à distance peuvent tout à fait jouer. Il faut juste anticiper un peu plus :
      </p>
      <ul>
        <li>
          <strong>Le tirage en ligne est indispensable</strong> : chacun découvre son collègue sur son lien, où
          qu&apos;il soit.
        </li>
        <li>
          <strong>Les listes d&apos;envies deviennent essentielles.</strong> Un collègue peut y mettre un lien vers un
          article, sa taille ou une simple note (« j&apos;adore le thé vert »). Cela permet aussi de commander
          directement en ligne.
        </li>
        <li>
          <strong>La livraison demande du temps.</strong> Lancez le tirage plus tôt, quatre semaines avant si possible.
        </li>
        <li>
          <strong>L&apos;adresse reste un point délicat.</strong> Pour garder l&apos;anonymat, la personne qui a besoin
          d&apos;une adresse peut poser une question anonyme à son collègue tiré au sort, ou les colis peuvent être
          envoyés à l&apos;organisateur qui les redistribue.
        </li>
        <li>
          <strong>L&apos;ouverture se fait en visio</strong>, chacun devant son paquet, pour garder le moment collectif.
        </li>
      </ul>

      <AppelAction titre="Organisez le Secret Santa de votre équipe" texte="Un lien d'invitation, un tirage, des listes d'envies : gratuit et sans compte." />

      <h2>Comment rendre le Secret Santa inclusif au travail ?</h2>
      <p>Un Secret Santa réussi est un moment où personne ne se sent mis à l&apos;écart. Quelques règles simples :</p>
      <ul>
        <li>
          <strong>La participation est volontaire.</strong> Certains ne fêtent pas Noël, d&apos;autres ont un budget
          serré : ne demandez jamais pourquoi quelqu&apos;un ne s&apos;inscrit pas.
        </li>
        <li>
          <strong>Le vocabulaire peut rester neutre.</strong> « Échange de cadeaux de fin d&apos;année » convient aussi
          bien que « Secret Santa ».
        </li>
        <li>
          <strong>Attention à l&apos;alcool et à la nourriture.</strong> Évitez l&apos;alcool par défaut et pensez aux
          régimes alimentaires (végétarien, sans gluten, allergies). Les listes d&apos;envies permettent à chacun de le
          signaler discrètement.
        </li>
        <li>
          <strong>Pas de cadeaux gênants.</strong> Les cadeaux « blagues » sur le physique, l&apos;âge ou la vie privée
          sont à proscrire au travail.
        </li>
      </ul>

      <h2>Qu&apos;est-ce que le mode mystère avec noms de code ?</h2>
      <p>
        Au bureau, il est fréquent que les cadeaux soient déposés à l&apos;avance dans un carton commun. Le problème :
        le prénom écrit sur le paquet, et l&apos;écriture de celui qui l&apos;a déposé, peuvent trahir le secret.
      </p>
      <p>
        Le mode mystère de Qui Offre règle cela. Chaque participant reçoit un nom de code amusant tiré au hasard,
        comme « Pingouin Farceur 🐧 ». Les participants ne voient que les noms de code, y compris pour la personne
        qu&apos;ils ont tirée : on choisit son cadeau uniquement d&apos;après sa liste d&apos;envies, et on écrit le
        nom de code sur le paquet. Le jour J, chacun récupère le paquet qui porte son nom de code. Dans ce mode, les
        listes d&apos;envies sont obligatoires avant le tirage (l&apos;organisateur peut passer outre si besoin).
      </p>

      <h2>Quelles idées de cadeaux pour un collègue ?</h2>
      <p>Au travail, misez sur l&apos;utile, le gourmand ou le convivial :</p>
      <ul>
        <li>un mug isotherme ou une gourde ;</li>
        <li>un carnet de notes joli et un bon stylo ;</li>
        <li>une plante de bureau facile à vivre ;</li>
        <li>un assortiment de thés ou de cafés ;</li>
        <li>une boîte de chocolats ou de biscuits artisanaux (en vérifiant les allergies) ;</li>
        <li>un jeu de cartes ou un casse-tête à partager en pause ;</li>
        <li>un support de téléphone ou un petit accessoire de bureau ;</li>
        <li>des chaussettes de Noël, un classique qui marche toujours.</li>
      </ul>
      <p>
        Pour plus d&apos;inspiration, voyez nos{" "}
        <Link href="/idees-cadeaux-secret-santa">idées de cadeaux Secret Santa par budget</Link>, avec une section
        dédiée aux télétravailleurs. Et si vous découvrez le principe, commencez par notre{" "}
        <Link href="/secret-santa">guide du Secret Santa</Link> ou celui du{" "}
        <Link href="/tirage-au-sort-noel">tirage au sort en ligne</Link>.
      </p>

      <Faq
        questions={[
          {
            q: "Quel budget pour un Secret Santa au travail ?",
            r: "Entre 10 et 20 € dans la plupart des équipes. L'important est d'annoncer le montant dès l'invitation et de préciser s'il comprend les frais de port pour les collègues à distance.",
          },
          {
            q: "Le Secret Santa au bureau doit-il être obligatoire ?",
            r: "Non. Il doit rester facultatif : certains collègues ne fêtent pas Noël ou préfèrent ne pas dépenser. Un lien d'invitation où chacun s'inscrit librement évite toute pression.",
          },
          {
            q: "Comment faire un Secret Santa avec des collègues à distance ?",
            r: "Faites le tirage en ligne, demandez à chacun une liste d'envies avec des liens, lancez le tirage environ quatre semaines avant pour laisser le temps aux livraisons, et ouvrez les cadeaux ensemble en visio.",
          },
          {
            q: "Comment éviter qu'on devine qui a offert le cadeau au bureau ?",
            r: "Utilisez des noms de code : avec le mode mystère de Qui Offre, chacun reçoit un nom de code aléatoire et l'écrit sur le paquet à la place du prénom. Les participants ne voient que les noms de code.",
          },
          {
            q: "Le manager ou l'organisateur peut-il participer ?",
            r: "Oui. Sur Qui Offre, la page de l'organisateur ne montre jamais qui offre à qui, il peut donc jouer comme n'importe quel collègue.",
          },
        ]}
      />
    </Article>
  );
}
