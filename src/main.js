import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from './config/gameConfig.js'
import BootScene from './scenes/BootScene.js'
import PreloadScene from './scenes/PreloadScene.js'
import GameScene from './scenes/GameScene.js'

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, PreloadScene, GameScene]
}

new Phaser.Game(config)
