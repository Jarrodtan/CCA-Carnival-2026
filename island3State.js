/* =============================================================================
 * island3State.js
 * ISLAND3 state — Pyramid Maze & CCA Events.
 *
 * Optimisations:
 *   • Assets loaded lazily on first visit.
 *   • Maze tiles drawn to an offscreen p5.Graphics buffer ONCE on enter,
 *     not 529 individual image() calls every frame.
 *     Only zone tiles (3-9) are redrawn on change (visited → unvisited flip).
 *   • Diagonal movement normalised (no sqrt(2) speed boost).
 *
 * Sub-states: MAZE → EVENT1-7 → EVENTSUM
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
  EVENT6   : "EVENT6",
  EVENT7   : "EVENT7",
  MILESTONE4: "MILESTONE4",  // shown after 4 zones visited
  MILESTONE5: "MILESTONE5",  // shown after 5 zones visited
  EVENTSUM : "EVENTSUM",
});

let _mazeState = I3_STATE.MAZE;

/* ---------------------------------------------------------------------------
 * Assets
 * ---------------------------------------------------------------------------*/
let _tile0Img, _tile1Img, _tile2Img, _tile3Img, _tile4Img;
let _event1Img, _event2Img, _event3Img, _event4Img, _event5Img, _event6Img,
    _trngImg, _milestone4Img, _milestone5Img, _eventSumImg;

/* ---------------------------------------------------------------------------
 * Maze grid (inline — see mazeData.js / maze.json for extracted version)
 * ---------------------------------------------------------------------------*/
const _MAZE_GRID = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,1,1,1,0,0,0,1,1,9,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,4,1,1,0,1,0,1,1,0,0,0,0,1,1,6,0,1,1],
  [1,1,1,1,1,0,0,0,0,1,0,1,1,0,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,0,1,1,1,1,0,0,0,0,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1],
  [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1],
  [1,1,1,0,0,0,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1],
  [1,1,1,0,1,1,1,1,3,0,1,1,0,1,1,1,1,1,1,1,0,1,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,0,0,1,1],
  [1,0,0,0,0,0,0,1,1,0,1,1,0,7,1,1,1,1,0,1,8,1,1],
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
 * Layout
 * ---------------------------------------------------------------------------*/
let _cellSize;
let _mazeOffset;

/* ---------------------------------------------------------------------------
 * Offscreen buffer — static tiles drawn ONCE, composited each frame
 * ---------------------------------------------------------------------------*/
let _mazeBuffer     = null;   // p5.Graphics
let _bufferDirty    = true;   // set true when a zone flips visited state

/* ---------------------------------------------------------------------------
 * Runtime
 * ---------------------------------------------------------------------------*/
let _player;
let _zones;
let _exitZone;
let _zoneExitTime = 0;
let _pendingMilestone = null;

/* ---------------------------------------------------------------------------
 * UI
 * ---------------------------------------------------------------------------*/
let _backBtnI3, _mainmenuBtnI3, _continueBtn;

/* =============================================================================
 * Lifecycle
 * =============================================================================*/

function preloadIsland3() {
  /* Nothing — lazy loaded. */
}
/* Re-do with correct count */
function loadAssetsIsland3(onDone) {
  let loaded = 0;
  const total = 15;
  const tick  = () => { if (++loaded === total) { _buildMazeBuffer(); onDone(); } };

  _tile0Img    = loadImage("assets/tile0.png",         tick);
  _tile1Img    = loadImage("assets/tile1.png",         tick);
  _tile2Img    = loadImage("assets/tile2.png",         tick);
  _tile3Img    = loadImage("assets/tile3.png",         tick);
  _tile4Img    = loadImage("assets/tile4.png",         tick);
  _event1Img   = loadImage("assets/event1.png",        tick);
  _event2Img   = loadImage("assets/event2.png",        tick);
  _event3Img   = loadImage("assets/event3.png",        tick);
  _event4Img   = loadImage("assets/event4.png",        tick);
  _event5Img   = loadImage("assets/event5.png",        tick);
  _event6Img   = loadImage("assets/event6.png",        tick);
  _trngImg     = loadImage("assets/trng.png"  ,        tick);
  _milestone4Img = loadImage("assets/milestone4.png",  tick);  // McDonald's pic
  _milestone5Img = loadImage("assets/milestone5.png",  tick);  // sticker merch pic
  _eventSumImg = loadImage("assets/eventSummary.png",  tick);
}

function setupIsland3() {
  const cols  = _MAZE_GRID[0].length;
  const rows  = _MAZE_GRID.length;
  _cellSize   = (width < height) ? (width / cols) : (height / rows);
  _mazeOffset = 0.5 * height - (11.5 * _cellSize);

  _player = { x: 3.5 * _cellSize, y: 16.5 * _cellSize,
              r: CFG_PLAYER_RADIUS, speed: CFG_PLAYER_SPEED };

  _zones = [
    { id: 1, x:  8 * _cellSize, y: 11 * _cellSize, touched: false },
    { id: 2, x:  5 * _cellSize, y:  5 * _cellSize, touched: false },
    { id: 3, x: 11 * _cellSize, y: 18 * _cellSize, touched: false },
    { id: 4, x: 19 * _cellSize, y:  5 * _cellSize, touched: false },
    { id: 5, x: 13 * _cellSize, y: 13 * _cellSize, touched: false },
    { id: 6, x: 20 * _cellSize, y: 13 * _cellSize, touched: false },
    { id: 7, x: 13 * _cellSize, y:  4 * _cellSize, touched: false },
  ];

  _exitZone = { x: 15 * _cellSize, y: 22 * _cellSize };

  _backBtnI3 = createImg("assets/back.png", "");
  _backBtnI3.class("backBtn");
  _backBtnI3.mousePressed(() => changeState(STATE.MAIN));
  _backBtnI3.hide();

  _mainmenuBtnI3 = createButton("Mainmenu");
  _mainmenuBtnI3.position(140, 20);
  _mainmenuBtnI3.mousePressed(() => changeState(STATE.MAIN));
  _mainmenuBtnI3.hide();

  _continueBtn = createImg("assets/continue.png", "");
  _continueBtn.class("continueBtn");
  _continueBtn.mouseClicked(() => {
    if (_pendingMilestone) {
      _mazeState        = _pendingMilestone;
      _pendingMilestone = null;   // clear after showing
    } else {
      _mazeState    = I3_STATE.MAZE;
      _zoneExitTime = millis();
    }
  });
  _continueBtn.hide();

  registerState(STATE.ISLAND3, {
    loadAssets: loadAssetsIsland3,
    enter:      enterStateIsland3,
    exit:       exitStateIsland3,
  });
}

function drawIsland3() {
  background("#E7A363");

  switch (_mazeState) {
    case I3_STATE.MAZE:      _drawMaze();                 break;
    case I3_STATE.EVENT1:    _drawEventSlide(_event1Img); break;
    case I3_STATE.EVENT2:    _drawEventSlide(_event2Img); break;
    case I3_STATE.EVENT3:    _drawEventSlide(_event3Img); break;
    case I3_STATE.EVENT4:    _drawEventSlide(_event4Img); break;
    case I3_STATE.EVENT5:    _drawEventSlide(_event5Img); break;
    case I3_STATE.EVENT6:    _drawEventSlide(_event6Img); break;
    case I3_STATE.EVENT7:    _drawEventSlide(_trngImg)  ; break;
    case I3_STATE.MILESTONE4: _drawEventSlide(_milestone4Img); break;
    case I3_STATE.MILESTONE5: _drawEventSlide(_milestone5Img); break;
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
  _player = { x: 3.5 * _cellSize, y: 16.5 * _cellSize,
              r: CFG_PLAYER_RADIUS, speed: CFG_PLAYER_SPEED };
  for (const z of _zones) z.touched = false;
  _mazeState    = I3_STATE.MAZE;
  _zoneExitTime = millis() - CFG_ZONE_EXIT_DELAY;
  _bufferDirty  = true;   // force buffer redraw on re-entry
  _mainmenuBtnI3.show(); 
  _pendingMilestone = null;
}

function exitStateIsland3() {
  _backBtnI3.hide();
  _continueBtn.hide();
  _mainmenuBtnI3.hide(); 
}

/* =============================================================================
 * Private — offscreen buffer
 * =============================================================================*/

/**
 * Draw the entire maze tile grid into _mazeBuffer (a p5.Graphics).
 * Called once after assets load, and again any time a zone tile flips state.
 * This replaces 529 individual image() calls per frame with 1 image() call.
 */
function _buildMazeBuffer() {
  const cols = _MAZE_GRID[0].length;
  const rows = _MAZE_GRID.length;
  const w    = cols * _cellSize;
  const h    = rows * _cellSize;

  if (!_mazeBuffer) {
    _mazeBuffer = createGraphics(w, h);
  }

  _mazeBuffer.imageMode(CORNER);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x    = c * _cellSize;
      const y    = r * _cellSize;
      const cell = _MAZE_GRID[r][c];

      if      (cell === 0) { _mazeBuffer.image(_tile0Img, x, y, _cellSize, _cellSize); }
      else if (cell === 1) { _mazeBuffer.image(_tile1Img, x, y, _cellSize, _cellSize); }
      else if (cell === 2) { _mazeBuffer.image(_tile2Img, x, y, _cellSize, _cellSize); }
      else if (cell >= 3 && cell <= 9) {
        const zoneId  = cell - 2;
        const visited = _zones ? _zones.find(z => z.id === zoneId)?.touched : false;
        _mazeBuffer.image(visited ? _tile4Img : _tile3Img, x, y, _cellSize, _cellSize);
      }
    }
  }

  _bufferDirty = false;
}

/* =============================================================================
 * Private — maze draw
 * =============================================================================*/

function _drawMaze() {
  _continueBtn.hide();
  _handleInputIsland3();

  /* Rebuild buffer only when zone state changed — not every frame. */
  if (_bufferDirty) _buildMazeBuffer();

  push();
    translate(0, _mazeOffset);
    imageMode(CORNER);
    /* ONE draw call for the entire tile grid. */
    image(_mazeBuffer, 0, 0);

    fill(255, 0, 0);
    noStroke();
    circle(_player.x, _player.y, _player.r * 2);
  pop();

  if (millis() - _zoneExitTime > CFG_ZONE_EXIT_DELAY) {
    for (const zone of _zones) _checkZoneCollision(zone);
    _checkExitZone();
  }
}

function _drawEventSlide(img) {
  imageMode(CORNER);
  image(img, 0, 0, width, height);
  _continueBtn.show();
}

/* =============================================================================
 * Private — collision
 * =============================================================================*/

function _checkZoneCollision(zone) {
  if (zone.touched) return;

  const inside = !(
    _player.x < zone.x              ||
    _player.x > zone.x + _cellSize  ||
    _player.y < zone.y              ||
    _player.y > zone.y + _cellSize
  );

  if (inside) {
    zone.touched = true;
    _bufferDirty = true;   // zone tile needs to flip to visited sprite

    // count only event zones (id 1-6), not TRNG (id 7)
    const eventCount = _zones.filter(z => z.id <= 6 && z.touched).length;

    // queue milestone to show AFTER the event slide's continue is pressed
    if (eventCount === 4) {
      _pendingMilestone = I3_STATE.MILESTONE4; // McDonald's voucher
    } else if (eventCount === 5) {
      _pendingMilestone = I3_STATE.MILESTONE5; // sticker merch
    }

    // always show the event slide first
    _mazeState = I3_STATE["EVENT" + zone.id];
  }
}

function _checkExitZone() {
  // all 6 events + TRNG must be visited
  const allEventsDone = _zones.filter(z => z.id <= 6).every(z => z.touched);
  const trngDone      = _zones.find(z => z.id === 7)?.touched;
  if (!allEventsDone || !trngDone) return;

  const inside = !(
    _player.x < _exitZone.x              ||
    _player.x > _exitZone.x + _cellSize  ||
    _player.y < _exitZone.y              ||
    _player.y > _exitZone.y + _cellSize
  );

  if (inside) _mazeState = I3_STATE.EVENTSUM;
}

/* =============================================================================
 * Private — input
 * =============================================================================*/

function _handleInputIsland3() {
  let dir = getInputDir();

  /* Normalise diagonal so diagonal speed == cardinal speed. */
  if (dir.x !== 0 && dir.y !== 0) {
    const INV_SQRT2 = 0.7071;
    dir = { x: dir.x * INV_SQRT2, y: dir.y * INV_SQRT2 };
  }

  const nextX = _player.x + dir.x * _player.speed;
  const nextY = _player.y + dir.y * _player.speed;

  if (!_isWall(nextX, _player.y)) _player.x = nextX;
  if (!_isWall(_player.x, nextY)) _player.y = nextY;
}

function _isWall(x, y) {
  const col = floor(x / _cellSize);
  const row = floor(y / _cellSize);

  if (row < 0 || row >= _MAZE_GRID.length ||
      col < 0 || col >= _MAZE_GRID[0].length) {
    return true;
  }

  return _MAZE_GRID[row][col] === 1;
}

/* =============================================================================
 * p5 callback
 * =============================================================================*/

function touchStarted() {
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission();
  }
}