# SP Navigators

A p5.js mobile-first interactive experience built for events. Players sail a boat across an overworld map to reach three islands, each with a unique physical interaction mechanic — camera cover, device shake, and tilt-controlled maze.

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
index.html                  Entry point — script load order is significant
style.css                   Global reset + shared button CSS classes
config.js                   ★ All tunable constants — edit this first
handlePermissions.js        iOS / Android sensor permission layer
stateManager.js             Game State Manager — lazy asset loading + loading screen
inputHandler.js             Keyboard + device tilt → unified direction vector
camera.js                   Front-facing camera, throttled brightness sampling
audioManager.js             Centralised music manager — one track at a time
welcomeState.js             Welcome / splash screen
mainState.js                Overworld sailing map + tutorial overlay
island1State.js             Island 1 — Lighthouse / Wheel of Life
island2State.js             Island 2 — Volcano & Alumni story
island3State.js             Island 3 — Pyramid Maze & CCA Events
manifest.json               App metadata (Name, Icon, Colors)
sw.js                       Service Worker for offline caching
assets/                     All images, GIFs and audio files
assets/icon-lighthouse.png  The 512x512 square app icon
```

---

## State Flow

```
[HTML loading screen]
        │
        ▼
    WELCOME  ──[START]──►  MAIN (sailing map + tutorial overlay)
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
           ISLAND3          ISLAND2          ISLAND1
          (closest)                          (furthest)
           [Menu]            [Menu]           [Menu]
              └────────────────┼────────────────┘
                               ▼
                             MAIN
                            [Home]
                               │
                               ▼
                           WELCOME
```

Island assets load **lazily** on first visit — a loading screen with percentage bar appears briefly, then never again for that island.

---

## Island Mechanics

### Island 1 — Lighthouse & Wheel of Life
**Mechanic: camera cover**

Flow: `boatFreeze → covered → shine → ourSource → nextPart (wheel)`

1. Sail to Island 1 — a frozen boat scene appears
2. **Cover the front camera** with your finger or palm → screen goes dark
3. **Uncover the camera** and hold for 1 second → lighthouse shines
4. Tap **Next** to progress through slides
5. Final screen: spinning Wheel of Life controlled by rotating the device
6. **Back** button appears on wheel screen to return to map

### Island 2 — Volcano & Alumni Story
**Mechanic: shake (Y-axis / up-down only)**

Flow: `slide 1 (shake) → slides 2–8 → slide 9 (back)`

1. Sail to Island 2 — passive volcano scene
2. **Shake the phone up and down** → volcano erupts
3. Tap **Next** to advance through the alumni story slides
4. **Back** returns to map from the final slide

> Desktop debug: press **S** to advance story

### Island 3 — Pyramid Maze & CCA Events
**Mechanic: tilt to move**

Flow: `MAZE → EVENT1–7 (on zone touch) → milestones → EVENTSUM`

1. Sail to Island 3 — a top-down pyramid maze appears
2. **Tilt the device** to steer the red dot through the maze
3. Find and enter all 7 zones — 6 CCA events + 1 TRNG zone
4. Each zone triggers an event slide → tap **Continue** to return to maze
5. After 4th event zone → McDonald's voucher slide appears
6. After 5th event zone → sticker merch slide appears
7. Visit all 6 events + TRNG → exit tile unlocks → event summary screen
8. Summary screen has **Join SP Navigators** button linking to Linktree

> Desktop debug: press **E** to skip straight to event summary

---

## Maze Zone Reference

| Grid value | Zone id | Event | Asset |
|---|---|---|---|
| `3` | 1 | Welcome to Nav+U | `event1.png` |
| `4` | 2 | Nav Night | `event2.png` |
| `5` | 3 | Nav Wellness Week | `event3.png` |
| `6` | 4 | End of MST Celebration | `event4.png` |
| `7` | 5 | Wheel Conference | `event5.png` |
| `8` | 6 | Values in Action (VIA) | `event6.png` |
| `9` | 7 | TRNG — must visit but not counted for milestones | `trng.png` |
| `2` | — | Exit tile — unlocked after all 7 visited | `tile2.png` |

**Formula:** grid number = zone id + 2

**Milestones** — shown after the event slide, before returning to maze:
- 4 events (id 1–6) visited → `milestone4.png` (McDonald's voucher)
- 5 events (id 1–6) visited → `milestone5.png` (sticker merch)

---

## Customisation Reference

Everything tuneable lives in **`config.js`**. No other file needs editing for typical adjustments.

### Welcome Screen

```js
const CFG_WELCOME_TITLE = "SP Navigators";

// Each array entry = one subtitle line. "" = blank gap between lines.
const CFG_WELCOME_SUBTITLE = [
  "To know Christ",
  "To make Him known",
  "To help others do the same",
];

const CFG_WELCOME_BG_TOP    = "#0a1f3d";  // gradient top colour (hex)
const CFG_WELCOME_BG_BOT    = "#0d3b6e";  // gradient bottom colour (hex)
const CFG_WELCOME_TITLE_COL = "#ffffff";  // title text colour
const CFG_WELCOME_BTN_COL   = "#e87722";  // START button colour

// Logo above the title — leave "" for text-only
const CFG_WELCOME_LOGO = "assets/logo.png";
```

Logo should be a **PNG with transparent background**, circular shape, exported at **420×420px** minimum for Retina screens.

---

### Island Collision Hitboxes

| Constant | Default | Notes |
|---|---|---|
| `CFG_ISLAND1_HIT_RATIO` | `0.45` | Triggers at shores of island image |
| `CFG_ISLAND2_HIT_RATIO` | `0.28` | Triggers at island edge |
| `CFG_ISLAND3_HIT_RATIO` | `0.28` | Triggers at island edge |

Raise → easier to trigger. Lower → must sail closer.

---

### Boat / Sailing

| Constant | Default | Effect |
|---|---|---|
| `CFG_BOAT_SPEED` | `2.0` | Pixels per frame |
| `CFG_BOAT_ROT_LERP` | `0.20` | Rotation smoothing — 0 = instant, 1 = no turn |

---

### Camera — Island 1

| Constant | Default | Effect |
|---|---|---|
| `CFG_BRIGHTNESS_THRESHOLD` | `55` | 0–255; pixel avg below this = "covered" |
| `CFG_UNCOVER_DEBOUNCE_MS` | `1000` | ms camera must stay bright before → shine |
| `CFG_CAMERA_WARMUP_FRAMES` | `30` | Frames skipped on entry (~0.5 s at 60 fps) |
| `CFG_CAMERA_SAMPLE_INTERVAL` | `6` | Sample once per N frames — saves CPU |

Two-stage false-trigger guard: warmup frames → readiness latch (must see one bright frame before COVERED can trigger).

---

### Shake — Island 2

| Constant | Default | Effect |
|---|---|---|
| `CFG_SHAKE_Y_THRESHOLD` | `25` | Min `\|ΔaccelerationY\|` per frame. Lower = more sensitive |
| `CFG_SHAKE_COOLDOWN_MS` | `1000` | ms before another shake registers |

Custom Y-axis-only detector — only up-down pumping triggers it.

---

### Maze — Island 3

| Constant | Default | Effect |
|---|---|---|
| `CFG_PLAYER_SPEED` | `2` | Pixels per frame |
| `CFG_PLAYER_RADIUS` | `8` | Visual size of player dot |
| `CFG_ZONE_EXIT_DELAY` | `1000` | ms of collision immunity after leaving event slide |
| `CFG_TILT_DEAD_ZONE` | `10` | Degrees of tilt ignored — prevents drift |

---

### Music

| Constant | Default | Used in |
|---|---|---|
| `CFG_MUSIC_VOLUME` | `1.0` | Global volume (0.0–1.0) |
| `CFG_MUSIC_WELCOME` | `assets/music_welcome.ogg` | Welcome screen |
| `CFG_MUSIC_MAIN` | `assets/music_main.ogg` | Sailing map |
| `CFG_MUSIC_ISLAND1` | `assets/music_island1.ogg` | Island 1 |
| `CFG_MUSIC_ISLAND2` | `assets/music_island2.ogg` | Island 2 |
| `CFG_MUSIC_ISLAND3` | `assets/music_island3.ogg` | Island 3 |

Use **OGG format**, under **2MB per file**, trimmed to a clean loop point. Music starts on the START button tap (first user gesture) to comply with browser autoplay policy.

---

### Buttons

| Constant | Default | Effect |
|---|---|---|
| `CFG_BTN_SAFE_MARGIN_PX` | `20` | Min px from screen edge |
| `CFG_BTN_BACK_RIGHT_OFFSET` | `120` | Back button from right edge |
| `CFG_BTN_BACK_BOTTOM_OFFSET` | `60` | Back button from bottom edge |
| `CFG_BTN_NEXT_RIGHT_OFFSET` | `100` | Next button from right edge |
| `CFG_BTN_NEXT_BOTTOM_OFFSET` | `60` | Next button from bottom edge |

All Menu buttons sit top-left (`position: fixed, left: 20px, top: 20px`). Next/Back buttons sit top-right (`position: fixed, right: 20px, top: 20px`).

---

## Swapping Assets

Drop the new file into `assets/` with the same filename — zero code change needed.

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
| `_event1Img` | `event1.png` | Welcome to Nav+U |
| `_event2Img` | `event2.png` | Nav Night |
| `_event3Img` | `event3.png` | Nav Wellness Week |
| `_event4Img` | `event4.png` | End of MST Celebration |
| `_event5Img` | `event5.png` | Wheel Conference |
| `_event6Img` | `event6.png` | Values in Action (VIA) |
| `_trngImg` | `trng.png` | TRNG slide |
| `_milestone4Img` | `milestone4.png` | McDonald's voucher milestone |
| `_milestone5Img` | `milestone5.png` | Sticker merch milestone |
| `_eventSumImg` | `eventSummary.png` | Final summary screen |

---

## Mobile Controls Summary

| Action | How |
|---|---|
| Move boat (map) | Tilt device or arrow keys |
| Move player (maze) | Tilt device or arrow keys |
| Enter island | Sail into island hitbox |
| Trigger Island 1 | Cover front camera with palm |
| Progress Island 1 | Uncover camera, hold 1 s |
| Trigger Island 2 | Shake phone up and down |
| Grant iOS sensors | Tap anywhere on first load |

---

## Debug Keys (Desktop Only)

| Key | State | Action |
|---|---|---|
| `S` | Island 2 | Advance story (simulates shake) |
| `E` | Island 3 | Skip straight to event summary |

Defined in `keyPressed()` in `main.js` — remove before release.

---

## Performance Notes

- **HTML loading screen** — shown before p5.js starts, covers the blank white flash. Animates to 90% then waits for `window.__p5Ready = true` from `main.js setup()` before rushing to 100% and fading out.
- **Lazy loading** — only 5 images load on startup. Each island loads its assets on first visit with a real percentage progress bar fed by `_loadProgress` in `stateManager.js`.
- **Camera throttle** — brightness sampled once every `CFG_CAMERA_SAMPLE_INTERVAL` frames, only while in `BOAT_FREEZE` or `COVERED` states (~83% CPU saving).
- **Maze buffer** — Island 3's 23×23 tile grid pre-rendered into an offscreen `p5.Graphics` buffer once, composited as a single `image()` call per frame. Rebuilds only when a zone tile changes state (`_bufferDirty = true`).
- **Music** — one track plays at a time via `audioManager.js`. `stopMusic()` called on every state exit. Starts on first user gesture to comply with browser autoplay policy.
- **Welcome background** — redraws every frame with twinkling stars and soft clouds using p5 draw calls. No extra image asset required.

---

## PWA & Mobile Installation

This project is a Progressive Web App (PWA), allowing it to be installed on mobile devices for a native-like experience.

**Features**
- **Offline Support**: Key assets and game states are cached via `sw.js` to ensure stability even if the school Wi-Fi is patchy.
- **Home Screen Icon**: Uses the **Lighthouse illustration** as a dedicated app icon labeled **"NavQuest"**.
- **Splash Screen**: A custom midnight blue (`#0a1f3d`) loading screen masks script initialization.
- **Standalone Mode**: Removes the browser address bar to maximize space for the sailing and maze mechanics.

**How to Install**
**iOS**: Open the site in Safari, tap **Share**, and select **"Add to Home Screen"**.
**Android**: Open the site in Chrome and tap the **"Install App"** prompt.

---

## Developer's Note

**Final Check for the Carnival:**
Since the game utilizes **tilt** and **camera** mechanics (Island 1 and Island 3), these sensors strictly require the site to be hosted on HTTPS to function on mobile. If hosting via **GitHub Pages**, this is handled automatically.

Good luck at the **T16 Heartbeat** booth tomorrow! Having a custom "**NavQuest**" app icon on students' phones is a great way to showcase the SIT-DigiPen Year 2 Computer Science in RTIS technical stack.

**Developed By:** Wei Liang (Jarrod)
*Year 2 CS RTIS | SIT-DigiPen (Singapore)*