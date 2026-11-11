# Publier Qui Offre sur le Play Store

Même chemin que Petsitia, en plus simple : le compte est facultatif et sans mot de passe
(donc pas de compte de test à fournir à Google), pas de notifications natives (donc
pas de Firebase). Le bundle se construit dans GitHub Actions, sans Android Studio.

L'application est une **coquille** : elle charge `https://www.quioffre.fr` (voir
`capacitor.config.ts`). Une mise à jour du site est donc aussitôt dans l'application,
sans repasser par le Play Store. On ne renvoie un bundle que si la coquille change
(icône, nom, réglages natifs, version de Capacitor).

---

## 1. Une fois : la clé de téléversement

Sur le Mac, dans le dossier du projet :

```bash
bash scripts/android-cle.sh
```

Le script demande un mot de passe (12 caractères au moins), crée
`~/Documents/quioffre-cles/quioffre-televersement.p12` (hors du dépôt) et copie son
contenu encodé dans le presse-papiers.

⚠️ **Le fichier et le mot de passe vont dans votre gestionnaire de mots de passe.**
Perdue, la clé ne se remplace que par le support de Google. Une clé par application :
ne réutilisez pas celle de Petsitia.

## 2. Une fois : les deux secrets GitHub

GitHub → dépôt `secret-cadeau` → *Settings* → *Secrets and variables* → *Actions* →
*New repository secret* :

| Secret | Contenu |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | le presse-papiers juste après `android-cle.sh` |
| `ANDROID_KEYSTORE_PASSWORD` | le mot de passe choisi |

## 3. Construire le bundle

GitHub → onglet **Actions** → « **Android — bundle signé** » → **Run workflow**
(version affichée : `1.0`). Comptez une dizaine de minutes.

Le bundle est en bas de la page du passage, dans **Artifacts** → `quioffre-aab` (un
`.zip` qui contient `quioffre-N.aab`). `N` est le numéro du passage : il ne fait que
monter, Google ne le refusera jamais pour ça.

Le script vérifie, avant de construire, que l'identifiant est bien `fr.quioffre.app`.
Se tromper publierait une seconde application, sous une identité jamais reprenable.

---

## 4. Play Console — créer l'application

Dans le **même compte développeur que Petsitia** (pas de nouveaux frais) :
*Toutes les applications* → **Créer une application**.

| Champ | À saisir |
| --- | --- |
| Nom de l'application | `Qui Offre : Secret Santa` |
| Langue par défaut | Français (France) – fr-FR |
| Application ou jeu | Application |
| Gratuite ou payante | Gratuite |

## 5. Test interne — *Tests → Test interne*

1. **Créer une release** → **Signature d'application par Google Play** : *Continuer*
   (votre clé devient la clé de téléversement).
2. **Importer** `quioffre-N.aab`.
3. **Notes de version** :

```
<fr-FR>
Première version : tirage au sort du Père Noël secret avec exclusions, listes d'envies partagées, réservations sans doublon, questions anonymes, mode mystère et listes de cadeaux d'anniversaire.
</fr-FR>
```

4. **Testeurs** : créez une liste « Équipe Qui Offre » avec votre adresse Gmail (celle
   du compte Google du téléphone), enregistrez, et ouvrez le **lien d'inscription**
   sur le téléphone pour installer l'application.

## 6. La recette, sur un vrai téléphone Android

Dans cet ordre, avant de parler de production :

1. L'icône sur l'écran d'accueil est le paquet corail, sans bord blanc, et le nom est
   « Qui Offre ».
2. Au lancement : écran crème avec le logo, puis l'accueil du site, **sans** barre
   d'adresse.
3. Le haut de l'écran n'est pas masqué par la barre d'état (heure, batterie).
4. Créer un groupe, ouvrir un lien personnel, révéler la personne tirée.
5. « Envoyer » ouvre la **feuille de partage d'Android** (WhatsApp, SMS…).
6. Un lien de boutique (Amazon, Fnac…) s'ouvre dans le navigateur ou l'application de
   la boutique, et le bouton retour ramène dans Qui Offre.
7. Le bouton retour d'Android revient à la page précédente, puis quitte l'application.
8. Mode avion au lancement : l'écran « Pas de connexion » s'affiche, et « Réessayer »
   fonctionne une fois le réseau revenu.

---

## 7. Fiche du Store — *Développer → Présence sur le Store → Fiche principale*

| Champ | À saisir |
| --- | --- |
| Nom de l'application (≤ 30) | `Qui Offre : Secret Santa` |
| Description courte (≤ 80) | `Tirage au sort du Père Noël secret et listes de cadeaux. Gratuit, sans compte.` |
| Icône (512 × 512) | `store/play/icone-512.png` |
| Image de présentation (1024 × 500) | `store/play/banniere-1024x500.png` |
| Captures téléphone (1080 × 1920) | `store/play/capture-1.png` à `capture-6.png` |

**Description complète** :

```
Qui Offre organise votre Père Noël secret (Secret Santa) en deux minutes, et vos listes de cadeaux toute l'année. Gratuit, sans compte, sans publicité.

LE TIRAGE AU SORT
Créez un groupe, ajoutez les participants ou partagez un seul lien d'invitation. Personne ne se tire soi-même, et les couples peuvent s'exclure. Même l'organisateur ne sait pas qui offre à qui : il peut participer comme les autres. Quelqu'un se désiste ? Le tirage s'ajuste pour une ou deux personnes seulement.

LES LISTES D'ENVIES
Chacun note ses idées de cadeaux : collez le lien d'une boutique, le titre, l'image et le prix se remplissent souvent tout seuls. « Je m'en occupe » réserve une idée pour éviter les doublons… et la personne concernée ne voit jamais ce qui a été réservé.

DES QUESTIONS ANONYMES
« Tu chausses du combien ? » : posez la question à la personne que vous avez tirée, sans vous trahir.

LE MODE MYSTÈRE
Chacun reçoit un nom de code marrant, comme « Pingouin Farceur ». Vous offrez à un nom de code sans savoir qui se cache derrière, d'après sa seule liste, et vous l'écrivez sur le paquet.

DES RAPPELS
Par e-mail : votre lien au moment du tirage, puis un rappel une semaine avant et la veille de l'échange.

LES LISTES D'ANNIVERSAIRE
Hors Secret Santa aussi : une liste de cadeaux à partager pour un anniversaire, une naissance ou un mariage. Vos proches réservent, vous gardez la surprise.

En famille, entre amis ou entre collègues : Qui Offre s'occupe du tirage, vous des cadeaux.
```

**Coordonnées** (même écran, plus bas) :

| Champ | À saisir |
| --- | --- |
| Adresse e-mail | `contact@creawebconseil.fr` |
| Site Web | `https://www.quioffre.fr` |
| Politique de confidentialité | `https://www.quioffre.fr/confidentialite` |

**Catégorie** : *Application* → **Style de vie**. Tags : Fêtes, Cadeaux.

---

## 8. Contenu de l'application — *Politique → Contenu de l'application*

| Déclaration | Réponse |
| --- | --- |
| **Politique de confidentialité** | `https://www.quioffre.fr/confidentialite` |
| **Annonces** | **Non**, l'application ne contient pas d'annonces |
| **Accès à l'application** | **Toutes les fonctionnalités sont disponibles sans accès spécial** (le compte est facultatif : connexion par e-mail, sans mot de passe) |
| **Public cible** | **18 ans et plus** ; ne s'adresse pas aux enfants (les groupes sont créés par des adultes) |
| **Applications d'actualités, COVID-19, gouvernementales** | Non |
| **Fonctionnalités financières** | Aucune |
| **Applications de santé** | Non |

Si Google demande des instructions malgré tout :

```
No account is needed. Open the app, tap "Organiser un tirage au sort", enter a group name and at least three first names, then "Lancer le tirage au sort". Each participant's private link is available on the organizer page ("Envoyer"). Birthday gift lists: "Créer ma liste de cadeaux" on the home page.
```

### Classification du contenu (questionnaire IARC)

- Catégorie : **Utilitaire, productivité, communication ou autre**.
- Violence, contenu sexuel, langage grossier, substances, jeux d'argent : **Non** à tout.
- Les utilisateurs peuvent-ils interagir ou échanger du contenu ? **Oui** (listes
  d'envies partagées, questions anonymes au sein d'un groupe privé).
- Partage de la position : **Non**. Achats numériques : **Non**.
- Accès libre à Internet (navigateur non restreint) : **Non**.

### Sécurité des données

Cohérent avec `https://www.quioffre.fr/confidentialite`.

- **Collecte ou partage de données ?** Oui (collecte uniquement).
- **Chiffrées en transit ?** Oui (HTTPS uniquement).
- **Suppression du compte** (exigée dès qu'on peut créer un compte) : dans l'application,
  *Mon espace* → « Supprimer mon compte ». URL à déclarer : `https://www.quioffre.fr/compte`
  (après connexion, même bouton), ou demande à `contact@creawebconseil.fr`.
- **Moyen de demander la suppression ?** Oui : l'organisateur supprime le groupe ou un
  participant depuis sa page ; la personne fêtée supprime sa liste ; et sur demande à
  `contact@creawebconseil.fr`. URL : `https://www.quioffre.fr/confidentialite`.

Types de données **collectées**, toutes **non partagées** (les hébergeurs qui les
traitent pour notre compte ne comptent pas comme un partage), finalité
**Fonctionnalités de l'application** :

| Catégorie Play | Type | Obligatoire ? | Pourquoi |
| --- | --- | --- | --- |
| Informations personnelles | Nom | Oui | le prénom, pour le tirage et les listes |
| Informations personnelles | Adresse e-mail | Non (facultative) | envoyer les liens et les rappels ; compte facultatif |
| Informations personnelles | Numéro de téléphone | Non (facultatif) | permettre à l'organisateur d'envoyer le lien par SMS |
| Messages | Autres messages dans l'application | Oui | questions anonymes et leurs réponses |
| Contenus générés par l'utilisateur | Autres contenus | Oui | idées de cadeaux des listes |

**Aucune** donnée de : position, informations financières, santé, photos, contacts,
identifiants de l'appareil, activité dans l'appli, navigation, fichiers, agenda.

---

## 9. Production

1. Compte **organisation** (comme pour Petsitia) : pas de test fermé obligatoire. Sur un
   compte personnel récent, Google exige d'abord un test fermé avec 12 testeurs
   pendant 14 jours.
2. Toutes les déclarations du § 8 au vert, la fiche du § 7 complète.
3. **Production → Créer une release** → **Ajouter depuis la bibliothèque** (le bundle du
   test interne), mêmes notes de version.
4. Premier examen par Google : de quelques heures à quelques jours.

⚠️ **La règle de Google sur les applications « vue web »** : une application qui se
contente d'afficher un site qu'on ne possède pas est refusée. Ici, c'est notre propre
service, qui s'utilise comme une application (pas de barre d'adresse, partage natif,
écran hors connexion) : c'est admis. Si Google le conteste, répondre que Qui Offre est
le service de l'éditeur, et que l'application en est le client mobile.

## 10. Régénérer les visuels

Après un changement d'écran, avec l'application lancée en local sur une base de
développement :

```bash
npm run build:local && npx next start -p 3100
```

```bash
BASE=http://localhost:3100 NODE_PATH=$(npm root -g) node scripts/visuels-play.mjs
```
