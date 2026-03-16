/* =============================================================================
 * config.js
 * "Precompiled Header" — global constants and shared configuration.
 *
 * Analogy: config.h / pch.h in C++
 *   - Keep ALL magic numbers here.
 *   - No logic; only data.
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Display / Canvas
 * ---------------------------------------------------------------------------*/
const CFG_BOAT_SIZE_RATIO  = 0.20;
const CFG_ISLAND1_RATIO_P  = 0.80;
const CFG_ISLAND2_RATIO_P  = 0.50;
const CFG_ISLAND3_RATIO_P  = 0.50;
const CFG_ISLAND1_RATIO_L  = 0.50;
const CFG_ISLAND2_RATIO_L  = 0.50;
const CFG_ISLAND3_RATIO_L  = 0.50;

/* ---------------------------------------------------------------------------
 * Boat / Navigation
 * ---------------------------------------------------------------------------*/
const CFG_BOAT_SPEED        = 2.0;
const CFG_BOAT_ROT_LERP     = 0.20;
const CFG_BOAT_INIT_ROT     = 270;

/* ---------------------------------------------------------------------------
 * Camera / Brightness (Island 1)
 * ---------------------------------------------------------------------------*/
const CFG_BRIGHTNESS_THRESHOLD  = 55;
const CFG_UNCOVER_DEBOUNCE_MS   = 1000;

/* ---------------------------------------------------------------------------
 * Camera sampling — throttle to every N frames to save CPU
 * ---------------------------------------------------------------------------*/
const CFG_CAMERA_SAMPLE_INTERVAL = 6;   // sample once every 6 frames (~10fps)

/* ---------------------------------------------------------------------------
 * Shake Detection (Island 2)
 * ---------------------------------------------------------------------------*/
const CFG_SHAKE_THRESHOLD   = 50;
const CFG_SHAKE_COOLDOWN_MS = 1000;

/* ---------------------------------------------------------------------------
 * Maze (Island 3)
 * ---------------------------------------------------------------------------*/
const CFG_PLAYER_RADIUS     = 8;
const CFG_PLAYER_SPEED      = 2;
const CFG_ZONE_EXIT_DELAY   = 1000;
const CFG_TILT_DEAD_ZONE    = 10;

/* ---------------------------------------------------------------------------
 * UI Button Positions
 * ---------------------------------------------------------------------------*/
const CFG_BTN_BACK_RIGHT_OFFSET   = 120;
const CFG_BTN_BACK_BOTTOM_OFFSET  = 60;
const CFG_BTN_NEXT_RIGHT_OFFSET   = 100;
const CFG_BTN_NEXT_BOTTOM_OFFSET  = 50;

/* ---------------------------------------------------------------------------
 * State Names
 * ---------------------------------------------------------------------------*/
const STATE = Object.freeze({
  MAIN:    "MAIN",
  ISLAND1: "ISLAND1",
  ISLAND2: "ISLAND2",
  ISLAND3: "ISLAND3",
  LOADING: "LOADING",   // transient — shown while lazy assets stream
});