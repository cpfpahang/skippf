/* SKIPPF service worker v20260829c — Web Push, KPI auto dimatikan */
const ICON = './icon-192.png';
const HOME = './?home=1';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  event.waitUntil((async function () {
    var data = {};
    if (event.data) {
      try { data = event.data.json(); } catch (e) {
        try { data = { body: event.data.text() }; } catch (e2) {}
      }
    }
    var title = data.title || 'SKIPPF';
    var body = data.body || 'Ada kemaskini SKIPPF.';
    await self.registration.showNotification(title, {
      body: body,
      icon: ICON,
      badge: ICON,
      tag: data.tag || 'skippf-push',
      renotify: true,
      data: { url: data.url || HOME }
    });
  })());
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || HOME;
  event.waitUntil(self.clients.openWindow(url));
});
