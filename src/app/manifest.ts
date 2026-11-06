import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // `id` fixe l'identité de l'application installée : ne plus jamais le changer.
    id: "/",
    name: "Qui Offre",
    short_name: "Qui Offre",
    description: "Qui offre à qui ? Tirage au sort du Père Noël secret et listes de cadeaux partagées.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf6f0",
    theme_color: "#2b2a66",
    lang: "fr",
    categories: ["lifestyle", "social"],
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
      // Android découpe l'icône (cercle, goutte…) : la version « maskable » garde le dessin dans la zone sûre.
      { src: "/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
