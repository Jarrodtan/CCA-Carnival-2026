/* =============================================================================
 * stateManager.js
 * Game State Manager (GSM) — with lazy asset loading.
 *
 * Each island registers a loadAssets() callback in addition to enter/exit.
 * On the FIRST visit, loadAssets() is called and the state shows a loading
 * screen until p5's loadImage calls finish (tracked via a counter).
 *
 * Analogy: SceneManager + AssetStreamer in a game engine.
 *
 * Usage:
 *   registerState(STATE.ISLAND1, {
 *     loadAssets: loadAssetsIsland1,   // called once, first visit only
 *     enter:      enterStateIsland1,
 *     exit:       exitStateIsland1,
 *   });
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Internal registry
 * ---------------------------------------------------------------------------*/
const _stateRegistry = {};

/* ---------------------------------------------------------------------------
 * Active state
 * ---------------------------------------------------------------------------*/
let currentState = STATE.WELCOME;

/* ---------------------------------------------------------------------------
 * Loading state — shown while lazy assets stream in
 * ---------------------------------------------------------------------------*/
let _isLoading   = false;
let _loadTarget  = null;    // state we are loading toward

/* ---------------------------------------------------------------------------
 * Public API
 * ---------------------------------------------------------------------------*/

/**
 * @param {string} name
 * @param {object} callbacks
 * @param {Function} [callbacks.loadAssets]  Called once on first visit.
 * @param {Function}  callbacks.enter
 * @param {Function} [callbacks.exit]
 */
function registerState(name, callbacks) {
  _stateRegistry[name] = {
    loadAssets: callbacks.loadAssets || null,
    enter:      callbacks.enter      || function () {},
    exit:       callbacks.exit       || function () {},
    loaded:     false,               // flips true after first loadAssets()
  };
}

/**
 * Transition to targetState.
 * If the state has a loadAssets() and hasn't loaded yet, shows loading screen
 * first; enter() is called once loading completes.
 */
function changeState(targetState) {
  if (!_stateRegistry[targetState]) {
    console.error("changeState: unknown state ->", targetState);
    return;
  }

  /* Exit current */
  if (_stateRegistry[currentState]) {
    _stateRegistry[currentState].exit();
  }

  const reg = _stateRegistry[targetState];

  if (reg.loadAssets && !reg.loaded) {
    /* First visit — stream assets then enter */
    _isLoading  = true;
    _loadTarget = targetState;
    currentState = STATE.LOADING;
    console.log("GSM: loading assets for", targetState);
    reg.loadAssets(() => {
      /* Callback fires when all loadImage() calls in loadAssets complete. */
      reg.loaded   = true;
      _isLoading   = false;
      currentState = targetState;
      reg.enter();
      console.log("GSM: -> ", targetState);
    });
  } else {
    /* Already loaded (or MAIN which has no lazy assets) */
    reg.enter();
    currentState = targetState;
    console.log("GSM:", currentState, "->", targetState);
  }
}

/**
 * Draw a simple loading screen.
 * Called from draw() when currentState === STATE.LOADING.
 */
function drawLoadingScreen() {
  background(20);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(22);
  text("Loading...", width / 2, height / 2);

  /* Animated dots */
  const dots = ".".repeat(1 + floor((millis() / 400) % 4));
  textSize(18);
  fill(180);
  text(dots, width / 2, height / 2 + 36);
}