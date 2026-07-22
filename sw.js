self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('mi-cache').then(function(cache) {
        return cache.add('index.html');
    })
 );
});