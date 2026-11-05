import type { Metadata } from "next";
import Link from "next/link";

import { AppelAction, Article } from "@/components/site/article";
import { Faq } from "@/components/site/faq";
import { guide } from "@/lib/guides";

const page = guide("/tirage-au-sort-noel");

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
          Pour faire un tirage au sort de Noël en ligne, on crée un groupe, on ajoute les participants et les
          éventuelles exclusions (les couples, par exemple), puis on lance le tirage : chacun découvre sur son propre
          lien la personne à qui il offre. Personne ne peut se tirer soi-même et l&apos;organisateur peut jouer, car
          il ne voit pas les résultats. Avec Qui Offre, c&apos;est gratuit et sans compte.
        </p>
      }
    >
      <h2>Pourquoi faire le tirage au sort en ligne plutôt qu&apos;avec des petits papiers ?</h2>
      <p>
        Les petits papiers dans un bonnet ont leur charme. Mais dès que le groupe dépasse quatre ou cinq personnes,
        les ennuis commencent : Tom pioche son propre prénom, Léa et son conjoint se tirent mutuellement, et Mamie Jo
        n&apos;était pas là le jour du tirage. On recommence, et à la troisième tentative, tout le monde a vu passer
        les papiers.
      </p>
      <table>
        <thead>
          <tr><th></th><th>Petits papiers</th><th>Tirage en ligne</th></tr>
        </thead>
        <tbody>
          <tr><td>Se tirer soi-même</td><td>Possible, il faut recommencer</td><td>Impossible</td></tr>
          <tr><td>Exclure les couples</td><td>Compliqué, souvent oublié</td><td>Une exclusion à cocher</td></tr>
          <tr><td>Participants absents ou à distance</td><td>Quelqu&apos;un pioche pour eux… et voit le nom</td><td>Chacun ouvre son lien, où qu&apos;il soit</td></tr>
          <tr><td>L&apos;organisateur joue aussi</td><td>Oui, mais il prépare les papiers</td><td>Oui, il ne voit pas qui offre à qui</td></tr>
          <tr><td>Oubli du nom tiré</td><td>Papier perdu, on demande autour de soi</td><td>Il suffit de rouvrir son lien</td></tr>
          <tr><td>Quelqu&apos;un se désiste</td><td>On refait tout à la main</td><td>On annule et on relance le tirage</td></tr>
        </tbody>
      </table>
      <p>
        En résumé, le tirage en ligne règle les trois vrais problèmes du bonnet : le hasard qui tombe mal, les
        contraintes difficiles à respecter, et le secret qui fuit.
      </p>

      <h2>Comment fonctionne un tirage au sort de Noël en ligne ?</h2>
      <p>
        Un bon outil de tirage fait une chose simple : il associe chaque participant à une autre personne du groupe,
        de façon aléatoire, en respectant deux contraintes. Personne ne se tire soi-même, et les exclusions que vous
        avez définies sont respectées. Si les exclusions rendent le tirage impossible (par exemple trois personnes
        qui s&apos;excluent toutes entre elles dans un groupe de quatre), l&apos;outil doit vous le dire au lieu de
        tricher.
      </p>
      <p>
        Ensuite, chaque participant découvre son résultat de son côté. Sur Qui Offre, il touche un paquet cadeau sur
        sa page pour révéler le prénom ; le paquet se referme à chaque visite, pour qu&apos;un regard par-dessus
        l&apos;épaule ne suffise pas à tout dévoiler.
      </p>

      <h2>Comment faire le tirage avec Qui Offre, étape par étape ?</h2>
      <ol>
        <li>
          <strong>Créez le groupe.</strong> Donnez-lui un nom (« Noël chez les Martin »), une date d&apos;échange, un
          budget et, si vous le souhaitez, un petit message. Aucun compte n&apos;est demandé.
        </li>
        <li>
          <strong>Ajoutez les participants.</strong> Deux façons de faire : vous saisissez les prénoms vous-même et
          chacun reçoit un lien personnel, ou vous partagez un seul lien d&apos;invitation et chacun s&apos;inscrit
          avec son prénom (et, s&apos;il le souhaite, un e-mail ou un téléphone visibles par vous seul).
        </li>
        <li>
          <strong>Définissez les exclusions.</strong> Indiquez les paires de personnes qui ne doivent pas se tirer,
          typiquement les couples.
        </li>
        <li>
          <strong>Lancez le tirage.</strong> Il faut au moins trois participants. L&apos;application vérifie que le
          tirage est possible avec vos exclusions.
        </li>
        <li>
          <strong>Distribuez les liens.</strong> Si vous avez saisi les participants, envoyez à chacun son lien
          personnel par le moyen de votre choix (message, e-mail…). Ceux qui ont donné leur e-mail reçoivent aussi un
          rappel quand le tirage est fait.
        </li>
        <li>
          <strong>Suivez sans tricher.</strong> Votre page d&apos;organisateur indique qui a ouvert son lien et combien
          d&apos;idées chacun a mises dans sa liste. Jamais qui offre à qui.
        </li>
      </ol>

      <AppelAction titre="Faites votre tirage au sort maintenant" />

      <h2>Comment garder le secret quand on est l&apos;organisateur ?</h2>
      <p>
        C&apos;est la grande question de l&apos;organisateur qui veut aussi jouer. Avec un tirage en ligne, les
        résultats ne s&apos;affichent que sur la page personnelle de chaque participant. L&apos;organisateur, lui, voit
        la liste des participants et leur avancement, mais pas les associations.
      </p>
      <p>
        Soyons honnêtes : si vous distribuez vous-même les liens personnels, vous pourriez techniquement en ouvrir un
        qui n&apos;est pas le vôtre. Le jeu repose donc sur la confiance, comme avec les petits papiers. Pour lever
        tout soupçon, utilisez le lien d&apos;invitation : chacun s&apos;inscrit lui-même et garde son lien pour lui.
      </p>
      <p>
        Pour aller plus loin, le <strong>mode mystère</strong> donne à chacun un nom de code tiré au hasard. Les
        participants ne voient que ces noms de code, y compris pour la personne qu&apos;ils ont tirée. On écrit le
        nom de code sur le paquet, et le mystère tient jusqu&apos;au bout.
      </p>

      <h2>Que faire si quelqu&apos;un se désiste après le tirage ?</h2>
      <p>
        Cela arrive : Karim ne pourra finalement pas venir, ou une cousine s&apos;ajoute à la dernière minute. Avec des
        papiers, on ne peut pas simplement retirer un nom : la personne qui avait tiré Karim n&apos;a plus personne, et
        celle que Karim avait tirée ne recevra rien.
      </p>
      <p>La solution la plus propre est de refaire le tirage :</p>
      <ol>
        <li>L&apos;organisateur annule le tirage en cours.</li>
        <li>Il retire ou ajoute la personne concernée.</li>
        <li>Il relance le tirage : chacun découvre sa nouvelle personne sur son lien.</li>
      </ol>
      <p>
        Prévenez le groupe avant de relancer, pour que personne n&apos;achète un cadeau pour la mauvaise personne. Et
        si possible, faites-le tôt : plus la date approche, plus le risque qu&apos;un cadeau soit déjà acheté est grand.
      </p>

      <h2>Quand faire le tirage au sort de Noël ?</h2>
      <p>
        Comptez trois à quatre semaines avant l&apos;échange. Pour un réveillon le 24 décembre, un tirage fin
        novembre ou début décembre laisse le temps de remplir les{" "}
        <Link href="/liste-de-cadeaux">listes d&apos;envies</Link>, de chercher une idée et de se faire livrer.
        Les participants qui ont donné leur e-mail reçoivent un rappel une semaine avant et la veille.
      </p>
      <p>
        Pour les règles du jeu et le choix du budget, voyez notre{" "}
        <Link href="/secret-santa">guide complet du Secret Santa</Link>. Pour un tirage au bureau, lisez{" "}
        <Link href="/secret-santa-entre-collegues">Secret Santa entre collègues</Link>.
      </p>

      <Faq
        questions={[
          {
            q: "Le tirage au sort en ligne est-il vraiment aléatoire ?",
            r: "Oui. Les associations sont tirées au hasard parmi toutes celles qui respectent les règles : personne ne se tire soi-même et les exclusions sont respectées. Si aucune combinaison n'est possible avec vos exclusions, Qui Offre vous le signale.",
          },
          {
            q: "Peut-on faire un tirage au sort de Noël sans que l'organisateur connaisse les résultats ?",
            r: "Oui. Sur Qui Offre, la page de l'organisateur montre qui a ouvert son lien et combien d'idées chacun a notées, mais jamais qui offre à qui. Chacun découvre sa personne uniquement sur son propre lien.",
          },
          {
            q: "Comment exclure un couple du tirage au sort ?",
            r: "Ajoutez une exclusion entre les deux personnes avant de lancer le tirage. Elles ne pourront pas se tirer l'une l'autre, ni dans un sens ni dans l'autre.",
          },
          {
            q: "Peut-on refaire un tirage au sort déjà lancé ?",
            r: "Oui. L'organisateur peut annuler le tirage, modifier les participants ou les exclusions, puis relancer. Pensez à prévenir le groupe, car chacun aura une nouvelle personne.",
          },
          {
            q: "Les participants doivent-ils installer une application ?",
            r: "Non. Chacun ouvre simplement son lien dans le navigateur de son téléphone ou de son ordinateur. Ceux qui le souhaitent peuvent ajouter Qui Offre à leur écran d'accueil depuis le navigateur.",
          },
        ]}
      />
    </Article>
  );
}
