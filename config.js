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
const CFG_BOAT_SIZE_RATIO  = 0.20;   // Boat width as fraction of shorter screen dim
const CFG_ISLAND1_RATIO_P  = 0.80;   // Island 1 width ratio (portrait)
const CFG_ISLAND2_RATIO_P  = 0.50;
const CFG_ISLAND3_RATIO_P  = 0.50;
const CFG_ISLAND1_RATIO_L  = 0.50;   // Ratio (landscape) uses height
const CFG_ISLAND2_RATIO_L  = 0.50;
const CFG_ISLAND3_RATIO_L  = 0.50;

/* ---------------------------------------------------------------------------
 * Boat / Navigation
 * ---------------------------------------------------------------------------*/
const CFG_BOAT_SPEED        = 2.0;
const CFG_BOAT_ROT_LERP     = 0.20;   // Rotation smoothing factor
const CFG_BOAT_INIT_ROT     = 270;    // Degrees — pointing left

/* ---------------------------------------------------------------------------
 * Camera / Brightness (Island 1)
 * ---------------------------------------------------------------------------*/
const CFG_BRIGHTNESS_THRESHOLD  = 55;   // Avg pixel brightness to detect "covered"
const CFG_UNCOVER_DEBOUNCE_MS   = 1000; // ms brightness must stay above threshold

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
const CFG_ZONE_EXIT_DELAY   = 1000;  // ms before re-checking zone collisions after exit
const CFG_TILT_DEAD_ZONE    = 10;    // degrees of tilt before registering movement

/* ---------------------------------------------------------------------------
 * State Names  (string enum — keeps magic strings in one place)
 * ---------------------------------------------------------------------------*/
const STATE = Object.freeze({
  MAIN:    "MAIN",
  ISLAND1: "ISLAND1",
  ISLAND2: "ISLAND2",
  ISLAND3: "ISLAND3",
});
