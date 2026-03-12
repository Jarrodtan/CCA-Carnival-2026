/* =============================================================================
 * handlePermissions.js
 * Device-orientation permission layer.
 *
 * Analogy: platform/Device.cpp in a game engine — isolates OS-level sensor
 *   APIs so the rest of the codebase never touches them directly.
 *
 * Public API:
 *   deviceHeading     {number|undefined}  — compass heading in degrees
 *   originalHeading   {number|undefined}  — heading at calibration point
 *   permissionsGranted {boolean}
 * =============================================================================*/

"use strict";

console.log("SP Navigators presents...");

/* ---------------------------------------------------------------------------
 * Exported state (read-only outside this module — treat as const from outside)
 * ---------------------------------------------------------------------------*/
let deviceHeading;
let originalHeading;
let permissionsGranted = false;

/* ---------------------------------------------------------------------------
 * Initialisation — wire up sensor events immediately
 * ---------------------------------------------------------------------------*/
if (typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function") {
  /* iOS 13+ requires an explicit user gesture before granting permission. */
  document.body.addEventListener("click", _requestIOSPermission);
} else {
  /* Android / desktop — permission is implicit. */
  window.addEventListener("deviceorientation", _onDeviceOrientation, true);
  permissionsGranted = true;
}

/* ---------------------------------------------------------------------------
 * Private helpers
 * ---------------------------------------------------------------------------*/

/**
 * Prompts the iOS permission dialog on first user tap.
 * Removes itself after the first successful grant so it doesn't fire again.
 */
function _requestIOSPermission() {
  DeviceMotionEvent.requestPermission()
    .then(function (state) {
      if (state === "granted") {
        window.addEventListener("deviceorientation", _onDeviceOrientation, true);
        permissionsGranted = true;
        console.log("DeviceMotionEvent permission granted.");
      } else {
        console.warn("DeviceMotionEvent permission denied.");
      }
    })
    .catch(function (err) {
      console.error("DeviceMotionEvent.requestPermission error:", err);
    });
}

/**
 * Normalises the raw orientation event into a single `deviceHeading` value
 * regardless of whether the device returns webkitCompassHeading (iOS) or
 * alpha (Android / desktop).
 *
 * @param {DeviceOrientationEvent} event
 */
function _onDeviceOrientation(event) {
  if (event.webkitCompassHeading !== undefined) {
    /* iOS — true-north referenced, clockwise positive. Negate for maths. */
    deviceHeading = -event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    /* Android / desktop — alpha in [0, 360), CCW from north (Z-axis). */
    deviceHeading = event.alpha;
  }
}

/* ---------------------------------------------------------------------------
 * Public utility
 * ---------------------------------------------------------------------------*/

/**
 * Calibrate originalHeading to current deviceHeading so that the current
 * physical orientation maps to a "zero" reference angle.
 * Call this every time you enter a state that depends on compass heading.
 *
 * @param {number} [offset=270]  Extra rotational offset (default aligns boat left)
 */
function calibrateHeading(offset) {
  offset = (offset === undefined) ? 270 : offset;
  originalHeading = deviceHeading + offset;
}
