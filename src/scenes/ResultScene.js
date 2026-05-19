import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js'

const CX = GAME_WIDTH / 2

export default class ResultScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultScene' }) }

  init(data) {
    this.p1Score = data.p1Score ?? 0
    this.p2Score = data.p2Score ?? 0
    this.p1Name  = data.p1Name  || 'Gracz 1'
    this.p2Name  = data.p2Name  || 'Gracz 2'
  }

  create() {
    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)

    let winner, winColor
    if (this.p1Score > this.p2Score) {
      winner = `${this.p1Name} wygrywa!`
      winColor = '#44aaff'
    } else if (this.p2Score > this.p1Score) {
      winner = `${this.p2Name} wygrywa!`
      winColor = '#ff8844'
    } else {
      winner = 'REMIS!'
      winColor = '#f0c040'
    }

    this.add.text(CX, 180, winner, {
      fontSize: '48px', color: winColor, fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(CX, 290, `${this.p1Name}:  ${this.p1Score} pkt`, {
      fontSize: '28px', color: '#44aaff', fontFamily: 'monospace'
    }).setOrigin(0.5)

    this.add.text(CX, 335, `${this.p2Name}:  ${this.p2Score} pkt`, {
      fontSize: '28px', color: '#ff8844', fontFamily: 'monospace'
    }).setOrigin(0.5)

    const btnBg = this.add.rectangle(CX, 445, 230, 52, 0x334466)
      .setInteractive({ useHandCursor: true })
    this.add.text(CX, 445, 'Powrót do menu', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5)

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x4466aa))
    btnBg.on('pointerout',  () => btnBg.setFillStyle(0x334466))
    btnBg.on('pointerdown', () => this.scene.start('MenuScene'))
  }
}
