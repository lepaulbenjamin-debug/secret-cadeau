import { ImageResponse } from "next/og";

/** L'image des aperçus de liens (WhatsApp, réseaux sociaux, SMS), commune à toutes les pages. */
export const alt = "Qui Offre — le Secret Santa en ligne, gratuit et sans compte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#1e4d3b", color: "#fffdf8" }}>
        <div style={{ fontSize: 96, display: "flex" }}>🎁</div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 16, display: "flex" }}>Qui Offre</div>
        <div style={{ fontSize: 44, marginTop: 12, opacity: 0.9, display: "flex" }}>Le Secret Santa en ligne, sans prise de tête.</div>
        <div style={{ fontSize: 30, marginTop: 36, color: "#f3d27a", display: "flex" }}>Tirage au sort · Listes de cadeaux · Gratuit, sans compte</div>
      </div>
    ),
    size,
  );
}
