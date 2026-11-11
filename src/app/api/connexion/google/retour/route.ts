import { NextResponse, type NextRequest } from "next/server";

import { compteVerifie } from "@/lib/compte/connexion-serveur";
import { COOKIE_GOOGLE, identiteGoogle } from "@/lib/compte/google";
import { suiteSure } from "@/lib/compte/secret";
import { COOKIE_SESSION, creerSession, DUREE_SESSION_S, optionsCookie } from "@/lib/compte/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origine = req.nextUrl.origin;
  let memo: { etat?: string; verificateur?: string; suite?: string } = {};
  try {
    memo = JSON.parse(req.cookies.get(COOKIE_GOOGLE)?.value ?? "{}");
  } catch {}
  const suite = suiteSure(memo.suite);
  const echec = () => {
    const r = NextResponse.redirect(`${origine}/connexion?erreur=google&suite=${encodeURIComponent(suite)}`);
    r.cookies.delete({ name: COOKIE_GOOGLE, path: "/api/connexion/google" });
    return r;
  };

  const code = req.nextUrl.searchParams.get("code");
  // L'état protège contre une connexion forcée (CSRF) : il doit être celui posé à l'aller.
  if (!code || !memo.etat || !memo.verificateur || req.nextUrl.searchParams.get("state") !== memo.etat) return echec();
  const id = await identiteGoogle({ origine, code, verificateur: memo.verificateur }).catch(() => null);
  if (!id) return echec();

  const compte = await compteVerifie(id.email, id.nom);
  const secret = await creerSession(compte.id);
  const r = NextResponse.redirect(`${origine}${suite}`);
  r.cookies.set(COOKIE_SESSION, secret, optionsCookie(DUREE_SESSION_S));
  r.cookies.delete({ name: COOKIE_GOOGLE, path: "/api/connexion/google" });
  return r;
}
