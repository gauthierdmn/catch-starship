import Phaser from 'phaser';
import { inject } from '@vercel/analytics';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { GAME_CONFIG } from './config/constants.js';

// Initialize Vercel Analytics
inject();

// Use full screen dimensions for both mobile and desktop
const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // We'll apply gravity to specific objects
      debug: false,
    },
  },
  scene: [PreloadScene, MenuScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
