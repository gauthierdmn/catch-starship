import Phaser from 'phaser';
import starshipSvg from '../assets/images/starship.svg';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Set industrial steel background color
    this.cameras.main.setBackgroundColor('#2C3E50');

    // Simple, elegant loading indicator
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'LOADING', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fill: '#95A5A6',
      letterSpacing: 4,
    });
    loadingText.setOrigin(0.5);

    // Minimal progress bar
    const progressBar = this.add.graphics();
    const barWidth = 200;
    const barHeight = 2;

    // Background line
    progressBar.lineStyle(barHeight, 0x5d6d7e, 0.4);
    progressBar.lineBetween(
      width / 2 - barWidth / 2,
      height / 2 + 10,
      width / 2 + barWidth / 2,
      height / 2 + 10
    );

    // Progress line
    this.load.on('progress', (value) => {
      progressBar.clear();
      // Background
      progressBar.lineStyle(barHeight, 0x5d6d7e, 0.4);
      progressBar.lineBetween(
        width / 2 - barWidth / 2,
        height / 2 + 10,
        width / 2 + barWidth / 2,
        height / 2 + 10
      );
      // Progress
      progressBar.lineStyle(barHeight, 0xbdc3c7, 1);
      progressBar.lineBetween(
        width / 2 - barWidth / 2,
        height / 2 + 10,
        width / 2 - barWidth / 2 + barWidth * value,
        height / 2 + 10
      );
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      loadingText.destroy();
    });

    // Load game assets
    this.load.svg('starship', starshipSvg, { width: 40, height: 120 });
  }

  create() {
    // Move to menu scene
    this.scene.start('MenuScene');
  }
}
