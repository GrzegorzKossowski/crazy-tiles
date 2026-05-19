export const GAME_WIDTH = 800
export const GAME_HEIGHT = 672       // 32 × 21
export const TILE_SIZE = 32          // grid unit

export const BOARD_SIZE = 10
export const GAME_TILE_SIZE = 54
export const GAME_TILE_GAP = 2
export const SCORE_BAR_HEIGHT = 70
export const BOARD_OFFSET_X = 121   // (800 - 558) / 2
export const BOARD_OFFSET_Y = 80    // SCORE_BAR_HEIGHT + 10

export const STARTING_SCORE = 100

export const DEFAULT_P1_NAME = 'Janusz'
export const DEFAULT_P2_NAME = 'Dżejsiczka'

// CPU character names per difficulty depth
export const CPU_NAMES = {
  1: 'Blamaż',    // easy  — blunders constantly
  3: 'Cwaniak',   // medium — thinks it's clever
  5: 'Tytan'      // hard  — merciless
}
