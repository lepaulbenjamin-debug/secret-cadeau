# 🎁 Qui Offre

**Qui offre à qui ?** Tirage au sort du Père Noël secret et listes de cadeaux partagées, sur le web et sur téléphone — [quioffre.fr](https://quioffre.fr).

## Ce que ça fait

- **Créer un groupe** en deux minutes : nom, date de l'échange, budget, prénoms des participants. Aucun compte à créer.
- **Un lien personnel par participant**, à envoyer par SMS / WhatsApp / e-mail depuis le bouton « Envoyer ».
- **Exclusions** : les couples ne se tirent pas l'un l'autre.
- **Tirage au sort** : personne ne se tire soi-même ; si les exclusions le rendent impossible, on le dit.
- **Révélation** : chacun découvre à qui il offre en « ouvrant le paquet ».
- **Listes d'envies** (titre, lien, prix, précision), visibles par tout le groupe.
- **Réservations sans doublon** : « Je m'en occupe ». Le propriétaire de la liste ne le voit **jamais**.
- **Questions anonymes** à la personne qu'on a tirée.
- **Suivi pour l'organisateur** : qui a ouvert son lien, combien d'idées — sans jamais voir le tirage.
- **Sur cet appareil** : les liens ouverts sont retrouvés depuis l'accueil.

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
