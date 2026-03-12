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
