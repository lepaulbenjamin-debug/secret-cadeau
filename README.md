# 🎁 Secret Cadeau

Tirage au sort du Père Noël secret et listes de cadeaux partagées, sur le web et sur téléphone.

## Ce que ça fait

- **Créer un groupe** en deux minutes : nom, date de l'échange, budget, prénoms des participants. Aucun compte à créer.
- **Un lien personnel par participant**, à envoyer par SMS / WhatsApp / e-mail depuis le bouton « Envoyer » (feuille de partage du téléphone).
- **Exclusions** : les couples (ou ceux qui s'offrent déjà un cadeau) ne se tirent pas l'un l'autre.
- **Tirage au sort** : personne ne se tire soi-même ; si les exclusions rendent le tirage impossible, on le dit.
- **Révélation** : chacun découvre à qui il offre en « ouvrant le paquet » sur son lien.
- **Listes d'envies** : titre, lien, prix, précision. Tout le groupe les voit.
- **Réservations sans doublon** : « Je m'en occupe » sur une idée. Le propriétaire de la liste ne le voit **jamais**.
- **Questions anonymes** : on pose une question à la personne qu'on a tirée, elle répond sans savoir qui demande.
- **Suivi pour l'organisateur** : qui a ouvert son lien, combien d'idées chacun a notées — sans jamais voir le tirage.
- **Mes groupes** : les liens ouverts sont gardés sur l'appareil et retrouvés depuis l'accueil.

## Technique

Même socle que Petsitia : **Next.js 16** (App Router, actions serveur), **Prisma + PostgreSQL**, **Tailwind 4**, hébergement **Vercel**, et une coquille **Capacitor** pour l'App Store et le Play Store (elle charge le site en ligne). Le site est aussi installable depuis le navigateur (manifeste PWA).

| Fichier | Rôle |
| --- | --- |
| `prisma/schema.prisma` | Groupes, participants, exclusions, idées, questions |
| `src/lib/tirage.ts` | L'algorithme de tirage (testé dans `tirage.test.ts`) |
| `src/app/actions.ts` | Toutes les écritures, avec contrôle du jeton |
| `src/app/g/[jeton]` | Espace organisateur |
| `src/app/p/[jeton]` | Espace d'un participant |
| `capacitor.config.ts`, `coquille/` | Application mobile |

## Lancer en local

```bash
npm install
cp .env.example .env   # puis renseigner DATABASE_URL
npx prisma migrate dev
npm run dev
```

Tests : `npm test` · Vérifications : `npx tsc --noEmit && npm run lint`

Mise en ligne et publication sur les stores : voir [DEPLOIEMENT.md](DEPLOIEMENT.md).
