import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Load minimal assets needed to show a loading bar in PreloadScene
  }

  create() {
    this.scene.start('PreloadScene')
  }
}
