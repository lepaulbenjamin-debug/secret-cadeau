import type { Metadata, Viewport } from "next";
/*
 * Les polices sont embarquées dans l'application (paquets Fontsource), pas
 * téléchargées chez Google au moment de la construction : sur Vercel, le
 * chargement de Fraunces par `next/font/google` faisait échouer le build.
 * Embarquées, elles ne dépendent plus d'aucun service extérieur.
 */
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "./globals.css";
import { affiliationActive, MENTION_AMAZON } from "@/lib/affiliation";

/*
 * L'adresse publique, écrite en dur : lue dans l'environnement, elle suivrait
 * les déploiements d'aperçu, et les aperçus de liens (WhatsApp, SMS) pointeraient
 * vers une adresse Vercel temporaire.
 */
const SITE_URL = "https://www.quioffre.fr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Qui Offre — tirage au sort et listes de cadeaux", template: "%s · Qui Offre" },
  description:
    "Organisez votre Père Noël secret en deux minutes : tirage au sort avec exclusions, listes de cadeaux partagées, réservations sans doublon et questions anonymes. Sans compte, sans publicité.",
  applicationName: "Qui Offre",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Qui Offre",
    title: "Qui Offre — le Père Noël secret sans prise de tête",
    description: "Tirage au sort, listes d'envies partagées et questions anonymes. Gratuit, sans compte.",
  },
  appleWebApp: { capable: true, title: "Qui Offre", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f2e7" },
    { media: "(prefers-color-scheme: dark)", color: "#17130f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <div className="mx-auto w-full max-w-xl px-4 pb-16">
          {children}
          {/* Mention exigée par le programme Partenaires Amazon, visible sur toutes les pages. */}
          {affiliationActive() && <p className="mt-10 text-center text-xs text-doux">{MENTION_AMAZON}</p>}
        </div>
      </body>
    </html>
  );
}
