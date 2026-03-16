/* =============================================================================
 * island2State.js
 * ISLAND2 state — Volcano & Alumni story.
 *
 * Optimisations:
 *   • Assets loaded lazily on first visit via loadAssetsIsland2().
 *
 * Flow: 1(shake) → 2 → 3 → ... → 9(back)
 * =============================================================================*/

"use strict";

const I2_FIRST_STATE = 1;
const I2_LAST_STATE  = 9;

/* ---------------------------------------------------------------------------
 * Assets (populated by loadAssetsIsland2)
 * ---------------------------------------------------------------------------*/
let _passiveImg, _activeImg, _alumniHelpImg;
let _shelterStartImg, _shelterEndImg, _shelterEndThankYouImg;
let _alumniImage1, _alumniImage2, _alumniAboutImg;
let _fireballImg;

let _storyState = I2_FIRST_STATE;

let _backBtnI2, _nextBtnI2;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function preloadIsland2() {
  /* Nothing — lazy loaded. */
}

/**
 * Called by stateManager on first visit.
 * @param {Function} onDone
 */
function loadAssetsIsland2(onDone) {
  let loaded = 0;
  const total = 10;
  const tick  = () => { if (++loaded === total) onDone(); };

  _passiveImg            = loadImage("assets/passive.png",             tick);
  _activeImg             = loadImage("assets/active.png",              tick);
  _alumniHelpImg         = loadImage("assets/alumniHelp.png",          tick);
  _shelterStartImg       = loadImage("assets/shelterStart.png",        tick);
  _fireballImg           = loadImage("assets/fireball.gif",            tick);
  _shelterEndImg         = loadImage("assets/shelterEnd.png",          tick);
  _shelterEndThankYouImg = loadImage("assets/shelterEndThankYou.png",  tick);
  _alumniImage1          = loadImage("assets/alumniImage_1.png",       tick);
  _alumniImage2          = loadImage("assets/alumniImage_2.png",       tick);
  _alumniAboutImg        = loadImage("assets/alumniAbout.png",         tick);
}

function setupIsland2() {
  _backBtnI2 = createButton("Back");
  _backBtnI2.style("font-size", "20px");
  _backBtnI2.position(width - CFG_BTN_BACK_RIGHT_OFFSET, height - CFG_BTN_BACK_BOTTOM_OFFSET);
  _backBtnI2.mousePressed(() => changeState(STATE.MAIN));
  _backBtnI2.hide();

  _nextBtnI2 = createButton("Next");
  _nextBtnI2.style("font-size", "20px");
  _nextBtnI2.position(width - CFG_BTN_BACK_RIGHT_OFFSET, height - CFG_BTN_BACK_BOTTOM_OFFSET);
  _nextBtnI2.mousePressed(_advanceStory);
  _nextBtnI2.hide();

  setShakeThreshold(CFG_SHAKE_THRESHOLD);

  registerState(STATE.ISLAND2, {
    loadAssets: loadAssetsIsland2,
    enter:      enterStateIsland2,
    exit:       exitStateIsland2,
  });
}

function drawIsland2() {
  background(220);
  imageMode(CORNER);

  _nextBtnI2.hide();
  _backBtnI2.hide();

  if (_storyState > I2_FIRST_STATE && _storyState < I2_LAST_STATE) {
    _nextBtnI2.show();
  } else if (_storyState === I2_LAST_STATE) {
    _backBtnI2.show();
  }

  switch (_storyState) {
    case 1: image(_passiveImg,            0, 0, width, height); break;
    case 2: image(_activeImg,             0, 0, width, height);
            image(_fireballImg,           0, 0, width, height); break;
    case 3: image(_alumniHelpImg,         0, 0, width, height); break;
    case 4: image(_shelterStartImg,       0, 0, width, height);
            image(_fireballImg,           0, 0, width, height); break;
    case 5: image(_shelterEndThankYouImg, 0, 0, width, height); break;
    case 6: image(_shelterEndImg,         0, 0, width, height); break;
    case 7: image(_alumniImage1,          0, 0, width, height); break;
    case 8: image(_alumniImage2,          0, 0, width, height); break;
    case 9: image(_alumniAboutImg,        0, 0, width, height); break;
  }
}

/* =============================================================================
 * GSM callbacks
 * =============================================================================*/

function enterStateIsland2() {
  _storyState = I2_FIRST_STATE;
}

function exitStateIsland2() {
  _backBtnI2.hide();
  _nextBtnI2.hide();
}

/* =============================================================================
 * p5 callback
 * =============================================================================*/

function deviceShaken() {
  if (_storyState === I2_FIRST_STATE) _advanceStory();
}

function _advanceStory() {
  if (_storyState < I2_LAST_STATE) _storyState++;
}