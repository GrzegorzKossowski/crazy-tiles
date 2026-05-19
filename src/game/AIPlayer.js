import { findMatchingTiles, canMove } from './GameLogic.js'

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
// cpuScore / p1Score: current totals, used to value game-ending moves correctly.
// depth: 2=easy (Blamaż), 5=medium (Cwaniak), 9=hard (Tytan)
export function getBestMove(board, colIndex, depth, cpuScore = 0, p1Score = 0) {
  const positions = board.getAvailableInCol(colIndex)
  if (!positions.length) return null

  // Easy personality (Blamaż): 30% chance to panic-block when it can win right now.
  // Mimics a human who grabs a sure win instead of fishing for more points.
  if (depth <= 2 && Math.random() < 0.30) {
    const blocking = positions.filter(({ row }) => {
      const clone = board.clone()
      const delta = clone.collectTiles(findMatchingTiles(clone, row, colIndex, false))
      return !canMove(clone, row, true) && (cpuScore + delta) > p1Score
    })
    if (blocking.length > 0) {
      // Among valid panic-blocks pick the one with the highest immediate score
      blocking.sort((a, b) =>
        previewScore(board, b.row, colIndex, false) -
        previewScore(board, a.row, colIndex, false)
      )
      return { row: blocking[0].row }
    }
  }

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
    let score = delta + childV

    // Blocking bonus: minimax returns 0 for game-ending moves (no future turns),
    // but locking in a winning margin has real value — add it explicitly.
    if (!canMove(clone, row, true)) {
      const margin = (cpuScore + delta) - p1Score
      if (margin > 0) score += margin
    }

    if (score > bestScore) { bestScore = score; bestRow = row }
  }

  return { row: bestRow }
}
