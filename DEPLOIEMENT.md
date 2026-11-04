# Mettre Secret Cadeau en ligne

Même parcours que Petsitia, en plus court : pas d'e-mails, pas de paiement.

## 1. La base de données (Neon)

1. Sur <https://neon.tech>, créez un projet `secret-cadeau`, région **Europe (Frankfurt)**.
2. Copiez la *connection string* de la branche `production`.

## 2. Le site (Vercel)

1. Sur <https://vercel.com>, **Add New → Project**, importez le dépôt `secret-cadeau`.
2. Dans **Environment Variables**, ajoutez `DATABASE_URL` = l'adresse Neon (environnement *Production*).
3. **Deploy**. La commande de build applique les migrations (`prisma migrate deploy`) puis construit le site.

⚠️ Ne mettez pas l'adresse de production dans l'environnement *Preview* : chaque branche poussée migrerait la vraie base. Créez plutôt une branche Neon `apercu` et donnez son adresse à *Preview*.

Le site est alors en ligne sur `secret-cadeau.vercel.app` (ou votre domaine : **Settings → Domains**).

## 3. Sur téléphone, sans store

Ouvrez le site dans Safari ou Chrome → **Partager → Sur l'écran d'accueil**. L'icône lance l'application en plein écran.

## 4. Sur les stores (Capacitor)

Si vous utilisez un domaine à vous, indiquez-le avant de construire :

```bash
export HOTE_PUBLIC=www.votre-domaine.fr
```

Puis, sur le Mac :

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

Les icônes sont dans `public/` (`icone-1024.png` pour les stores) ; `node scripts/icones.mjs` les régénère depuis `src/app/icon.svg`.

⚠️ L'identifiant `fr.secretcadeau.app` (dans `capacitor.config.ts`) ne doit plus changer après la première publication.
