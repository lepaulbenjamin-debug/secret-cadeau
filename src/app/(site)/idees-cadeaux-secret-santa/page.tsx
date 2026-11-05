import type { Metadata } from "next";
import Link from "next/link";

import { AppelAction, Article } from "@/components/site/article";
import { Faq } from "@/components/site/faq";
import { guide } from "@/lib/guides";

const page = guide("/idees-cadeaux-secret-santa");

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
          Pour un Secret Santa, les meilleures idées de cadeaux sont celles qui tombent juste pour le budget fixé : un
          petit plaisir gourmand ou un objet du quotidien à 10 €, un accessoire ou un jeu à 20 €, un objet plus soigné ou
          une expérience à 30 ou 50 €. Mais la meilleure idée reste celle que la personne a notée elle-même dans sa
          liste d&apos;envies.
        </p>
      }
    >
      <h2>Quelle est la meilleure idée de cadeau pour un Secret Santa ?</h2>
      <p>
        Avant de parcourir des listes d&apos;idées, regardez la liste d&apos;envies de la personne que vous avez tirée.
        C&apos;est elle qui sait le mieux ce qui lui ferait plaisir, sa taille, ses couleurs préférées et ce
        qu&apos;elle possède déjà. Si elle a noté « un mug isotherme bleu » avec un lien, vous êtes sûr de viser
        juste.
      </p>
      <p>
        Pas de liste, ou une liste trop courte ? Vous pouvez poser une question anonyme à la personne tirée
        (« plutôt thé ou café ? ») : sur Qui Offre, elle répond sans savoir qui demande. Et si vous êtes toujours en
        panne, les idées ci-dessous sont là pour vous dépanner.
      </p>

      <h2>Quelles idées de cadeaux selon le budget ?</h2>
      <table>
        <thead>
          <tr><th>Budget</th><th>Types d&apos;idées</th><th>Pour qui</th></tr>
        </thead>
        <tbody>
          <tr><td>10 €</td><td>Petit plaisir gourmand, objet du quotidien, clin d&apos;œil</td><td>Collègues, grands groupes</td></tr>
          <tr><td>20 €</td><td>Jeu, accessoire pratique, livre, plante</td><td>Collègues, amis</td></tr>
          <tr><td>30 €</td><td>Coffret thématique, objet de qualité, loisir créatif</td><td>Amis, famille</td></tr>
          <tr><td>50 €</td><td>Bel objet durable, expérience, équipement de loisir</td><td>Famille, amis proches</td></tr>
        </tbody>
      </table>

      <h3>Idées de cadeaux à 10 €</h3>
      <p>À ce prix, on mise sur le petit plaisir ou l&apos;objet utile qu&apos;on n&apos;achète jamais pour soi :</p>
      <ul>
        <li>une paire de chaussettes rigolotes ou de Noël ;</li>
        <li>un assortiment de thés ou de chocolats chauds ;</li>
        <li>un carnet de notes et un joli crayon ;</li>
        <li>une petite plante grasse dans son pot ;</li>
        <li>une bougie parfumée ;</li>
        <li>un jeu de cartes d&apos;apéro ou un petit jeu de poche ;</li>
        <li>une tablette de chocolat artisanal et un mot personnalisé.</li>
      </ul>

      <h3>Idées de cadeaux à 20 €</h3>
      <ul>
        <li>un mug isotherme ou une gourde ;</li>
        <li>un roman ou une bande dessinée (d&apos;après les goûts notés dans la liste) ;</li>
        <li>un jeu de société rapide à expliquer ;</li>
        <li>un plaid léger ou une bouillotte ;</li>
        <li>un kit pour faire pousser des herbes aromatiques ;</li>
        <li>un puzzle ;</li>
        <li>un petit coffret d&apos;épices ou de sauces.</li>
      </ul>

      <h3>Idées de cadeaux à 30 €</h3>
      <ul>
        <li>un coffret dégustation (thés, cafés, confitures) ;</li>
        <li>un kit de loisir créatif : broderie, aquarelle, poterie à modeler ;</li>
        <li>une enceinte ou des écouteurs d&apos;entrée de gamme ;</li>
        <li>un beau livre de cuisine ou de voyage ;</li>
        <li>un jeu de société pour les soirées entre amis ;</li>
        <li>un set de bain ou de soins.</li>
      </ul>

      <h3>Idées de cadeaux à 50 €</h3>
      <ul>
        <li>une expérience : atelier, cours d&apos;initiation, entrée pour une activité ;</li>
        <li>un bel accessoire durable : écharpe, sac, portefeuille ;</li>
        <li>un équipement pour un loisir : petit matériel de randonnée, de yoga ou de jardinage ;</li>
        <li>un appareil de cuisine compact ;</li>
        <li>un abonnement à une box ou à un magazine (si la personne le souhaite) ;</li>
        <li>une lampe de lecture ou de bureau.</li>
      </ul>

      <AppelAction titre="Des idées qui tombent juste" texte="Avec les listes d'envies de Qui Offre, chacun note ce qui lui ferait plaisir. Vous n'avez plus qu'à choisir." />

      <h2>Quelles idées de cadeaux selon le profil ?</h2>

      <h3>Pour un gourmand</h3>
      <ul>
        <li>un coffret de spécialités régionales ;</li>
        <li>des épices du monde ou un sel aromatisé ;</li>
        <li>un pot de pâte à tartiner artisanale ;</li>
        <li>un moule ou un ustensile de pâtisserie original.</li>
      </ul>

      <h3>Pour un sportif</h3>
      <ul>
        <li>une gourde isotherme ;</li>
        <li>une serviette microfibre ;</li>
        <li>des bandes élastiques d&apos;exercice ;</li>
        <li>une lampe frontale pour courir l&apos;hiver.</li>
      </ul>

      <h3>Pour un lecteur</h3>
      <ul>
        <li>un roman d&apos;un auteur qu&apos;il aime (vérifiez sa liste pour éviter qu&apos;il l&apos;ait déjà) ;</li>
        <li>un marque-page original ;</li>
        <li>une petite lampe de lecture à clipser ;</li>
        <li>un carnet pour noter ses lectures.</li>
      </ul>

      <h3>Pour un télétravailleur</h3>
      <ul>
        <li>un support d&apos;ordinateur portable ou de téléphone ;</li>
        <li>un tapis de souris confortable ;</li>
        <li>un mug chauffant ou isotherme ;</li>
        <li>une plante de bureau facile à vivre ;</li>
        <li>des chaussons chauds pour les journées à la maison.</li>
      </ul>

      <h3>Pour un enfant</h3>
      <ul>
        <li>un livre adapté à son âge ;</li>
        <li>un jeu de construction ou un kit d&apos;expériences ;</li>
        <li>des feutres, un carnet de coloriage ou des gommettes ;</li>
        <li>un jeu de cartes familial.</li>
      </ul>
      <p>Pour un enfant, demandez toujours conseil aux parents : ils connaissent ses goûts et ce qu&apos;il a déjà.</p>

      <h3>Pour quelqu&apos;un qui a déjà tout</h3>
      <ul>
        <li>un consommable de qualité : café, thé, huile d&apos;olive, chocolat ;</li>
        <li>une expérience plutôt qu&apos;un objet ;</li>
        <li>un cadeau fait main : biscuits, confiture, carte illustrée.</li>
      </ul>

      <h2>Quels cadeaux éviter pour un Secret Santa ?</h2>
      <ul>
        <li><strong>L&apos;alcool</strong>, sauf si la personne l&apos;a demandé : tout le monde n&apos;en boit pas.</li>
        <li><strong>Les vêtements à la taille devinée</strong> : sans taille dans la liste, abstenez-vous.</li>
        <li><strong>Les parfums et cosmétiques</strong> : très personnels, souvent à côté.</li>
        <li><strong>Les cadeaux « blagues » vexants</strong>, surtout entre collègues.</li>
        <li><strong>Dépasser le budget</strong> : cela met mal à l&apos;aise les autres participants.</li>
      </ul>

      <h2>Comment éviter d&apos;offrir la même chose qu&apos;un autre ?</h2>
      <p>
        Dans un Secret Santa classique, chacun offre à une personne différente, donc le risque de doublon est faible.
        Mais si plusieurs personnes offrent un cadeau à la même personne (un enfant de la famille, par exemple), les
        réservations sont précieuses : sur Qui Offre, on clique sur « Je m&apos;en occupe » et les autres voient que
        l&apos;idée est prise, sans que la personne concernée ne le sache. Notre guide pour{" "}
        <Link href="/liste-de-cadeaux">créer une liste de cadeaux</Link> explique le fonctionnement.
      </p>
      <p>
        Vous cherchez des idées pour un contexte précis ? Voyez nos guides{" "}
        <Link href="/secret-santa-entre-collegues">Secret Santa entre collègues</Link> et{" "}
        <Link href="/secret-santa-en-famille">Secret Santa en famille</Link>.
      </p>

      <Faq
        questions={[
          {
            q: "Que peut-on offrir pour un Secret Santa à 10 € ?",
            r: "À 10 €, misez sur un petit plaisir ou un objet du quotidien : chaussettes de Noël, assortiment de thés, carnet et crayon, petite plante grasse, bougie ou jeu de cartes d'apéro.",
          },
          {
            q: "Quel cadeau offrir à quelqu'un qu'on connaît mal ?",
            r: "Regardez d'abord sa liste d'envies. Sans liste, choisissez un cadeau consommable ou utile qui plaît à presque tout le monde : chocolat, thé, mug isotherme, plante facile à vivre. Vous pouvez aussi lui poser une question anonyme sur ses goûts.",
          },
          {
            q: "Peut-on offrir un cadeau fait main pour un Secret Santa ?",
            r: "Oui, et c'est souvent très apprécié : biscuits, confiture, bougie ou carte illustrée. Respectez simplement le budget en coût de matériel et soignez l'emballage.",
          },
          {
            q: "Peut-on offrir de l'argent ou une carte cadeau ?",
            r: "C'est possible si le groupe l'accepte, mais cela enlève une partie du plaisir de la surprise. Une idée tirée de la liste d'envies de la personne est généralement plus appréciée.",
          },
          {
            q: "L'emballage est-il compris dans le budget ?",
            r: "C'est à l'organisateur de le préciser au départ. Le plus simple est de dire que le budget concerne le cadeau seul et que chacun emballe à sa façon.",
          },
        ]}
      />
    </Article>
  );
}
