/*
 * Service worker de Qui Offre : il ne sert QU'AUX NOTIFICATIONS.
 *
 * Pas de cache des pages : un site qui change chaque jour (tirage, listes,
 * réservations) servi depuis un cache montrerait des réservations périmées.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch {
    d = { corps: e.data ? e.data.text() : "" };
  }
  e.waitUntil(
    self.registration.showNotification(d.titre || "Qui Offre", {
      body: d.corps || "",
      icon: "/icone-192.png",
      tag: d.etiquette,
      lang: "fr",
      data: { url: d.url || "/" },
    }),
  );
});

// Toucher la notification ouvre la bonne page — ou la ramène au premier plan si elle est déjà ouverte.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenetres) => {
      for (const f of fenetres) if (f.url === url && "focus" in f) return f.focus();
      return self.clients.openWindow(url);
    }),
  );
});
