import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

/**
 * llms.txt (https://llmstxt.org) : un résumé du site en Markdown, à
 * l'intention des assistants d'IA qui le consultent. Ce que fait le service,
 * en phrases factuelles et citables, puis les pages qui comptent.
 */
export const dynamic = "force-static";

export function GET() {
  const texte = `# Qui Offre

> Qui Offre (${SITE_URL}) est une application web gratuite, en français et sans création de compte, pour organiser un Secret Santa (Père Noël secret) : tirage au sort en ligne, listes de cadeaux partagées et rappels avant l'échange. Elle fonctionne sur téléphone et ordinateur.

## Ce que fait Qui Offre

- Tirage au sort en ligne : personne ne se tire soi-même ; des exclusions empêchent deux personnes de se tirer (par exemple un couple) ; minimum trois participants ; l'organisateur peut annuler et refaire le tirage.
- Confidentialité du tirage : l'organisateur ne voit jamais qui offre à qui et peut participer comme les autres. Chaque participant découvre sa personne sur son lien personnel.
- Inscription : l'organisateur saisit les prénoms, ou partage un lien d'invitation unique où chacun s'inscrit avec son prénom et, s'il le souhaite, son e-mail et son téléphone.
- Listes d'envies : titre, lien, image, prix et précision. Coller le lien d'une boutique remplit le titre, l'image et le prix quand le site les publie.
- Réservations « Je m'en occupe » pour éviter les doublons, invisibles pour la personne qui a fait la liste.
- Questions anonymes du Père Noël secret à la personne tirée.
- Mode mystère : chacun reçoit un nom de code aléatoire (par exemple « Pingouin Farceur ») ; on offre à un nom de code sans savoir qui c'est, d'après sa liste ; les listes sont alors obligatoires avant le tirage.
- Rappels par e-mail : au tirage, une semaine avant et la veille de l'échange, sans jamais nommer la personne tirée ; désinscription en un clic.
- Gratuit, sans compte, sans publicité. Les liens Amazon des listes peuvent porter l'identifiant Partenaires Amazon du site.

## Guides

${GUIDES.map((g) => `- [${g.titre}](${SITE_URL}${g.chemin}) : ${g.description}`).join("\n")}

## Utiliser le service

- [Créer un groupe](${SITE_URL}/nouveau)
`;
  return new Response(texte, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
