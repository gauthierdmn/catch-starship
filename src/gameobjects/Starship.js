import Phaser from 'phaser';
import { STARSHIP } from '../config/constants.js';

export default class Starship extends Phaser.GameObjects.Container {
  constructor(scene, x, y, location = null) {
    super(scene, x, y);

    this.scene = scene;
    this.flames = [];
    this.location = location;

    // Scale down on mobile for more landing time
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile) {
      this.setScale(0.7);
    }

    // Create starship sprite
    this.sprite = scene.add.sprite(0, 0, 'starship');
    this.add(this.sprite);

    // Create engine flames
    this.createFlames();

    // Add to scene
    scene.add.existing(this);
  }

  createFlames() {
    // Position flames at the bottom of the sprite (3 engine nozzles)
    const flamePositions = [
      { x: -8, y: 60 }, // Left nozzle
      { x: 0, y: 60 }, // Center nozzle
      { x: 8, y: 60 }, // Right nozzle
    ];

    // Use location-specific flame colors if available
    const flameColor1 = this.location?.flameColor1 || STARSHIP.FLAME_COLOR_1;
    const flameColor2 = this.location?.flameColor2 || STARSHIP.FLAME_COLOR_2;

    flamePositions.forEach((pos) => {
      // Create flame graphics
      const flame = this.scene.add.graphics();
      flame.setPosition(pos.x, pos.y);

      // Draw flame shape with location-specific colors
      flame.fillStyle(flameColor1);
      flame.fillTriangle(-3, 0, 3, 0, 0, 16);

      flame.fillStyle(flameColor2);
      flame.fillTriangle(-2, 0, 2, 0, 0, 12);

      // Add bright core
      flame.fillStyle(0xffffff, 0.9);
      flame.fillTriangle(-1, 0, 1, 0, 0, 6);

      this.add(flame);
      this.flames.push(flame);
    });
  }

  update(enginesOn = false) {
    // Show/hide and animate flames based on engine state
    this.flames.forEach((flame) => {
      if (enginesOn) {
        flame.setVisible(true);
        // Animate flames (flicker effect) - more intense when engines on
        const scale = 1.5 + Math.random() * 0.8;
        flame.setScale(scale, scale);
      } else {
        // Hide flames when engines are off (free fall)
        flame.setVisible(false);
      }
    });
  }
}
