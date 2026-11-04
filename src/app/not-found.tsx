import Link from "next/link";

export default function Introuvable() {
  return (
    <main className="pt-20 text-center">
      <p className="text-5xl">🎁❓</p>
      <h1 className="mt-4 font-titre text-2xl font-bold">Ce lien ne mène nulle part</h1>
      <p className="mt-2 text-doux">Vérifiez qu&apos;il a été copié en entier, ou demandez-le à nouveau à l&apos;organisateur.</p>
      <Link href="/" className="bouton mt-6">Accueil</Link>
    </main>
  );
}
