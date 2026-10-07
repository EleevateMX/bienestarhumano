/* Service worker · Bienestar Humano
   - Red primero, caché de respaldo: siempre intenta traer la versión nueva
     de GitHub Pages; si no hay internet, sirve la última copia guardada.
   - Sube CACHE_VERSION cuando quieras forzar que se limpie la caché vieja. */
const CACHE_VERSION = 'bh-v5';
const SHELL = [
  './', './index.html', './styles.css', './app.js', './data.js',
  './vendor/chart.umd.js', './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css', './vendor/xlsx.mini.min.js',
  './logo.png', './logo-icon.png', './icons/icon-192.png', './icons/icon-512.png', './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(SHELL).catch(() => null)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  // Solo se cachea lo propio del sitio; mapas, fuentes y Google van directo a la red.
  if(url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if(res && res.ok){ const copy = res.clone(); caches.open(CACHE_VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
  );
});
