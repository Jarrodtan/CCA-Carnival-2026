/* =============================================================================
 * welcomeState.js
 * WELCOME state — splash / title screen shown on first launch.
 *
 * Uses a real DOM button for the Start action so touch and click both work
 * reliably on iOS/Android without coordinate-hit-testing canvas taps.
 *
 * ── CUSTOMISATION (all in config.js) ─────────────────────────────────────────
 *   CFG_WELCOME_TITLE       Main heading text
 *   CFG_WELCOME_SUBTITLE    Smaller tagline (left-aligned, indented)
 *   CFG_WELCOME_BG_TOP      Gradient top colour  (hex string)
 *   CFG_WELCOME_BG_BOT      Gradient bottom colour
 *   CFG_WELCOME_TITLE_COL   Title text colour
 *   CFG_WELCOME_BTN_COL     Start button background colour
 *   CFG_WELCOME_LOGO        Path to logo image, e.g. "assets/logo.png"
 *                           Set to "" to show no logo.
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * State
 * ---------------------------------------------------------------------------*/
let _welcomeEnterTime = 0;
let _startBtn         = null;   // DOM button — reliable on mobile touch
let _logoImg          = null;   // optional logo, null if CFG_WELCOME_LOGO === ""
let _logoLoaded       = false;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function setupWelcome() {
  /* ── Start button — real DOM element, touch + click both fire natively ── */
  _startBtn = createButton("START");
  _startBtn.style("position",        "fixed");
  _startBtn.style("left",            "50%");
  _startBtn.style("transform",       "translateX(-50%)");
  _startBtn.style("bottom",          "18%");
  _startBtn.style("width",           "clamp(140px, 42vw, 240px)");
  _startBtn.style("height",          "clamp(44px, 7vh, 64px)");
  _startBtn.style("font-size",       "clamp(16px, 4vw, 22px)");
  _startBtn.style("font-weight",     "bold");
  _startBtn.style("letter-spacing",  "0.12em");
  _startBtn.style("color",           "#ffffff");
  _startBtn.style("background",      CFG_WELCOME_BTN_COL);
  _startBtn.style("border",          "none");
  _startBtn.style("border-radius",   "999px");
  _startBtn.style("box-shadow",      "0 4px 18px rgba(0,0,0,0.35)");
  _startBtn.style("cursor",          "pointer");
  _startBtn.style("z-index",         "200");
  _startBtn.style("-webkit-tap-highlight-color", "transparent");
  _startBtn.mousePressed(() => {
    playMusic('welcome');
    _showTutorial = true;      // tell map to show tutorial
    changeState(STATE.MAIN);
  });
  _startBtn.hide();

  /* ── Optional logo — load only if a path is configured ── */
  if (CFG_WELCOME_LOGO && CFG_WELCOME_LOGO.trim() !== "") {
    _logoImg = loadImage(
      CFG_WELCOME_LOGO,
      () => { _logoLoaded = true; },
      () => { console.warn("welcomeState: logo not found ->", CFG_WELCOME_LOGO); }
    );
  }

  registerState(STATE.WELCOME, {
    enter: enterStateWelcome,
    exit:  exitStateWelcome,
  });
}

function drawWelcome() {
  const elapsed = millis() - _welcomeEnterTime;

  /* ── Background gradient ── */
  _drawGradient(color(CFG_WELCOME_BG_TOP), color(CFG_WELCOME_BG_BOT));

  /* ── Fade-in (0 to 255 over 900 ms) ── */
  const alpha = constrain(map(elapsed, 0, 900, 0, 255), 0, 255);

  /* Show button once fully faded in */
  if (alpha >= 255) _startBtn.show();

  /* ── Layout anchors ── */
  const cx   = width  / 2;

  /* ── Logo (optional) ── */
  let logoBottom = height * 0.22;
  if (_logoLoaded && _logoImg) {
    const logoH = constrain(height * 0.18, 60, 140);
    const logoW = (_logoImg.width / _logoImg.height) * logoH;
    const logoY = height * 0.10;
    push();
      tint(255, alpha);
      imageMode(CENTER);
      image(_logoImg, cx, logoY + logoH / 2, logoW, logoH);
    pop();
    logoBottom = logoY + logoH + height * 0.03;
  }

  /* ── Title ── */
  const titleSize = constrain(width * 0.11, 34, 72);
  const titleY    = logoBottom + titleSize * 0.6;

  push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(titleSize);
    noStroke();
    /* shadow */
    fill(0, 0, 0, alpha * 0.30);
    text(CFG_WELCOME_TITLE, cx + 3, titleY + 3);
    /* main */
    const tc = color(CFG_WELCOME_TITLE_COL);
    fill(red(tc), green(tc), blue(tc), alpha);
    text(CFG_WELCOME_TITLE, cx, titleY);
  pop();

  /* ── Thin divider ── */
  const divY = titleY + titleSize * 0.75;
  const divW = width * 0.72;
  push();
    stroke(255, 255, 255, alpha * 0.35);
    strokeWeight(1.2);
    line(cx - divW / 2, divY, cx + divW / 2, divY);
  pop();

  /* ── Subtitle — left-aligned, multi-line ── */
  const subSize    = constrain(width * 0.042, 13, 22);
  const lineHeight = subSize * 1.55;   // spacing between lines
  let   subY       = divY + subSize * 1.6;

  push();
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textSize(subSize);
    noStroke();
    fill(255, 255, 255, alpha * 0.80);
    for (const line of CFG_WELCOME_SUBTITLE) {
      text(line, cx, subY);
      subY += lineHeight;
    }
  pop();
}

/* =============================================================================
 * GSM callbacks
 * =============================================================================*/

function enterStateWelcome() {
  _welcomeEnterTime = millis();
  playMusic('welcome');
}

function exitStateWelcome() {
  _startBtn.hide();
  stopMusic(); 
}

/* =============================================================================
 * Private — gradient
 * =============================================================================*/

function _drawGradient(topCol, botCol) {
  noStroke();
  for (let y = 0; y < height; y++) {
    fill(lerpColor(topCol, botCol, y / height));
    rect(0, y, width, 1);
  }
}