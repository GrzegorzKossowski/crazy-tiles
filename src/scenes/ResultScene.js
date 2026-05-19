import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js'

const CX = GAME_WIDTH / 2

export default class ResultScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultScene' }) }

  init(data) {
    this.p1Score = data.p1Score ?? 0
    this.p2Score = data.p2Score ?? 0
    this.mode    = data.mode || 'pvp'
  }

  create() {
    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    const p2Name = this.mode === 'pvc' ? 'CPU' : 'P2'

    let winner, winColor
    if (this.p1Score > this.p2Score) {
      winner = 'P1 WINS!'
      winColor = '#44aaff'
    } else if (this.p2Score > this.p1Score) {
      winner = `${p2Name} WINS!`
      winColor = '#ff8844'
    } else {
      winner = 'DRAW!'
      winColor = '#f0c040'
    }

    this.add.text(CX, 180, winner, {
      fontSize: '56px', color: winColor, fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(CX, 290, `P1:  ${this.p1Score} pts`, {
      fontSize: '30px', color: '#44aaff', fontFamily: 'monospace'
    }).setOrigin(0.5)

    this.add.text(CX, 340, `${p2Name}: ${this.p2Score} pts`, {
      fontSize: '30px', color: '#ff8844', fontFamily: 'monospace'
    }).setOrigin(0.5)

    // Back to menu button
    const btnBg = this.add.rectangle(CX, 450, 220, 54, 0x334466)
      .setInteractive({ useHandCursor: true })
    this.add.text(CX, 450, 'Back to Menu', {
      fontSize: '22px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5)

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x4466aa))
    btnBg.on('pointerout',  () => btnBg.setFillStyle(0x334466))
    btnBg.on('pointerdown', () => this.scene.start('MenuScene'))
  }
}
