import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    const { width, height } = this.cameras.main

    const barBg = this.add.rectangle(width / 2, height / 2, 320, 20, 0x333333)
    const bar = this.add.rectangle(
      width / 2 - 160, height / 2, 0, 20, 0x00ccff
    ).setOrigin(0, 0.5)

    this.load.on('progress', (value) => {
      bar.width = 320 * value
    })

    this.load.on('complete', () => {
      barBg.destroy()
      bar.destroy()
    })

    // Load game assets here, e.g.:
    // this.load.image('tiles', 'assets/tileset.png')
    // this.load.tilemapTiledJSON('map', 'assets/map.json')
    // this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 })
  }

  create() {
    this.scene.start('MenuScene')
  }
}
