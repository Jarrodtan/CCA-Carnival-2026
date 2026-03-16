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
 * p5 — mousePressed
 * Forward to welcome screen button handler.
 * ---------------------------------------------------------------------------*/
function mousePressed() {
  _welcomeHandlePress();
}