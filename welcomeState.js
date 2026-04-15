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
  textFont('Arial');

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

  /* ── Fade-in (0 to 255 over 900 ms) ── */
  const alpha = constrain(map(elapsed, 0, 900, 0, 255), 0, 255);

  /* ── Night sky background ── */
  _drawNightSky(alpha);

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
    textStyle(BOLDITALIC);  // was BOLD
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
  const lineHeight = subSize * 1.2;  // was 1.55 | spacing between lines
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

  /* ── Developer Credit — Anchored at the bottom of the screen ── */
  const creditSize = constrain(width * 0.035, 10, 14);
  const creditY    = height - 25; // This keeps it 25 pixels from the bottom edge

  push();
    textAlign(CENTER, CENTER);
    textStyle(ITALIC);
    textSize(creditSize);
    noStroke();
    
    // Uses the alpha variable so it fades in with your title
    fill(255, 255, 255, alpha * 0.60);
    
    // Adding the version number here (Make sure this matches your sw.js version!)
    const versionLabel = " | v1.0.1";
    text(CFG_DEVELOPER_CREDIT + "  |  v" + CFG_APP_VERSION, cx, subY + lineHeight * 1.5);
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

/* =============================================================================
 * Private — NightSky
 * =============================================================================*/
function _drawNightSky(alpha) {
  /* ── Gradient background ── */
  _drawGradient(color(CFG_WELCOME_BG_TOP), color(CFG_WELCOME_BG_BOT));

  /* ── Stars ── */
  const stars = [
    [0.12, 0.05], [0.45, 0.03], [0.78, 0.08], [0.25, 0.12],
    [0.60, 0.06], [0.88, 0.15], [0.35, 0.18], [0.70, 0.11],
    [0.05, 0.22], [0.92, 0.04], [0.55, 0.20], [0.18, 0.30],
    [0.82, 0.25], [0.40, 0.28], [0.65, 0.32], [0.08, 0.38],
  ];
  push();
    noStroke();
    for (const [sx, sy] of stars) {
      const twinkle = 0.5 + 0.5 * sin(millis() * 0.002 + sx * 20);
      fill(255, 255, 255, alpha * (0.4 + 0.5 * twinkle));
      const r = constrain(width * 0.006, 2, 5);  // was 0.004, 1.5, 3.5
      circle(sx * width, sy * height, r * 2);
    }
  pop();

  /* ── Soft clouds ── */
  push();
    noStroke();
    for (let i = 0; i < 3; i++) {
      const cx  = width  * (0.15 + i * 0.35);
      const cy  = height * (0.06 + i * 0.03);
      const cw  = width  * (0.18 + i * 0.04);
      fill(255, 255, 255, alpha * 0.03);  // was 0.06
      ellipse(cx, cy, cw, cw * 0.4);
      fill(255, 255, 255, alpha * 0.02);  // was 0.04
      ellipse(cx + cw * 0.2, cy - cw * 0.08, cw * 0.7, cw * 0.3);
    }
  pop();
}