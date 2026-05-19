import { describe, it, expect } from 'vitest'
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE,
  BOARD_SIZE, GAME_TILE_SIZE, GAME_TILE_GAP,
  SCORE_BAR_HEIGHT, BOARD_OFFSET_X, BOARD_OFFSET_Y,
  STARTING_SCORE
} from './gameConfig.js'

describe('gameConfig', () => {
  it('GAME_WIDTH is a positive integer', () => {
    expect(GAME_WIDTH).toBeGreaterThan(0)
    expect(Number.isInteger(GAME_WIDTH)).toBe(true)
  })

  it('GAME_HEIGHT is a positive integer', () => {
    expect(GAME_HEIGHT).toBeGreaterThan(0)
    expect(Number.isInteger(GAME_HEIGHT)).toBe(true)
  })

  it('canvas dimensions are divisible by TILE_SIZE', () => {
    expect(GAME_WIDTH % TILE_SIZE).toBe(0)
    expect(GAME_HEIGHT % TILE_SIZE).toBe(0)
  })

  it('BOARD_SIZE is 10', () => {
    expect(BOARD_SIZE).toBe(10)
  })

  it('GAME_TILE_SIZE is large enough to be clickable', () => {
    expect(GAME_TILE_SIZE).toBeGreaterThanOrEqual(50)
  })

  it('board fits within canvas width', () => {
    const boardPixels = BOARD_SIZE * GAME_TILE_SIZE + (BOARD_SIZE - 1) * GAME_TILE_GAP
    expect(BOARD_OFFSET_X * 2 + boardPixels).toBeLessThanOrEqual(GAME_WIDTH)
  })

  it('board fits within canvas height', () => {
    const boardPixels = BOARD_SIZE * GAME_TILE_SIZE + (BOARD_SIZE - 1) * GAME_TILE_GAP
    expect(BOARD_OFFSET_Y + boardPixels).toBeLessThanOrEqual(GAME_HEIGHT)
  })

  it('STARTING_SCORE is positive', () => {
    expect(STARTING_SCORE).toBeGreaterThan(0)
  })
})
