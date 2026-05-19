import { describe, it, expect } from 'vitest'
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from './gameConfig.js'

describe('gameConfig', () => {
  it('GAME_WIDTH is a positive integer', () => {
    expect(GAME_WIDTH).toBeGreaterThan(0)
    expect(Number.isInteger(GAME_WIDTH)).toBe(true)
  })

  it('GAME_HEIGHT is a positive integer', () => {
    expect(GAME_HEIGHT).toBeGreaterThan(0)
    expect(Number.isInteger(GAME_HEIGHT)).toBe(true)
  })

  it('TILE_SIZE is a positive integer', () => {
    expect(TILE_SIZE).toBeGreaterThan(0)
    expect(Number.isInteger(TILE_SIZE)).toBe(true)
  })

  it('canvas fits a whole number of tiles horizontally', () => {
    expect(GAME_WIDTH % TILE_SIZE).toBe(0)
  })

  it('canvas fits a whole number of tiles vertically', () => {
    expect(GAME_HEIGHT % TILE_SIZE).toBe(0)
  })
})
