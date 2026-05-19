import { findMatchingTiles, canMove } from './GameLogic.js'

// Returns the score delta if AI picks tile at (row, colIndex)
function evalMove(board, row, col, isRow) {
  const matches = findMatchingTiles(board, row, col, isRow)
  return matches.reduce((sum, t) => sum + t.value, 0)
}

// Minimax: maximizingPlayer=true means it's AI's turn (maximize AI − P1 advantage)
function minimax(board, index, isRow, depth, maximizing) {
  const positions = isRow
    ? board.getAvailableInRow(index)
    : board.getAvailableInCol(index)

  if (depth === 0 || positions.length === 0) return 0

  if (maximizing) {
    let best = -Infinity
    for (const { row, col } of positions) {
      const clone = board.clone()
      const matches = findMatchingTiles(clone, row, col, isRow)
      const delta = clone.collectTiles(matches)
      const nextIndex = isRow ? col : row
      const childVal = minimax(clone, nextIndex, !isRow, depth - 1, false)
      best = Math.max(best, delta + childVal)
    }
    return best
  } else {
    let best = Infinity
    for (const { row, col } of positions) {
      const clone = board.clone()
      const matches = findMatchingTiles(clone, row, col, isRow)
      const delta = clone.collectTiles(matches)
      const nextIndex = isRow ? col : row
      // Opponent's gain is subtracted from AI perspective
      const childVal = minimax(clone, nextIndex, !isRow, depth - 1, true)
      best = Math.min(best, delta + childVal)
    }
    return best
  }
}

// Returns {row} — the row index AI should pick in the given colIndex
export function getBestMove(board, colIndex, depth) {
  const positions = board.getAvailableInCol(colIndex)
  if (positions.length === 0) return null

  let bestRow = positions[0].row
  let bestScore = -Infinity

  for (const { row, col } of positions) {
    const clone = board.clone()
    const matches = findMatchingTiles(clone, row, col, false)
    const delta = clone.collectTiles(matches)
    const nextRow = row // nextConstraint for P1 = row of picked tile
    const future = minimax(clone, nextRow, true, depth - 1, false)
    // AI score = delta (what AI gets now) - future (what P1 gets optimally)
    const score = delta - future
    if (score > bestScore) {
      bestScore = score
      bestRow = row
    }
  }

  return { row: bestRow }
}
