/* =============================================================================
 * island2State.js
 * ISLAND2 state — Volcano & Alumni story.
 *
 * Story flow (linear — driven by Next button, except State 1 → 2 via shake):
 *   1  Passive volcano       ← shake phone to trigger eruption
 *   2  Active volcano
 *   3  Alumni comes to help
 *   4  Shelter (fireballs)
 *   5  Thank-you response
 *   6  Shelter end
 *   7  Alumni image 1
 *   8  Alumni image 2
 *   9  Alumni about / poster  ← Back button visible
 *
 * Sensor:
 *   p5's deviceShaken() callback; threshold set via setShakeThreshold().
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Story state constants
 * ---------------------------------------------------------------------------*/
const I2_FIRST_STATE = 1;
const I2_LAST_STATE  = 9;

/* ---------------------------------------------------------------------------
 * Assets
 * ---------------------------------------------------------------------------*/
let _passiveImg, _activeImg, _alumniHelpImg;
let _shelterStartImg, _shelterEndImg, _shelterEndThankYouImg;
let _alumniImage1, _alumniImage2, _alumniAboutImg;
let _fireballImg;

/* ---------------------------------------------------------------------------
 * State
 * ---------------------------------------------------------------------------*/
let _storyState = I2_FIRST_STATE;

/* ---------------------------------------------------------------------------
 * UI elements
 * ---------------------------------------------------------------------------*/
let _backBtnI2, _nextBtnI2;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function preloadIsland2() {
  _passiveImg             = loadImage("assets/passive.png");
  _activeImg              = loadImage("assets/active.png");
  _alumniHelpImg          = loadImage("assets/alumniHelp.png");
  _shelterStartImg        = loadImage("assets/shelterStart.png");
  _fireballImg            = loadImage("assets/fireball.gif");
  _shelterEndImg          = loadImage("assets/shelterEnd.png");
  _shelterEndThankYouImg  = loadImage("assets/shelterEndThankYou.png");
  _alumniImage1           = loadImage("assets/alumniImage_1.png");
  _alumniImage2           = loadImage("assets/alumniImage_2.png");
  _alumniAboutImg         = loadImage("assets/alumniAbout.png");
}

function setupIsland2() {
  /* --- Back button (bottom-right, shown only on last slide) --- */
  _backBtnI2 = createButton("Back");
  _backBtnI2.style("font-size", "20px");
  _backBtnI2.position(width - 120, height - 60);
  _backBtnI2.mousePressed(() => changeState(STATE.MAIN));
  _backBtnI2.hide();

  /* --- Next button (bottom-right) --- */
  _nextBtnI2 = createButton("Next");
  _nextBtnI2.style("font-size", "20px");
  _nextBtnI2.position(width - 120, height - 60);
  _nextBtnI2.mousePressed(_advanceStory);
  _nextBtnI2.hide();

  /* Configure p5's built-in shake detector. */
  setShakeThreshold(CFG_SHAKE_THRESHOLD);

  /* --- Register with GSM --- */
  registerState(STATE.ISLAND2, { enter: enterStateIsland2, exit: exitStateIsland2 });
}

function drawIsland2() {
  background(220);
  imageMode(CORNER);

  /* Button visibility rules:
   *   - First slide  : neither  (shake to proceed)
   *   - Middle slides: Next only
   *   - Last slide   : Back only */
  _nextBtnI2.hide();
  _backBtnI2.hide();

  if (_storyState > I2_FIRST_STATE && _storyState < I2_LAST_STATE) {
    _nextBtnI2.show();
  } else if (_storyState === I2_LAST_STATE) {
    _backBtnI2.show();
  }

  /* --- Story render --- */
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

/**
 * p5 fires deviceShaken() automatically when acceleration exceeds the threshold.
 * Only responds when on the first (passive) slide.
 */
function deviceShaken() {
  if (_storyState === I2_FIRST_STATE) {
    _advanceStory();
  }
}

/* =============================================================================
 * Private
 * =============================================================================*/

/** Increment story state; clamps at the last slide. */
function _advanceStory() {
  if (_storyState < I2_LAST_STATE) {
    _storyState++;
  }
}
