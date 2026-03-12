/* =============================================================================
 * stateManager.js
 * Game State Manager (GSM).
 *
 * Analogy: GSM / SceneManager in a game engine.
 *   - Owns the current-state variable.
 *   - Calls Exit on the old state before Enter on the new state.
 *   - States register themselves via registerState().
 *
 * Usage:
 *   registerState(STATE.MAIN,    { enter: enterStateMain,    exit: null           });
 *   registerState(STATE.ISLAND1, { enter: enterStateIsland1, exit: exitStateIsland1 });
 *   changeState(STATE.ISLAND1);
 * =============================================================================*/

"use strict";

/* ---------------------------------------------------------------------------
 * Internal registry — { stateName: { enter, exit } }
 * ---------------------------------------------------------------------------*/
const _stateRegistry = {};

/* ---------------------------------------------------------------------------
 * Active state — exposed read-only; write only through changeState()
 * ---------------------------------------------------------------------------*/
let currentState = STATE.MAIN;

/* ---------------------------------------------------------------------------
 * Public API
 * ---------------------------------------------------------------------------*/

/**
 * Register a state's lifecycle callbacks.
 *
 * @param {string}   name          - One of the STATE.* constants.
 * @param {object}   callbacks
 * @param {Function} callbacks.enter - Called when transitioning INTO this state.
 * @param {Function} [callbacks.exit]  - Called when leaving this state (optional).
 */
function registerState(name, callbacks) {
  _stateRegistry[name] = {
    enter: callbacks.enter || function () {},
    exit:  callbacks.exit  || function () {},
  };
}

/**
 * Transition to a new state.
 * Calls exit() on the current state, then enter() on the target state.
 *
 * @param {string} targetState - Must be registered via registerState() first.
 */
function changeState(targetState) {
  /* --- Guard: unknown state --- */
  if (!_stateRegistry[targetState]) {
    console.error("changeState: unknown state ->", targetState);
    return;
  }

  console.log("GSM:", currentState, "->", targetState);

  /* --- Exit current --- */
  if (_stateRegistry[currentState]) {
    _stateRegistry[currentState].exit();
  }

  /* --- Enter next --- */
  _stateRegistry[targetState].enter();

  currentState = targetState;
}
