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
 * Loading progress — updated by each island's loadAssets tick
 * ---------------------------------------------------------------------------*/
let _loadProgress = { loaded: 0, total: 0 };

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
 * Draw loading screen with night sky theme matching welcome screen.
 * Called from draw() when currentState === STATE.LOADING.
 */
function drawLoadingScreen() {
  /* ── Night sky gradient — matches welcome screen ── */
  noStroke();
  const topCol = color(10, 31, 61);    // #0a1f3d
  const botCol = color(13, 45, 94);    // #0d2d5e
  for (let y = 0; y < height; y++) {
    fill(lerpColor(topCol, botCol, y / height));
    rect(0, y, width, 1);
  }
 
  /* ── Twinkling stars ── */
  const stars = [
    [0.12, 0.05], [0.45, 0.03], [0.78, 0.08], [0.25, 0.12],
    [0.60, 0.06], [0.88, 0.15], [0.35, 0.18], [0.70, 0.11],
    [0.05, 0.22], [0.92, 0.04], [0.55, 0.20], [0.18, 0.30],
  ];
  push();
    noStroke();
    for (const [sx, sy] of stars) {
      const twinkle = 0.5 + 0.5 * sin(millis() * 0.002 + sx * 20);
      fill(255, 255, 255, (0.4 + 0.5 * twinkle) * 255);
      const r = constrain(width * 0.006, 2, 5);
      circle(sx * width, sy * height, r * 2);
    }
  pop();
 
  const cx  = width  / 2;
  const cy  = height / 2;
  const pct = _loadProgress.total > 0
    ? min(100, floor((_loadProgress.loaded / _loadProgress.total) * 100))
    : 0;
 
  /* ── Percentage number ── */
  push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(constrain(width * 0.14, 42, 80));
    fill(255);
    noStroke();
    text(pct + "%", cx, cy - height * 0.06);
  pop();
 
  /* ── "Loading..." label ── */
  push();
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textSize(constrain(width * 0.045, 14, 22));
    fill(255, 255, 255, 180);
    noStroke();
    // const dots = ".".repeat(1 + floor((millis() / 400) % 4));
    // text("Loading" + dots, cx, cy + height * 0.04);
    text("Loading...", cx, cy + height * 0.04);
  pop();
 
  /* ── Progress bar ── */
  const barW = width  * 0.65;
  const barH = constrain(height * 0.012, 6, 12);
  const barX = cx - barW / 2;
  const barY = cy + height * 0.1;
  push();
    noStroke();
    fill(255, 255, 255, 40);
    rect(barX, barY, barW, barH, barH / 2);
    if (pct > 0) {
      fill(232, 119, 34);   // SP orange
      rect(barX, barY, barW * (pct / 100), barH, barH / 2);
    }
  pop();
}