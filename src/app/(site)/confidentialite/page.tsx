import type { Metadata } from "next";
import Link from "next/link";

import { Article } from "@/components/site/article";
import { EDITEUR } from "@/lib/editeur";
import { guide } from "@/lib/guides";

const page = guide("/confidentialite");

export const metadata: Metadata = {
  title: page.titre,
  description: page.description,
  alternates: { canonical: page.chemin },
};

export default function Confidentialite() {
  return (
    <Article
      page={page}
      resume={
        <p>
          Qui Offre ne demande ni compte ni mot de passe. Il conserve uniquement ce qu&apos;il faut pour faire fonctionner
          votre tirage et vos listes, ne le vend à personne et n&apos;affiche aucune publicité.
        </p>
      }
    >
      <h2>Qui est responsable de vos données ?</h2>
      <p>
        {EDITEUR.nom}, joignable à l&apos;adresse {EDITEUR.contact}. Voir aussi les <Link href="/mentions-legales">mentions légales</Link>.
      </p>

      <h2>Quelles données, et pourquoi ?</h2>
      <table>
        <thead>
          <tr><th>Donnée</th><th>À quoi elle sert</th><th>Qui la voit</th></tr>
        </thead>
        <tbody>
          <tr><td>Nom du groupe, date, budget, message</td><td>Organiser l&apos;échange</td><td>Les membres du groupe</td></tr>
          <tr><td>Prénom (et nom de code en mode mystère)</td><td>Faire le tirage, afficher les listes</td><td>Les membres du groupe (seulement le nom de code en mode mystère)</td></tr>
          <tr><td>E-mail de l&apos;organisateur (facultatif)</td><td>Lui envoyer son lien d&apos;organisateur, le relancer si le tirage tarde</td><td>Personne</td></tr>
          <tr><td>E-mail et téléphone (facultatifs)</td><td>Vous renvoyer votre lien, vous envoyer les rappels</td><td>L&apos;organisateur uniquement</td></tr>
          <tr><td>Résultat du tirage</td><td>Vous dire à qui vous offrez</td><td>Vous seul</td></tr>
          <tr><td>Listes d&apos;envies, réservations, questions anonymes</td><td>Le fonctionnement du jeu</td><td>Le groupe (réservations cachées au propriétaire de la liste, auteur des questions caché)</td></tr>
        </tbody>
      </table>
      <p>
        La base légale est l&apos;exécution du service que vous utilisez. Les e-mails de rappel reposent sur votre choix de
        donner votre adresse ; vous pouvez les couper à tout moment, en un clic depuis l&apos;e-mail ou dans « Mes coordonnées
        et rappels ».
      </p>

      <h2>Sur votre appareil</h2>
      <p>
        Pour retrouver vos groupes sans compte, Qui Offre garde sur votre appareil (stockage local du navigateur) la liste
        des liens que vous avez ouverts. Elle n&apos;est jamais envoyée à nos serveurs. Le site n&apos;utilise aucun cookie de
        mesure d&apos;audience ni de publicité.
      </p>

      <h2>Nos prestataires</h2>
      <ul>
        <li>Vercel : hébergement du site.</li>
        <li>Neon : hébergement de la base de données, dans l&apos;Union européenne (Francfort).</li>
        <li>Resend : envoi des e-mails de rappel.</li>
      </ul>
      <p>
        Lorsque vous suivez un lien vers une boutique (Amazon ou autre), vous quittez Qui Offre : c&apos;est alors la politique
        de confidentialité de cette boutique qui s&apos;applique.
      </p>

      <h2>Combien de temps ?</h2>
      <p>
        Les données d&apos;un groupe sont conservées tant que le groupe existe. L&apos;organisateur peut retirer un participant
        (ses données et sa liste sont alors effacées) ou supprimer le groupe entier depuis sa page : tout est alors effacé
        définitivement. Vous pouvez aussi nous demander la suppression d&apos;un groupe ou de vos données.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez accéder à vos données, les rectifier (directement dans votre espace), les faire effacer ou vous opposer
        à leur utilisation en écrivant à {EDITEUR.contact}. En cas de désaccord, vous pouvez saisir la CNIL (cnil.fr).
      </p>
    </Article>
  );
}
