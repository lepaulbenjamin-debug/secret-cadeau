import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import "./globals.css";

const titre = Fraunces({ variable: "--font-titre", subsets: ["latin"], weight: ["600", "700"] });
const texte = Inter({ variable: "--font-texte", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Secret Cadeau — tirage au sort et listes de cadeaux", template: "%s · Secret Cadeau" },
  description:
    "Organisez votre Père Noël secret en deux minutes : tirage au sort avec exclusions, listes de cadeaux partagées, réservations sans doublon et questions anonymes. Sans compte, sans publicité.",
  applicationName: "Secret Cadeau",
  appleWebApp: { capable: true, title: "Secret Cadeau", statusBarStyle: "default" },
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
    <html lang="fr" className={`${titre.variable} ${texte.variable}`}>
      <body className="font-sans antialiased">
        <div className="mx-auto w-full max-w-xl px-4 pb-16">{children}</div>
      </body>
    </html>
  );
}
