/**
 * =============================================================================
 * Service Worker: sp-nav-v1.1.2
 * Project: SP Navigators (SIT-DigiPen RTIS Year 2)
 *
 * PURPOSE:
 * 1. Handles offline caching for the T16 Heartbeat Carnival.
 * 2. Manages "Hot Updates" to fix the "Site Can't Be Reached" PWA bug.
 * 3. Ensures the latest UI (Developer Credits) is served immediately.
 *
 * VERSIONING (SemVer): 
 * - v1.1.2: Patch fix for absolute bottom layout and cache activation.
 * =============================================================================
 */

/**
 * =============================================================================
 * SEMANTIC VERSIONING (SemVer) - Project: NavQuest
 * =============================================================================
 * CURRENT VERSION: 1.0.1
 * * [1] MAJOR: 1 (Initial Public Release)
 * - The core 3-island exploration and camera-sensor mechanics are stable.
 * - Base PWA framework established for GitHub Pages hosting.
 * * [0] MINOR: 0 (Baseline Feature Set)
 * - Current features: Real-time interactive simulation, orientation sensing, 
 * and PWA "Add to Home Screen" capability.
 * * [1] PATCH: 1 (Critical Maintenance & UI)
 * - FIXED: "Site Can't Be Reached" error on Android by adding 'activate' 
 * listener and old cache purging logic.
 * - FIXED: Service Worker lifecycle issue using skipWaiting() and clients.claim() 
 * to force updates without requiring a manual app reinstall.
 * - UPDATED: Positioning of CFG_DEVELOPER_CREDIT to (height - 20) for 
 * better visibility on various mobile aspect ratios.
 * - UPDATED: Documentation and comments for code readability.
 * =============================================================================
 */

// 1. CACHE NAME: Change this number (e.g., v1.0.2) to force an update.
const cacheName = 'sp-nav-v1.1.2';

// 2. STATIC ASSETS: Files to be cached for offline capability.
const staticAssets = [
  './',
  './index.html',
  './index.html?v=1.1.2', // CRITICAL: Matches start_url in manifest.json
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
  './assets/icon-lighthouse.png',
  './assets/audio/music_welcome.ogg' // Add global audio to prevent preload stalls
];

/**
 * INSTALL EVENT
 * Downloads all assets into the new cache version.
 * skipWaiting() ensures the new version doesn't get stuck in the "waiting" phase.
 */
self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  self.skipWaiting(); 
});

/**
 * ACTIVATE EVENT
 * Cleans up old caches to prevent storage bloat and routing errors.
 * clients.claim() allows the service worker to take control of the page immediately.
 */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // If the cache key isn't the current version, delete it.
          if (key !== cacheName) {
            console.log("SW: Purging outdated cache ->", key);
            return caches.delete(key); 
          }
        })
      );
    })
  );
  self.clients.claim(); 
});

/**
 * FETCH EVENT
 * Strategy: Cache-First. 
 * Checks cache for assets to save data/load fast. Falls back to network if not found.
 */
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});