/** Les écrans de l'application : une colonne étroite, pensée pour le téléphone. */
export default function MiseEnPageApplication({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-xl px-4 pb-16">{children}</div>;
}
