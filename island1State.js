/* =============================================================================
 * island1State.js
 * ISLAND1 state — Lighthouse & Wheel of Life.
 *
 * Optimisations:
 *   • Assets loaded lazily on first visit (loadAssetsIsland1 callback).
 *   • Camera brightness throttled via getCameraAvgBrightness() in camera.js.
 *   • Pixel loop removed — camera.js handles sampling.
 *   • Only checks camera in states that need it (not in shine/ourSource/nextPart).
 *
 * Flow:  boatFreeze → covered → shine → ourSource → nextPart (wheel)
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Assets (populated by loadAssetsIsland1)
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
let _backBtnI1, _nextBtnI1;

/* ---------------------------------------------------------------------------
 * Brightness debounce
 * ---------------------------------------------------------------------------*/
let _uncoveredSince = 0;

/* ---------------------------------------------------------------------------
 * Wheel size
 * ---------------------------------------------------------------------------*/
let _wheelSize;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function preloadIsland1() {
  /* Nothing — assets loaded lazily on first visit. */
}

/**
 * Called by stateManager on first visit.
 * Loads all Island 1 assets; calls onDone() when complete.
 *
 * @param {Function} onDone  — stateManager callback, fires when all loads finish.
 */
function loadAssetsIsland1(onDone) {
  let loaded = 0;
  const total = 11;
  const tick  = () => { if (++loaded === total) onDone(); };

  _boatFreezeImg     = loadImage("assets/boat_freeze.png",       tick);
  _darkLandImg       = loadImage("assets/dark_land.png",         tick);
  _lighthouseImg     = loadImage("assets/lighthouse_shine.png",  tick);
  _ourSourceLightImg = loadImage("assets/our_source_light.png",  tick);
  _wheelLifeImg      = loadImage("assets/wheel_life.png",        tick);
  _wheelImg          = loadImage("assets/wheel.png",             tick);
  _hubImg            = loadImage("assets/HUB.png",               tick);
  _prayerImg         = loadImage("assets/PRAYER.png",            tick);
  _witnessingImg     = loadImage("assets/WITNESSING.png",        tick);
  _theWordImg        = loadImage("assets/THE WORD.png",          tick);
  _fellowshipImg     = loadImage("assets/FELLOWSHIP.png",        tick);
}

function setupIsland1() {
  _backBtnI1 = createButton("Back");
  _backBtnI1.position(20, 50);
  _backBtnI1.mousePressed(() => changeState(STATE.MAIN));
  _backBtnI1.hide();

  _nextBtnI1 = createButton("Next");
  _nextBtnI1.style("font-size", "16px");
  _nextBtnI1.position(width - CFG_BTN_NEXT_RIGHT_OFFSET, height - CFG_BTN_NEXT_BOTTOM_OFFSET);
  _nextBtnI1.mousePressed(_onNextPressed);
  _nextBtnI1.hide();

  _wheelSize = 0.5 * min(width, height);

  registerState(STATE.ISLAND1, {
    loadAssets: loadAssetsIsland1,
    enter:      enterStateIsland1,
    exit:       exitStateIsland1,
  });
}

function drawIsland1() {
  imageMode(CORNER);

  const showNext = (_i1State === I1_STATE.SHINE || _i1State === I1_STATE.OUR_SOURCE);
  showNext ? _nextBtnI1.show() : _nextBtnI1.hide();

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

  /* Only run camera check in states that need it — saves CPU in later states. */
  if (_i1State === I1_STATE.BOAT_FREEZE || _i1State === I1_STATE.COVERED) {
    _processCameraBrightness();
  }
}

/* =============================================================================
 * GSM callbacks
 * =============================================================================*/

function enterStateIsland1() {
  calibrateHeading(270);
  _i1State        = I1_STATE.BOAT_FREEZE;
  _uncoveredSince = 0;
  _backBtnI1.show();
}

function exitStateIsland1() {
  _backBtnI1.hide();
  _nextBtnI1.hide();
}

/* =============================================================================
 * Private — render
 * =============================================================================*/

function _drawWheelOfLife() {
  const wheelRot = (((originalHeading - deviceHeading) % 360) + 360) % 360;

  image(_wheelLifeImg, 0, 0, width, height);

  push();
    translate(width / 2, height / 2);
    rotate(wheelRot);
    imageMode(CENTER);
    image(_wheelImg, 0, 0, _wheelSize, _wheelSize);
  pop();

  push();
    translate(width / 2, height / 2);
    imageMode(CENTER);
    image(_hubImg, 0, 0, _wheelSize * 0.25, _wheelSize * 0.25);
  pop();

  imageMode(CORNER);
  if      (wheelRot > 330 || wheelRot <  30) image(_prayerImg,     0, 0, width, height);
  else if (wheelRot >  60 && wheelRot < 120) image(_witnessingImg, 0, 0, width, height);
  else if (wheelRot > 150 && wheelRot < 210) image(_theWordImg,    0, 0, width, height);
  else if (wheelRot > 240 && wheelRot < 300) image(_fellowshipImg, 0, 0, width, height);
}

/* =============================================================================
 * Private — camera brightness (throttled via camera.js)
 * =============================================================================*/

function _processCameraBrightness() {
  const avg = getCameraAvgBrightness();   // throttled — reads cached value most frames

  switch (_i1State) {
    case I1_STATE.BOAT_FREEZE:
      if (avg < CFG_BRIGHTNESS_THRESHOLD) {
        _i1State = I1_STATE.COVERED;
      }
      break;

    case I1_STATE.COVERED:
      if (avg >= CFG_BRIGHTNESS_THRESHOLD) {
        if (_uncoveredSince === 0) {
          _uncoveredSince = millis();
        } else if (millis() - _uncoveredSince > CFG_UNCOVER_DEBOUNCE_MS) {
          _i1State = I1_STATE.SHINE;
        }
      } else {
        _uncoveredSince = 0;
      }
      break;
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
    _nextBtnI1.hide();
  }
}