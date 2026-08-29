/* SKIPPF service worker — notifikasi kepada semua pegawai yang pernah buka app */
const ALERTS_URL = './alerts.json';
const ICON = './icon-192.png';

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
    if (!data.title) {
      try { data = await (await fetch(ALERTS_URL, { cache: 'no-store' })).json(); } catch (e) {}
    }
    await showAlert(data);
  })());
});

self.addEventListener('periodicsync', function (event) {
  if (event.tag === 'skippf-kpi') event.waitUntil(checkAlerts());
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './dashboard/';
  event.waitUntil(self.clients.openWindow(url));
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'check-alerts') {
    event.waitUntil(checkAlerts());
  }
});

async function checkAlerts() {
  var data = await (await fetch(ALERTS_URL, { cache: 'no-store' })).json();
  var last = await getLastFp();
  if (!data || !data.fingerprint) return;
  if (last === data.fingerprint) return;
  await setLastFp(data.fingerprint);
  if (data.count > 0) await showAlert(data);
}

async function showAlert(data) {
  data = data || {};
  if (data.count === 0) return;
  await self.registration.showNotification(data.title || 'SKIPPF', {
    body: data.body || 'Ada indikator PERHATIAN.',
    icon: ICON,
    badge: ICON,
    tag: 'skippf-kpi',
    renotify: true,
    data: { url: data.url || './dashboard/' }
  });
}

function idb() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open('skippf-push', 1);
    req.onupgradeneeded = function () { req.result.createObjectStore('kv'); };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

async function getLastFp() {
  try {
    var db = await idb();
    return await new Promise(function (resolve, reject) {
      var r = db.transaction('kv').objectStore('kv').get('fp');
      r.onsuccess = function () { resolve(r.result || ''); };
      r.onerror = function () { reject(r.error); };
    });
  } catch (e) { return ''; }
}

async function setLastFp(fp) {
  try {
    var db = await idb();
    await new Promise(function (resolve, reject) {
      var r = db.transaction('kv', 'readwrite').objectStore('kv').put(fp, 'fp');
      r.onsuccess = function () { resolve(); };
      r.onerror = function () { reject(r.error); };
    });
  } catch (e) {}
}
