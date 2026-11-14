"use client";

import { Capacitor } from "@capacitor/core";
import { Bell, BellOff, Download, Share, Smartphone, SquarePlus } from "lucide-react";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";

import { abonnerPush, desabonnerPush } from "@/app/actions-push";

/* ───────── L'invite d'installation d'Android/Chrome, gardée dès qu'elle arrive ───────── */

type InviteInstallation = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let invite: InviteInstallation | null = null;
const abonnes = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // on montre notre propre bouton, au bon endroit
    invite = e as InviteInstallation;
    abonnes.forEach((f) => f());
  });
  window.addEventListener("appinstalled", () => {
    invite = null;
    abonnes.forEach((f) => f());
  });
}
const suivreInvite = (f: () => void) => {
  abonnes.add(f);
  return () => abonnes.delete(f);
};

/* ───────── Ce que l'appareil sait faire ───────── */

type Appareil = { natif: boolean; installee: boolean; ios: boolean; android: boolean; push: boolean };

function lireAppareil(): Appareil {
  const ua = navigator.userAgent;
  return {
    natif: Capacitor.isNativePlatform(),
    installee:
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
    ios: /iphone|ipad|ipod/i.test(ua) || (ua.includes("Macintosh") && "ontouchend" in document),
    android: /android/i.test(ua),
    push: "serviceWorker" in navigator && "PushManager" in window && "Notification" in window,
  };
}
let cacheAppareil: Appareil | null = null;
const appareil = () => (cacheAppareil ??= lireAppareil());

function cleEnOctets(base64url: string): Uint8Array<ArrayBuffer> {
  const b64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(b64);
  const octets = new Uint8Array(new ArrayBuffer(brut.length));
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i);
  return octets;
}

/**
 * « Qui Offre sur votre téléphone » : installer l'application depuis le
 * navigateur (avec les gestes propres à chaque téléphone), puis activer les
 * notifications.
 *
 * ⚠️ SUR IPHONE, LES NOTIFICATIONS N'EXISTENT QUE DANS L'APPLICATION INSTALLÉE
 * (iOS 16.4+). Dans Safari, on ne propose donc que l'installation.
 * ⚠️ Dans l'application des stores (Capacitor), rien : c'est déjà une application,
 * et les notifications natives passeraient par un autre chemin.
 */
export function InstallerApp({ jeton, clePublique, compact = false }: { jeton: string; clePublique: string; compact?: boolean }) {
  const a = useSyncExternalStore(() => () => {}, appareil, () => null);
  const inviteDispo = useSyncExternalStore(suivreInvite, () => invite !== null, () => false);
  const [abonne, setAbonne] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [message, setMessage] = useState("");
  // « Plus tard » est retenu sur l'appareil, pour cet espace.
  const masqueRetenu = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return !compact && localStorage.getItem(`quioffre:installer-masque:${jeton}`) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const [masqueMaintenant, setMasque] = useState(false);
  const masque = masqueRetenu || masqueMaintenant;
  const [enCours, demarrer] = useTransition();

  const pushPossible = Boolean(a && a.push && clePublique && (a.installee || !a.ios));

  // Le service worker, et l'état de l'abonnement sur cet appareil.
  useEffect(() => {
    if (!a?.push || a.natif) return;
    let vivant = true;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (!vivant) return;
        setAbonne(Boolean(sub));
        setPermission(Notification.permission);
      })
      .catch(() => vivant && setAbonne(false));
    return () => {
      vivant = false;
    };
  }, [a]);

  if (!a || a.natif) return null;
  const aInstaller = !a.installee && (a.ios || a.android || inviteDispo);
  if (!aInstaller && !pushPossible) return null;
  if (!compact && (masque || (a.installee && abonne))) return null;

  const activer = () =>
    demarrer(async () => {
      setMessage("");
      try {
        const choix = await Notification.requestPermission();
        setPermission(choix);
        if (choix !== "granted") return setMessage("Notifications refusées. Vous pourrez les autoriser plus tard dans les réglages.");
        const reg = await navigator.serviceWorker.ready;
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: cleEnOctets(clePublique) }));
        const r = await abonnerPush(jeton, sub.toJSON());
        if (r?.erreur) return setMessage(r.erreur);
        setAbonne(true);
        setMessage("🔔 C'est activé : vous serez prévenu du tirage, des nouvelles idées, des questions et des rappels.");
      } catch {
        setMessage("L'activation n'a pas abouti sur ce navigateur. Réessayez depuis l'application installée.");
      }
    });

  const desactiver = () =>
    demarrer(async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await desabonnerPush(jeton, sub.endpoint);
        await sub.unsubscribe().catch(() => {});
      }
      setAbonne(false);
      setMessage("Notifications désactivées sur cet appareil.");
    });

  return (
    <section className={compact ? "mt-3 space-y-3 rounded-xl bg-creme p-3" : "carte space-y-3"} aria-labelledby={compact ? undefined : `installer-${jeton}`}>
      {!compact && (
        <div className="flex items-start justify-between gap-3">
          <h2 id={`installer-${jeton}`} className="flex items-center gap-2 font-titre text-xl font-semibold">
            <Smartphone size={20} aria-hidden /> Qui Offre sur votre téléphone
          </h2>
          <button
            type="button"
            className="shrink-0 text-sm text-doux underline"
            onClick={() => {
              setMasque(true);
              try {
                localStorage.setItem(`quioffre:installer-masque:${jeton}`, "1");
              } catch {}
            }}
          >
            Plus tard
          </button>
        </div>
      )}

      {aInstaller && (
        <div className="space-y-2 text-sm">
          {inviteDispo ? (
            <>
              <p>Installez l&apos;application : une icône sur l&apos;écran d&apos;accueil, qui s&apos;ouvre directement sur votre espace.</p>
              <button
                type="button"
                className="bouton"
                onClick={async () => {
                  await invite?.prompt();
                  invite = null;
                  abonnes.forEach((f) => f());
                }}
              >
                <Download size={16} aria-hidden /> Installer l&apos;application
              </button>
            </>
          ) : a.ios ? (
            <>
              <p>Ajoutez Qui Offre à votre écran d&apos;accueil : elle s&apos;ouvrira directement sur votre espace.</p>
              <ol className="list-decimal space-y-1.5 pl-5">
                <li>
                  Touchez <Share size={15} className="inline align-[-2px]" aria-label="Partager" /> <strong>Partager</strong> (en bas de
                  Safari, ou en haut sur iPad).
                </li>
                <li>
                  Choisissez <SquarePlus size={15} className="inline align-[-2px]" aria-hidden /> <strong>Sur l&apos;écran d&apos;accueil</strong>,
                  puis <strong>Ajouter</strong>.
                </li>
                <li>Ouvrez Qui Offre depuis la nouvelle icône pour activer les notifications.</li>
              </ol>
              <p className="text-doux">Sur iPhone, les notifications ne fonctionnent que depuis l&apos;application installée.</p>
            </>
          ) : (
            <>
              <p>Ajoutez Qui Offre à votre écran d&apos;accueil :</p>
              <ol className="list-decimal space-y-1.5 pl-5">
                <li>Ouvrez le menu du navigateur <strong>⋮</strong> (en haut à droite).</li>
                <li>
                  Touchez <strong>Installer l&apos;application</strong> ou <strong>Ajouter à l&apos;écran d&apos;accueil</strong>.
                </li>
              </ol>
            </>
          )}
        </div>
      )}

      {pushPossible && (
        <div className="space-y-2 text-sm">
          {permission === "denied" ? (
            <p className="text-doux">
              <BellOff size={15} className="mr-1 inline align-[-2px]" aria-hidden />
              Les notifications sont bloquées pour Qui Offre. Réautorisez-les dans les réglages du téléphone ou du navigateur.
            </p>
          ) : abonne ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-sapin">🔔 Notifications activées sur cet appareil</span>
              <button type="button" disabled={enCours} onClick={desactiver} className="text-doux underline">
                Désactiver
              </button>
            </div>
          ) : (
            <>
              <p>Soyez prévenu du tirage, des nouvelles idées de la personne que vous avez tirée, des questions anonymes et des rappels avant l&apos;échange.</p>
              <button type="button" disabled={enCours || abonne === null} onClick={activer} className="bouton bouton-cerise">
                <Bell size={16} aria-hidden /> {enCours ? "Un instant…" : "Activer les notifications"}
              </button>
            </>
          )}
        </div>
      )}
      {message && <p role="status" className="text-sm font-medium">{message}</p>}
    </section>
  );
}
