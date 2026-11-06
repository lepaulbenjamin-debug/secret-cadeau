"use client";

import { Cake, Crown, Gift, X } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { lireLiens, oublierLien, type LienGarde } from "./memoire";

let cache: { brut: string; liens: LienGarde[] } = { brut: "", liens: [] };
const auditeurs = new Set<() => void>();
const prevenir = () => auditeurs.forEach((f) => f());

function instantane(): LienGarde[] {
  const liens = lireLiens();
  const brut = JSON.stringify(liens);
  if (brut !== cache.brut) cache = { brut, liens };
  return cache.liens;
}

const VIDE: LienGarde[] = [];

const CHEMINS: Record<LienGarde["type"], (j: string) => string> = {
  admin: (j) => `/g/${j}`,
  perso: (j) => `/p/${j}`,
  "liste-proprio": (j) => `/ma-liste/${j}`,
  liste: (j) => `/liste/${j}`,
};

function sousTitre(l: LienGarde): string {
  if (l.type === "admin") return "Vous organisez";
  if (l.type === "liste-proprio") return "Votre liste de cadeaux";
  if (l.type === "liste") return "Une liste à consulter";
  return l.pourAutre ? `Espace de ${l.prenom}` : `Votre espace${l.prenom ? `, ${l.prenom}` : ""}`;
}

export function MesGroupes() {
  const liens = useSyncExternalStore(
    (f) => {
      auditeurs.add(f);
      window.addEventListener("storage", f);
      return () => {
        auditeurs.delete(f);
        window.removeEventListener("storage", f);
      };
    },
    instantane,
    () => VIDE,
  );

  if (!liens.length) return null;

  return (
    <section className="mt-8">
      <h2 className="font-titre text-xl font-semibold">Sur cet appareil</h2>
      <ul className="mt-3 space-y-2">
        {liens.map((l) => (
          <li key={`${l.type}-${l.jeton}`} className="carte flex items-center gap-3 !p-3">
            <span className={`grid size-10 shrink-0 place-items-center rounded-full ${l.type === "admin" ? "bg-cerise-clair text-cerise" : "bg-sapin-clair text-sapin"}`}>
              {l.type === "admin" ? <Crown size={18} /> : l.type.startsWith("liste") ? <Cake size={18} /> : <Gift size={18} />}
            </span>
            <Link href={CHEMINS[l.type](l.jeton)} className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{l.groupe}</span>
              <span className="block text-sm text-doux">{sousTitre(l)}</span>
            </Link>
            <button
              type="button"
              aria-label={`Oublier ${l.groupe} sur cet appareil`}
              className="grid size-9 place-items-center rounded-full text-doux hover:bg-creme"
              onClick={() => {
                if (!confirm("Retirer ce lien de cet appareil ? Le groupe n'est pas supprimé.")) return;
                oublierLien(l.type, l.jeton);
                prevenir();
              }}
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
