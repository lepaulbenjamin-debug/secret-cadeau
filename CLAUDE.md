# Qui Offre — consignes pour Claude

Application de Secret Santa et de listes de cadeaux (www.quioffre.fr), en français.
Next.js 16 (App Router, actions serveur), Prisma + PostgreSQL (Neon), Tailwind 4, Vercel.
Voir `README.md` et `DEPLOIEMENT.md`.

## Interface — à vérifier à chaque changement

- **Listes déroulantes (`<select>`) : la flèche ne doit JAMAIS être collée au bord droit.**
  Toujours la classe `champ` : `globals.css` remplace la flèche du navigateur par une flèche
  dessinée avec une vraie marge (`select.champ`). Un `<select>` sans `champ`, ou un style qui
  rétablit `appearance`, ramène le défaut. Vérifier sur capture d'écran.
- Tester chaque écran au format téléphone (390 px) ET en mode sombre, sans défilement horizontal.
- Contrastes : `--cerise` (#CC3A33) pour les boutons et le texte corail ; `--corail` (#FC5A53,
  couleur du logo) seulement pour le décor. Les noms de variables désignent un rôle : `--sapin`
  est le bleu marine principal.
- Textes en français, vouvoiement, espace insécable avant « ? ! : » dans les titres.

## Code

- **Jamais `throw` pour un refus attendu dans une action serveur** : en production, Next masque
  le message (« Minified React error #441 »). Renvoyer `{ erreur }` (type `Refus` ou `Etat`).
- Le jeton d'un lien EST l'identité : ne jamais afficher le jeton, le `destinataireId` ni les
  coordonnées d'un participant sur la page d'un autre. L'organisateur ne voit jamais qui offre à qui.
- **Aucun e-mail ne nomme la personne tirée.**
- Amazon : jamais de récupération de ses pages (contrat Partenaires) ; l'identifiant d'affiliation
  est posé à l'affichage (`src/lib/affiliation.ts`).
- Migrations : écrites à la main dans `prisma/migrations/`, puis vérifiées avec
  `prisma migrate diff --from-migrations … --to-schema-datamodel …` (doit répondre « No difference »).
- Après un changement : `npm test`, `npx tsc --noEmit`, `npm run lint`, construction
  (`npm run build:local`), et un parcours réel dans le navigateur (Playwright).

## Livraison

- **Fusionner systématiquement** (consigne du propriétaire) : une fois les vérifications passées,
  pousser la branche, ouvrir la pull request vers `main` et la fusionner, puis vérifier que la
  nouvelle version répond sur https://www.quioffre.fr (quioffre.vercel.app y redirige en 308 :
  vérifier l'adresse finale, pas le code de la première réponse).
