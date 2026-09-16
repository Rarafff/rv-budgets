self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "Ada pembaruan untuk uang Anda." };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Budgets. Money moment", {
      body: payload.body || "Ada pembaruan untuk uang Anda.",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "budgets-money-moment",
      renotify: false,
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const target = event.notification.data?.url || "/";
      const existing = windows.find((windowClient) => new URL(windowClient.url).pathname === target);
      return existing ? existing.focus() : clients.openWindow(target);
    }),
  );
});
