
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('invite-app-v2').then(cache => cache.addAll([
      'index.html', 'manage.html', 'style.css', 'app.js', 'manifest.json'
    ]))
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
