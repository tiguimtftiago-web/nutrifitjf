self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : "" }; }
  event.waitUntil(self.registration.showNotification(data.title || "Nutrifit • Compras necessárias", {
    body: data.body || "Há insumos que precisam de atenção no estoque.",
    icon: "/images/nutrifit-logo-icon.svg",
    badge: "/images/nutrifit-logo-icon.svg",
    tag: data.tag || "nutrifit-purchase-alert",
    renotify: true,
    data: { url: data.url || "/admin" }
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const client of list) { if ("focus" in client) { client.navigate(target); return client.focus(); } }
    return clients.openWindow(target);
  }));
});