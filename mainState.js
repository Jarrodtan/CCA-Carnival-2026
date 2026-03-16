/* =============================================================================
 * mainState.js
 * MAIN state — overworld sailing map.
 *
 * Optimisations vs original:
 *   • Only 5 images loaded upfront (boat + background + island thumbnails).
 *   • _recalculateLayout() added for windowResized() support.
 *   • camera.js owns the video capture — no `video` global here.
 *   • _requestIOSPermission reference removed from drawMain (lives in handlePermissions).
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Assets
 * ---------------------------------------------------------------------------*/
let _backgroundImg;
let _boatImg;
let _island1Img, _island2Img, _island3Img;

/* ---------------------------------------------------------------------------
 * Layout
 * ---------------------------------------------------------------------------*/
let _island1Pos, _island2Pos, _island3Pos;
let _island1W, _island2W, _island3W;
let _island1H, _island2H, _island3H;
let _ckpt1Pos,  _ckpt2Pos,  _ckpt3Pos;
let _boatW, _boatH;

/* ---------------------------------------------------------------------------
 * Boat state
 * ---------------------------------------------------------------------------*/
let _boatPos;
let _boatRot   = CFG_BOAT_INIT_ROT;
let _targetRot = CFG_BOAT_INIT_ROT;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function preloadMain() {
  /* These 5 are the ONLY assets that load before the first frame. */
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

    const backToWelcomeBtn = createButton("Menu");
    backToWelcomeBtn.position(140, 20);   // sits right of Fullscreen button
    backToWelcomeBtn.mousePressed(() => changeState(STATE.WELCOME));
  } else {
    createCanvas(windowWidth, windowHeight);

    const backToWelcomeBtn = createButton("Menu");
    backToWelcomeBtn.position(20, 20);
    backToWelcomeBtn.mousePressed(() => changeState(STATE.WELCOME));
  }

  /* --- Camera (shared utility — camera.js) --- */
  setupCamera();

  /* --- Layout --- */
  _computeImageLayout();
  _rebuildPositions();

  _boatPos = _defaultBoatPos();
  calibrateHeading(270);

  registerState(STATE.MAIN, { enter: enterStateMain });
}

function drawMain() {
  if (originalHeading === undefined || isNaN(originalHeading)) {
    calibrateHeading(270);
  }

  if (permissionsGranted && originalHeading !== undefined) {
    _updateBoat();
    _clampBoatPosition();
    _checkIslandCollisions();
  }

  _render();
}

/* =============================================================================
 * GSM callbacks
 * =============================================================================*/

function enterStateMain() {
  _boatPos = _defaultBoatPos();
  calibrateHeading(270);
}

/* =============================================================================
 * Called from main.js windowResized()
 * =============================================================================*/

function _recalculateLayout() {
  resizeCanvas(windowWidth, windowHeight);
  _computeImageLayout();
  _rebuildPositions();
  _clampBoatPosition();
}

/* =============================================================================
 * Private — update
 * =============================================================================*/

function _updateBoat() {
  angleMode(DEGREES);
  const dir = getInputDir();

  if (dir.x !== 0 || dir.y !== 0) {
    const fwdX = cos(_boatRot);
    const fwdY = sin(_boatRot);
    const dot  = fwdX * dir.x + fwdY * dir.y;
    const magFwd = sqrt(fwdX * fwdX + fwdY * fwdY);
    const magDir = sqrt(dir.x * dir.x + dir.y * dir.y);
    let delta = acos(dot / (magFwd * magDir));
    if (fwdX * (-dir.y) + fwdY * dir.x > 0) delta = -delta;
    if (!isNaN(delta)) _targetRot = _boatRot + delta;
  }

  _boatRot    = lerp(_boatRot, _targetRot, CFG_BOAT_ROT_LERP);
  _boatPos.x += dir.x * CFG_BOAT_SPEED;
  _boatPos.y += dir.y * CFG_BOAT_SPEED;
}

function _clampBoatPosition() {
  _boatPos.x = constrain(_boatPos.x, _boatW / 2, width  - _boatW / 2);
  _boatPos.y = constrain(_boatPos.y, _boatH / 2, height - _boatH / 2);
}

function _checkIslandCollisions() {
  const hit1 = CFG_ISLAND1_HIT_RATIO * _island1H;
  if (_aabbOverlap(_boatPos, _ckpt1Pos, hit1, hit1)) {
    changeState(STATE.ISLAND1);
  } else if (_aabbOverlap(_boatPos, _ckpt2Pos, CFG_ISLAND2_HIT_RATIO * _island2W, CFG_ISLAND2_HIT_RATIO * _island2H)) {
    changeState(STATE.ISLAND2);
  } else if (_aabbOverlap(_boatPos, _ckpt3Pos, CFG_ISLAND3_HIT_RATIO * _island3W, CFG_ISLAND3_HIT_RATIO * _island3H)) {
    changeState(STATE.ISLAND3);
  }
}

/* =============================================================================
 * Private — render
 * =============================================================================*/

function _render() {
  imageMode(CORNER);
  image(_backgroundImg, 0, 0, width, height);

  imageMode(CENTER);
  image(_island1Img, _island1Pos.x, _island1Pos.y, _island1W, _island1H);
  image(_island2Img, _island2Pos.x, _island2Pos.y, _island2W, _island2H);
  image(_island3Img, _island3Pos.x, _island3Pos.y, _island3W, _island3H);

  push();
    translate(_boatPos.x, _boatPos.y);
    rotate(_boatRot);
    imageMode(CENTER);
    image(_boatImg, 0, 0, _boatW, _boatH);
  pop();

  /* Debug checkpoint dots — remove before release */
  // noStroke();
  // fill(255, 0, 0);
  // circle(_ckpt1Pos.x, _ckpt1Pos.y, 10);
  // circle(_ckpt2Pos.x, _ckpt2Pos.y, 10);
  // circle(_ckpt3Pos.x, _ckpt3Pos.y, 10);
}

/* =============================================================================
 * Private — utilities
 * =============================================================================*/

function _defaultBoatPos() {
  return { x: width * 0.25, y: (5 * height) / 6 };
}

function _computeImageLayout() {
  const portrait = (width < height);
  if (portrait) {
    _boatW = CFG_BOAT_SIZE_RATIO * width;
    _boatH = (_boatW / _boatImg.width) * _boatImg.height;
    _island1W = CFG_ISLAND1_RATIO_P * width;
    _island2W = CFG_ISLAND2_RATIO_P * width;
    _island3W = CFG_ISLAND3_RATIO_P * width;
    _island1H = (_island1W / _island1Img.width) * _island1Img.height;
    _island2H = (_island2W / _island2Img.width) * _island2Img.height;
    _island3H = (_island3W / _island3Img.width) * _island3Img.height;
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
}

/** Rebuild positions from current _island*W/H — called after resize too. */
function _rebuildPositions() {
  _island1Pos = { x: width  - 0.5 * _island1W, y: _island1H / 2 };
  _island2Pos = { x: _island2W / 2,             y: height / 2    };
  _island3Pos = { x: width  - 0.5 * _island3W, y: height - _island3H / 2 };

  _ckpt1Pos = { x: _island1Pos.x - (1/5) * _island1W, y: _island1Pos.y - (1/4) * _island1H };
  _ckpt2Pos = { x: _island2Pos.x,                      y: _island2Pos.y - (1/6) * _island2H };
  _ckpt3Pos = { x: _island3Pos.x,                      y: _island3Pos.y                      };
}

function _aabbOverlap(a, b, halfW, halfH) {
  return !(a.x < b.x - halfW ||
           a.x > b.x + halfW ||
           a.y < b.y - halfH ||
           a.y > b.y + halfH);
}

/**
 * Position a p5 button safely inside the viewport using CSS fixed positioning.
 * offsetFromRight / offsetFromBottom are the desired distances from each edge;
 * they are clamped so the button never goes off-screen.
 *
 * @param {p5.Element} btn
 * @param {number} offsetFromRight
 * @param {number} offsetFromBottom
 */
function _positionBtn(btn, offsetFromRight, offsetFromBottom) {
  const margin = CFG_BTN_SAFE_MARGIN_PX;
  const r = max(margin, min(offsetFromRight,  windowWidth  - margin));
  const b = max(margin, min(offsetFromBottom, windowHeight - margin));
  btn.style("position", "fixed");
  btn.style("right",  r + "px");
  btn.style("bottom", b + "px");
  btn.style("font-size", "18px");
  btn.style("padding", "8px 16px");
  btn.style("z-index", "100");
}