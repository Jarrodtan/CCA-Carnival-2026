/* =============================================================================
 * camera.js
 * Shared camera utility — front-facing capture + throttled brightness sampling.
 *
 * Optimisation: sampling every pixel at 60fps wastes CPU.
 * CFG_CAMERA_SAMPLE_INTERVAL (default 6) means we sample once per 6 frames
 * (~10fps) — more than fast enough to detect a hand covering the lens,
 * and cuts CPU usage by ~83% vs sampling every frame.
 *
 * Public API:
 *   setupCamera()              — call once in setupMain()
 *   getCameraAvgBrightness()   — returns cached [0,255] value, resamples on interval
 * =============================================================================*/

"use strict";

let _videoCapture  = null;
let _lastBrightness = 0;
let _frameCount     = 0;

function setupCamera() {
  _videoCapture = createCapture({ video: { facingMode: "user" }, audio: false });
  _videoCapture.size(100, 100);
  _videoCapture.hide();
}

/**
 * Returns average brightness [0, 255].
 * Resamples only every CFG_CAMERA_SAMPLE_INTERVAL frames; returns cached value otherwise.
 */
function getCameraAvgBrightness() {
  if (!_videoCapture) return 0;

  _frameCount++;
  if (_frameCount % CFG_CAMERA_SAMPLE_INTERVAL !== 0) {
    return _lastBrightness;   // return cached — skip the pixel loop
  }

  _videoCapture.loadPixels();
  const pixels    = _videoCapture.pixels;
  const numPixels = pixels.length / 4;
  let   total     = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    total += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
  }

  _lastBrightness = total / numPixels;
  return _lastBrightness;
}
