// Ba hao — เก็บหน้าแอปไว้ในเครื่อง เปิดได้ทันทีและเปิดได้แม้ไม่มีเน็ต
const CACHE = 'bahao-2026-11-17.4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  // เก็บเฉพาะไฟล์ของแอปเอง + d3 + ฟอนต์ · ข้อมูลยอดขายไม่เก็บที่นี่
  const ok = u.origin === self.location.origin || /(^|\.)(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname);
  if (e.request.method !== 'GET' || !ok) return;
  const key = e.request.mode === 'navigate' ? './index.html' : e.request;
  e.respondWith(caches.open(CACHE).then((c) => c.match(key, { ignoreSearch: e.request.mode === 'navigate' }).then((hit) => {
    const net = fetch(e.request).then((r) => { if (r && (r.ok || r.type === 'opaque')) c.put(key, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  })));
});
