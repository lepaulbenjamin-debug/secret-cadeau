import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // `id` fixe l'identité de l'application installée : ne plus jamais le changer.
    id: "/",
    name: "Secret Cadeau",
    short_name: "Secret Cadeau",
    description: "Tirage au sort du Père Noël secret et listes de cadeaux partagées.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f2e7",
    theme_color: "#1e4d3b",
    lang: "fr",
    categories: ["lifestyle", "social"],
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
