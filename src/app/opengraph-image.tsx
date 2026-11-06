import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/** L'image des aperçus de liens (WhatsApp, réseaux sociaux, SMS), commune à toutes les pages. */
export const alt = "Qui Offre — le Secret Santa en ligne, gratuit et sans compte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Lue au moment de la construction : l'image est statique.
  const logo = await readFile(join(process.cwd(), "public/logo-grand.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf6f0",
          color: "#2b2a66",
          borderBottom: "24px solid #fc5a53",
        }}
      >
        <img src={src} width={584} height={260} alt="" />
        <div style={{ fontSize: 46, fontWeight: 700, marginTop: 28, display: "flex" }}>Le Secret Santa en ligne, sans prise de tête.</div>
        <div style={{ fontSize: 30, marginTop: 16, color: "#cc3a33", display: "flex" }}>
          Tirage au sort · Listes de cadeaux · Gratuit, sans compte
        </div>
      </div>
    ),
    size,
  );
}
