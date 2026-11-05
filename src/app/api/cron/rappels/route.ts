import { NextResponse } from "next/server";

import { envoyerRappels } from "@/lib/rappels-serveur";

/**
 * Tâche planifiée Vercel (voir vercel.json), chaque matin.
 *
 * ⚠️ Protégée par CRON_SECRET : Vercel envoie `Authorization: Bearer <CRON_SECRET>`
 * quand la variable existe. Sans elle, n'importe qui pourrait déclencher des
 * envois en appelant l'adresse — on refuse donc tout si elle manque.
 */
export async function GET(requete: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || requete.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "non autorisé" }, { status: 401 });
  }
  const bilan = await envoyerRappels();
  console.log("Rappels :", JSON.stringify(bilan));
  return NextResponse.json(bilan);
}
