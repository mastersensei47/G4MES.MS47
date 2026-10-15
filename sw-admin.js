/* Service worker del panel admin (solo para que se pueda instalar como app).
   - Solo toca los archivos del panel; el resto del sitio pasa de largo.
   - Red primero: siempre se ve la versión nueva; si no hay internet, usa la copia guardada. */
const CACHE = "ms47-admin-v1";
const SHELL = ["admin.html", "config.js", "defaults.js", "estilo.js", "manifest-admin.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;
  const nombre = url.pathname.split("/").pop();
  if(!SHELL.includes(nombre)) return;
  e.respondWith(
    fetch(req).then(res => {
      if(res && res.ok){ const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("admin.html")))
  );
});
