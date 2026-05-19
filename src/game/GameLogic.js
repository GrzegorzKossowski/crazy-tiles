export function findMatchingTiles(board, row, col, isRow) {
  const value = board.getValue(row, col)
  if (value === null) return []

  const tiles = isRow
    ? board.getAvailableInRow(row)
    : board.getAvailableInCol(col)

  return tiles.filter(t => t.value === value)
}

export function applyMove(board, row, col, isRow) {
  const positions = findMatchingTiles(board, row, col, isRow)
  const scoreDelta = board.collectTiles(positions)
  // The chosen tile's other coordinate becomes the next player's constraint
  const nextConstraint = isRow ? col : row
  return { scoreDelta, nextConstraint }
}

export function canMove(board, index, isRow) {
  const tiles = isRow
    ? board.getAvailableInRow(index)
    : board.getAvailableInCol(index)
  return tiles.length > 0
}

export function getValidPositions(board, index, isRow) {
  return isRow
    ? board.getAvailableInRow(index)
    : board.getAvailableInCol(index)
}
