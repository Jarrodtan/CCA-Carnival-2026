/* =============================================================================
 * config.js
 * "Precompiled Header" — global constants and shared configuration.
 *
 * Analogy: config.h / pch.h in C++
 *   - Keep ALL magic numbers here.
 *   - No logic; only data.
 *
 * ── QUICK-TUNE GUIDE ────────────────────────────────────────────────────────
 *
 *  HITBOXES (island collision on the sailing map)
 *    CFG_ISLAND1_HIT_RATIO   fraction of island1 height used as collision half-size
 *    CFG_ISLAND2_HIT_RATIO   fraction of island2 width/height
 *    CFG_ISLAND3_HIT_RATIO   fraction of island3 width/height
 *    → raise = easier to trigger, lower = must be closer
 *
 *  CAMERA
 *    CFG_BRIGHTNESS_THRESHOLD   0-255; below this = "covered"
 *    CFG_UNCOVER_DEBOUNCE_MS    ms the camera must stay bright before "shine"
 *    CFG_CAMERA_WARMUP_FRAMES   frames to skip at start (prevents cold-start false trigger)
 *    CFG_CAMERA_SAMPLE_INTERVAL sample every N frames (CPU throttle)
 *
 *  SHAKE (Island 2)
 *    CFG_SHAKE_THRESHOLD   lower = more sensitive
 *
 *  MAZE (Island 3)
 *    CFG_PLAYER_SPEED   pixels per frame
 *    CFG_ZONE_EXIT_DELAY ms of immunity after leaving an event slide
 *
 *  BUTTONS
 *    CFG_BTN_SAFE_MARGIN_PX   minimum px from right/bottom edge — prevents off-screen
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
 * Island collision hitboxes  ← TUNE THESE to tighten / loosen island entry
 *   Value = fraction of that island's rendered dimension used as the
 *   AABB half-size.  0.15 = tight,  0.35 = generous.
 * ---------------------------------------------------------------------------*/
const CFG_ISLAND1_HIT_RATIO = 0.50;   // triggers at the shores / edge of island image
const CFG_ISLAND2_HIT_RATIO = 0.30;   // triggers when boat reaches island edge
const CFG_ISLAND3_HIT_RATIO = 0.30;   // triggers when boat reaches island edge

/* ---------------------------------------------------------------------------
 * Boat / Navigation
 * ---------------------------------------------------------------------------*/
const CFG_BOAT_SPEED        = 2.5;
const CFG_BOAT_ROT_LERP     = 0.20;
const CFG_BOAT_INIT_ROT     = 270;

/* ---------------------------------------------------------------------------
 * Camera / Brightness (Island 1)
 * ---------------------------------------------------------------------------*/
const CFG_BRIGHTNESS_THRESHOLD  = 55;     // 0-255; below = "covered"
const CFG_UNCOVER_DEBOUNCE_MS   = 1000;   // ms camera must stay bright
// Frames to ignore camera output on first entry — the feed takes a moment to
// warm up and its first frames are all-black, which falsely triggers COVERED.
const CFG_CAMERA_WARMUP_FRAMES  = 30;     // ~0.5 s at 60 fps

/* ---------------------------------------------------------------------------
 * Camera sampling — throttle to every N frames to save CPU
 * ---------------------------------------------------------------------------*/
const CFG_CAMERA_SAMPLE_INTERVAL = 6;   // sample once every 6 frames (~10fps)

/* ---------------------------------------------------------------------------
 * Shake Detection (Island 2)
 * Custom Y-axis-only detector — responds to up/down pumping motion only,
 * ignoring side-to-side or twist.  Replaces p5's built-in deviceShaken().
 *
 *   CFG_SHAKE_Y_THRESHOLD   minimum |deltaY| per frame to count as a pump
 *                           typical values: 15 (sensitive) – 35 (firm shake)
 *   CFG_SHAKE_COOLDOWN_MS   ms before another pump can register
 * ---------------------------------------------------------------------------*/
const CFG_SHAKE_THRESHOLD   = 50;    // kept for setShakeThreshold() guard
const CFG_SHAKE_Y_THRESHOLD = 25;    // ← TUNE: lower = easier to trigger
const CFG_SHAKE_COOLDOWN_MS = 1000;

/* ---------------------------------------------------------------------------
 * Maze (Island 3)
 * ---------------------------------------------------------------------------*/
const CFG_PLAYER_RADIUS     = 8;
const CFG_PLAYER_SPEED      = 2.5;
const CFG_ZONE_EXIT_DELAY   = 1000;
const CFG_TILT_DEAD_ZONE    = 10;

/* ---------------------------------------------------------------------------
 * UI Button Positions (Not in use)
 * Safe-margin ensures buttons stay inside the viewport on any screen size.
 * CFG_BTN_SAFE_MARGIN_PX is the minimum distance from the right / bottom edge.
 * ---------------------------------------------------------------------------*/
const CFG_BTN_SAFE_MARGIN_PX      = 20;    // px from edge — prevents off-screen
const CFG_BTN_BACK_RIGHT_OFFSET   = 120;
const CFG_BTN_BACK_BOTTOM_OFFSET  = 60;
const CFG_BTN_NEXT_RIGHT_OFFSET   = 100;
const CFG_BTN_NEXT_BOTTOM_OFFSET  = 60;

/* ---------------------------------------------------------------------------
 * Welcome Screen  ← TUNE TEXT AND COLOURS HERE
 * ---------------------------------------------------------------------------*/
const CFG_WELCOME_TITLE      = "SP Navigators";
const CFG_WELCOME_SUBTITLE   = ["To know Christ", "", "To make Him known", "", "To help others do the same"]; // "Explore. Discover. Navigate."
const CFG_WELCOME_BG_TOP     = "#0d3b6e";   // deep navy
const CFG_WELCOME_BG_BOT     = "#1a6ea8";   // ocean blue
const CFG_WELCOME_TITLE_COL  = "#ffffff";   // white
const CFG_WELCOME_BTN_COL    = "#e87722";   // SP orange — change to any hex
// Logo: set to a file path like "assets/logo.png" to show a logo above the
// title, or leave as "" for text-only.
const CFG_WELCOME_LOGO       = "assets/logo.png";          // e.g. "assets/logo.png"

/* ---------------------------------------------------------------------------
 * State Names
 * ---------------------------------------------------------------------------*/
const STATE = Object.freeze({
  WELCOME: "WELCOME",   // splash / title screen — shown on first launch
  MAIN:    "MAIN",
  ISLAND1: "ISLAND1",
  ISLAND2: "ISLAND2",
  ISLAND3: "ISLAND3",
  LOADING: "LOADING",   // transient — shown while lazy assets stream
});