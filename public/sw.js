self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : "" }; }
  const badgePromise = ("setAppBadge" in self.navigator)
    ? self.navigator.setAppBadge(1).catch(() => {})
    : Promise.resolve();
  event.waitUntil(Promise.all([
    badgePromise,
    self.registration.showNotification(data.title || "NUTRIFIT • COMPRAS NECESSÁRIAS", {
    body: data.body || "⚠️ Há insumos que precisam de atenção no estoque.",
    icon: "/images/nutrifit-logo-icon.svg",
    badge: "/images/nutrifit-logo-icon.svg",
    tag: data.tag || "nutrifit-purchase-alert",
    renotify: true,
    data: { url: data.url || "/admin" },
    actions: [{ action: "open-admin", title: "ABRIR PAINEL" }]
    }))
  ]));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const clearBadge = ("clearAppBadge" in self.navigator)
    ? self.navigator.clearAppBadge().catch(() => {})
    : Promise.resolve();
  const target = new URL(event.notification.data?.url || "/admin", self.location.origin).href;
  event.waitUntil(Promise.all([clearBadge, clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const client of list) { if ("focus" in client) { client.navigate(target); return client.focus(); } }
    return clients.openWindow(target);
  })]));
});