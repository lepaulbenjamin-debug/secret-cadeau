/**
 * Envoi d'e-mails par Resend (https://resend.com), par son API HTTP : pas de
 * dépendance à installer.
 *
 * Sans `RESEND_API_KEY`, rien ne part et rien ne casse : l'envoi répond
 * « non envoyé », la tâche des rappels le note et passe à la suite.
 *
 * L'expéditeur (`EMAIL_EXPEDITEUR`, ex. « Qui Offre <rappels@quioffre.fr> »)
 * doit être sur un domaine vérifié chez Resend.
 */

export type Email = {
  a: string;
  sujet: string;
  html: string;
  texte: string;
  /** Adresse de désinscription en un clic (en-têtes List-Unsubscribe, RFC 8058). */
  desabonnement?: string;
};

export async function envoyerEmail(e: Email, fetcher: typeof fetch = fetch): Promise<{ ok: boolean; motif?: string }> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) return { ok: false, motif: "RESEND_API_KEY absente" };
  const de = process.env.EMAIL_EXPEDITEUR ?? "Qui Offre <rappels@quioffre.fr>";

  const r = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${cle}`, "content-type": "application/json" },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      from: de,
      to: [e.a],
      subject: e.sujet,
      html: e.html,
      text: e.texte,
      headers: e.desabonnement
        ? { "List-Unsubscribe": `<${e.desabonnement}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }
        : undefined,
    }),
  });
  if (r.ok) return { ok: true };
  return { ok: false, motif: `Resend ${r.status} : ${(await r.text().catch(() => "")).slice(0, 200)}` };
}
