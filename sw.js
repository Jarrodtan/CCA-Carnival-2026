const cacheName = 'sp-nav-v1';
const staticAssets = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './config.js',
  './handlePermissions.js',
  './stateManager.js',
  './inputHandler.js',
  './camera.js',
  './audioManager.js',
  './welcomeState.js',
  './mainState.js',
  './island1State.js',
  './island2State.js',
  './island3State.js',
  './main.js',
  './assets/logo.png',
  './assets/icon-lighthouse.png'
];

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});