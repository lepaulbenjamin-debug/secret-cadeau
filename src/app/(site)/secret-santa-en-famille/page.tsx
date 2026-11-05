import type { Metadata } from "next";
import Link from "next/link";

import { AppelAction, Article } from "@/components/site/article";
import { Faq } from "@/components/site/faq";
import { guide } from "@/lib/guides";

const page = guide("/secret-santa-en-famille");

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
          Un Secret Santa en famille consiste à remplacer la montagne de cadeaux de Noël par un tirage au sort : chaque
          adulte offre un seul cadeau, plus soigné, à un membre de la famille tiré au hasard. On exclut les couples du
          tirage, on fixe un budget commun (souvent 30 à 50 €) et chacun partage une liste d&apos;envies pour éviter les
          doublons.
        </p>
      }
    >
      <h2>Pourquoi faire un Secret Santa en famille ?</h2>
      <p>
        Dans une grande famille, Noël peut vite tourner au marathon. Prenons la famille de Léa : ses parents, son frère
        Tom et sa compagne, sa sœur, deux cousins et Mamie Jo. Dix adultes qui s&apos;offrent tous un cadeau, cela fait
        quatre-vingt-dix paquets. Beaucoup de dépenses, beaucoup de cadeaux achetés à la va-vite, et quelques
        doublons au pied du sapin.
      </p>
      <p>Avec un Secret Santa, chaque adulte n&apos;achète qu&apos;un cadeau. Les avantages sont nombreux :</p>
      <ul>
        <li><strong>Moins cher</strong> : un seul cadeau par personne, même avec un budget plus généreux.</li>
        <li><strong>Moins de stress</strong> : une seule idée à trouver, et on a le temps de bien la choisir.</li>
        <li><strong>Plus de surprise</strong> : on ne sait pas qui nous a tirés, le suspense dure jusqu&apos;au réveillon.</li>
        <li><strong>Moins de gaspillage</strong> : un cadeau choisi d&apos;après une liste d&apos;envies finit rarement au fond d&apos;un placard.</li>
      </ul>

      <h2>Comment organiser un Secret Santa en famille ?</h2>
      <ol>
        <li>
          <strong>Proposez l&apos;idée tôt.</strong> Dès novembre, lancez le sujet. Certains seront attachés aux
          cadeaux pour tout le monde : écoutez, et proposez éventuellement d&apos;essayer une année.
        </li>
        <li>
          <strong>Décidez qui participe.</strong> Adultes seulement, ou tout le monde ? Voir plus bas pour les enfants.
        </li>
        <li><strong>Fixez la date et le budget</strong>, par exemple le réveillon du 24 décembre et 40 €.</li>
        <li><strong>Ajoutez les exclusions</strong> : les couples, au minimum.</li>
        <li>
          <strong>Faites le tirage en ligne.</strong> La famille est rarement réunie avant Noël : un{" "}
          <Link href="/tirage-au-sort-noel">tirage au sort en ligne</Link> permet à chacun de découvrir sa personne de
          chez lui.
        </li>
        <li><strong>Demandez à chacun sa liste d&apos;envies.</strong></li>
      </ol>

      <h2>Pourquoi exclure les couples du tirage ?</h2>
      <p>
        Si Tom tire sa compagne, deux problèmes se posent. D&apos;abord, la surprise est limitée : on s&apos;offre déjà
        des cadeaux en couple, souvent en plus du Secret Santa. Ensuite, le budget du foyer se retrouve concentré sur
        un même échange. Exclure les couples permet de mélanger les branches de la famille et de recevoir un cadeau de
        quelqu&apos;un qu&apos;on voit moins souvent.
      </p>
      <p>
        Une exclusion se règle en une ligne avant le tirage : on indique que Tom et sa compagne ne doivent pas se tirer.
        Certaines familles ajoutent aussi les parents et leurs enfants adultes, ou les personnes qui se sont tirées
        l&apos;année précédente. Attention à ne pas multiplier les exclusions dans un petit groupe : au-delà d&apos;un
        certain point, le tirage devient impossible. Qui Offre vous le signale si c&apos;est le cas.
      </p>

      <h2>Comment inclure les enfants dans un Secret Santa familial ?</h2>
      <p>Plusieurs formules fonctionnent bien :</p>
      <ul>
        <li>
          <strong>Les enfants à part.</strong> Les adultes font un Secret Santa entre eux, et les enfants gardent leurs
          cadeaux habituels. C&apos;est la formule la plus courante quand les enfants sont petits.
        </li>
        <li>
          <strong>Les enfants dans le tirage.</strong> Ils participent comme les autres. Un adulte gère leur liste
          d&apos;envies et les aide à choisir leur cadeau. Les plus grands adorent garder le secret.
        </li>
        <li>
          <strong>Un groupe pour les enfants.</strong> Les cousins font leur propre tirage, avec un petit budget, en
          parallèle de celui des adultes.
        </li>
      </ul>
      <p>
        Pour un enfant qui ne sait pas encore lire, un parent ouvre le lien, remplit la liste avec lui (« un livre sur
        les dinosaures », « des feutres ») et l&apos;aide à découvrir la personne qu&apos;il a tirée, en lui faisant
        promettre de garder le secret.
      </p>

      <AppelAction titre="Lancez le Secret Santa de la famille" texte="Exclusions des couples, listes d'envies et rappels par e-mail : gratuit et sans compte." />

      <h2>Quel budget pour un Secret Santa en famille ?</h2>
      <p>
        Comme chacun n&apos;offre qu&apos;un cadeau, on peut viser un budget plus confortable qu&apos;entre collègues.
        Voici quelques repères, à adapter à vos habitudes :
      </p>
      <table>
        <thead>
          <tr><th>Situation</th><th>Budget indicatif</th></tr>
        </thead>
        <tbody>
          <tr><td>Famille où les budgets sont très différents</td><td>20 à 30 €</td></tr>
          <tr><td>Famille qui remplace tous les cadeaux entre adultes</td><td>30 à 50 €</td></tr>
          <tr><td>Groupe des enfants ou des cousins</td><td>10 à 15 €</td></tr>
        </tbody>
      </table>
      <p>
        Le plus important est que le budget soit le même pour tous et accepté par tous, y compris par les étudiants ou
        les grands-parents. Pour trouver une idée dans chaque fourchette, consultez nos{" "}
        <Link href="/idees-cadeaux-secret-santa">idées de cadeaux par budget</Link>.
      </p>

      <h2>Comment les listes d&apos;envies évitent-elles les doublons ?</h2>
      <p>
        En famille, le doublon est un grand classique : deux personnes ont eu la même bonne idée pour Mamie Jo. Avec un
        Secret Santa, chacun n&apos;offre qu&apos;à une personne, mais les listes restent utiles bien au-delà :
      </p>
      <ul>
        <li>
          <strong>Elles guident votre Père Noël secret</strong>, qui ne vous connaît pas forcément aussi bien que vous
          le croyez.
        </li>
        <li>
          <strong>Elles servent à toute la famille.</strong> Sur Qui Offre, les listes sont visibles par tout le groupe.
          Les parents qui veulent faire un petit cadeau en plus aux enfants, par exemple, peuvent s&apos;en inspirer.
        </li>
        <li>
          <strong>Les réservations évitent les doublons.</strong> Quand quelqu&apos;un clique sur « Je m&apos;en occupe »
          pour une idée, les autres voient qu&apos;elle est prise. La personne qui a fait la liste, elle, ne voit jamais
          ce qui a été réservé : la surprise est préservée.
        </li>
      </ul>
      <p>
        Et si vous avez une question (« tu fais quelle pointure ? »), vous pouvez la poser anonymement à la personne
        que vous avez tirée : elle répond sans savoir qui demande. Notre guide pour{" "}
        <Link href="/liste-de-cadeaux">créer une liste de cadeaux</Link> donne des conseils pour bien la remplir.
      </p>

      <h2>Et le jour du réveillon ?</h2>
      <p>
        Posez tous les paquets au pied du sapin et ouvrez-les un par un, pour que chacun profite de chaque cadeau.
        Beaucoup de familles aiment faire deviner qui a offert quoi : c&apos;est souvent le moment le plus drôle de la
        soirée. Pour les règles générales du jeu, voyez notre <Link href="/secret-santa">guide du Secret Santa</Link>.
      </p>

      <Faq
        questions={[
          {
            q: "Comment faire un Secret Santa en famille quand on n'habite pas au même endroit ?",
            r: "Faites le tirage en ligne : chacun reçoit un lien et découvre de chez lui la personne qu'il a tirée. Les listes d'envies sont partagées dans le groupe, et le jour J chacun apporte son cadeau ou le fait livrer.",
          },
          {
            q: "Faut-il inclure les enfants dans le Secret Santa familial ?",
            r: "C'est au choix. Beaucoup de familles réservent le Secret Santa aux adultes et gardent les cadeaux habituels pour les enfants. Si les enfants participent, un adulte peut gérer leur lien et leur liste d'envies.",
          },
          {
            q: "Comment éviter qu'un couple se tire au sort ?",
            r: "Ajoutez une exclusion entre les deux conjoints avant de lancer le tirage. Ils ne pourront pas se tirer l'un l'autre.",
          },
          {
            q: "Et si toute la famille n'est pas d'accord pour arrêter les cadeaux pour tous ?",
            r: "Proposez un essai pour une année, ou une formule mixte : Secret Santa entre adultes, cadeaux classiques pour les enfants. Fixer un budget plus généreux pour l'unique cadeau rassure souvent les plus attachés à la tradition.",
          },
          {
            q: "Mamie peut-elle participer si elle n'est pas à l'aise avec Internet ?",
            r: "Oui. Il suffit d'ouvrir un lien, sans compte ni mot de passe. Un proche peut aussi l'aider à découvrir sa personne et à remplir sa liste d'envies sur son propre téléphone ou ordinateur.",
          },
        ]}
      />
    </Article>
  );
}
