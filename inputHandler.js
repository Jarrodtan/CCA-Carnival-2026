/* =============================================================================
 * inputHandler.js
 * Centralised input abstraction layer.
 *
 * Analogy: InputSystem.cpp in a game engine.
 *   - Reads keyboard + device-tilt in ONE place.
 *   - Returns a normalised direction vector  { x, y }  in [-1, 1].
 *   - All other systems call getInputDir() — they never touch p5 globals.
 *
 * Public API:
 *   getInputDir()  → { x: number, y: number }   (unit-ish vector)
 * =============================================================================*/

"use strict";

/**
 * Returns the current movement direction based on keyboard and device tilt.
 * Accounts for landscape-mode axis swap on mobile.
 *
 * @returns {{ x: number, y: number }}  Each component is -1, 0, or 1.
 */
function getInputDir() {
  let x = 0;
  let y = 0;

  /* --- Keyboard --- */
  if (keyIsDown(LEFT_ARROW))  x -= 1;
  if (keyIsDown(RIGHT_ARROW)) x += 1;
  if (keyIsDown(UP_ARROW))    y -= 1;
  if (keyIsDown(DOWN_ARROW))  y += 1;

  /* --- Device tilt (mobile) --- */
  let tiltX = rotationX;
  let tiltY = rotationY;

  /* Swap axes in landscape so "tilt forward" still means "move up". */
  if (deviceOrientation === LANDSCAPE) {
    tiltX = rotationY;
    tiltY = rotationX;
  }

  if (tiltY < -CFG_TILT_DEAD_ZONE) x -= 1;
  if (tiltY >  CFG_TILT_DEAD_ZONE) x += 1;
  if (tiltX < -CFG_TILT_DEAD_ZONE) y -= 1;
  if (tiltX >  CFG_TILT_DEAD_ZONE) y += 1;

  /* Clamp to [-1, 1] in case keyboard + tilt fire simultaneously. */
  x = constrain(x, -1, 1);
  y = constrain(y, -1, 1);

  return { x, y };
}

/**
 * New Touch Logic for Tablets/Non-gyro devices
 * Calculates a direction vector from the center of the screen to the touch point.
 * What it does: It checks if the user is touching the screen and calculates a direction toward that touch.
 */
function getTouchDir() {
  let tx = 0;
  let ty = 0;

  if (touches.length > 0) {
    // Calculate vector from center of screen to touch location
    let touch = touches[0];
    let dx = touch.x - width / 2;
    let dy = touch.y - height / 2;

    // Create a normalized direction (-1 to 1 range)
    let mag = sqrt(dx * dx + dy * dy);
    if (mag > 10) { // Small deadzone so tiny taps don't move the boat
      tx = dx / mag;
      ty = dy / mag;
    }
  }
  return { x: tx, y: ty };
}

function _drawVirtualJoystick() {
  const jX = width / 2;
  const jY = height - 100;
  const jSize = 120;
  const kSize = 60;

  push();
    // Draw the outer ring
    fill(255, 50);
    stroke(255, 100);
    strokeWeight(2);
    circle(jX, jY, jSize);
    
    let knobX = jX;
    let knobY = jY;

    // Move the knob visually if touching/clicking
    if (touches.length > 0 || mouseIsPressed) {
      let tx = touches.length > 0 ? touches[0].x : mouseX;
      let ty = touches.length > 0 ? touches[0].y : mouseY;
      let d = dist(tx, ty, jX, jY);
      let angle = atan2(ty - jY, tx - jX);
      let moveDist = min(d, jSize / 2);
      
      knobX = jX + cos(angle) * moveDist;
      knobY = jY + sin(angle) * moveDist;
      fill(232, 119, 34, 200); // SP Orange
    } else {
      fill(255, 150); // Idle White
    }

    noStroke();
    circle(knobX, knobY, kSize);
  pop();
}

function getJoystickDir() {
  const jX = width / 2;
  const jY = height - 100;
  let dir = { x: 0, y: 0 };

  if (touches.length > 0 || mouseIsPressed) {
    let tx = touches.length > 0 ? touches[0].x : mouseX;
    let ty = touches.length > 0 ? touches[0].y : mouseY;
    let d = dist(tx, ty, jX, jY);

    if (d > 10) { // Deadzone
      dir.x = (tx - jX) / d;
      dir.y = (ty - jY) / d;
    }
  }
  return dir;
}