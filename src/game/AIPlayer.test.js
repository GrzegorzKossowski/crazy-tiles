import { describe, it, expect } from 'vitest'
import { Board } from './Board.js'
import { getBestMove } from './AIPlayer.js'

function makeGrid(overrides = {}) {
  const data = Array.from({ length: 10 }, () => Array(10).fill(null))
  for (const [key, val] of Object.entries(overrides)) {
    const [r, c] = key.split(',').map(Number)
    data[r][c] = val
  }
  return data
}

describe('getBestMove', () => {
  it('returns null when column is empty', () => {
    const board = new Board(makeGrid())
    expect(getBestMove(board, 3, 1)).toBeNull()
  })

  it('depth 1: picks the highest-value tile in column', () => {
    const data = makeGrid({ '1,5': 3, '4,5': 10, '7,5': -2 })
    const board = new Board(data)
    const move = getBestMove(board, 5, 1)
    expect(move.row).toBe(4) // row with value 10
  })

  it('depth 1: picks the least negative when all tiles are negative', () => {
    const data = makeGrid({ '0,2': -1, '3,2': -8, '9,2': -3 })
    const board = new Board(data)
    const move = getBestMove(board, 2, 1)
    expect(move.row).toBe(0) // row with value -1 (least damage)
  })

  it('does not mutate the original board', () => {
    const data = makeGrid({ '2,0': 5, '5,0': 9 })
    const board = new Board(data)
    getBestMove(board, 0, 1)
    expect(board.getValue(2, 0)).toBe(5)
    expect(board.getValue(5, 0)).toBe(9)
  })

  it('returns a valid row index (within available tiles)', () => {
    const data = makeGrid({ '0,3': 1, '6,3': -4, '9,3': 7 })
    const board = new Board(data)
    const move = getBestMove(board, 3, 3)
    expect([0, 6, 9]).toContain(move.row)
  })

  it('depth 5 still returns a valid row', () => {
    const data = makeGrid({
      '1,1': 5, '3,1': -2, '6,1': 8,
      '2,6': 3, '4,6': 1,
      '0,3': 4, '5,3': 7
    })
    const board = new Board(data)
    const move = getBestMove(board, 1, 5)
    expect(move).not.toBeNull()
    expect(typeof move.row).toBe('number')
  })

  it('depth 1: does not pick a negative tile when a positive one is available', () => {
    const data = makeGrid({ '0,7': -5, '3,7': 4, '8,7': -1 })
    const board = new Board(data)
    const move = getBestMove(board, 7, 1)
    expect(move.row).toBe(3) // only positive tile
  })

  it('blocking bonus: prefers game-ending move when CPU is winning', () => {
    // Col 0: row 2 scores 5 but leaves P1 able to move (tile at 2,4 remains)
    //        row 7 scores 3 but row 7 is empty → blocks P1 → game ends
    // With cpuScore=120, p1Score=100: blocking margin = 120+3-100 = 23
    // → blocking score = 3+23 = 26 > non-blocking score = 5
    const data = makeGrid({ '2,0': 5, '2,4': 1, '7,0': 3 })
    const board = new Board(data)
    const move = getBestMove(board, 0, 1, 120, 100)
    expect(move.row).toBe(7) // lower-scoring but game-ending move wins
  })
})
