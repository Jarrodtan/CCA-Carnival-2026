/* =============================================================================
 * mainState.js
 * MAIN state — overworld sailing map.
 *
 * Analogy: MainScene.cpp  (a concrete scene/state implementation).
 *
 * Lifecycle functions called by main.js:
 *   preloadMain()     — asset loading
 *   setupMain()       — one-time init
 *   drawMain()        — per-frame update + render
 *
 * State-manager callbacks (registered in main.js):
 *   enterStateMain()  — reset on re-entry
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Assets
 * ---------------------------------------------------------------------------*/
let _backgroundImg;
let _boatImg;
let _island1Img, _island2Img, _island3Img;

/* ---------------------------------------------------------------------------
 * Layout — computed in setupMain(), reused every frame
 * ---------------------------------------------------------------------------*/
let _island1Pos, _island2Pos, _island3Pos;
let _island1W, _island2W, _island3W;
let _island1H, _island2H, _island3H;
let _ckpt1Pos,  _ckpt2Pos,  _ckpt3Pos;
let _boatW, _boatH;

/* ---------------------------------------------------------------------------
 * Boat state
 * ---------------------------------------------------------------------------*/
let _boatPos;                        // { x, y } — screen position (centre)
let _boatRot      = CFG_BOAT_INIT_ROT; // current rotation  (degrees)
let _targetRot    = CFG_BOAT_INIT_ROT; // desired rotation  (degrees)

/* ---------------------------------------------------------------------------
 * Camera capture (used by Island 1 brightness check)
 * ---------------------------------------------------------------------------*/
let video;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function preloadMain() {
  _island1Img    = loadImage("assets/island1.png");
  _island2Img    = loadImage("assets/island2.png");
  _island3Img    = loadImage("assets/island3.png");
  _boatImg       = loadImage("assets/boat.png");
  _backgroundImg = loadImage("assets/backgroundMain.png");
}

function setupMain() {
  /* --- Canvas --- */
  const canFullscreen = (document.fullscreenEnabled ||
                         document.webkitFullscreenEnabled ||
                         document.mozFullScreenEnabled   ||
                         document.msFullscreenEnabled);

  if (canFullscreen) {
    createCanvas(displayWidth, displayHeight);
    const fsBtn = createButton("Fullscreen");
    fsBtn.position(20, 20);
    fsBtn.mousePressed(() => fullscreen(!fullscreen()));
    console.log("Press Fullscreen for the best experience!");
  } else {
    createCanvas(windowWidth, windowHeight);
  }

  /* --- Front-facing camera (used in Island 1 for brightness detection) --- */
  video = createCapture({ video: { facingMode: "user" }, audio: false });
  video.size(100, 100);
  video.hide();

  /* --- Compute image sizes based on orientation --- */
  _computeImageLayout();

  /* --- Island anchor positions (centred on image) --- */
  _island1Pos = { x: width  - 0.5 * _island1W,   y: _island1H / 2 };
  _island2Pos = { x: _island2W / 2,               y: height / 2    };
  _island3Pos = { x: width  - 0.5 * _island3W,   y: height - _island3H / 2 };

  /* --- Checkpoint positions (docking points near each island) --- */
  _ckpt1Pos = { x: _island1Pos.x - (1/5) * _island1W, y: _island1Pos.y - (1/4) * _island1H };
  _ckpt2Pos = { x: _island2Pos.x,                      y: _island2Pos.y - (1/6) * _island2H };
  _ckpt3Pos = { x: _island3Pos.x,                      y: _island3Pos.y                      };

  /* --- Initial boat position --- */
  _boatPos = _defaultBoatPos();

  /* --- Calibrate heading --- */
  calibrateHeading(270);

  /* --- Register with the GSM --- */
  registerState(STATE.MAIN, { enter: enterStateMain });
}

function drawMain() {
  /* Fallback calibration if heading was undefined at setup time (iOS timing). */
  if (originalHeading === undefined || isNaN(originalHeading)) {
    calibrateHeading(270);
  }

  /* Only update game logic once permissions are available. */
  if (permissionsGranted && originalHeading !== undefined) {
    document.body.removeEventListener("click", _requestIOSPermission);

    _updateBoat();
    _clampBoatPosition();
    _checkIslandCollisions();
  }

  /* --- Render --- */
  _render();
}

/* =============================================================================
 * GSM callbacks
 * =============================================================================*/

/** Reset boat to spawn position and recalibrate compass on re-entry. */
function enterStateMain() {
  _boatPos = _defaultBoatPos();
  calibrateHeading(270);
}

/* =============================================================================
 * Private — update
 * =============================================================================*/

/**
 * Read input, compute desired heading, lerp current rotation toward it.
 * Moves the boat position in the current facing direction.
 */
function _updateBoat() {
  angleMode(DEGREES);

  const dir = getInputDir();          // { x, y } from inputHandler.js

  /* Only recalculate target rotation when there is actual input. */
  if (dir.x !== 0 || dir.y !== 0) {
    /* Forward vector of the boat (from current rotation). */
    const fwdX = cos(_boatRot);
    const fwdY = sin(_boatRot);

    /* Angle between current heading and desired direction. */
    const dot   = fwdX * dir.x + fwdY * dir.y;
    const magFwd = sqrt(fwdX * fwdX + fwdY * fwdY);
    const magDir = sqrt(dir.x * dir.x + dir.y * dir.y);
    let delta = acos(dot / (magFwd * magDir));

    /* Determine sign (CW or CCW) using the 2-D cross product. */
    if (fwdX * (-dir.y) + fwdY * dir.x > 0) {
      delta = -delta;
    }

    if (!isNaN(delta)) {
      _targetRot = _boatRot + delta;
    }
  }

  /* Smooth rotation. */
  _boatRot = lerp(_boatRot, _targetRot, CFG_BOAT_ROT_LERP);

  /* Translate position. */
  _boatPos.x += dir.x * CFG_BOAT_SPEED;
  _boatPos.y += dir.y * CFG_BOAT_SPEED;
}

/** Keep the boat fully inside the canvas. */
function _clampBoatPosition() {
  _boatPos.x = constrain(_boatPos.x, _boatW / 2, width  - _boatW / 2);
  _boatPos.y = constrain(_boatPos.y, _boatH / 2, height - _boatH / 2);
}

/** Trigger a state change when the boat reaches a checkpoint AABB. */
function _checkIslandCollisions() {
  /* Island 1 uses a fixed collision box to match its large size. */
  if (_aabbOverlap(_boatPos, _ckpt1Pos, (2/5) * height, (2/5) * height)) {
    changeState(STATE.ISLAND1);
  } else if (_aabbOverlap(_boatPos, _ckpt2Pos, _island2W * 0.5, _island2H * 0.5)) {
    changeState(STATE.ISLAND2);
  } else if (_aabbOverlap(_boatPos, _ckpt3Pos, _island3W * 0.5, _island3H * 0.5)) {
    changeState(STATE.ISLAND3);
  }
}

/* =============================================================================
 * Private — render
 * =============================================================================*/

function _render() {
  /* Background */
  imageMode(CORNER);
  image(_backgroundImg, 0, 0, width, height);

  /* Islands */
  imageMode(CENTER);
  image(_island1Img, _island1Pos.x, _island1Pos.y, _island1W, _island1H);
  image(_island2Img, _island2Pos.x, _island2Pos.y, _island2W, _island2H);
  image(_island3Img, _island3Pos.x, _island3Pos.y, _island3W, _island3H);

  /* Boat (rotated around its centre) */
  push();
    translate(_boatPos.x, _boatPos.y);
    rotate(_boatRot);
    imageMode(CENTER);
    image(_boatImg, 0, 0, _boatW, _boatH);
  pop();

  /* Debug: checkpoint circles */
  noStroke();
  fill(255, 0, 0);
  circle(_ckpt1Pos.x, _ckpt1Pos.y, 10);
  circle(_ckpt2Pos.x, _ckpt2Pos.y, 10);
  circle(_ckpt3Pos.x, _ckpt3Pos.y, 10);
}

/* =============================================================================
 * Private — utilities
 * =============================================================================*/

/** Default spawn position for the boat (lower-left quarter). */
function _defaultBoatPos() {
  return { x: width * 0.25, y: (5 * height) / 6 };
}

/**
 * Compute image dimensions from current canvas size and orientation.
 * Called once in setup; if you add windowResized() support, call it again.
 */
function _computeImageLayout() {
  const portrait = (width < height);

  if (portrait) {
    _boatW = CFG_BOAT_SIZE_RATIO * width;
    _boatH = (_boatW / _boatImg.width) * _boatImg.height;

    _island1W = CFG_ISLAND1_RATIO_P * width;
    _island2W = CFG_ISLAND2_RATIO_P * width;
    _island3W = CFG_ISLAND3_RATIO_P * width;
  } else {
    _boatH = CFG_BOAT_SIZE_RATIO * height;
    _boatW = (_boatH / _boatImg.height) * _boatImg.width;

    _island1H = CFG_ISLAND1_RATIO_L * height;
    _island1W = (_island1H / _island1Img.height) * _island1Img.width;

    _island2H = CFG_ISLAND2_RATIO_L * height;
    _island2W = (_island2H / _island2Img.height) * _island2Img.width;

    _island3H = CFG_ISLAND3_RATIO_L * height;
    _island3W = (_island3H / _island3Img.height) * _island3Img.width;
  }

  /* Portrait path didn't set heights yet — compute them now. */
  if (portrait) {
    _island1H = (_island1W / _island1Img.width) * _island1Img.height;
    _island2H = (_island2W / _island2Img.width) * _island2Img.height;
    _island3H = (_island3W / _island3Img.width) * _island3Img.height;
  }
}

/**
 * Axis-Aligned Bounding Box overlap test.
 * Both rectangles are specified by their CENTRE point plus half-extents.
 *
 * @param {{ x, y }} a      - Centre of rect A.
 * @param {{ x, y }} b      - Centre of rect B.
 * @param {number}   halfW  - Half-width  of rect B.
 * @param {number}   halfH  - Half-height of rect B.
 * @returns {boolean}
 */
function _aabbOverlap(a, b, halfW, halfH) {
  return !(a.x < b.x - halfW ||
           a.x > b.x + halfW ||
           a.y < b.y - halfH ||
           a.y > b.y + halfH);
}
