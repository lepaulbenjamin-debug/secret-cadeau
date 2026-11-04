# Mettre Qui Offre en ligne

Coût : **0 €** (offres gratuites Neon et Vercel) + le nom de domaine (~10 €/an).
Comptez 15 minutes pour les étapes 1 et 2, 10 minutes pour l'étape 3.

---

## 1. La base de données — Neon

1. Sur <https://console.neon.tech>, **New Project**.
2. Nom : `quioffre`. Région : **AWS Europe Central 1 (Frankfurt)** — ne se change plus ensuite.
3. Une fois créé, bouton **Connect** : copiez l'adresse qui commence par `postgresql://…`
   (gardez-la de côté, c'est un mot de passe).

## 2. Le site — Vercel

1. Sur <https://vercel.com/new>, importez le dépôt GitHub **`secret-cadeau`**.
   (Si Vercel ne le voit pas : *Adjust GitHub App Permissions* → autoriser ce dépôt.)
2. Nom du projet : `quioffre`.
3. Déroulez **Environment Variables** et ajoutez :
   - Nom : `DATABASE_URL` — Valeur : l'adresse Neon de l'étape 1.
4. **Deploy**. Au premier déploiement, la base est créée automatiquement (migrations).
5. Le site répond sur `https://quioffre.vercel.app` (ou un nom proche que Vercel affiche).
   Créez un groupe pour essayer.

⚠️ La variable doit être réservée à l'environnement **Production** (c'est le cas si
vous l'ajoutez à l'import ; sinon *Settings → Environment Variables*, décochez
*Preview*). Sans cela, chaque branche poussée sur GitHub lirait les vrais groupes.

> Facultatif, pour essayer une branche avant de la fusionner : dans Neon, créez une
> branche `apercu` et mettez son adresse dans `DATABASE_URL_APERCU`, environnement
> **Preview** uniquement.

## 3. Le nom de domaine — `quioffre.fr`

1. Achetez `quioffre.fr` chez OVH (le `.com` en plus si vous voulez le protéger).
2. Dans Vercel : projet `quioffre` → **Settings → Domains** → ajoutez `quioffre.fr`.
   Vercel propose d'ajouter aussi `www.quioffre.fr` en **redirection vers `quioffre.fr`** : acceptez.
   ⚠️ C'est bien `quioffre.fr` (sans www) qui doit être l'adresse principale : l'application
   mobile et les aperçus de liens sont réglés dessus.
3. Vercel affiche les enregistrements DNS à créer (un `A` pour `quioffre.fr`, un `CNAME`
   pour `www`). Dans OVH : **Noms de domaine → quioffre.fr → Zone DNS → Ajouter une entrée**,
   recopiez exactement les valeurs données par Vercel, et supprimez les anciennes entrées
   `A` / `CNAME` d'OVH pour ces mêmes noms.
4. Attendez quelques minutes à quelques heures : Vercel passe au vert et installe le HTTPS tout seul.

## 4. Sur téléphone, sans store

Ouvrez le site dans Safari ou Chrome → **Partager → Sur l'écran d'accueil**.

## 5. Plus tard : les stores (Capacitor)

Sur le Mac :

```bash
npx cap add ios && npx cap add android
```

```bash
npx cap sync
```

```bash
npx cap open ios        # Xcode → Archive → App Store Connect
```

```bash
npx cap open android    # Android Studio → Build → Generate Signed Bundle
```

Icônes : `public/icone-1024.png` ; `node scripts/icones.mjs` les régénère depuis `src/app/icon.svg`.

⚠️ L'identifiant `fr.quioffre.app` (dans `capacitor.config.ts`) ne doit plus changer après la première publication.
