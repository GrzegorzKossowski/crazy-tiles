import Phaser from 'phaser'
import {
  GAME_WIDTH, GAME_HEIGHT, BOARD_SIZE,
  GAME_TILE_SIZE, GAME_TILE_GAP,
  BOARD_OFFSET_X, BOARD_OFFSET_Y,
  SCORE_BAR_HEIGHT, STARTING_SCORE
} from '../config/gameConfig.js'
import { generateBoard, Board } from '../game/Board.js'
import { applyMove, canMove, getValidPositions } from '../game/GameLogic.js'
import { getBestMove } from '../game/AIPlayer.js'

const STEP = GAME_TILE_SIZE + GAME_TILE_GAP

// Pixel position of tile center
function tileX(col) { return BOARD_OFFSET_X + col * STEP + GAME_TILE_SIZE / 2 }
function tileY(row) { return BOARD_OFFSET_Y + row * STEP + GAME_TILE_SIZE / 2 }

// Material Design Green 800 / Red 800 — WCAG AAA contrast with white text
// Green: L≈0.177, contrast 4.63:1 | Red: L≈0.141, contrast 5.50:1
function tileColor(value) {
  return value > 0 ? 0x2e7d32 : 0xc62828
}

const STATE = { P1_TURN: 'P1_TURN', P2_TURN: 'P2_TURN', AI_THINKING: 'AI_THINKING', GAME_OVER: 'GAME_OVER' }

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }) }

  init(data) {
    this.mode  = data.mode  || 'pvp'
    this.depth = data.depth || 1
  }

  create() {
    this.board = new Board(generateBoard())
    this.p1Score = STARTING_SCORE
    this.p2Score = STARTING_SCORE
    this.state = STATE.P1_TURN
    this.activeRow = Phaser.Math.Between(0, BOARD_SIZE - 1)
    this.activeCol = -1

    this._buildScoreBar()
    this._buildBoard()
    this._buildZoneHighlight()
    this._buildIndicators()
    this._buildThinkingLabel()

    this._refreshBoard()
    this._setZone(this.activeRow, true)
    this._updateScoreBar()
  }

  // ── Score bar ──────────────────────────────────────────────────────────────

  _buildScoreBar() {
    this.add.rectangle(GAME_WIDTH / 2, SCORE_BAR_HEIGHT / 2, GAME_WIDTH, SCORE_BAR_HEIGHT, 0x11112a)

    this.p1Label = this.add.text(20, SCORE_BAR_HEIGHT / 2, '', {
      fontSize: '20px', color: '#44aaff', fontFamily: 'monospace'
    }).setOrigin(0, 0.5)

    this.p2Label = this.add.text(GAME_WIDTH - 20, SCORE_BAR_HEIGHT / 2, '', {
      fontSize: '20px', color: '#ff8844', fontFamily: 'monospace'
    }).setOrigin(1, 0.5)

    this.turnLabel = this.add.text(GAME_WIDTH / 2, SCORE_BAR_HEIGHT / 2 - 10, '', {
      fontSize: '15px', color: '#cccccc', fontFamily: 'monospace'
    }).setOrigin(0.5)

    // Menu button
    const menuBg = this.add.rectangle(GAME_WIDTH / 2, SCORE_BAR_HEIGHT / 2 + 14, 90, 26, 0x334466)
      .setInteractive({ useHandCursor: true })
    this.add.text(GAME_WIDTH / 2, SCORE_BAR_HEIGHT / 2 + 14, 'MENU', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5)
    menuBg.on('pointerover', () => menuBg.setFillStyle(0x4466aa))
    menuBg.on('pointerout',  () => menuBg.setFillStyle(0x334466))
    menuBg.on('pointerdown', () => this.scene.start('MenuScene'))
  }

  _updateScoreBar() {
    const p2Name = this.mode === 'pvc' ? 'CPU' : 'P2'
    this.p1Label.setText(`P1: ${this.p1Score}`)
    this.p2Label.setText(`${p2Name}: ${this.p2Score}`)

    const stateText = {
      [STATE.P1_TURN]:    '► P1 picks a ROW tile',
      [STATE.P2_TURN]:    `► ${p2Name} picks a COLUMN tile`,
      [STATE.AI_THINKING]:'► CPU is thinking...',
      [STATE.GAME_OVER]:  'Game Over'
    }
    this.turnLabel.setText(stateText[this.state] || '')
  }

  // ── Board ──────────────────────────────────────────────────────────────────

  _buildBoard() {
    // Background panel
    const bw = BOARD_SIZE * STEP - GAME_TILE_GAP
    this.add.rectangle(
      BOARD_OFFSET_X + bw / 2,
      BOARD_OFFSET_Y + bw / 2,
      bw + 10, bw + 10, 0x0d0d20
    )

    this._tileObjects = []
    for (let r = 0; r < BOARD_SIZE; r++) {
      this._tileObjects[r] = []
      for (let c = 0; c < BOARD_SIZE; c++) {
        const x = tileX(c)
        const y = tileY(r)

        const bg = this.add.rectangle(x, y, GAME_TILE_SIZE, GAME_TILE_SIZE, 0x333355)
          .setInteractive({ useHandCursor: true })

        const txt = this.add.text(x, y, '', {
          fontSize: '26px', fontStyle: 'bold',
          color: '#ffffff', fontFamily: 'monospace'
        }).setOrigin(0.5)

        bg.on('pointerdown', () => this._onTileClick(r, c))
        bg.on('pointerover', () => { if (bg.active) bg.setStrokeStyle(2, 0xffffff) })
        bg.on('pointerout',  () => bg.setStrokeStyle(0))

        this._tileObjects[r][c] = { bg, txt }
      }
    }
  }

  _refreshBoard() {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const v = this.board.getValue(r, c)
        const { bg, txt } = this._tileObjects[r][c]
        if (v === null) {
          bg.setVisible(false)
          txt.setVisible(false)
        } else {
          bg.setVisible(true).setFillStyle(tileColor(v))
          txt.setVisible(true).setText(Math.abs(v))
        }
      }
    }
  }

  // ── Zone highlight ─────────────────────────────────────────────────────────

  _buildZoneHighlight() {
    const bw = BOARD_SIZE * STEP - GAME_TILE_GAP
    // Row highlight (full width)
    this._rowHighlight = this.add.rectangle(
      BOARD_OFFSET_X + bw / 2, 0, bw, GAME_TILE_SIZE, 0xffff00, 0.12
    ).setVisible(false)
    // Column highlight (full height)
    this._colHighlight = this.add.rectangle(
      0, BOARD_OFFSET_Y + bw / 2, GAME_TILE_SIZE, bw, 0xffff00, 0.12
    ).setVisible(false)
  }

  _buildIndicators() {
    const bw = BOARD_SIZE * STEP - GAME_TILE_GAP
    const indStyle = { fontSize: '22px', color: '#ffdd57', fontFamily: 'monospace', fontStyle: 'bold' }

    // ▶ points right, placed left of board
    this._rowIndicator = this.add.text(BOARD_OFFSET_X - 26, 0, '▶', indStyle)
      .setOrigin(0.5).setVisible(false)

    // ▲ points up into board, placed below board
    this._colIndicator = this.add.text(0, BOARD_OFFSET_Y + bw + 14, '▲', indStyle)
      .setOrigin(0.5).setVisible(false)
  }

  _setZone(index, isRow) {
    const bw = BOARD_SIZE * STEP - GAME_TILE_GAP
    if (isRow) {
      this._rowHighlight.setY(tileY(index)).setVisible(true)
      this._colHighlight.setVisible(false)
      this._rowIndicator.setY(tileY(index)).setVisible(true)
      this._colIndicator.setVisible(false)
    } else {
      this._colHighlight.setX(tileX(index)).setVisible(true)
      this._rowHighlight.setVisible(false)
      this._colIndicator.setX(tileX(index)).setVisible(true)
      this._rowIndicator.setVisible(false)
    }
    this._setClickable(index, isRow)
  }

  _setClickable(index, isRow) {
    // Disable all tiles, then enable only those in active zone
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        this._tileObjects[r][c].bg.disableInteractive()

    const positions = getValidPositions(this.board, index, isRow)
    for (const { row, col } of positions) {
      this._tileObjects[row][col].bg.setInteractive({ useHandCursor: true })
    }
  }

  // ── Thinking label ─────────────────────────────────────────────────────────

  _buildThinkingLabel() {
    this._thinkingLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '28px', color: '#ffdd57', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10).setVisible(false)
  }

  _showThinking(visible) {
    this._thinkingLabel.setVisible(visible)
    if (visible) {
      this._thinkDots = 0
      this._thinkTimer = this.time.addEvent({
        delay: 400,
        loop: true,
        callback: () => {
          this._thinkDots = (this._thinkDots + 1) % 4
          this._thinkingLabel.setText('CPU thinking' + '.'.repeat(this._thinkDots))
        }
      })
    } else if (this._thinkTimer) {
      this._thinkTimer.remove()
      this._thinkTimer = null
    }
  }

  // ── Tile click handler ─────────────────────────────────────────────────────

  _onTileClick(row, col) {
    if (this.state === STATE.P1_TURN) {
      this._executeMove(row, col, true, 'p1')
    } else if (this.state === STATE.P2_TURN) {
      this._executeMove(row, col, false, 'p2')
    }
  }

  _executeMove(row, col, isRow, player) {
    const { scoreDelta, nextConstraint } = applyMove(this.board, row, col, isRow)

    if (player === 'p1') {
      this.p1Score += scoreDelta
      this.activeCol = nextConstraint
    } else {
      this.p2Score += scoreDelta
      this.activeRow = nextConstraint
    }

    this._refreshBoard()

    // Check if next player can move
    if (player === 'p1') {
      if (!canMove(this.board, this.activeCol, false)) {
        this._endGame()
        return
      }
      if (this.mode === 'pvc') {
        this._startAI()
      } else {
        this.state = STATE.P2_TURN
        this._setZone(this.activeCol, false)
        this._updateScoreBar()
      }
    } else {
      if (!canMove(this.board, this.activeRow, true)) {
        this._endGame()
        return
      }
      this.state = STATE.P1_TURN
      this._setZone(this.activeRow, true)
      this._updateScoreBar()
    }
  }

  // ── AI ─────────────────────────────────────────────────────────────────────

  _startAI() {
    this.state = STATE.AI_THINKING
    this._updateScoreBar()
    this._showThinking(true)
    // Slight delay so UI updates before heavy computation
    this.time.delayedCall(150, () => this._runAI())
  }

  _runAI() {
    const move = getBestMove(this.board, this.activeCol, this.depth)
    this._showThinking(false)
    if (!move) {
      this._endGame()
      return
    }
    this._executeMove(move.row, this.activeCol, false, 'p2')
  }

  // ── Game over ──────────────────────────────────────────────────────────────

  _endGame() {
    this.state = STATE.GAME_OVER
    this._rowHighlight.setVisible(false)
    this._colHighlight.setVisible(false)
    this._rowIndicator.setVisible(false)
    this._colIndicator.setVisible(false)
    this._updateScoreBar()

    this.time.delayedCall(2000, () => {
      this.scene.start('ResultScene', {
        p1Score: this.p1Score,
        p2Score: this.p2Score,
        mode: this.mode
      })
    })
  }
}
