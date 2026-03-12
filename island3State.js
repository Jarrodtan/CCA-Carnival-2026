/* =============================================================================
 * island3State.js
 * ISLAND3 state — Pyramid Maze & CCA Events.
 *
 * Sub-states:
 *   MAZE      — tilt/keyboard to navigate; collect 5 event zones
 *   EVENT1-5  — static event slides (continue button returns to MAZE)
 *   EVENTSUM  — summary slide shown after all 5 zones + exit zone reached
 *
 * Maze grid legend:
 *   0 — walkable path
 *   1 — wall
 *   2 — exit tile
 *   3-7 — event zone tiles (tile3 = unvisited, tile4 = visited)
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Maze sub-states
 * ---------------------------------------------------------------------------*/
const I3_STATE = Object.freeze({
  MAZE     : "MAZE",
  EVENT1   : "EVENT1",
  EVENT2   : "EVENT2",
  EVENT3   : "EVENT3",
  EVENT4   : "EVENT4",
  EVENT5   : "EVENT5",
  EVENTSUM : "EVENTSUM",
});

let _mazeState = I3_STATE.MAZE;

/* ---------------------------------------------------------------------------
 * Assets
 * ---------------------------------------------------------------------------*/
let _tile0Img, _tile1Img, _tile2Img, _tile3Img, _tile4Img;
let _event1Img, _event2Img, _event3Img, _event4Img, _event5Img, _eventSumImg;

/* ---------------------------------------------------------------------------
 * Maze grid
 * ---------------------------------------------------------------------------*/
/* Encoded as a 2-D array; 3-7 are zone IDs mapping to event tiles. */
const _MAZE_GRID = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,4,1,1,0,1,0,1,1,0,0,0,0,1,1,6,0,1,1],
  [1,1,1,1,1,0,0,0,0,1,0,1,1,0,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,0,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1],
  [1,1,1,0,0,0,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1],
  [1,1,1,0,1,1,1,1,3,0,1,1,0,1,1,1,1,1,1,1,0,1,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,0,0,1,1],
  [1,0,0,0,0,0,0,1,1,0,1,1,0,7,1,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1],
  [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,1,1,1,5,1,1,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1],
];

/* ---------------------------------------------------------------------------
 * Derived layout (computed in setup)
 * ---------------------------------------------------------------------------*/
let _cellSize;
let _mazeOffset;    // vertical offset so maze is centred on canvas

/* ---------------------------------------------------------------------------
 * Player
 * ---------------------------------------------------------------------------*/
let _player;   // { x, y, r, speed }

/* ---------------------------------------------------------------------------
 * Event zones (positions in maze-space; id maps to EVENT sub-state)
 * ---------------------------------------------------------------------------*/
let _zones;   // array of { x, y, d, id, touched }

/* ---------------------------------------------------------------------------
 * Exit zone
 * ---------------------------------------------------------------------------*/
let _exitZone;   // { x, y }

/* ---------------------------------------------------------------------------
 * Timing guard — prevents immediate re-trigger after returning from an event
 * ---------------------------------------------------------------------------*/
let _zoneExitTime = 0;

/* ---------------------------------------------------------------------------
 * UI elements
 * ---------------------------------------------------------------------------*/
let _backBtnI3, _backBtnI3Alt, _continueBtn;

/* Exposed to Island 1 brightness check (legacy coupling — leave as-is). */
let brightnessIsland3;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function preloadIsland3() {
  _tile0Img = loadImage("assets/tile0.png");
  _tile1Img = loadImage("assets/tile1.png");
  _tile2Img = loadImage("assets/tile2.png");
  _tile3Img = loadImage("assets/tile3.png");   // unvisited zone
  _tile4Img = loadImage("assets/tile4.png");   // visited   zone

  _event1Img   = loadImage("assets/event1.png");
  _event2Img   = loadImage("assets/event2.png");
  _event3Img   = loadImage("assets/event3.png");
  _event4Img   = loadImage("assets/event4.png");
  _event5Img   = loadImage("assets/event5.png");
  _eventSumImg = loadImage("assets/eventSummary.png");
}

function setupIsland3() {
  /* --- Maze layout --- */
  const cols = _MAZE_GRID[0].length;
  const rows = _MAZE_GRID.length;
  _cellSize   = (width < height) ? (width / cols) : (height / rows);
  _mazeOffset = 0.5 * height - (11.5 * _cellSize);

  /* --- Player spawn --- */
  _player = { x: 3.5 * _cellSize, y: 16.5 * _cellSize,
              r: CFG_PLAYER_RADIUS, speed: CFG_PLAYER_SPEED };

  /* --- Event zones (tile values 3–7 map to zone IDs 1–5) --- */
  _zones = [
    { id: 1, x:  8 * _cellSize, y: 11 * _cellSize, touched: false },
    { id: 2, x:  5 * _cellSize, y:  5 * _cellSize, touched: false },
    { id: 3, x: 11 * _cellSize, y: 18 * _cellSize, touched: false },
    { id: 4, x: 19 * _cellSize, y:  5 * _cellSize, touched: false },
    { id: 5, x: 13 * _cellSize, y: 13 * _cellSize, touched: false },
  ];

  /* --- Exit zone --- */
  _exitZone = { x: 15 * _cellSize, y: 22 * _cellSize };

  /* --- Back buttons --- */
  _backBtnI3 = createImg("assets/back.png", "");
  _backBtnI3.class("backBtn");
  _backBtnI3.mousePressed(() => changeState(STATE.MAIN));
  _backBtnI3.hide();

  _backBtnI3Alt = createButton("Back");
  _backBtnI3Alt.position(20, 50);
  _backBtnI3Alt.mousePressed(() => changeState(STATE.MAIN));
  _backBtnI3Alt.hide();

  /* --- Continue button (returns from event slide to maze) --- */
  _continueBtn = createImg("assets/continue.png", "");
  _continueBtn.class("continueBtn");
  _continueBtn.mouseClicked(() => {
    _mazeState    = I3_STATE.MAZE;
    _zoneExitTime = millis();
  });
  _continueBtn.hide();

  /* --- Register with GSM --- */
  registerState(STATE.ISLAND3, { enter: enterStateIsland3, exit: exitStateIsland3 });
}

function drawIsland3() {
  background("#E7A363");

  switch (_mazeState) {
    case I3_STATE.MAZE:
      _drawMaze();
      break;

    case I3_STATE.EVENT1:  _drawEventSlide(_event1Img);   break;
    case I3_STATE.EVENT2:  _drawEventSlide(_event2Img);   break;
    case I3_STATE.EVENT3:  _drawEventSlide(_event3Img);   break;
    case I3_STATE.EVENT4:  _drawEventSlide(_event4Img);   break;
    case I3_STATE.EVENT5:  _drawEventSlide(_event5Img);   break;

    case I3_STATE.EVENTSUM:
      imageMode(CORNER);
      image(_eventSumImg, 0, 0, width, height);
      _backBtnI3.show();
      break;
  }
}

/* =============================================================================
 * GSM callbacks
 * =============================================================================*/

function enterStateIsland3() {
  /* Reset player to spawn. */
  _player = { x: 3.5 * _cellSize, y: 16.5 * _cellSize,
              r: CFG_PLAYER_RADIUS, speed: CFG_PLAYER_SPEED };

  /* Reset all zone flags. */
  for (const z of _zones) z.touched = false;

  _mazeState    = I3_STATE.MAZE;
  _zoneExitTime = millis() - CFG_ZONE_EXIT_DELAY; // allow immediate collision checks

  _backBtnI3Alt.show();
}

function exitStateIsland3() {
  _backBtnI3.hide();
  _backBtnI3Alt.hide();
  _continueBtn.hide();
}

/* =============================================================================
 * Private — maze draw
 * =============================================================================*/

function _drawMaze() {
  _continueBtn.hide();
  _handleInputIsland3();

  push();
    translate(0, _mazeOffset);
    imageMode(CORNER);
    _renderTiles();

    /* Player dot */
    fill(255, 0, 0);
    noStroke();
    circle(_player.x, _player.y, _player.r * 2);
  pop();

  /* Zone & exit collision checks (guarded by cooldown after returning). */
  if (millis() - _zoneExitTime > CFG_ZONE_EXIT_DELAY) {
    for (const zone of _zones) {
      _checkZoneCollision(zone);
    }
    _checkExitZone();
  }
}

/** Iterate every cell and draw the correct tile image. */
function _renderTiles() {
  for (let r = 0; r < _MAZE_GRID.length; r++) {
    for (let c = 0; c < _MAZE_GRID[r].length; c++) {
      const x    = c * _cellSize;
      const y    = r * _cellSize;
      const cell = _MAZE_GRID[r][c];

      if      (cell === 0) { image(_tile0Img, x, y, _cellSize, _cellSize); }
      else if (cell === 1) { image(_tile1Img, x, y, _cellSize, _cellSize); }
      else if (cell === 2) { image(_tile2Img, x, y, _cellSize, _cellSize); }
      else if (cell >= 3 && cell <= 7) {
        /* Zone tile — visited (tile4) vs unvisited (tile3). */
        const zoneId  = cell - 2;                     // tile value 3 → zone 1, etc.
        const visited = _zones.find(z => z.id === zoneId)?.touched;
        image(visited ? _tile4Img : _tile3Img, x, y, _cellSize, _cellSize);
      }
    }
  }
}

/* =============================================================================
 * Private — event slide draw
 * =============================================================================*/

function _drawEventSlide(img) {
  imageMode(CORNER);
  image(img, 0, 0, width, height);
  _continueBtn.show();
}

/* =============================================================================
 * Private — collision detection
 * =============================================================================*/

/**
 * AABB collision between player centre and a 1x1 cell zone.
 * Transitions to the matching EVENT sub-state and marks zone as visited.
 *
 * @param {{ id, x, y, touched }} zone
 */
function _checkZoneCollision(zone) {
  if (zone.touched) return;   // Already visited; skip.

  const inside = !(
    _player.x < zone.x ||
    _player.x > zone.x + _cellSize ||
    _player.y < zone.y ||
    _player.y > zone.y + _cellSize
  );

  if (inside) {
    zone.touched = true;
    _mazeState   = I3_STATE["EVENT" + zone.id];
  }
}

/** Check if player reached the exit AND all zones have been visited. */
function _checkExitZone() {
  const allVisited = _zones.every(z => z.touched);
  if (!allVisited) return;

  const inside = !(
    _player.x < _exitZone.x ||
    _player.x > _exitZone.x + _cellSize ||
    _player.y < _exitZone.y ||
    _player.y > _exitZone.y + _cellSize
  );

  if (inside) {
    _mazeState = I3_STATE.EVENTSUM;
  }
}

/* =============================================================================
 * Private — input
 * =============================================================================*/

/** Read input dir, resolve next position, apply wall collision. */
function _handleInputIsland3() {
  const dir   = getInputDir();
  const nextX = _player.x + dir.x * _player.speed;
  const nextY = _player.y + dir.y * _player.speed;

  if (!_isWall(nextX, _player.y)) _player.x = nextX;
  if (!_isWall(_player.x, nextY)) _player.y = nextY;
}

/**
 * Returns true if the given world-space point falls inside a wall cell.
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function _isWall(x, y) {
  const col = floor(x / _cellSize);
  const row = floor(y / _cellSize);

  if (row < 0 || row >= _MAZE_GRID.length ||
      col < 0 || col >= _MAZE_GRID[0].length) {
    return true;   // Out-of-bounds counts as a wall.
  }

  return _MAZE_GRID[row][col] === 1;
}

/* =============================================================================
 * p5 callback — kept in global scope as p5 requires it there
 * =============================================================================*/

/** Requests device orientation permission on iOS when user first taps the screen. */
function touchStarted() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission();
  }
}
