# 🎁 Qui Offre

**Qui offre à qui ?** Tirage au sort du Père Noël secret et listes de cadeaux partagées, sur le web et sur téléphone — [quioffre.fr](https://quioffre.fr).

## Ce que ça fait

- **Créer un groupe** en deux minutes : nom, date de l'échange, budget, prénoms des participants. Aucun compte à créer.
- **Lien d'invitation** : un seul lien pour le groupe, chacun s'inscrit avec son prénom, son e-mail et son téléphone (visibles de l'organisateur seul).
- **Un lien personnel par participant**, envoyé depuis le bouton « Envoyer », ou en SMS / e-mail prérempli quand la personne a laissé ses coordonnées.
- **Exclusions** : les couples ne se tirent pas l'un l'autre.
- **Tirage au sort** : personne ne se tire soi-même ; si les exclusions le rendent impossible, on le dit.
- **Révélation** : chacun découvre à qui il offre en « ouvrant le paquet ».
- **Listes d'envies** (titre, lien, image, prix, précision), visibles par tout le groupe. **Coller un lien remplit l'idée** (titre, image, prix) quand le site les publie ; pour Amazon, titre tiré de l'adresse (`src/lib/apercu.ts`).
- **Réservations sans doublon** : « Je m'en occupe ». Le propriétaire de la liste ne le voit **jamais**.
- **Questions anonymes** à la personne qu'on a tirée.
- **Mode mystère** : chacun reçoit un nom de code marrant (« Pingouin Farceur 🐧 », `src/lib/noms-de-code.ts`). On offre à un nom de code sans savoir qui c'est, d'après sa seule liste, et on l'écrit sur le paquet. Listes obligatoires avant le tirage (sauf si l'organisateur force).
- **Liens affiliés Amazon** : les liens Amazon des listes portent notre identifiant Partenaires (`src/lib/affiliation.ts`, variable `AMAZON_TAG_FR`).
- **Suivi pour l'organisateur** : qui a ouvert son lien, combien d'idées — sans jamais voir le tirage.
- **Sur cet appareil** : les liens ouverts sont retrouvés depuis l'accueil.

- **Rappels par e-mail** : au tirage, une semaine avant et la veille (`src/lib/rappels.ts`, tâche quotidienne `/api/cron/rappels`), désinscription en un clic.
- **Site public** optimisé pour le référencement classique et par les assistants d'IA : guides (`src/app/(site)`), `sitemap.xml`, `robots.txt`, `llms.txt`, données structurées.

## Technique

Next.js 16 (actions serveur), Prisma + PostgreSQL (Neon), Tailwind 4, hébergement Vercel. Installable depuis le navigateur (PWA) ; coquille Capacitor prête pour les stores.

| Fichier | Rôle |
| --- | --- |
| `prisma/schema.prisma` | Groupes, participants, exclusions, idées, questions |
| `src/lib/tirage.ts` | L'algorithme de tirage (testé dans `tirage.test.ts`) |
| `src/app/actions.ts` | Toutes les écritures, avec contrôle du jeton |
| `src/app/g/[jeton]` | Espace organisateur |
| `src/app/p/[jeton]` | Espace d'un participant |
| `scripts/migrer.mjs` | Migrations au déploiement, jamais sur la base de production depuis un aperçu |
| `capacitor.config.ts`, `coquille/` | Application mobile |

## Lancer en local

```bash
npm install
cp .env.example .env   # puis renseigner DATABASE_URL
npx prisma migrate dev
npm run dev
```

Tests : `npm test` · Vérifications : `npx tsc --noEmit && npm run lint`

Mise en ligne : voir [DEPLOIEMENT.md](DEPLOIEMENT.md).
