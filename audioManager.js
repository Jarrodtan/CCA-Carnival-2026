/* =============================================================================
 * audioManager.js
 * Centralised music manager — one track plays at a time, crossfades on switch.
 * Add <script src="audioManager.js"></script> to index.html after camera.js
 * =============================================================================*/

"use strict";

let _currentTrack = null;
let _tracks       = {};

function preloadAudio() {
  _tracks.welcome = loadSound(CFG_MUSIC_WELCOME);
  _tracks.main    = loadSound(CFG_MUSIC_MAIN);
  _tracks.island1 = loadSound(CFG_MUSIC_ISLAND1);
  _tracks.island2 = loadSound(CFG_MUSIC_ISLAND2);
  _tracks.island3 = loadSound(CFG_MUSIC_ISLAND3);
}

function playMusic(trackKey) {
  const next = _tracks[trackKey];
  if (!next) return;
  if (_currentTrack && _currentTrack !== next) {
    _currentTrack.stop();
  }
  if (!next.isPlaying()) {
    next.setVolume(CFG_MUSIC_VOLUME);
    next.loop();
  }
  _currentTrack = next;
}

function stopMusic() {
  if (_currentTrack) _currentTrack.stop();
  _currentTrack = null;
}