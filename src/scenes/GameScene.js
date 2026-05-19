import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../config/gameConfig.js'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const cols = Math.ceil(GAME_WIDTH / TILE_SIZE)
    const rows = Math.ceil(GAME_HEIGHT / TILE_SIZE)
    const gfx = this.add.graphics()

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * TILE_SIZE
        const y = row * TILE_SIZE
        const color = (row + col) % 2 === 0 ? 0x2d4a22 : 0x3a5c2c
        gfx.fillStyle(color, 1)
        gfx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2)
      }
    }

    this.player = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      24, 24,
      0xffdd57
    )
    this.physics.add.existing(this.player)

    this.cursors = this.input.keyboard.createCursorKeys()

    this.wasd = {
      up:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }
  }

  update() {
    const body = this.player.body
    const speed = 160

    body.setVelocity(0)

    const left  = this.cursors.left.isDown  || this.wasd.left.isDown
    const right = this.cursors.right.isDown || this.wasd.right.isDown
    const up    = this.cursors.up.isDown    || this.wasd.up.isDown
    const down  = this.cursors.down.isDown  || this.wasd.down.isDown

    if (left)  body.setVelocityX(-speed)
    if (right) body.setVelocityX(speed)
    if (up)    body.setVelocityY(-speed)
    if (down)  body.setVelocityY(speed)

    if ((left || right) && (up || down)) {
      body.velocity.normalize().scale(speed)
    }
  }
}
