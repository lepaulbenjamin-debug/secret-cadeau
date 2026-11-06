import type { Metadata } from "next";
import Link from "next/link";

import { AppelAction, Article } from "@/components/site/article";
import { Faq } from "@/components/site/faq";
import { guide } from "@/lib/guides";

const page = guide("/liste-de-cadeaux");

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
          Une liste de cadeaux en ligne, ou liste d&apos;envies, est une page où vous notez les cadeaux qui vous feraient
          plaisir (avec un lien, une taille, une couleur ou une fourchette de prix) et que vous partagez avec vos
          proches. Grâce aux réservations invisibles, chacun indique ce qu&apos;il compte offrir sans que vous le
          voyiez, ce qui évite les doublons tout en gardant la surprise.
        </p>
      }
    >
      <h2>Pourquoi faire une liste de cadeaux en ligne ?</h2>
      <p>
        Faire une liste n&apos;a rien d&apos;égoïste : c&apos;est rendre service à ceux qui veulent vous faire plaisir.
        Personne n&apos;aime chercher pendant des heures, ni offrir un cadeau qui finira au fond d&apos;un placard.
      </p>
      <ul>
        <li><strong>Moins de cadeaux ratés</strong> : vos proches savent ce qui vous plaît vraiment.</li>
        <li><strong>Moins de doublons</strong> : deux personnes n&apos;offrent pas la même chose.</li>
        <li><strong>Moins de temps perdu</strong> : un lien, et l&apos;on sait où trouver l&apos;article.</li>
        <li><strong>Toujours à jour</strong> : contrairement à une liste envoyée par message, une page en ligne se modifie à tout moment.</li>
      </ul>

      <h2>Que mettre dans sa liste de cadeaux ?</h2>
      <p>
        Une bonne liste est précise sans être dirigiste. Elle laisse le choix à ceux qui offrent tout en leur évitant
        les erreurs. Pour chaque idée, pensez à indiquer :
      </p>
      <table>
        <thead>
          <tr><th>Information</th><th>Exemple</th><th>Pourquoi c&apos;est utile</th></tr>
        </thead>
        <tbody>
          <tr><td>Un titre clair</td><td>« Pull en laine col roulé »</td><td>On comprend l&apos;idée d&apos;un coup d&apos;œil.</td></tr>
          <tr><td>Un lien</td><td>La page de l&apos;article dans une boutique</td><td>On sait exactement quoi acheter et où.</td></tr>
          <tr><td>La taille ou la pointure</td><td>« Taille M », « 39 »</td><td>Évite l&apos;échange après Noël.</td></tr>
          <tr><td>La couleur ou le style</td><td>« Vert sapin ou bleu marine »</td><td>Laisse un choix tout en guidant.</td></tr>
          <tr><td>Une fourchette de prix</td><td>« Environ 25 € »</td><td>Chacun trouve une idée dans son budget.</td></tr>
          <tr><td>Une note libre</td><td>« N&apos;importe quel roman de cet auteur sauf le dernier »</td><td>Ajoute le contexte qui fait la différence.</td></tr>
        </tbody>
      </table>
      <p>Quelques conseils pour une liste réussie :</p>
      <ul>
        <li><strong>Variez les prix</strong>, du petit plaisir à l&apos;idée plus ambitieuse.</li>
        <li><strong>Mettez plusieurs idées</strong> : trois à cinq pour un Secret Santa, davantage si plusieurs personnes vous offrent un cadeau.</li>
        <li><strong>Ajoutez des idées ouvertes</strong> : « un livre de cuisine végétarienne », « tout ce qui touche au jardinage ».</li>
        <li><strong>Mettez la liste à jour</strong> : retirez ce que vous avez acheté vous-même entre-temps.</li>
      </ul>
      <p>
        En manque d&apos;inspiration pour votre propre liste ? Parcourez nos{" "}
        <Link href="/idees-cadeaux-secret-santa">idées de cadeaux par budget</Link>.
      </p>

      <h2>Comment créer une liste de cadeaux avec Qui Offre ?</h2>
      <ol>
        <li>
          <strong>Rejoignez ou créez un groupe.</strong> Sur Qui Offre, chaque participant d&apos;un groupe a sa liste
          d&apos;envies, accessible depuis son lien personnel. Pas de compte à créer.
        </li>
        <li>
          <strong>Ajoutez une idée.</strong> Donnez-lui un titre, et si vous le souhaitez un lien, une image, un prix et
          une note.
        </li>
        <li>
          <strong>Collez un lien, la fiche se remplit.</strong> Sur de nombreuses boutiques en ligne, coller l&apos;adresse
          d&apos;un article suffit à remplir automatiquement le titre, l&apos;image et le prix, quand la boutique publie
          ces informations. Pour certains sites, seul le titre est récupéré ; vous complétez le reste à la main.
        </li>
        <li>
          <strong>C&apos;est partagé.</strong> Votre liste est visible par tout le groupe : votre Père Noël secret, mais
          aussi les autres membres.
        </li>
      </ol>

      <AppelAction titre="Créez votre groupe et vos listes" texte="Listes d'envies, réservations invisibles et tirage au sort : gratuit et sans compte." />

      <h2>Comment éviter les doublons sans gâcher la surprise ?</h2>
      <p>
        C&apos;est tout l&apos;intérêt des réservations invisibles. Prenons la liste de Mamie Jo : elle a noté une
        écharpe, un livre de mots croisés et un jeu de cartes.
      </p>
      <ol>
        <li>Léa ouvre la liste et clique sur « Je m&apos;en occupe » pour l&apos;écharpe.</li>
        <li>Quand Tom consulte la liste, il voit que l&apos;écharpe est déjà prise. Il choisit les mots croisés.</li>
        <li>Mamie Jo, elle, voit toujours sa liste telle qu&apos;elle l&apos;a écrite. Elle ne sait ni ce qui a été réservé, ni par qui.</li>
      </ol>
      <p>
        Résultat : pas de doublon, et la surprise reste entière le jour J. C&apos;est la principale différence avec une
        liste partagée dans un simple document, où tout le monde, y compris la personne concernée, voit qui a coché
        quoi.
      </p>

      <h2>Comment poser une question sans se trahir ?</h2>
      <p>
        Une idée est floue (« un pull, mais de quelle taille ? ») ? Dans un Secret Santa sur Qui Offre, vous pouvez
        poser une question anonyme à la personne que vous avez tirée. Elle voit la question et y répond, sans savoir
        qui la pose ; la réponse s&apos;affiche pour vous. Bien plus discret qu&apos;un message dans le groupe de
        discussion familial.
      </p>

      <h2>Une liste de cadeaux, seulement pour Noël ?</h2>
      <p>
        Non. Le Secret Santa est l&apos;usage le plus courant, mais une liste d&apos;envies partagée est utile toute
        l&apos;année, dès qu&apos;un groupe veut gâter quelqu&apos;un :
      </p>
      <ul>
        <li>un anniversaire, pour que les amis se répartissent les idées ;</li>
        <li>la fête des mères ou des pères, entre frères et sœurs ;</li>
        <li>un pot de départ ou un cadeau collectif au bureau ;</li>
        <li>les cadeaux des enfants, gérés par les parents pour toute la famille.</li>
      </ul>
      <p>
        Pour un anniversaire, une naissance ou un mariage, Qui Offre propose une{" "}
        <Link href="/liste/nouvelle">liste de cadeaux sans tirage au sort</Link> : vous notez vos envies, vous partagez
        le lien, et vos proches réservent « Je m&apos;en occupe » avec leur prénom. Ils voient ce que les autres ont
        réservé, vous jamais.
      </p>
      <AppelActionListe />
      <p>
        Pour les règles du jeu, voyez notre <Link href="/secret-santa">guide du Secret Santa</Link>. Pour les cadeaux
        des enfants et des grands-parents, lisez{" "}
        <Link href="/secret-santa-en-famille">Secret Santa en famille</Link>.
      </p>

      <Faq
        questions={[
          {
            q: "Comment faire une liste de cadeaux en ligne gratuite ?",
            r: "Créez un groupe sur Qui Offre ou rejoignez celui auquel on vous a invité, puis ajoutez vos idées dans votre liste d'envies : titre, lien, image, prix et note. C'est gratuit et sans compte, et la liste est visible par tout le groupe.",
          },
          {
            q: "La personne qui fait la liste voit-elle ce qui a été réservé ?",
            r: "Non. Sur Qui Offre, les réservations « Je m'en occupe » sont visibles par les autres membres du groupe, pour éviter les doublons, mais jamais par la personne à qui appartient la liste.",
          },
          {
            q: "Pourquoi le prix ou l'image ne s'affiche pas quand je colle un lien ?",
            r: "Le remplissage automatique dépend de ce que la boutique publie dans sa page. Certaines ne donnent pas ces informations ; pour certains sites, seul le titre est repris du lien. Vous pouvez toujours compléter le prix et la note à la main.",
          },
          {
            q: "Combien d'idées mettre dans une liste d'envies ?",
            r: "Trois à cinq idées suffisent pour un Secret Santa, avec des prix variés autour du budget. Si plusieurs personnes vous offrent un cadeau, ajoutez-en davantage pour qu'elles puissent se répartir.",
          },
          {
            q: "Peut-on modifier sa liste après le tirage ?",
            r: "Oui, vous pouvez ajouter, modifier ou retirer des idées à tout moment. Pensez simplement que quelqu'un a peut-être déjà acheté une idée que vous retirez à la dernière minute.",
          },
        ]}
      />
    </Article>
  );
}

function AppelActionListe() {
  return (
    <aside className="not-prose my-8 rounded-2xl bg-sapin p-6 text-center text-carte">
      <p className="font-titre text-xl font-semibold">🎂 Une liste pour votre anniversaire ?</p>
      <p className="mt-1 text-sm opacity-90">Créée en 30 secondes, partagée en un lien, réservations invisibles pour vous.</p>
      <Link href="/liste/nouvelle" className="bouton bouton-cerise mt-4">Créer ma liste de cadeaux</Link>
    </aside>
  );
}
