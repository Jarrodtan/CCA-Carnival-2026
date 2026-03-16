/* =============================================================================
 * welcomeState.js
 * WELCOME state — splash / title screen shown on first launch.
 *
 * Pure p5 drawing — no image assets needed, loads instantly.
 * Pressing "Start" transitions to STATE.MAIN.
 *
 * ── CUSTOMISATION ────────────────────────────────────────────────────────────
 *   CFG_WELCOME_TITLE       Main heading text           (config.js)
 *   CFG_WELCOME_SUBTITLE    Smaller line below title    (config.js)
 *   CFG_WELCOME_BG_TOP      Gradient top colour         (config.js)
 *   CFG_WELCOME_BG_BOT      Gradient bottom colour      (config.js)
 *   CFG_WELCOME_TITLE_COL   Title text colour           (config.js)
 *   CFG_WELCOME_BTN_COL     Start button colour         (config.js)
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Animation state
 * ---------------------------------------------------------------------------*/
let _welcomeEnterTime = 0;   // millis() when we entered — drives fade-in

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function setupWelcome() {
  registerState(STATE.WELCOME, {
    enter: enterStateWelcome,
    exit:  exitStateWelcome,
  });
}

function drawWelcome() {
  const elapsed = millis() - _welcomeEnterTime;

  /* ── Background gradient ── */
  _drawGradient(
    color(CFG_WELCOME_BG_TOP),
    color(CFG_WELCOME_BG_BOT)
  );

  /* ── Fade-in alpha (0→255 over 800 ms) ── */
  const alpha = constrain(map(elapsed, 0, 800, 0, 255), 0, 255);

  /* ── Title ── */
  const titleY  = height * 0.38;
  const titleSize = constrain(width * 0.11, 32, 72);

  push();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(titleSize);

    /* soft shadow */
    fill(0, 0, 0, alpha * 0.35);
    text(CFG_WELCOME_TITLE, width / 2 + 3, titleY + 3);

    fill(
      red  (color(CFG_WELCOME_TITLE_COL)),
      green(color(CFG_WELCOME_TITLE_COL)),
      blue (color(CFG_WELCOME_TITLE_COL)),
      alpha
    );
    text(CFG_WELCOME_TITLE, width / 2, titleY);
  pop();

  /* ── Subtitle ── */
  const subY    = titleY + titleSize * 1.2;
  const subSize = constrain(width * 0.045, 14, 26);

  push();
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textSize(subSize);
    fill(255, 255, 255, alpha * 0.85);
    text(CFG_WELCOME_SUBTITLE, width / 2, subY);
  pop();

  /* ── Decorative divider line ── */
  const lineW = width * 0.35;
  const lineY = subY + subSize * 1.6;
  push();
    stroke(255, 255, 255, alpha * 0.4);
    strokeWeight(1.5);
    line(width / 2 - lineW / 2, lineY, width / 2 + lineW / 2, lineY);
  pop();

  /* ── Start button ── */
  _drawStartButton(alpha);
}

/* =============================================================================
 * GSM callbacks
 * =============================================================================*/

function enterStateWelcome() {
  _welcomeEnterTime = millis();
}

function exitStateWelcome() {
  /* nothing to clean up — no p5 elements created */
}

/* =============================================================================
 * Private — helpers
 * =============================================================================*/

/**
 * Vertical linear gradient background drawn as thin horizontal strips.
 */
function _drawGradient(topCol, botCol) {
  noStroke();
  for (let y = 0; y <= height; y++) {
    const t = y / height;
    fill(
      lerp(red(topCol),   red(botCol),   t),
      lerp(green(topCol), green(botCol), t),
      lerp(blue(topCol),  blue(botCol),  t)
    );
    rect(0, y, width, 1);
  }
}

/**
 * Draw the Start button and handle click/tap.
 * Built entirely with p5 draw calls — no DOM element needed.
 */
function _drawStartButton(alpha) {
  const btnW  = constrain(width * 0.42, 140, 240);
  const btnH  = constrain(height * 0.075, 44, 64);
  const btnX  = width  / 2 - btnW / 2;
  const btnY  = height * 0.65;
  const r     = btnH / 2;   // fully rounded pill

  const hovering = (mouseX > btnX && mouseX < btnX + btnW &&
                    mouseY > btnY && mouseY < btnY + btnH);

  /* Button fill — slightly lighter on hover */
  const baseCol  = color(CFG_WELCOME_BTN_COL);
  const hoverCol = color(
    min(red(baseCol)   + 30, 255),
    min(green(baseCol) + 30, 255),
    min(blue(baseCol)  + 30, 255)
  );

  push();
    /* shadow */
    noStroke();
    fill(0, 0, 0, alpha * 0.25);
    rect(btnX + 3, btnY + 4, btnW, btnH, r);

    /* pill */
    fill(
      red  (hovering ? hoverCol : baseCol),
      green(hovering ? hoverCol : baseCol),
      blue (hovering ? hoverCol : baseCol),
      alpha
    );
    rect(btnX, btnY, btnW, btnH, r);

    /* label */
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(constrain(width * 0.05, 16, 24));
    fill(255, 255, 255, alpha);
    text("START", width / 2, btnY + btnH / 2);
  pop();

  /* Click / tap detection (checked every frame, harmless) */
  _welcomeBtnX = btnX;
  _welcomeBtnY = btnY;
  _welcomeBtnW = btnW;
  _welcomeBtnH = btnH;
}

/* Button bounds stored each frame so mousePressed can read them */
let _welcomeBtnX = 0, _welcomeBtnY = 0, _welcomeBtnW = 0, _welcomeBtnH = 0;

/**
 * Called by p5's mousePressed.
 * Only acts when WELCOME is the active state.
 */
function _welcomeHandlePress() {
  if (currentState !== STATE.WELCOME) return;
  if (mouseX > _welcomeBtnX && mouseX < _welcomeBtnX + _welcomeBtnW &&
      mouseY > _welcomeBtnY && mouseY < _welcomeBtnY + _welcomeBtnH) {
    changeState(STATE.MAIN);
  }
}
