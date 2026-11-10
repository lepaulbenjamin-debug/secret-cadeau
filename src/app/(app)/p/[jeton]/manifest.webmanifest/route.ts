import { manifeste } from "@/lib/manifeste";

/** Le manifeste propre à l'espace d'un participant : l'application installée s'ouvre dessus. */
export async function GET(_: Request, { params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  if (!/^[\w-]{8,64}$/.test(jeton)) return new Response("Introuvable", { status: 404 });
  return Response.json(manifeste(`/p/${jeton}`), {
    headers: { "content-type": "application/manifest+json; charset=utf-8", "cache-control": "private, max-age=3600" },
  });
}
