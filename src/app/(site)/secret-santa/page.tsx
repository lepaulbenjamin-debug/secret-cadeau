import type { Metadata } from "next";
import Link from "next/link";

import { AppelAction, Article } from "@/components/site/article";
import { Faq } from "@/components/site/faq";
import { guide } from "@/lib/guides";

const page = guide("/secret-santa");

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
          Le Secret Santa, ou Père Noël secret, est un échange de cadeaux où chaque participant tire au sort une
          seule personne à qui il offrira un présent, sans révéler qui il est. Tout le monde reçoit un cadeau, chacun
          n&apos;en achète qu&apos;un, dans un budget fixé à l&apos;avance. Il suffit d&apos;un tirage au sort, d&apos;un
          budget et d&apos;une date d&apos;échange.
        </p>
      }
    >
      <h2>Qu&apos;est-ce qu&apos;un Secret Santa ?</h2>
      <p>
        Le principe tient en une phrase : au lieu que tout le monde offre un cadeau à tout le monde, chacun offre un
        seul cadeau à une personne tirée au sort. Le nom de cette personne reste secret jusqu&apos;au jour de
        l&apos;échange, et parfois même après.
      </p>
      <p>
        Prenons un groupe de six amis : Léa, Tom, Inès, Karim, Chloé et Mamie Jo. Sans Secret Santa, chacun achète
        cinq cadeaux, soit trente paquets à trouver, emballer et payer. Avec un Secret Santa, il n&apos;y a plus que
        six cadeaux en tout. Chacun peut prendre le temps de bien choisir le sien, et la surprise reste entière.
      </p>
      <p>
        On parle aussi de « Père Noël secret », de « Papa Noël secret » ou simplement de « tirage au sort de Noël ».
        C&apos;est le même jeu.
      </p>

      <h2>D&apos;où vient le Secret Santa ?</h2>
      <p>
        L&apos;expression « Secret Santa » vient des pays anglo-saxons, où la tradition est répandue au bureau comme
        en famille. On retrouve des coutumes proches ailleurs, comme le « Wichteln » dans les pays germanophones ou le
        « Kris Kringle » dans certains pays anglophones. Les origines exactes sont difficiles à dater : retenez
        surtout que l&apos;idée d&apos;un échange de cadeaux tiré au sort est ancienne et a fait le tour du monde,
        parce qu&apos;elle est simple et économique.
      </p>

      <h2>Quelles sont les règles du Secret Santa ?</h2>
      <p>Il n&apos;existe pas de règlement officiel, mais quelques règles de base font consensus :</p>
      <ol>
        <li><strong>Chacun tire une seule personne</strong> et lui offre un seul cadeau.</li>
        <li><strong>Personne ne se tire soi-même.</strong> Cela paraît évident, mais c&apos;est le piège classique des petits papiers.</li>
        <li><strong>Le secret est gardé</strong> : on ne dit pas qui on a tiré, même à son voisin de table.</li>
        <li><strong>Le budget est le même pour tous</strong>, pour que personne ne se sente gêné en ouvrant son paquet.</li>
        <li><strong>Une date d&apos;échange commune</strong> est fixée dès le départ.</li>
      </ol>
      <p>On ajoute souvent des règles maison :</p>
      <ul>
        <li><strong>Les exclusions</strong> : deux personnes en couple ne se tirent pas entre elles, pour que l&apos;échange reste une surprise.</li>
        <li><strong>Les listes d&apos;envies</strong> : chacun note quelques idées pour guider son Père Noël secret.</li>
        <li><strong>Un thème</strong> : « fait maison », « seconde main », « quelque chose qui se mange »…</li>
        <li><strong>La révélation</strong> : certains groupes devinent qui a offert quoi, d&apos;autres préfèrent ne jamais le dire.</li>
      </ul>

      <h2>Comment organiser un Secret Santa, étape par étape ?</h2>
      <ol>
        <li>
          <strong>Constituez le groupe.</strong> Listez les participants et vérifiez que chacun est d&apos;accord pour
          jouer. Il faut au moins trois personnes pour que le tirage garde un peu de mystère.
        </li>
        <li>
          <strong>Fixez la date et le budget.</strong> Annoncez-les dès le départ pour que chacun s&apos;organise.
        </li>
        <li>
          <strong>Notez les exclusions.</strong> Couples, frères et sœurs qui s&apos;offrent déjà un cadeau, personnes
          qui se sont tirées l&apos;an dernier…
        </li>
        <li>
          <strong>Faites le tirage au sort.</strong> Avec des petits papiers si tout le monde est dans la même pièce,
          ou en ligne si le groupe est dispersé. Notre guide du{" "}
          <Link href="/tirage-au-sort-noel">tirage au sort de Noël en ligne</Link> compare les deux méthodes.
        </li>
        <li>
          <strong>Invitez chacun à remplir sa liste d&apos;envies.</strong> Trois à cinq idées suffisent. Voir notre
          guide pour <Link href="/liste-de-cadeaux">créer une liste de cadeaux</Link>.
        </li>
        <li>
          <strong>Relancez avant la date.</strong> Un petit rappel une semaine avant évite les achats de dernière minute.
        </li>
        <li><strong>Profitez du jour J.</strong> Échange, ouverture des paquets et, si vous le souhaitez, révélation.</li>
      </ol>
      <p>
        Avec Qui Offre, ces étapes se font en quelques minutes et sans compte : vous créez le groupe, ajoutez les
        participants et les exclusions, lancez le tirage, et chacun découvre la personne qu&apos;il a tirée sur son
        propre lien. L&apos;organisateur peut participer, car sa page ne montre jamais qui offre à qui.
      </p>

      <AppelAction />

      <h2>Quel budget pour un Secret Santa ?</h2>
      <p>
        Le bon budget est celui que tout le monde peut se permettre sans y penser. Mieux vaut un montant modeste
        accepté par tous qu&apos;un montant ambitieux qui met quelqu&apos;un mal à l&apos;aise. Voici des repères
        courants, à adapter à votre groupe :
      </p>
      <table>
        <thead>
          <tr><th>Groupe</th><th>Budget habituel</th><th>Pourquoi</th></tr>
        </thead>
        <tbody>
          <tr><td>Collègues</td><td>10 à 20 €</td><td>Tout le monde ne se connaît pas bien ; un petit montant reste léger.</td></tr>
          <tr><td>Amis</td><td>20 à 30 €</td><td>Assez pour un cadeau qui fait plaisir, sans pression.</td></tr>
          <tr><td>Famille</td><td>30 à 50 €</td><td>Un seul cadeau remplace souvent plusieurs, on peut viser plus utile.</td></tr>
        </tbody>
      </table>
      <p>
        Annoncez aussi ce que le budget couvre : emballage et frais de port compris ou non ? Pour trouver quoi offrir
        dans chaque fourchette, consultez nos <Link href="/idees-cadeaux-secret-santa">idées de cadeaux par budget</Link>.
      </p>

      <h2>Comment se passe le jour de l&apos;échange ?</h2>
      <p>Plusieurs formules existent, choisissez celle qui colle à votre groupe :</p>
      <ul>
        <li><strong>Tous les paquets au pied du sapin</strong>, avec le prénom du destinataire. On les ouvre chacun son tour.</li>
        <li><strong>Le jeu des devinettes</strong> : après chaque ouverture, le destinataire essaie de deviner qui l&apos;a gâté.</li>
        <li><strong>Le secret total</strong> : on ne révèle rien, et le mystère dure jusqu&apos;à l&apos;année suivante.</li>
        <li><strong>À distance</strong> : chacun fait livrer son cadeau, puis on l&apos;ouvre ensemble en visio.</li>
      </ul>
      <p>
        Astuce : en mode mystère, chaque participant reçoit un nom de code amusant (par exemple « Pingouin Farceur 🐧 »)
        et l&apos;écrit sur son paquet à la place du prénom. Pratique au bureau, quand les paquets sont déposés à
        l&apos;avance dans un même carton.
      </p>

      <h2>Quelles erreurs éviter ?</h2>
      <ul>
        <li><strong>Lancer le tirage trop tard.</strong> Trois à quatre semaines avant l&apos;échange laissent le temps de commander.</li>
        <li><strong>Oublier les exclusions.</strong> Un couple qui se tire entre lui gâche un peu la surprise.</li>
        <li><strong>Ne pas fixer de budget.</strong> C&apos;est la première source de gêne le jour J.</li>
        <li><strong>Refaire le tirage à la main quand quelqu&apos;un se désiste.</strong> Avec des papiers, le secret est vite éventé. En ligne, l&apos;organisateur annule et relance le tirage en un clic.</li>
        <li><strong>Offrir sans regarder la liste d&apos;envies.</strong> Elle est là pour ça, même si vous voulez ajouter une touche personnelle.</li>
        <li><strong>Trahir le secret par message.</strong> Pour poser une question, mieux vaut un canal anonyme que le groupe de discussion familial.</li>
      </ul>
      <p>
        Vous organisez au travail ou en famille ? Nos guides dédiés vont plus loin :{" "}
        <Link href="/secret-santa-entre-collegues">Secret Santa entre collègues</Link> et{" "}
        <Link href="/secret-santa-en-famille">Secret Santa en famille</Link>.
      </p>

      <AppelAction titre="Lancez votre Secret Santa" texte="Créez votre groupe en deux minutes, sans compte, et laissez le tirage faire le reste." />

      <Faq
        questions={[
          {
            q: "Quelle est la différence entre Secret Santa et Père Noël secret ?",
            r: "Il n'y en a pas : Secret Santa est le nom anglais, Père Noël secret sa traduction française. Dans les deux cas, chaque participant tire au sort une personne à qui il offre un cadeau, sans dire qui il est.",
          },
          {
            q: "Combien faut-il être pour faire un Secret Santa ?",
            r: "Il faut au moins trois participants. À deux, chacun saurait forcément qui lui offre son cadeau. Il n'y a pas vraiment de maximum : le jeu fonctionne aussi bien à cinq qu'à quarante.",
          },
          {
            q: "Quand faut-il faire le tirage au sort ?",
            r: "Idéalement trois à quatre semaines avant la date de l'échange. Cela laisse le temps à chacun de remplir sa liste d'envies, de chercher une idée et de se faire livrer.",
          },
          {
            q: "Doit-on révéler qui a offert quoi ?",
            r: "C'est au choix du groupe. Certains font deviner l'auteur du cadeau après l'ouverture, d'autres gardent le secret pour toujours. Décidez-le avant le tirage pour que tout le monde soit sur la même longueur d'onde.",
          },
          {
            q: "L'organisateur peut-il participer au Secret Santa ?",
            r: "Oui, à condition que le tirage soit fait par un outil qui ne lui montre pas les résultats. Avec Qui Offre, la page de l'organisateur n'affiche jamais qui offre à qui : il découvre seulement la personne qu'il a tirée, comme les autres.",
          },
        ]}
      />
    </Article>
  );
}
