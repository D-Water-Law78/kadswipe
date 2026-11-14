// Kad'Swipe : la page, les icônes et les polices sont gardées sur le téléphone.
// À chaque ouverture : affichage immédiat depuis le téléphone, puis mise à jour discrète en arrière-plan
// (une nouvelle version de l'appli apparaît donc à l'ouverture suivante).
var CACHE = 'kadswipe-de7c7fcb1a';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf('kadswipe-') === 0 && k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;                                   // les appels au Google Sheet ne passent jamais par le cache
  var mine = url.origin === self.location.origin;
  var fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!mine && !fonts) return;
  var key = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(key, {ignoreSearch:true}).then(function(hit){
      var net = fetch(req).then(function(res){ if (res && (res.ok || res.type === 'opaque')) c.put(key, res.clone()); return res; });
      if (hit){ e.waitUntil(net.catch(function(){})); return hit; }
      return net;
    });
  }));
});
