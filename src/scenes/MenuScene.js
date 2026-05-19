import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js'

const CX = GAME_WIDTH / 2

function makeButton(scene, x, y, w, h, label, onClick) {
  const bg = scene.add.rectangle(x, y, w, h, 0x334466)
    .setInteractive({ useHandCursor: true })
  const text = scene.add.text(x, y, label, {
    fontSize: '22px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5)

  bg.on('pointerover', () => bg.setFillStyle(0x4466aa))
  bg.on('pointerout',  () => bg.setFillStyle(0x334466))
  bg.on('pointerdown', onClick)
  return { bg, text }
}

export default class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }) }

  create() {
    // Background
    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    // Title
    this.add.text(CX, 120, 'CRAZY TILES', {
      fontSize: '64px', color: '#f0c040', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(CX, 195, 'by Grzegorz Kossowski', {
      fontSize: '18px', color: '#8888aa', fontFamily: 'monospace'
    }).setOrigin(0.5)

    // PvP button
    makeButton(this, CX, 310, 260, 54, 'Player vs Player', () => {
      this.scene.start('GameScene', { mode: 'pvp' })
    })

    // PvC button
    makeButton(this, CX, 380, 260, 54, 'Player vs CPU', () => {
      this._showDifficulty()
    })

    // About button
    makeButton(this, CX, 450, 260, 54, 'About', () => {
      this._showAbout()
    })

    // Difficulty panel (hidden)
    this._diffPanel = this._buildDiffPanel()
    this._diffPanel.setVisible(false)

    // About overlay (hidden)
    this._aboutPanel = this._buildAboutPanel()
    this._aboutPanel.setVisible(false)
  }

  _buildDiffPanel() {
    const panel = this.add.container(CX, 540)

    const bg = this.add.rectangle(0, 0, 320, 130, 0x222244)
    panel.add(bg)

    const label = this.add.text(0, -42, 'Select difficulty:', {
      fontSize: '18px', color: '#ccccff', fontFamily: 'monospace'
    }).setOrigin(0.5)
    panel.add(label)

    const diffs = [
      { label: 'Easy',   depth: 1, x: -100 },
      { label: 'Medium', depth: 3, x: 0 },
      { label: 'Hard',   depth: 5, x: 100 }
    ]

    for (const d of diffs) {
      const btn = this.add.rectangle(d.x, 10, 85, 44, 0x334466)
        .setInteractive({ useHandCursor: true })
      const txt = this.add.text(d.x, 10, d.label, {
        fontSize: '17px', color: '#ffffff', fontFamily: 'monospace'
      }).setOrigin(0.5)

      btn.on('pointerover', () => btn.setFillStyle(0x4466aa))
      btn.on('pointerout',  () => btn.setFillStyle(0x334466))
      btn.on('pointerdown', () => {
        this.scene.start('GameScene', { mode: 'pvc', depth: d.depth })
      })
      panel.add(btn)
      panel.add(txt)
    }

    return panel
  }

  _buildAboutPanel() {
    const panel = this.add.container(CX, GAME_HEIGHT / 2)
    const bg = this.add.rectangle(0, 0, 560, 340, 0x111133, 0.97)
    panel.add(bg)

    const lines = [
      'CRAZY TILES — Turn-based strategy game',
      '',
      'P1 picks tiles from a highlighted ROW.',
      'P2 / CPU picks tiles from a highlighted COLUMN.',
      'If multiple tiles in the row/col share',
      'the same value — all are collected!',
      '',
      'Players start with 100 points.',
      'Game ends when a player has no tiles to pick.',
      'Higher score wins.',
    ]

    const body = this.add.text(0, -130, lines.join('\n'), {
      fontSize: '16px', color: '#ccccff', fontFamily: 'monospace',
      align: 'center', lineSpacing: 6
    }).setOrigin(0.5, 0)

    const closeBtn = this.add.text(0, 130, '[ Close ]', {
      fontSize: '18px', color: '#f0c040', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    closeBtn.on('pointerdown', () => panel.setVisible(false))
    panel.add(body)
    panel.add(closeBtn)

    return panel
  }

  _showDifficulty() {
    this._aboutPanel.setVisible(false)
    this._diffPanel.setVisible(!this._diffPanel.visible)
  }

  _showAbout() {
    this._diffPanel.setVisible(false)
    this._aboutPanel.setVisible(!this._aboutPanel.visible)
  }
}
