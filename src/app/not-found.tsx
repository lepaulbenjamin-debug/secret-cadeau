import Link from "next/link";

export default function Introuvable() {
  return (
    <main className="mx-auto max-w-xl px-4 pt-20 pb-16 text-center">
      <p className="text-5xl">🎁❓</p>
      <h1 className="mt-4 font-titre text-2xl font-bold">Ce lien ne mène nulle part</h1>
      <p className="mt-2 text-doux">Vérifiez qu&apos;il a été copié en entier, ou demandez-le à nouveau à l&apos;organisateur.</p>
      <div className="mt-6 flex flex-col items-center gap-2">
        <Link href="/retrouver" className="bouton">Retrouver mes liens par e-mail</Link>
        <Link href="/" className="text-sm text-doux underline">Accueil</Link>
      </div>
    </main>
  );
}
