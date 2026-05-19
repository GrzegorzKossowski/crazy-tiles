import { findMatchingTiles } from './GameLogic.js'

// Preview score for a move without mutating the board
function previewScore(board, row, col, isRow) {
  return findMatchingTiles(board, row, col, isRow)
    .reduce((sum, t) => sum + t.value, 0)
}

// Minimax with alpha-beta pruning and move ordering.
//
// Returns V = CPU_score_advantage - P1_score_advantage from this position onward.
//   isCPUTurn=true  → CPU picks from column `index` (maximizes V)
//   isCPUTurn=false → P1  picks from row    `index` (minimizes V)
//
// alpha = best V CPU can already guarantee (prune when branch can't beat it)
// beta  = best V P1  can already guarantee (prune when branch can't improve it)
function minimax(board, index, isCPUTurn, depth, alpha, beta) {
  if (depth === 0) return 0

  const isRow = !isCPUTurn
  const positions = isRow
    ? board.getAvailableInRow(index)
    : board.getAvailableInCol(index)

  if (positions.length === 0) return 0

  // Move ordering: explore most-promising moves first for better pruning
  positions.sort((a, b) => {
    const sa = previewScore(board, a.row, a.col, isRow)
    const sb = previewScore(board, b.row, b.col, isRow)
    return isCPUTurn ? sb - sa : sa - sb   // CPU: best first; P1: worst for CPU first
  })

  if (isCPUTurn) {
    let best = -Infinity
    for (const { row, col } of positions) {
      const clone = board.clone()
      const delta = clone.collectTiles(findMatchingTiles(clone, row, col, false))
      // After CPU picks row in this col, P1's constraint = that row
      const childV = minimax(clone, row, false, depth - 1, alpha, beta)
      best = Math.max(best, delta + childV)
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break  // beta cut-off: P1 won't allow this branch
    }
    return best
  } else {
    let best = Infinity
    for (const { row, col } of positions) {
      const clone = board.clone()
      const delta = clone.collectTiles(findMatchingTiles(clone, row, col, true))
      // After P1 picks col in this row, CPU's constraint = that col
      const childV = minimax(clone, col, true, depth - 1, alpha, beta)
      // P1's gain subtracts from V (V = CPU - P1)
      best = Math.min(best, childV - delta)
      beta = Math.min(beta, best)
      if (beta <= alpha) break  // alpha cut-off: CPU won't allow this branch
    }
    return best
  }
}

// Returns {row} — the row index CPU should pick in the given colIndex.
// depth: 1 = easy (greedy), 5 = medium, 11 = hard
export function getBestMove(board, colIndex, depth) {
  const positions = board.getAvailableInCol(colIndex)
  if (!positions.length) return null

  // Sort top-level moves by immediate gain (best-first for tighter alpha-beta)
  positions.sort((a, b) =>
    previewScore(board, b.row, colIndex, false) -
    previewScore(board, a.row, colIndex, false)
  )

  let bestRow = positions[0].row
  let bestScore = -Infinity

  for (const { row } of positions) {
    const clone = board.clone()
    const delta = clone.collectTiles(findMatchingTiles(clone, row, colIndex, false))
    // P1 responds next; start alpha-beta with full window
    const childV = minimax(clone, row, false, depth - 1, -Infinity, Infinity)
    const score = delta + childV   // CPU's gain + future advantage (CPU - P1)
    if (score > bestScore) { bestScore = score; bestRow = row }
  }

  return { row: bestRow }
}
