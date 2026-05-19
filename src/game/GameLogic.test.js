import { describe, it, expect } from 'vitest'
import { Board } from './Board.js'
import { findMatchingTiles, applyMove, canMove, getValidPositions } from './GameLogic.js'

function makeBoard(data) {
  return new Board(data)
}

function emptyRow() {
  return Array(10).fill(null)
}

function makeGrid(overrides = {}) {
  // 10x10 all nulls, then apply overrides: { 'row,col': value }
  const data = Array.from({ length: 10 }, () => Array(10).fill(null))
  for (const [key, val] of Object.entries(overrides)) {
    const [r, c] = key.split(',').map(Number)
    data[r][c] = val
  }
  return data
}

describe('findMatchingTiles', () => {
  it('returns only the clicked tile when no duplicates exist in row', () => {
    const data = makeGrid({ '0,0': 5, '0,1': 3, '0,2': 7 })
    const board = makeBoard(data)
    const matches = findMatchingTiles(board, 0, 0, true)
    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({ row: 0, col: 0, value: 5 })
  })

  it('returns all tiles with same value in the same row', () => {
    const data = makeGrid({ '2,0': 10, '2,3': 10, '2,7': 10, '2,9': 5 })
    const board = makeBoard(data)
    const matches = findMatchingTiles(board, 2, 0, true)
    expect(matches).toHaveLength(3)
    expect(matches.every(t => t.value === 10)).toBe(true)
  })

  it('returns all tiles with same value in the same column', () => {
    const data = makeGrid({ '0,4': -3, '3,4': -3, '8,4': 7 })
    const board = makeBoard(data)
    const matches = findMatchingTiles(board, 0, 4, false)
    expect(matches).toHaveLength(2)
    expect(matches.every(t => t.value === -3)).toBe(true)
  })

  it('returns empty array for null tile', () => {
    const board = makeBoard(makeGrid())
    const matches = findMatchingTiles(board, 0, 0, true)
    expect(matches).toHaveLength(0)
  })

  it('does not cross rows — col duplicates not counted for row move', () => {
    const data = makeGrid({ '0,2': 5, '1,2': 5 }) // same col, different rows
    const board = makeBoard(data)
    const matches = findMatchingTiles(board, 0, 2, true) // P1 moves in row 0
    expect(matches).toHaveLength(1) // only (0,2), not (1,2)
  })
})

describe('applyMove', () => {
  it('returns correct scoreDelta and removes tiles', () => {
    const data = makeGrid({ '1,0': 4, '1,5': 4, '1,9': 2 })
    const board = makeBoard(data)
    const { scoreDelta, nextConstraint } = applyMove(board, 1, 0, true)
    expect(scoreDelta).toBe(8) // 4 + 4
    expect(nextConstraint).toBe(0) // col of clicked tile
    expect(board.getValue(1, 0)).toBe(null)
    expect(board.getValue(1, 5)).toBe(null)
    expect(board.getValue(1, 9)).toBe(2) // untouched
  })

  it('nextConstraint is col when isRow (P1 move)', () => {
    const data = makeGrid({ '3,6': 7 })
    const board = makeBoard(data)
    const { nextConstraint } = applyMove(board, 3, 6, true)
    expect(nextConstraint).toBe(6)
  })

  it('nextConstraint is row when !isRow (P2 move)', () => {
    const data = makeGrid({ '5,2': 7 })
    const board = makeBoard(data)
    const { nextConstraint } = applyMove(board, 5, 2, false)
    expect(nextConstraint).toBe(5)
  })

  it('handles negative scoreDelta', () => {
    const data = makeGrid({ '0,0': -8, '0,4': -8 })
    const board = makeBoard(data)
    const { scoreDelta } = applyMove(board, 0, 0, true)
    expect(scoreDelta).toBe(-16)
  })
})

describe('canMove', () => {
  it('returns true when row has tiles', () => {
    const data = makeGrid({ '4,3': 5 })
    const board = makeBoard(data)
    expect(canMove(board, 4, true)).toBe(true)
  })

  it('returns false when row is empty', () => {
    const board = makeBoard(makeGrid())
    expect(canMove(board, 4, true)).toBe(false)
  })

  it('returns true when col has tiles', () => {
    const data = makeGrid({ '7,2': -1 })
    const board = makeBoard(data)
    expect(canMove(board, 2, false)).toBe(true)
  })

  it('returns false when col is empty', () => {
    const board = makeBoard(makeGrid())
    expect(canMove(board, 2, false)).toBe(false)
  })
})

describe('getValidPositions', () => {
  it('returns positions in specified row', () => {
    const data = makeGrid({ '0,1': 3, '0,5': -2 })
    const board = makeBoard(data)
    const pos = getValidPositions(board, 0, true)
    expect(pos).toHaveLength(2)
    expect(pos.map(p => p.col).sort()).toEqual([1, 5])
  })

  it('returns positions in specified col', () => {
    const data = makeGrid({ '2,3': 1, '8,3': 9 })
    const board = makeBoard(data)
    const pos = getValidPositions(board, 3, false)
    expect(pos).toHaveLength(2)
    expect(pos.map(p => p.row).sort()).toEqual([2, 8])
  })
})
