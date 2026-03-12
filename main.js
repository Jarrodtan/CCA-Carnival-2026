/* =============================================================================
 * main.js
 * Entry point — p5.js lifecycle hooks.
 *
 * Analogy: main.cpp  (WinMain / entry point in a game engine).
 *   - Calls preload / setup / draw on each registered module in order.
 *   - Contains NO game logic; delegates everything to state modules.
 *
 * Load order (index.html):
 *   config.js → handlePermissions.js → stateManager.js →
 *   inputHandler.js → mainState.js → island1State.js →
 *   island2State.js → island3State.js → main.js
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * p5 — preload
 * Load all assets before setup() is called.
 * ---------------------------------------------------------------------------*/
function preload() {
  preloadMain();
  preloadIsland1();
  preloadIsland2();
  preloadIsland3();
}

/* ---------------------------------------------------------------------------
 * p5 — setup
 * One-time initialisation. Each state module creates its canvas / UI here
 * and self-registers with the GSM via registerState().
 * ---------------------------------------------------------------------------*/
function setup() {
  setupMain();
  setupIsland1();
  setupIsland2();
  setupIsland3();
}

/* ---------------------------------------------------------------------------
 * p5 — draw (60 fps game loop)
 * Dispatch to the currently active state's draw function.
 * ---------------------------------------------------------------------------*/
function draw() {
  switch (currentState) {
    case STATE.MAIN:    drawMain();    break;
    case STATE.ISLAND1: drawIsland1(); break;
    case STATE.ISLAND2: drawIsland2(); break;
    case STATE.ISLAND3: drawIsland3(); break;
    default:
      console.error("draw(): unhandled state ->", currentState);
  }
}
