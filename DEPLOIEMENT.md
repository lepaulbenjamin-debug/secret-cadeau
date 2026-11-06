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
   Vercel ajoute `www.quioffre.fr` et fait **rediriger `quioffre.fr` vers `www.quioffre.fr`** : gardez ce réglage.
   ⚠️ C'est `www.quioffre.fr` qui est l'adresse principale : l'application mobile
   (`capacitor.config.ts`) et les aperçus de liens (`layout.tsx`) sont réglés dessus.
   Si un jour vous inversez dans Vercel, changez-les aussi.
3. Vercel affiche les enregistrements DNS à créer (un `A` pour `quioffre.fr`, un `CNAME`
   pour `www`). Dans OVH : **Noms de domaine → quioffre.fr → Zone DNS → Ajouter une entrée**,
   recopiez exactement les valeurs données par Vercel, et supprimez les anciennes entrées
   `A` / `CNAME` d'OVH pour ces mêmes noms.
4. Attendez quelques minutes à quelques heures : Vercel passe au vert et installe le HTTPS tout seul.

## 4. Les liens affiliés Amazon (facultatif)

Quand quelqu'un colle un lien Amazon dans sa liste, le lien **affiché** porte votre
identifiant Partenaires (celui d'un tiers éventuel est remplacé). La base garde le
lien d'origine : changer d'identifiant vaut aussitôt pour toutes les listes.

1. Inscrivez-vous au programme **Partenaires Amazon** (<https://partenaires.amazon.fr>)
   et déclarez-y le site `quioffre.fr`. Vous obtenez un identifiant du type `quioffre-21`.
2. Dans Vercel → **Settings → Environment Variables**, ajoutez `AMAZON_TAG_FR` = votre
   identifiant (environnement **Production**), puis **Redeploy**.
3. Pour d'autres boutiques, une variable chacune : `AMAZON_TAG_DE`, `AMAZON_TAG_IT`,
   `AMAZON_TAG_ES`, `AMAZON_TAG_CO_UK`, `AMAZON_TAG_COM`… (un identifiant ne vaut que
   pour sa boutique).

La mention obligatoire « En tant que Partenaire Amazon, Qui Offre réalise un bénéfice
sur les achats remplissant les conditions requises » s'affiche alors en bas de chaque page.
Sans variable, rien ne change.

⚠️ Revenus d'affiliation = usage commercial : l'offre gratuite de Vercel (Hobby) ne
l'autorise pas, il faut passer à l'offre Pro.

## 5. Les rappels par e-mail (Resend)

Les participants qui ont donné leur e-mail reçoivent leur lien au moment du tirage,
puis un rappel une semaine avant et la veille de l'échange. Sans ces réglages,
l'application marche, simplement sans e-mail.

1. Créez un compte sur <https://resend.com> (gratuit jusqu'à 3 000 e-mails/mois).
2. **Domains → Add Domain** → `quioffre.fr`, région **Ireland (eu-west-1)**.
   Resend affiche 3 ou 4 enregistrements DNS (MX et TXT pour `send`, TXT `resend._domainkey`).
   Ajoutez-les chez OVH (**Zone DNS → Ajouter une entrée**), puis **Verify** dans Resend.
   ⚠️ Ne touchez pas aux MX existants d'OVH sur `@` : ceux de Resend sont sur le sous-domaine `send`.
3. **API Keys → Create API Key** (permission *Sending access*), copiez la clé.
4. Dans Vercel → **Settings → Environment Variables** (Production) :
   - `RESEND_API_KEY` = la clé ;
   - `EMAIL_EXPEDITEUR` = `Qui Offre <rappels@quioffre.fr>` ;
   - `CRON_SECRET` = une longue chaîne aléatoire (Vercel l'utilise pour appeler la tâche planifiée ;
     sans elle, la tâche refuse de tourner).
5. **Redeploy**. La tâche part chaque matin vers 9 h (`vercel.json`) ; son bilan est dans
   Vercel → **Logs** (« Rappels : … »).

## 6. Le référencement

1. **Google Search Console** (<https://search.google.com/search-console>) : ajoutez la propriété
   *Domaine* `quioffre.fr` (un enregistrement TXT chez OVH), puis **Sitemaps** →
   `https://www.quioffre.fr/sitemap.xml`.
2. **Bing Webmaster Tools** (<https://www.bing.com/webmasters>) : importez depuis Search Console en
   un clic. Bing alimente aussi Copilot et la recherche de ChatGPT.
3. Rien d'autre à faire pour les assistants d'IA : `robots.txt` les autorise et `/llms.txt`
   leur résume le site.
4. Avant d'en parler autour de vous, complétez l'identité de l'éditeur dans `src/lib/editeur.ts`
   (mentions légales et confidentialité).

## 7. Sur téléphone, sans store

Ouvrez le site dans Safari ou Chrome → **Partager → Sur l'écran d'accueil**.

## 8. Plus tard : les stores (Capacitor)

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

Icônes : `public/icone-1024.png` pour les stores (fond plein, les stores arrondissent eux-mêmes) ; `public/icone-maskable-512.png` pour Android ; `src/app/icon.png` et `apple-icon.png` pour le navigateur et l'iPhone. Logo : `public/logo-clair.png`, `logo-sombre.png` (thème sombre), `logo-grand.png`.

⚠️ L'identifiant `fr.quioffre.app` (dans `capacitor.config.ts`) ne doit plus changer après la première publication.
