import type { Metadata } from "next";
import Link from "next/link";

import { AppelAction, Article } from "@/components/site/article";
import { Faq } from "@/components/site/faq";
import { guide } from "@/lib/guides";

const page = guide("/liste-cadeaux-anniversaire");

export const metadata: Metadata = {
  title: page.titre,
  description: page.description,
  alternates: { canonical: page.chemin },
  openGraph: { title: page.titre, description: page.description, url: page.chemin, type: "article" },
};

const APPEL = { href: "/liste/nouvelle", bouton: "Créer ma liste d'anniversaire" };

export default function ListeAnniversaire() {
  return (
    <Article
      page={page}
      resume={
        <p>
          Une liste de cadeaux d&apos;anniversaire est une liste d&apos;envies que la personne fêtée partage avec ses proches :
          chacun choisit une idée et la réserve, pour éviter que deux invités offrent la même chose. Sur Qui Offre, elle se
          crée en quelques secondes, gratuitement et sans compte, et la personne fêtée ne voit jamais ce qui a été réservé.
        </p>
      }
    >
      <h2>Pourquoi faire une liste de cadeaux d&apos;anniversaire&nbsp;?</h2>
      <p>
        Avant chaque anniversaire, la même question revient dans les conversations : « Qu&apos;est-ce qui lui ferait
        plaisir ? ». Sans réponse, chacun improvise, et l&apos;on se retrouve avec trois bougies parfumées et aucun des livres
        qu&apos;on attendait. Une liste règle trois problèmes d&apos;un coup :
      </p>
      <ul>
        <li><strong>les proches ne sèchent plus</strong> : ils piochent une idée qui fera vraiment plaisir ;</li>
        <li><strong>les doublons disparaissent</strong> : une idée réservée est signalée aux autres ;</li>
        <li><strong>la surprise reste</strong> : vous savez ce que vous avez demandé, pas ce que vous allez recevoir, ni de qui.</li>
      </ul>
      <p>
        C&apos;est aussi plus simple pour vous : au lieu de répondre dix fois à la même question, vous envoyez un seul lien.
      </p>

      <h2>Comment créer sa liste d&apos;anniversaire en ligne&nbsp;?</h2>
      <p>Avec Qui Offre, il n&apos;y a ni compte à créer ni application à installer :</p>
      <ol>
        <li>
          Ouvrez <Link href="/liste/nouvelle">Créer une liste</Link>, choisissez « Anniversaire », indiquez le prénom de la
          personne fêtée et, si vous voulez, la date et un petit mot pour vos proches.
        </li>
        <li>
          Ajoutez vos idées. Le plus rapide : collez le lien d&apos;un article repéré sur une boutique en ligne, le titre,
          l&apos;image et le prix se remplissent souvent tout seuls. Vous pouvez aussi écrire une idée libre (« un cours de
          poterie »).
        </li>
        <li>
          Partagez le lien de la liste dans la conversation de famille ou d&apos;amis. Gardez pour vous l&apos;autre lien, celui
          qui permet de modifier la liste : laissez votre e-mail à la création pour le recevoir et ne jamais le perdre.
        </li>
      </ol>
      <p>
        Vos proches ouvrent le lien, choisissent une idée et touchent « Je m&apos;en occupe » en indiquant leur prénom.
        C&apos;est tout.
      </p>

      <AppelAction titre="Votre liste en 30 secondes" texte="Gratuit, sans compte, et vous ne voyez jamais ce qui est réservé." {...APPEL} />

      <h2>Que mettre dans une liste d&apos;anniversaire&nbsp;?</h2>
      <p>
        Une bonne liste laisse du choix sans laisser deviner : variez les budgets et les types d&apos;idées, et donnez les
        précisions qui évitent les erreurs.
      </p>
      <table>
        <thead>
          <tr><th>Type d&apos;idée</th><th>Exemple</th><th>Le détail à ne pas oublier</th></tr>
        </thead>
        <tbody>
          <tr><td>Un objet précis</td><td>Un casque, un jeu de société</td><td>Le lien vers l&apos;article, ou la référence exacte</td></tr>
          <tr><td>Un vêtement, des chaussures</td><td>Un pull, des baskets</td><td>La taille, la couleur, la coupe</td></tr>
          <tr><td>Un livre, une série</td><td>Le prochain tome d&apos;une saga</td><td>Les tomes déjà lus, le format (poche, broché)</td></tr>
          <tr><td>Une expérience</td><td>Un cours, une place de concert</td><td>La ville, les dates possibles</td></tr>
          <tr><td>Un petit plaisir</td><td>Un thé, des chocolats</td><td>Les goûts et les allergies</td></tr>
          <tr><td>Une contribution</td><td>Une participation à un gros projet</td><td>Le projet en une phrase, et à qui s&apos;adresser</td></tr>
        </tbody>
      </table>
      <p>
        Mettez quelques idées à petit prix : tout le monde n&apos;a pas le même budget, et une liste où tout dépasse
        cinquante euros met certains proches mal à l&apos;aise. Pour vous inspirer, voyez nos{" "}
        <Link href="/idees-cadeaux-secret-santa">idées de cadeaux par budget</Link>.
      </p>

      <h2>Comment éviter les doublons sans gâcher la surprise&nbsp;?</h2>
      <p>
        C&apos;est tout l&apos;intérêt d&apos;une liste partagée. Quand un proche réserve une idée, les autres voient « Déjà réservé
        par Tom » et passent à la suivante. Vous, en revanche, ne voyez rien : ni ce qui est réservé, ni par qui. Même si
        vous ouvrez le lien partagé depuis votre propre téléphone, Qui Offre masque les réservations.
      </p>
      <p>
        Un proche change d&apos;avis ? Il peut annuler sa réservation depuis son téléphone, et l&apos;idée redevient libre pour
        les autres. Personne d&apos;autre ne peut annuler à sa place.
      </p>

      <h2>Une liste pour un enfant&nbsp;: comment faire&nbsp;?</h2>
      <p>
        Pour l&apos;anniversaire d&apos;un enfant, c&apos;est généralement un parent qui crée la liste, au prénom de l&apos;enfant. Il
        la remplit en pensant aux grands-parents, parrains, marraines et parents des copains invités, qui demandent souvent
        une idée. Quelques conseils :
      </p>
      <ul>
        <li>précisez l&apos;âge et les goûts du moment dans le mot d&apos;accueil (« fan de dinosaures, déjà tous les Playmobil pirates ») ;</li>
        <li>proposez plusieurs idées autour de quinze ou vingt euros pour les copains de classe ;</li>
        <li>ajoutez la taille des vêtements, qui change vite à cet âge.</li>
      </ul>
      <p>
        Le parent garde le lien pour modifier la liste ; il ne voit pas non plus les réservations, ce qui préserve la
        surprise pour toute la famille.
      </p>

      <h2>Est-ce impoli de partager une liste de cadeaux&nbsp;?</h2>
      <p>
        Ça dépend surtout de la manière. Envoyer une liste à tout le monde sans qu&apos;on l&apos;ait demandée peut sembler
        exigeant ; la donner à ceux qui demandent « qu&apos;est-ce qui te ferait plaisir ? » rend service. Deux habitudes
        aident :
      </p>
      <ul>
        <li>un mot d&apos;accueil qui rappelle que ce ne sont que des suggestions (« toutes les idées sont des pistes, rien n&apos;est obligatoire ») ;</li>
        <li>des idées variées en prix, pour que chacun s&apos;y retrouve.</li>
      </ul>

      <h2>Et pour une naissance, un mariage ou Noël&nbsp;?</h2>
      <p>
        Le principe est le même : en créant la liste, choisissez simplement l&apos;occasion (naissance, mariage, Noël…). Pour
        un échange de cadeaux en groupe où chacun offre à une seule personne tirée au sort, c&apos;est plutôt un{" "}
        <Link href="/secret-santa">Secret Santa</Link> qu&apos;il vous faut ; Qui Offre fait aussi le{" "}
        <Link href="/tirage-au-sort-noel">tirage au sort en ligne</Link>, avec une liste d&apos;envies pour chaque participant.
        Pour aller plus loin sur les listes en général, lisez{" "}
        <Link href="/liste-de-cadeaux">créer et partager sa liste d&apos;envies</Link>.
      </p>

      <AppelAction titre="Créez votre liste d'anniversaire" texte="Collez vos liens, partagez, et laissez vos proches s'organiser." {...APPEL} />

      <Faq
        questions={[
          {
            q: "Comment faire une liste de cadeaux d'anniversaire en ligne ?",
            r: "Sur Qui Offre, ouvrez « Créer une liste », choisissez « Anniversaire » et indiquez un prénom. Ajoutez vos idées (en collant le lien d'un article, le titre, l'image et le prix se remplissent souvent tout seuls), puis partagez le lien de la liste avec vos proches. C'est gratuit et sans compte.",
          },
          {
            q: "La personne fêtée voit-elle ce qui a été réservé ?",
            r: "Non. Les proches voient les réservations des autres, pour éviter les doublons, mais la personne fêtée ne voit jamais ni ce qui est réservé ni par qui, même en ouvrant le lien partagé sur son propre téléphone.",
          },
          {
            q: "Mes proches doivent-ils créer un compte pour réserver ?",
            r: "Non. Ils ouvrent le lien, touchent « Je m'en occupe » et indiquent leur prénom. Leur téléphone s'en souvient, ce qui leur permet d'annuler leur réservation s'ils changent d'avis.",
          },
          {
            q: "Peut-on créer une liste d'anniversaire pour un enfant ?",
            r: "Oui. Un parent crée la liste au prénom de l'enfant, la remplit et la partage avec la famille et les parents des invités. Lui non plus ne voit pas les réservations.",
          },
          {
            q: "J'ai perdu le lien de ma liste, comment le retrouver ?",
            r: "Si vous avez indiqué votre e-mail en créant la liste, la page « Retrouver mes liens » vous renvoie le lien pour la modifier et celui à partager.",
          },
        ]}
      />
    </Article>
  );
}
