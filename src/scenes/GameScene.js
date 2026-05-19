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

function tileColor(value) {
  return value > 0 ? 0x32cd32 : 0xff0000
}

const STATE = { P1_TURN: 'P1_TURN', P2_TURN: 'P2_TURN', AI_THINKING: 'AI_THINKING', GAME_OVER: 'GAME_OVER' }

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }) }

  init(data) {
    this.mode   = data.mode   || 'pvp'
    this.depth  = data.depth  || 1
    this.p1Name = data.p1Name || 'Gracz 1'
    this.p2Name = data.p2Name || (data.mode === 'pvc' ? 'CPU' : 'Gracz 2')
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
    this._buildHistoryPanels()
    this._buildThinkingOverlay()

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
    this.p1Label.setText(`${this.p1Name}: ${this.p1Score}`)
    this.p2Label.setText(`${this.p2Name}: ${this.p2Score}`)

    const stateText = {
      [STATE.P1_TURN]:    `► ${this.p1Name} wybiera kafelek w RZĘDZIE`,
      [STATE.P2_TURN]:    `► ${this.p2Name} wybiera kafelek w KOLUMNIE`,
      [STATE.AI_THINKING]:`► ${this.p2Name} myśli...`,
      [STATE.GAME_OVER]:  'Koniec gry'
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
      .setOrigin(0.5).setDepth(5).setVisible(false)

    // ▲ points up into board, placed below board
    this._colIndicator = this.add.text(0, BOARD_OFFSET_Y + bw + 14, '▲', indStyle)
      .setOrigin(0.5).setDepth(5).setVisible(false)
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

  // ── Move history panels ────────────────────────────────────────────────────

  _buildHistoryPanels() {
    const MAX = 18
    const ENTRY_H = 28
    const bw = BOARD_SIZE * STEP - GAME_TILE_GAP
    const top = BOARD_OFFSET_Y
    const panelW = BOARD_OFFSET_X - 14
    const lx = Math.round(BOARD_OFFSET_X / 2)                           // ≈ 60
    const rx = BOARD_OFFSET_X + bw + Math.round((GAME_WIDTH - BOARD_OFFSET_X - bw) / 2) // ≈ 740

    // panel backgrounds
    this.add.rectangle(lx, top + bw / 2, panelW, bw, 0x080812)
    this.add.rectangle(rx, top + bw / 2, panelW, bw, 0x080812)

    // player name labels
    this.add.text(lx, top + 5, this.p1Name, {
      fontSize: '12px', color: '#44aaff', fontFamily: 'monospace'
    }).setOrigin(0.5, 0)
    this.add.text(rx, top + 5, this.p2Name, {
      fontSize: '12px', color: '#ff8844', fontFamily: 'monospace'
    }).setOrigin(0.5, 0)

    // separator lines
    this.add.rectangle(lx, top + 23, panelW - 6, 1, 0x334466)
    this.add.rectangle(rx, top + 23, panelW - 6, 1, 0x334466)

    // pre-create text slots
    const style = { fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold' }
    this._p1HistText = []
    this._p2HistText = []
    for (let i = 0; i < MAX; i++) {
      const y = top + 29 + i * ENTRY_H
      this._p1HistText.push(this.add.text(lx, y, '', style).setOrigin(0.5, 0))
      this._p2HistText.push(this.add.text(rx, y, '', style).setOrigin(0.5, 0))
    }

    this._p1History = []
    this._p2History = []
  }

  _refreshHistory() {
    const fill = (history, texts) => {
      const offset = Math.max(0, history.length - texts.length)
      texts.forEach((t, i) => {
        const v = history[offset + i]
        if (v === undefined) { t.setText(''); return }
        t.setText(String(Math.abs(v)))
         .setColor(v >= 0 ? '#32cd32' : '#ff4444')
      })
    }
    fill(this._p1History, this._p1HistText)
    fill(this._p2History, this._p2HistText)
  }

  // ── Thinking overlay ───────────────────────────────────────────────────────

  _buildThinkingOverlay() {
    const bw = BOARD_SIZE * STEP - GAME_TILE_GAP
    const cx = BOARD_OFFSET_X + bw / 2
    const cy = BOARD_OFFSET_Y + bw / 2

    this._thinkingOverlay = this.add.container(cx, cy).setDepth(15).setVisible(false)
    this._thinkingOverlay.add(this.add.rectangle(0, 0, 220, 54, 0x000000, 0.80))
    this._thinkingOverlay.add(
      this.add.text(0, 0, 'CPU myśli...', {
        fontSize: '22px', color: '#f0c040', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5)
    )
  }

  _showThinking(visible) {
    this._thinkingOverlay.setVisible(visible)
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
      this._p1History.push(scoreDelta)
      this.activeCol = nextConstraint
    } else {
      this.p2Score += scoreDelta
      this._p2History.push(scoreDelta)
      this.activeRow = nextConstraint
    }

    this._refreshBoard()
    this._refreshHistory()

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
    const move = getBestMove(this.board, this.activeCol, this.depth, this.p2Score, this.p1Score)
    this._showThinking(false)
    if (!move) {
      this._endGame()
      return
    }
    this._executeMove(move.row, this.activeCol, false, 'p2')
  }

  // ── Game over banner ───────────────────────────────────────────────────────

  _showGameOverBanner() {
    const cx = GAME_WIDTH / 2
    const cy = GAME_HEIGHT / 2

    // Semi-transparent dark overlay
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55)
      .setDepth(20)

    // Banner background
    const banner = this.add.rectangle(cx, cy, 480, 110, 0x11112a)
      .setStrokeStyle(2, 0xf0c040)
      .setDepth(21)

    // "Brak ruchów" line
    this.add.text(cx, cy - 26, 'Brak dostępnych ruchów', {
      fontSize: '18px', color: '#aaaacc', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(22)

    // Big "KONIEC GRY" line
    this.add.text(cx, cy + 12, 'KONIEC GRY', {
      fontSize: '34px', color: '#f0c040', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(22)

    // Pulse animation on banner
    this.tweens.add({
      targets: banner,
      scaleX: 1.02, scaleY: 1.02,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  // ── Game over ──────────────────────────────────────────────────────────────

  _endGame() {
    this.state = STATE.GAME_OVER
    this._rowHighlight.setVisible(false)
    this._colHighlight.setVisible(false)
    this._rowIndicator.setVisible(false)
    this._colIndicator.setVisible(false)
    this._updateScoreBar()
    this._showGameOverBanner()

    this.time.delayedCall(2500, () => {
      this.scene.start('ResultScene', {
        p1Score: this.p1Score,
        p2Score: this.p2Score,
        p1Name:  this.p1Name,
        p2Name:  this.p2Name,
        mode:    this.mode
      })
    })
  }
}
