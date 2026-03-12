/* =============================================================================
 * island1State.js
 * ISLAND1 state — Lighthouse & Wheel of Life.
 *
 * Flow (sub-states):
 *   boatFreeze  → Prompt player to cover camera
 *   covered     → Camera covered; dark scene shown
 *   shine       → Camera uncovered; lighthouse revealed  [Next →]
 *   ourSource   → "Our Source of Light" slide            [Next →]
 *   nextPart    → Interactive compass-driven Wheel of Life
 *
 * Sensor:
 *   Uses the front-facing camera (video created in mainState.js) to measure
 *   average brightness — covering the lens triggers the story transition.
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Assets
 * ---------------------------------------------------------------------------*/
let _boatFreezeImg, _darkLandImg, _lighthouseImg, _ourSourceLightImg;
let _wheelLifeImg, _wheelImg, _hubImg;
let _prayerImg, _witnessingImg, _theWordImg, _fellowshipImg;

/* ---------------------------------------------------------------------------
 * Sub-state
 * ---------------------------------------------------------------------------*/
const I1_STATE = Object.freeze({
  BOAT_FREEZE : "boatFreeze",
  COVERED     : "covered",
  SHINE       : "shine",
  OUR_SOURCE  : "ourSource",
  NEXT_PART   : "nextPart",
});

let _i1State = I1_STATE.BOAT_FREEZE;

/* ---------------------------------------------------------------------------
 * UI elements
 * ---------------------------------------------------------------------------*/
let _backBtn, _nextBtn;

/* ---------------------------------------------------------------------------
 * Brightness debounce
 * ---------------------------------------------------------------------------*/
let _uncoveredSince = 0;   // timestamp when brightness first rose above threshold

/* ---------------------------------------------------------------------------
 * Wheel size (computed on enter so it responds to screen size)
 * ---------------------------------------------------------------------------*/
let _wheelSize;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function preloadIsland1() {
  _boatFreezeImg     = loadImage("assets/boat_freeze.png");
  _darkLandImg       = loadImage("assets/dark_land.png");
  _lighthouseImg     = loadImage("assets/lighthouse_shine.png");
  _ourSourceLightImg = loadImage("assets/our_source_light.png");
  _wheelLifeImg      = loadImage("assets/wheel_life.png");
  _wheelImg          = loadImage("assets/wheel.png");
  _hubImg            = loadImage("assets/HUB.png");
  _prayerImg         = loadImage("assets/PRAYER.png");
  _witnessingImg     = loadImage("assets/WITNESSING.png");
  _theWordImg        = loadImage("assets/THE WORD.png");
  _fellowshipImg     = loadImage("assets/FELLOWSHIP.png");
}

function setupIsland1() {
  /* --- Back button (top-left) --- */
  _backBtn = createButton("Back");
  _backBtn.position(20, 50);
  _backBtn.mousePressed(() => changeState(STATE.MAIN));
  _backBtn.hide();

  /* --- Next button (bottom-right) --- */
  _nextBtn = createButton("Next");
  _nextBtn.style("font-size", "16px");
  _nextBtn.position(width - 100, height - 50);
  _nextBtn.mousePressed(_onNextPressed);
  _nextBtn.hide();

  /* --- Wheel size (constant for a given screen) --- */
  _wheelSize = 0.5 * min(width, height);

  /* --- Register with GSM --- */
  registerState(STATE.ISLAND1, { enter: enterStateIsland1, exit: exitStateIsland1 });
}

function drawIsland1() {
  imageMode(CORNER);

  /* Show / hide Next based on sub-state. */
  const showNext = (_i1State === I1_STATE.SHINE || _i1State === I1_STATE.OUR_SOURCE);
  showNext ? _nextBtn.show() : _nextBtn.hide();

  /* --- Sub-state render --- */
  switch (_i1State) {
    case I1_STATE.BOAT_FREEZE:
      image(_boatFreezeImg, 0, 0, width, height);
      break;

    case I1_STATE.COVERED:
      image(_darkLandImg, 0, 0, width, height);
      break;

    case I1_STATE.SHINE:
      image(_darkLandImg,   0, 0, width, height);
      image(_lighthouseImg, 0, 0, width, height);
      break;

    case I1_STATE.OUR_SOURCE:
      image(_ourSourceLightImg, 0, 0, width, height);
      break;

    case I1_STATE.NEXT_PART:
      _drawWheelOfLife();
      break;
  }

  /* Camera brightness check drives boatFreeze → covered → shine. */
  _processCameraBrightness();
}

/* =============================================================================
 * GSM callbacks
 * =============================================================================*/

function enterStateIsland1() {
  calibrateHeading(270);
  _i1State      = I1_STATE.BOAT_FREEZE;
  _uncoveredSince = 0;
  _backBtn.show();
}

function exitStateIsland1() {
  _backBtn.hide();
  _nextBtn.hide();
}

/* =============================================================================
 * Private — render
 * =============================================================================*/

/**
 * Render the compass-driven Wheel of Life and overlay the active spoke label.
 */
function _drawWheelOfLife() {
  /* Heading delta converted to a [0, 360) wheel rotation angle. */
  const wheelRot = (((originalHeading - deviceHeading) % 360) + 360) % 360;

  image(_wheelLifeImg, 0, 0, width, height);

  push();
    translate(width / 2, height / 2);
    rotate(wheelRot);
    imageMode(CENTER);
    image(_wheelImg, 0, 0, _wheelSize, _wheelSize);
  pop();

  /* Hub overlay (centred, does not rotate). */
  push();
    translate(width / 2, height / 2);
    imageMode(CENTER);
    image(_hubImg, 0, 0, _wheelSize * 0.25, _wheelSize * 0.25);
  pop();

  /* Spoke labels — shown when wheel rotation falls in each 60° window. */
  imageMode(CORNER);
  if      (wheelRot > 330 || wheelRot <  30) image(_prayerImg,     0, 0, width, height);
  else if (wheelRot >  60 && wheelRot < 120) image(_witnessingImg, 0, 0, width, height);
  else if (wheelRot > 150 && wheelRot < 210) image(_theWordImg,    0, 0, width, height);
  else if (wheelRot > 240 && wheelRot < 300) image(_fellowshipImg, 0, 0, width, height);
}

/* =============================================================================
 * Private — camera brightness
 * =============================================================================*/

/**
 * Samples every pixel of the 100x100 video frame to compute average brightness.
 * Drives the boatFreeze → covered → shine sub-state transitions.
 */
function _processCameraBrightness() {
  video.loadPixels();

  const numPixels = video.pixels.length / 4;
  let   totalBrightness = 0;

  for (let i = 0; i < video.pixels.length; i += 4) {
    const r = video.pixels[i];
    const g = video.pixels[i + 1];
    const b = video.pixels[i + 2];
    totalBrightness += (r + g + b) / 3;
  }

  const avg = totalBrightness / numPixels;

  /* Expose for Island 3 (legacy reference — keep until Island 3 no longer needs it). */
  brightnessIsland3 = avg;

  switch (_i1State) {
    case I1_STATE.BOAT_FREEZE:
      if (avg < CFG_BRIGHTNESS_THRESHOLD) {
        _i1State = I1_STATE.COVERED;
      }
      break;

    case I1_STATE.COVERED:
      if (avg >= CFG_BRIGHTNESS_THRESHOLD) {
        /* Start debounce timer on first bright frame. */
        if (_uncoveredSince === 0) {
          _uncoveredSince = millis();
        } else if (millis() - _uncoveredSince > CFG_UNCOVER_DEBOUNCE_MS) {
          _i1State = I1_STATE.SHINE;
        }
      } else {
        /* Camera went dark again — reset debounce. */
        _uncoveredSince = 0;
      }
      break;

    /* No camera checks in shine / ourSource / nextPart. */
  }
}

/* =============================================================================
 * Private — UI callbacks
 * =============================================================================*/

function _onNextPressed() {
  if (_i1State === I1_STATE.SHINE) {
    _i1State = I1_STATE.OUR_SOURCE;
  } else if (_i1State === I1_STATE.OUR_SOURCE) {
    _i1State = I1_STATE.NEXT_PART;
    _nextBtn.hide();
  }
}
