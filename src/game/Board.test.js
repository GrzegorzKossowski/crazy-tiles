import { describe, it, expect } from 'vitest'
import { generateBoard, Board } from './Board.js'
import { BOARD_SIZE } from '../config/gameConfig.js'

describe('generateBoard', () => {
  it('returns a 10x10 grid', () => {
    const grid = generateBoard()
    expect(grid.length).toBe(BOARD_SIZE)
    grid.forEach(row => expect(row.length).toBe(BOARD_SIZE))
  })

  it('contains exactly 100 tiles', () => {
    const grid = generateBoard()
    const flat = grid.flat()
    expect(flat.length).toBe(100)
  })

  it('each value from -10 to 10 (no zero) appears exactly 5 times', () => {
    const grid = generateBoard()
    const flat = grid.flat()
    const expected = [
      -10, -9, -8, -7, -6, -5, -4, -3, -2, -1,
        1,  2,  3,  4,  5,  6,  7,  8,  9, 10
    ]
    for (const v of expected) {
      expect(flat.filter(x => x === v).length).toBe(5)
    }
  })

  it('contains no zeros', () => {
    const grid = generateBoard()
    expect(grid.flat().includes(0)).toBe(false)
  })
})

describe('Board', () => {
  function makeBoard() {
    return new Board(generateBoard())
  }

  it('getValue returns correct value', () => {
    const data = Array.from({ length: 10 }, (_, r) =>
      Array.from({ length: 10 }, (_, c) => r * 10 + c + 1)
    )
    const board = new Board(data)
    expect(board.getValue(0, 0)).toBe(1)
    expect(board.getValue(1, 0)).toBe(11)
  })

  it('getAvailableInRow returns all non-null tiles in row', () => {
    const data = Array.from({ length: 10 }, () => Array(10).fill(1))
    data[2][3] = null
    const board = new Board(data)
    const row = board.getAvailableInRow(2)
    expect(row.length).toBe(9)
    expect(row.find(t => t.col === 3)).toBeUndefined()
  })

  it('getAvailableInCol returns all non-null tiles in col', () => {
    const data = Array.from({ length: 10 }, () => Array(10).fill(5))
    data[4][1] = null
    const board = new Board(data)
    const col = board.getAvailableInCol(1)
    expect(col.length).toBe(9)
  })

  it('collectTiles removes tiles and returns sum', () => {
    const data = Array.from({ length: 10 }, () => Array(10).fill(3))
    const board = new Board(data)
    const delta = board.collectTiles([{ row: 0, col: 0 }, { row: 0, col: 1 }])
    expect(delta).toBe(6)
    expect(board.getValue(0, 0)).toBe(null)
    expect(board.getValue(0, 1)).toBe(null)
    expect(board.getValue(0, 2)).toBe(3) // untouched
  })

  it('collectTiles handles negative values', () => {
    const data = Array.from({ length: 10 }, () => Array(10).fill(-5))
    const board = new Board(data)
    const delta = board.collectTiles([{ row: 1, col: 1 }, { row: 2, col: 1 }])
    expect(delta).toBe(-10)
  })

  it('clone is an independent copy', () => {
    const board = makeBoard()
    const clone = board.clone()
    clone.collectTiles([{ row: 0, col: 0 }])
    expect(board.getValue(0, 0)).not.toBe(null)
  })
})
