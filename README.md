# SP Navigators

A p5.js mobile-first interactive experience. Players sail a boat across an overworld map to reach three islands, each with a unique physical interaction mechanic — camera cover, device shake, and tilt-controlled maze.

---

## Quick Start

1. Drop all files into a folder (keep `assets/` alongside the `.js` files)
2. Serve over HTTP — e.g. `npx serve .` or any local server
3. Open on a mobile device for the full experience (tilt, shake, camera)
4. Arrow keys work on desktop as a fallback

> **iOS note:** On first tap the app requests device orientation permission. Just tap anywhere when prompted.

---

## File Structure

```
index.html            Entry point — script load order is significant
style.css             Global reset + shared button CSS classes
config.js           ★ All tunable constants — edit this first
handlePermissions.js  iOS / Android sensor permission layer
stateManager.js       Game State Manager — lazy asset loading + loading screen
inputHandler.js       Keyboard + device tilt → unified direction vector
camera.js             Front-facing camera, throttled brightness sampling
welcomeState.js       Welcome / splash screen
mainState.js          Overworld sailing map
island1State.js       Island 1 — Lighthouse / Wheel of Life
island2State.js       Island 2 — Volcano & Alumni story
island3State.js       Island 3 — Pyramid Maze & CCA Events
assets/               All images and GIFs
```

---

## State Flow

```
WELCOME  ──[START]──►  MAIN (sailing map)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           ISLAND1      ISLAND2      ISLAND3
           [Back]        [Back]       [Back]
              └────────────┼────────────┘
                           ▼
                         MAIN
                        [Menu]
                           │
                           ▼
                        WELCOME
```

Island assets load **lazily** on first visit — a `Loading…` screen appears briefly, then never again for that island.

---

## Island Mechanics

### Island 1 — Lighthouse & Wheel of Life
**Mechanic: camera cover**

Flow: `boatFreeze → covered → shine → ourSource → nextPart (wheel)`

1. Sail to Island 1 — a frozen boat scene appears
2. **Cover the front camera** with your finger or palm → screen goes dark
3. **Uncover the camera** and hold for 1 second → lighthouse shines
4. Tap **Next** to progress through slides
5. Final screen: a spinning wheel controlled by rotating the device

### Island 2 — Volcano & Alumni Story
**Mechanic: shake (Y-axis / up-down only)**

Flow: `slide 1 (shake) → slides 2–8 → slide 9 (back)`

1. Sail to Island 2 — passive volcano scene
2. **Shake the phone up and down** (like pumping) → volcano erupts
3. Tap **Next** to advance through the alumni story
4. **Back** returns to map from the final slide

### Island 3 — Pyramid Maze & CCA Events
**Mechanic: tilt to move**

Flow: `MAZE → EVENT1–5 (on zone touch) → EVENTSUM`

1. Sail to Island 3 — a top-down pyramid maze appears
2. **Tilt the device** to steer the red dot through the maze
3. Find and enter all 5 event zones (marked tiles) → each triggers a slide
4. Tap **Continue** to return to the maze after each slide
5. Once all 5 zones are visited, reach the **exit tile** → summary screen
6. **Back** returns to map at any time

---

## Customisation Reference

Everything tuneable lives in **`config.js`**. No other file needs editing for typical adjustments.

### Welcome Screen

```js
const CFG_WELCOME_TITLE = "SP Navigators";

// Each array entry = one subtitle line. "" = blank gap between lines.
const CFG_WELCOME_SUBTITLE = [
  "To know Christ",
  "",
  "To make Him known",
  "",
  "To help others do the same",
];

const CFG_WELCOME_BG_TOP    = "#0d3b6e";  // gradient top colour (hex)
const CFG_WELCOME_BG_BOT    = "#1a6ea8";  // gradient bottom colour (hex)
const CFG_WELCOME_TITLE_COL = "#ffffff";  // title text colour
const CFG_WELCOME_BTN_COL   = "#e87722";  // START button colour

// Logo above the title — leave "" for text-only
const CFG_WELCOME_LOGO = "";              // e.g. "assets/logo.png"
```

To add a logo: drop the image into `assets/` and set `CFG_WELCOME_LOGO = "assets/yourlogo.png"`. It scales responsively and fades in with everything else.

---

### Island Collision Hitboxes

Controls how close the boat must sail before an island activates.

| Constant | Default | Notes |
|---|---|---|
| `CFG_ISLAND1_HIT_RATIO` | `0.18` | Fraction of island height used as AABB half-size |
| `CFG_ISLAND2_HIT_RATIO` | `0.20` | Fraction of island width/height |
| `CFG_ISLAND3_HIT_RATIO` | `0.20` | Fraction of island width/height |

Raise → easier to trigger. Lower → must sail right up to the island.

---

### Boat / Sailing

| Constant | Default | Effect |
|---|---|---|
| `CFG_BOAT_SPEED` | `2.0` | Pixels per frame |
| `CFG_BOAT_ROT_LERP` | `0.20` | Rotation smoothing — 0 = instant snap, 1 = no turn |

---

### Camera — Island 1

| Constant | Default | Effect |
|---|---|---|
| `CFG_BRIGHTNESS_THRESHOLD` | `55` | 0–255; pixel avg below this = "covered" |
| `CFG_UNCOVER_DEBOUNCE_MS` | `1000` | ms camera must stay bright before transitioning to shine |
| `CFG_CAMERA_WARMUP_FRAMES` | `30` | Frames skipped on entry (~0.5 s at 60 fps) |
| `CFG_CAMERA_SAMPLE_INTERVAL` | `6` | Sample once per N frames — saves CPU |

The camera uses a **two-stage guard** to prevent false triggers on first load:
1. **Warmup** — ignores the first 30 frames (camera feed starts black/noisy)
2. **Readiness latch** — won't trigger COVERED until it has seen at least one bright frame, confirming the camera is producing real data

---

### Shake — Island 2

| Constant | Default | Effect |
|---|---|---|
| `CFG_SHAKE_Y_THRESHOLD` | `25` | Min `\|ΔaccelerationY\|` per frame to count as a pump. Lower = more sensitive |
| `CFG_SHAKE_COOLDOWN_MS` | `1000` | ms before another shake can register |

Uses a **custom Y-axis-only detector** (not p5's built-in `deviceShaken`). Only up-down pumping motion triggers it — side-to-side or twisting does not.

---

### Maze — Island 3

| Constant | Default | Effect |
|---|---|---|
| `CFG_PLAYER_SPEED` | `2` | Pixels per frame |
| `CFG_PLAYER_RADIUS` | `8` | Visual size of player dot |
| `CFG_ZONE_EXIT_DELAY` | `1000` | ms of collision immunity after leaving an event slide |
| `CFG_TILT_DEAD_ZONE` | `10` | Degrees of tilt ignored — prevents drift at rest |

---

### Buttons

| Constant | Default | Effect |
|---|---|---|
| `CFG_BTN_SAFE_MARGIN_PX` | `20` | Min px from screen edge — prevents off-screen buttons |
| `CFG_BTN_BACK_RIGHT_OFFSET` | `120` | Back button distance from right edge |
| `CFG_BTN_BACK_BOTTOM_OFFSET` | `60` | Back button distance from bottom edge |
| `CFG_BTN_NEXT_RIGHT_OFFSET` | `100` | Next button distance from right edge |
| `CFG_BTN_NEXT_BOTTOM_OFFSET` | `60` | Next button distance from bottom edge |

---

## Swapping Assets

Drop the new file into `assets/` and either keep the same filename (zero code change) or update the string in the relevant `loadAssets*()` function.

### Main Map — `preloadMain()` in `mainState.js`

| Variable | Filename |
|---|---|
| `_backgroundImg` | `backgroundMain.png` |
| `_boatImg` | `boat.png` |
| `_island1Img` | `island1.png` |
| `_island2Img` | `island2.png` |
| `_island3Img` | `island3.png` |

### Island 1 — `loadAssetsIsland1()` in `island1State.js`

| Variable | Filename | Screen |
|---|---|---|
| `_boatFreezeImg` | `boat_freeze.png` | Entry — frozen boat |
| `_darkLandImg` | `dark_land.png` | Covered + shine background |
| `_lighthouseImg` | `lighthouse_shine.png` | Shine overlay |
| `_ourSourceLightImg` | `our_source_light.png` | "Our Source" slide |
| `_wheelLifeImg` | `wheel_life.png` | Wheel of Life background |
| `_wheelImg` | `wheel.png` | Rotating wheel sprite |
| `_hubImg` | `HUB.png` | Wheel centre hub |
| `_prayerImg` | `PRAYER.png` | Wheel segment overlay |
| `_witnessingImg` | `WITNESSING.png` | Wheel segment overlay |
| `_theWordImg` | `THE WORD.png` | Wheel segment overlay |
| `_fellowshipImg` | `FELLOWSHIP.png` | Wheel segment overlay |

### Island 2 — `loadAssetsIsland2()` in `island2State.js`

| Variable | Filename | Story step |
|---|---|---|
| `_passiveImg` | `passive.png` | Step 1 — shake prompt |
| `_activeImg` | `active.png` | Step 2 |
| `_fireballImg` | `fireball.gif` | Steps 2 & 4 overlay |
| `_alumniHelpImg` | `alumniHelp.png` | Step 3 |
| `_shelterStartImg` | `shelterStart.png` | Step 4 |
| `_shelterEndThankYouImg` | `shelterEndThankYou.png` | Step 5 |
| `_shelterEndImg` | `shelterEnd.png` | Step 6 |
| `_alumniImage1` | `alumniImage_1.png` | Step 7 |
| `_alumniImage2` | `alumniImage_2.png` | Step 8 |
| `_alumniAboutImg` | `alumniAbout.png` | Step 9 — final slide |

### Island 3 — `loadAssetsIsland3()` in `island3State.js`

| Variable | Filename | Used for |
|---|---|---|
| `_tile0Img` | `tile0.png` | Walkable path tile |
| `_tile1Img` | `tile1.png` | Wall tile |
| `_tile2Img` | `tile2.png` | Exit tile |
| `_tile3Img` | `tile3.png` | Event zone — unvisited |
| `_tile4Img` | `tile4.png` | Event zone — visited |
| `_event1Img` – `_event5Img` | `event1.png` … `event5.png` | Event slides |
| `_eventSumImg` | `eventSummary.png` | Summary / end slide |

---

## Mobile Controls Summary

| Action | How |
|---|---|
| Move boat (map) | Tilt device or arrow keys |
| Move player (maze) | Tilt device or arrow keys |
| Enter island | Sail into island hitbox |
| Trigger Island 1 | Cover front camera with palm |
| Progress Island 1 shine | Uncover camera, hold 1 s |
| Trigger Island 2 | Shake phone up and down |
| Grant iOS sensors | Tap anywhere on first load |

---

## Performance Notes

- **Lazy loading** — only 5 images load on startup (boat + map + island thumbnails). Each island's full asset set loads on first visit only, keeping initial load fast.
- **Camera throttle** — brightness is sampled once every `CFG_CAMERA_SAMPLE_INTERVAL` frames and only while in `BOAT_FREEZE` or `COVERED` sub-states, saving ~83% CPU vs sampling every frame.
- **Maze buffer** — Island 3's 23×23 tile grid is pre-rendered into an offscreen `p5.Graphics` buffer once on load, then composited as a single `image()` call per frame. The buffer only rebuilds when a zone tile changes state (`_bufferDirty = true`).
- **Gradient** — the welcome screen background redraws every frame using `lerpColor` horizontal strips. Acceptable cost for a static splash screen.
