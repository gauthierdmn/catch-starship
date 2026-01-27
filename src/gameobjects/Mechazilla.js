import Phaser from 'phaser';
import { MECHAZILLA } from '../config/constants.js';

export default class Mechazilla extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;
    this.catchZoneWidth = MECHAZILLA.CATCH_ZONE_WIDTH;
    this.catchZone = null;

    // Scale down on mobile for more landing time
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile) {
      this.setScale(0.7);
    }

    // Create mechazilla structure
    this.createMechazilla();

    // Add to scene
    scene.add.existing(this);
  }

  createMechazilla() {
    const graphics = this.scene.add.graphics();
    const tw = MECHAZILLA.TOWER_WIDTH;
    const th = MECHAZILLA.TOWER_HEIGHT;
    const armLen = MECHAZILLA.ARM_LENGTH;
    const armW = MECHAZILLA.ARM_WIDTH;
    const armSpacing = MECHAZILLA.ARM_SPACING;

    // Main tower structure
    graphics.fillStyle(MECHAZILLA.TOWER_COLOR);
    graphics.fillRect(-tw / 2, -th, tw, th);

    // Tower highlight (left edge)
    graphics.fillStyle(MECHAZILLA.HIGHLIGHT_COLOR);
    graphics.fillRect(-tw / 2, -th, 2, th);

    // Tower shadow (right edge)
    graphics.fillStyle(0x1c1c1c);
    graphics.fillRect(tw / 2 - 2, -th, 2, th);

    // Cross-bracing details (structural X patterns)
    graphics.lineStyle(1, MECHAZILLA.STRUCTURE_COLOR);
    const sections = 8;
    for (let i = 0; i < sections; i++) {
      const y1 = -th + (th / sections) * i;
      const y2 = -th + (th / sections) * (i + 1);

      // Draw X pattern
      graphics.lineBetween(-tw / 2 + 2, y1, tw / 2 - 2, y2);
      graphics.lineBetween(tw / 2 - 2, y1, -tw / 2 + 2, y2);
    }

    // Horizontal supports
    graphics.lineStyle(1.5, MECHAZILLA.HIGHLIGHT_COLOR);
    for (let i = 0; i <= sections; i++) {
      const y = -th + (th / sections) * i;
      graphics.lineBetween(-tw / 2, y, tw / 2, y);
    }

    // Calculate catch arm positions (centered vertically on tower)
    const catchArmY = -th / 2;

    // Upper catching arm (extends left from tower) - ORANGE like real Mechazilla
    graphics.fillStyle(MECHAZILLA.ARM_COLOR);
    graphics.fillRect(-tw / 2 - armLen, catchArmY - armSpacing / 2 - armW, armLen + tw / 2, armW);

    // Lower catching arm (extends left from tower) - ORANGE
    graphics.fillRect(-tw / 2 - armLen, catchArmY + armSpacing / 2, armLen + tw / 2, armW);

    // Add metallic highlight to upper arm
    graphics.fillStyle(MECHAZILLA.ARM_DETAIL_COLOR);
    graphics.fillRect(-tw / 2 - armLen, catchArmY - armSpacing / 2 - armW, armLen + tw / 2, 2);

    // Add metallic highlight to lower arm
    graphics.fillRect(-tw / 2 - armLen, catchArmY + armSpacing / 2, armLen + tw / 2, 2);

    // Arm shadow/depth
    graphics.fillStyle(0xcc5500, 0.5);
    graphics.fillRect(
      -tw / 2 - armLen,
      catchArmY - armSpacing / 2 - armW + armW - 2,
      armLen + tw / 2,
      2
    );
    graphics.fillRect(-tw / 2 - armLen, catchArmY + armSpacing / 2 + armW - 2, armLen + tw / 2, 2);

    // Arm support brackets (stronger)
    graphics.lineStyle(3, MECHAZILLA.STRUCTURE_COLOR);
    // Upper arm support
    graphics.lineBetween(
      -tw / 2,
      catchArmY - armSpacing / 2 - armW - 8,
      -tw / 2 - 15,
      catchArmY - armSpacing / 2 - armW
    );
    graphics.lineBetween(
      -tw / 2,
      catchArmY - armSpacing / 2 - armW - 8,
      -tw / 2,
      catchArmY - armSpacing / 2 + 5
    );
    // Lower arm support
    graphics.lineBetween(
      -tw / 2,
      catchArmY + armSpacing / 2 + armW + 8,
      -tw / 2 - 15,
      catchArmY + armSpacing / 2 + armW
    );
    graphics.lineBetween(
      -tw / 2,
      catchArmY + armSpacing / 2 + armW + 8,
      -tw / 2,
      catchArmY + armSpacing / 2 - 5
    );

    // Hydraulic cylinders on arms (realistic detail)
    graphics.fillStyle(0x606060);
    const cylinderPositions = [0.3, 0.6];
    cylinderPositions.forEach((pos) => {
      const x = -tw / 2 - armLen * pos;
      // Upper arm cylinder
      graphics.fillRect(x - 2, catchArmY - armSpacing / 2 - armW - 3, 4, armW + 6);
      // Lower arm cylinder
      graphics.fillRect(x - 2, catchArmY + armSpacing / 2 - 3, 4, armW + 6);
    });

    // Add structural reinforcement at the tips
    graphics.fillStyle(0x808080);
    graphics.fillRect(-tw / 2 - armLen - 3, catchArmY - armSpacing / 2 - armW - 2, 3, armW + 4);
    graphics.fillRect(-tw / 2 - armLen - 3, catchArmY + armSpacing / 2 - 2, 3, armW + 4);

    this.add(graphics);

    // Add tower base platform
    this.createTowerBase();

    // Create catch zone (invisible for collision detection)
    this.createCatchZone(catchArmY);
  }

  createTowerBase() {
    const graphics = this.scene.add.graphics();
    const tw = MECHAZILLA.TOWER_WIDTH;

    // Orbital Launch Mount base structure
    graphics.fillStyle(0x505050);
    graphics.fillRect(-tw / 2 - 15, 0, tw + 30, 10);

    // Support legs
    graphics.fillStyle(0x404040);
    graphics.fillRect(-tw / 2 - 15, 10, 8, 20);
    graphics.fillRect(tw / 2 + 7, 10, 8, 20);

    // Central support
    graphics.fillStyle(0x606060);
    graphics.fillRect(-tw / 2 - 5, 10, tw + 10, 15);

    // Details
    graphics.lineStyle(1, 0x707070);
    graphics.strokeRect(-tw / 2 - 15, 0, tw + 30, 10);

    this.add(graphics);
  }

  createCatchZone(catchArmY) {
    const armSpacing = MECHAZILLA.ARM_SPACING;
    const armW = MECHAZILLA.ARM_WIDTH;
    const tw = MECHAZILLA.TOWER_WIDTH;

    // Calculate catch zone dimensions (invisible for gameplay)
    const zoneWidth = MECHAZILLA.CATCH_ZONE_WIDTH;
    const zoneHeight = armSpacing;
    const zoneX = -tw / 2 - zoneWidth;
    const zoneY = catchArmY - armSpacing / 2;

    // Optional: Add subtle visual cues without the game-y green zone
    const zoneGraphics = this.scene.add.graphics();

    // Very subtle indicator lines on the arms (barely visible)
    zoneGraphics.lineStyle(1, 0xffffff, 0.1);
    zoneGraphics.lineBetween(
      zoneX,
      zoneY + zoneHeight / 2,
      zoneX + zoneWidth,
      zoneY + zoneHeight / 2
    );

    // Add small orange markers on the arm tips to show catch point
    zoneGraphics.fillStyle(MECHAZILLA.ARM_DETAIL_COLOR, 0.8);
    // Upper arm catch point indicator
    zoneGraphics.fillCircle(zoneX + zoneWidth / 2, catchArmY - armSpacing / 2 - armW / 2, 2);
    // Lower arm catch point indicator
    zoneGraphics.fillCircle(zoneX + zoneWidth / 2, catchArmY + armSpacing / 2 + armW / 2, 2);

    this.add(zoneGraphics);

    // Store catch zone reference for collision detection
    // IMPORTANT: Account for container scaling (0.7x on mobile)
    // The local coordinates need to be scaled to get world coordinates
    const scale = this.scaleY; // Use Y scale since we care about vertical position
    this.catchZone = {
      x: this.x + (zoneX + zoneWidth / 2) * scale,
      y: this.y + (zoneY + zoneHeight / 2) * scale,
      width: zoneWidth * scale,
      height: zoneHeight * scale,
    };
  }

  getCatchZone() {
    return this.catchZone;
  }
}
