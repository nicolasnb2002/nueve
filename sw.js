// Service worker de Nueve: cache local para usar la app sin conexión.
// Sin analíticas ni llamadas a terceros: solo guarda archivos del propio sitio.
const VERSION = "nueve-v2";
const SCOPE = new URL(self.registration.scope).pathname; // "/nueve/"
const SHELL = [SCOPE, `${SCOPE}favicon.svg`, `${SCOPE}__grok/manifest.webmanifest`, `${SCOPE}__grok/icon-192.png`];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;

  // Navegación: red primero, si no hay conexión se usa la página guardada.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        // Cada página está prerenderizada: se usa su copia, si no la portada.
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match(SCOPE))),
    );
    return;
  }

  // Archivos del build (con hash): cache primero.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
