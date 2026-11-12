/* Service worker: nhận thông báo đẩy nhắc học */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {}); // cần cho điều kiện "cài đặt được" (PWA) trên một số trình duyệt

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "SEED", {
    body: d.body || "Đến giờ học tiếng Anh rồi!",
    icon: "/icon-192.png?v=6",
    badge: "/icon-badge.png?v=5",
    tag: "nhac-hoc",
    renotify: true,
    data: { url: d.url || "/" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) if ("focus" in c) { c.navigate && c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
