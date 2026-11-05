/** Données structurées schema.org, lues par Google et par les moteurs d'IA. */
export function JsonLd({ donnees }: { donnees: object }) {
  return (
    <script
      type="application/ld+json"
      // `<` échappé : un texte contenant « </script> » ne peut pas fermer la balise.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees).replace(/</g, "\\u003c") }}
    />
  );
}
