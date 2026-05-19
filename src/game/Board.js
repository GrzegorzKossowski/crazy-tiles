import { BOARD_SIZE } from '../config/gameConfig.js'

const TILE_VALUES = [
  -10, -9, -8, -7, -6, -5, -4, -3, -2, -1,
    1,  2,  3,  4,  5,  6,  7,  8,  9, 10
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateBoard() {
  // Each value appears exactly 5 times → 100 tiles, shuffled
  const pool = shuffle(Array.from({ length: 5 }, () => TILE_VALUES).flat())
  const grid = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    grid.push(pool.slice(r * BOARD_SIZE, (r + 1) * BOARD_SIZE))
  }
  return grid
}

export class Board {
  constructor(data) {
    // Deep copy to avoid shared state
    this._grid = data.map(row => [...row])
  }

  getValue(row, col) {
    return this._grid[row][col]
  }

  getAvailableInRow(row) {
    const result = []
    for (let col = 0; col < BOARD_SIZE; col++) {
      const v = this._grid[row][col]
      if (v !== null) result.push({ row, col, value: v })
    }
    return result
  }

  getAvailableInCol(col) {
    const result = []
    for (let row = 0; row < BOARD_SIZE; row++) {
      const v = this._grid[row][col]
      if (v !== null) result.push({ row, col, value: v })
    }
    return result
  }

  collectTiles(positions) {
    let sum = 0
    for (const { row, col } of positions) {
      sum += this._grid[row][col]
      this._grid[row][col] = null
    }
    return sum
  }

  clone() {
    return new Board(this._grid)
  }
}
