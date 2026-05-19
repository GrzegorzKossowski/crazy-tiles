import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from './config/gameConfig.js'
import BootScene from './scenes/BootScene.js'
import PreloadScene from './scenes/PreloadScene.js'
import MenuScene from './scenes/MenuScene.js'
import GameScene from './scenes/GameScene.js'
import ResultScene from './scenes/ResultScene.js'

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  dom: { createContainer: true },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, ResultScene]
}

new Phaser.Game(config)
