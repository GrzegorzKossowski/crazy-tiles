import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, CPU_NAMES, DEFAULT_P1_NAME, DEFAULT_P2_NAME } from '../config/gameConfig.js'

const CX = GAME_WIDTH / 2

function makeButton(scene, x, y, w, h, label, onClick) {
  const bg = scene.add.rectangle(x, y, w, h, 0x334466)
    .setInteractive({ useHandCursor: true })
  scene.add.text(x, y, label, {
    fontSize: '20px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5)
  bg.on('pointerover', () => bg.setFillStyle(0x4466aa))
  bg.on('pointerout',  () => bg.setFillStyle(0x334466))
  bg.on('pointerdown', onClick)
  return bg
}

function ensureInputCSS() {
  if (document.getElementById('ct-input-style')) return
  const s = document.createElement('style')
  s.id = 'ct-input-style'
  s.textContent = `
    .ct-input {
      position: fixed;
      background: #1a2040;
      border: 2px solid #334466;
      border-radius: 4px;
      color: #ffffff;
      font-family: monospace;
      text-align: center;
      padding: 4px 6px;
      outline: none;
      box-sizing: border-box;
      z-index: 10;
    }
    .ct-input:focus { border-color: #6688cc; }
  `
  document.head.appendChild(s)
}

export default class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }) }

  create() {
    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    // Title
    this.add.text(CX, 105, 'CRAZY TILES', {
      fontSize: '62px', color: '#f0c040', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(CX, 178, 'by Grzegorz Kossowski', {
      fontSize: '16px', color: '#8888aa', fontFamily: 'monospace'
    }).setOrigin(0.5)

    // Labels above inputs (Phaser text)
    this.add.text(CX - 105, 222, 'Gracz 1', {
      fontSize: '13px', color: '#8888aa', fontFamily: 'monospace'
    }).setOrigin(0.5, 1)
    this.add.text(CX + 105, 222, 'Gracz 2', {
      fontSize: '13px', color: '#8888aa', fontFamily: 'monospace'
    }).setOrigin(0.5, 1)

    // Native HTML inputs positioned over canvas
    this._createInputs()
    this.events.once('shutdown', () => this._destroyInputs())

    // Main buttons
    makeButton(this, CX, 318, 260, 50, 'Player vs Player', () => this._startPvP())
    makeButton(this, CX, 382, 260, 50, 'Player vs CPU',    () => this._showDifficulty())
    makeButton(this, CX, 446, 260, 50, 'About',            () => this._showAbout())

    // Panels
    this._diffPanel  = this._buildDiffPanel()
    this._aboutPanel = this._buildAboutPanel()
    this._diffPanel.setVisible(false)
    this._aboutPanel.setVisible(false)
  }

  // ── Native HTML inputs ─────────────────────────────────────────────────────

  _createInputs() {
    ensureInputCSS()
    const canvas = this.sys.game.canvas
    const rect   = canvas.getBoundingClientRect()
    const sx = rect.width  / GAME_WIDTH
    const sy = rect.height / GAME_HEIGHT

    const w  = Math.round(150 * sx)
    const h  = Math.round(34  * sy)
    const fs = Math.round(16  * sx)

    const makeInput = (gameX, gameY, storageKey, defaultVal) => {
      const inp = document.createElement('input')
      inp.type       = 'text'
      inp.maxLength  = 14
      inp.value      = localStorage.getItem(storageKey) || defaultVal
      inp.className  = 'ct-input'
      inp.style.left = `${Math.round(rect.left + gameX * sx - w / 2)}px`
      inp.style.top  = `${Math.round(rect.top  + gameY * sy - h / 2)}px`
      inp.style.width    = `${w}px`
      inp.style.height   = `${h}px`
      inp.style.fontSize = `${fs}px`
      document.body.appendChild(inp)
      return inp
    }

    this._p1Input = makeInput(CX - 105, 245, 'ct_p1Name', DEFAULT_P1_NAME)
    this._p2Input = makeInput(CX + 105, 245, 'ct_p2Name', DEFAULT_P2_NAME)
  }

  _destroyInputs() {
    this._p1Input?.remove()
    this._p2Input?.remove()
    this._p1Input = null
    this._p2Input = null
  }

  _getP1Name() { return this._p1Input?.value.trim() || DEFAULT_P1_NAME }
  _getP2Name() { return this._p2Input?.value.trim() || DEFAULT_P2_NAME }

  // ── Start game ─────────────────────────────────────────────────────────────

  _startPvP() {
    const p1Name = this._getP1Name()
    const p2Name = this._getP2Name()
    localStorage.setItem('ct_p1Name', p1Name)
    localStorage.setItem('ct_p2Name', p2Name)
    this.scene.start('GameScene', { mode: 'pvp', p1Name, p2Name })
  }

  _startPvC(depth) {
    const p1Name = this._getP1Name()
    const p2Name = CPU_NAMES[depth]
    localStorage.setItem('ct_p1Name', p1Name)
    this.scene.start('GameScene', { mode: 'pvc', depth, p1Name, p2Name })
  }

  // ── Difficulty panel ───────────────────────────────────────────────────────

  _buildDiffPanel() {
    const panel = this.add.container(CX, 528)
    panel.add(this.add.rectangle(0, 0, 340, 140, 0x111133))
    panel.add(this.add.text(0, -52, 'Wybierz poziom trudności:', {
      fontSize: '15px', color: '#aaaacc', fontFamily: 'monospace'
    }).setOrigin(0.5))

    const diffs = [
      { depth: 2, x: -110 },
      { depth: 5, x: 0    },
      { depth: 9, x: 110  }
    ]

    for (const d of diffs) {
      const cpuName   = CPU_NAMES[d.depth]
      const diffLabel = d.depth === 2 ? 'Easy' : d.depth === 5 ? 'Medium' : 'Hard'

      const btn = this.add.rectangle(d.x, 8, 96, 58, 0x334466)
        .setInteractive({ useHandCursor: true })
      panel.add(btn)
      panel.add(this.add.text(d.x, -4, diffLabel, {
        fontSize: '15px', color: '#ccccff', fontFamily: 'monospace'
      }).setOrigin(0.5))
      panel.add(this.add.text(d.x, 18, cpuName, {
        fontSize: '16px', color: '#f0c040', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5))

      btn.on('pointerover', () => btn.setFillStyle(0x4466aa))
      btn.on('pointerout',  () => btn.setFillStyle(0x334466))
      btn.on('pointerdown', () => this._startPvC(d.depth))
    }

    return panel
  }

  // ── About panel ────────────────────────────────────────────────────────────

  _buildAboutPanel() {
    const panel = this.add.container(CX, GAME_HEIGHT / 2)
    panel.add(this.add.rectangle(0, 0, 580, 360, 0x111133, 0.97))

    const lines = [
      'CRAZY TILES — gra strategiczna turowa',
      '',
      'Gracz 1 wybiera kafelki z podświetlonego RZĘDU.',
      'Gracz 2 / CPU wybiera z podświetlonej KOLUMNY.',
      'Jeśli kilka kafelków w rzędzie / kolumnie',
      'ma tę samą wartość — wszystkie są zbierane!',
      '',
      'Gracze zaczynają z 100 punktami.',
      'Gra kończy się gdy gracz nie może wykonać ruchu.',
      'Wygrywa wyższy wynik.',
    ]

    panel.add(this.add.text(0, -140, lines.join('\n'), {
      fontSize: '15px', color: '#ccccff', fontFamily: 'monospace',
      align: 'center', lineSpacing: 5
    }).setOrigin(0.5, 0))

    const closeBtn = this.add.text(0, 140, '[ Zamknij ]', {
      fontSize: '18px', color: '#f0c040', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => panel.setVisible(false))
    panel.add(closeBtn)
    return panel
  }

  // ── Panel toggles ──────────────────────────────────────────────────────────

  _showDifficulty() {
    this._aboutPanel.setVisible(false)
    this._diffPanel.setVisible(!this._diffPanel.visible)
  }

  _showAbout() {
    this._diffPanel.setVisible(false)
    this._aboutPanel.setVisible(!this._aboutPanel.visible)
  }
}
