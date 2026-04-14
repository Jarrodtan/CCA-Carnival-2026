/* =============================================================================
 * main.js
 * Entry point — p5.js lifecycle hooks.
 *
 * LOADING STRATEGY
 * ----------------
 * Only MAIN state assets load upfront (5 images — fast).
 * Island assets load lazily on first visit via loadIslandAssets(stateId).
 * A per-island "loading" flag prevents entering the state mid-load.
 *
 * Analogy: main.cpp + asset streaming in a game engine.
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * p5 — preload
 * ONLY load what is needed to show the first screen.
 * Island assets are loaded on first visit (see stateManager.js).
 * ---------------------------------------------------------------------------*/
function preload() {
  preloadMain();      // 5 images — boat, background, 3 island thumbnails
  preloadAudio();
}

/* ---------------------------------------------------------------------------
 * p5 — setup
 * ---------------------------------------------------------------------------*/
function setup() {
  setupMain();
  setupWelcome();     // no assets — registers STATE.WELCOME with GSM
  setupIsland1();
  setupIsland2();
  setupIsland3();

  /* Start on the welcome screen instead of jumping straight to the map. */
  changeState(STATE.WELCOME);

  window.__p5Ready = true;
}

/* ---------------------------------------------------------------------------
 * p5 — windowResized
 * ---------------------------------------------------------------------------*/
function windowResized() {
  _recalculateLayout();
}

/* ---------------------------------------------------------------------------
 * p5 — draw (60 fps)
 * ---------------------------------------------------------------------------*/
function draw() {
  switch (currentState) {
    case STATE.WELCOME: drawWelcome();        break;
    case STATE.MAIN:    drawMain();           break;
    case STATE.ISLAND1: drawIsland1();        break;
    case STATE.ISLAND2: drawIsland2();        break;
    case STATE.ISLAND3: drawIsland3();        break;
    case STATE.LOADING: drawLoadingScreen();  break;
    default:
      console.error("draw(): unhandled state ->", currentState);
  }
}

/* ---------------------------------------------------------------------------
 * DEBUG KEY
 * ---------------------------------------------------------------------------*/
function keyPressed() {
  /* ── Island 2 debug — press S to advance story ── */
  if (currentState === STATE.ISLAND2) {
    if (key === 's' || key === 'S') _advanceStory();
  }

  /* ── Island 3 debug — press E to skip to summary ── */
  if (currentState === STATE.ISLAND3) {
    if (key === 'e' || key === 'E') {
      for (const z of _zones) z.touched = true;
      _bufferDirty = true;
      _mazeState   = I3_STATE.EVENTSUM;
    }
  }
}