import { ArrowLeft, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { retrouverLiens } from "@/app/actions";
import { Formulaire } from "@/components/formulaire";

export const metadata: Metadata = {
  title: "Retrouver mes liens",
  description: "Vous avez perdu le lien de votre groupe ou de votre liste ? Recevez-les tous par e-mail.",
  robots: { index: false, follow: true },
};

export default function Retrouver() {
  return (
    <main className="pt-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-doux"><ArrowLeft size={16} /> Accueil</Link>
      <h1 className="mt-4 font-titre text-3xl font-bold">Retrouver mes liens</h1>
      <p className="mt-1 text-doux">
        Vous avez perdu le lien de votre groupe, de votre espace ou de votre liste ? Indiquez votre adresse e-mail : si elle
        est connue, vous recevez tous vos liens en un seul message.
      </p>
      <div className="carte mt-6">
        <Formulaire action={retrouverLiens} bouton="M'envoyer mes liens">
          <div>
            <label className="etiquette" htmlFor="email">Votre adresse e-mail</label>
            <input id="email" name="email" type="email" required className="champ" maxLength={120} autoComplete="email" placeholder="lea@exemple.fr" />
          </div>
        </Formulaire>
      </div>
      <div className="mt-6 space-y-2 text-sm text-doux">
        <p className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" aria-hidden /> Seuls les liens associés à cette adresse sont envoyés, et uniquement à elle.</p>
        <p>
          Votre adresse n&apos;est pas connue ? Si vous ne l&apos;aviez pas indiquée, demandez votre lien à l&apos;organisateur du
          groupe : il peut aussi ajouter votre e-mail depuis sa page.
        </p>
      </div>
    </main>
  );
}
