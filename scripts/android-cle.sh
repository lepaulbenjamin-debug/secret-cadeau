#!/usr/bin/env bash
#
# Crée la clé de téléversement Android de Qui Offre, sur le Mac, avec openssl.
#
#     bash scripts/android-cle.sh [dossier]      (défaut : ~/Documents/quioffre-cles)
#
# ⚠️ CETTE CLÉ NE SE REFAIT PAS À LA LÉGÈRE. Elle signe chaque bundle envoyé à
# Google Play ; perdue, il faut passer par le support de Google. Elle reste HORS
# du dépôt (le script refuse de s'y écrire) et son mot de passe va dans un
# gestionnaire de mots de passe, avec le fichier. Une clé PAR application : ne
# réutilisez pas celle de Petsitia.
set -euo pipefail

DOSSIER="${1:-$HOME/Documents/quioffre-cles}"
FICHIER="$DOSSIER/quioffre-televersement.p12"
ALIAS="quioffre"

case "$(cd "$(dirname "$DOSSIER")" 2>/dev/null && pwd)/$(basename "$DOSSIER")" in
  "$(git rev-parse --show-toplevel 2>/dev/null || echo /nonexistent)"*)
    echo "✗ Ce dossier est dans le dépôt : une clé de signature n'y a pas sa place." >&2
    exit 1 ;;
esac

if [ -e "$FICHIER" ]; then
  echo "✗ $FICHIER existe déjà. Je ne l'écrase jamais : c'est peut-être la clé déjà enregistrée chez Google." >&2
  exit 1
fi

read -r -s -p "Mot de passe de la clé (12 caractères au moins) : " MDP; echo
read -r -s -p "Encore une fois : " MDP2; echo
[ "$MDP" = "$MDP2" ] || { echo "✗ Les deux saisies diffèrent." >&2; exit 1; }
[ "${#MDP}" -ge 12 ] || { echo "✗ 12 caractères au moins." >&2; exit 1; }

mkdir -p "$DOSSIER"
chmod 700 "$DOSSIER"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

openssl req -x509 -newkey rsa:2048 -nodes -days 10950 \
  -keyout "$TMP/cle.pem" -out "$TMP/certificat.pem" \
  -subj "/CN=Qui Offre/O=CreaWeb Conseil/C=FR" 2>/dev/null

export MDP
openssl pkcs12 -export -inkey "$TMP/cle.pem" -in "$TMP/certificat.pem" \
  -name "$ALIAS" -out "$FICHIER" -passout env:MDP
chmod 600 "$FICHIER"

echo
echo "✓ Clé créée : $FICHIER"
echo "  alias : $ALIAS"
if command -v pbcopy >/dev/null 2>&1; then
  base64 < "$FICHIER" | tr -d '\n' | pbcopy
  echo "  Son contenu encodé est dans le presse-papiers : à coller maintenant dans le secret"
  echo "  GitHub ANDROID_KEYSTORE_BASE64."
else
  echo "  Contenu encodé pour le secret ANDROID_KEYSTORE_BASE64 : base64 < \"$FICHIER\" | tr -d '\\n'"
fi
echo "  ⚠️  Sauvegardez le fichier ET le mot de passe dans votre gestionnaire de mots de passe."
