import { NextResponse, type NextRequest } from "next/server";

import { adresseAutorisation, COOKIE_GOOGLE, googleConfigure } from "@/lib/compte/google";
import { secretAleatoire, suiteSure } from "@/lib/compte/secret";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const origine = req.nextUrl.origin;
  const suite = suiteSure(req.nextUrl.searchParams.get("suite"));
  if (!googleConfigure()) return NextResponse.redirect(`${origine}/connexion?erreur=google&suite=${encodeURIComponent(suite)}`);
  const etat = secretAleatoire();
  const verificateur = secretAleatoire();
  const rep = NextResponse.redirect(adresseAutorisation({ origine, etat, verificateur }));
  rep.cookies.set(COOKIE_GOOGLE, JSON.stringify({ etat, verificateur, suite }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/connexion/google",
    maxAge: 600,
  });
  return rep;
}
