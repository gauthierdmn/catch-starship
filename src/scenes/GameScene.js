import Phaser from 'phaser';
import Starship from '../gameobjects/Starship.js';
import Mechazilla from '../gameobjects/Mechazilla.js';
import { STARSHIP, COLORS, MESSAGES, LOCATIONS } from '../config/constants.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.starship = null;
    this.mechazilla = null;
    this.catchZone = null;
    this.cursors = null;
    this.spaceKey = null;
    this.isGameOver = false;
    this.hasLanded = false;
    this.enginesOn = false;
    this.isMobile = false;
    this.landingBurnButton = null;
    this.touchingLeft = false;
    this.touchingRight = false;
    this.touchStartX = 0;
    this.currentTouchX = 0;
    this.isDragging = false;
  }

  create(data = {}) {
    this.isGameOver = false;
    this.hasLanded = false;

    // Get location (default to Earth)
    const locationKey = data.location || 'EARTH';
    this.currentLocation = LOCATIONS[locationKey];
    this.currentLocationKey = locationKey;

    // Detect mobile device
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Store dynamic dimensions
    this.gameWidth = this.scale.width;
    this.gameHeight = this.scale.height;

    // Fade in from black
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Create background (location-specific)
    this.createBackground();

    // Create ground
    this.createGround();

    // Create Mechazilla with catch zone (positioned dynamically)
    const mechazillaX = this.gameWidth / 2;
    const mechazillaY = this.gameHeight - 50;
    this.mechazilla = new Mechazilla(this, mechazillaX, mechazillaY);
    this.catchZone = this.mechazilla.getCatchZone();

    // Create Starship with physics (positioned dynamically)
    const starshipX = this.gameWidth / 2 + STARSHIP.INITIAL_X_OFFSET;
    const starshipY = STARSHIP.INITIAL_Y;
    this.starship = new Starship(this, starshipX, starshipY, this.currentLocation);

    // Enable physics on starship
    this.physics.add.existing(this.starship);
    this.starship.body.setGravityY(this.currentLocation.gravity);
    this.starship.body.setVelocityY(STARSHIP.INITIAL_VELOCITY_Y);
    this.starship.body.setCollideWorldBounds(false); // Allow falling off screen
    this.starship.body.setDrag(100, 0); // Add horizontal drag for more responsive control

    // Setup keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Add UI text
    this.createUI();

    // Add mobile touch controls if on mobile
    if (this.isMobile) {
      this.createMobileControls();
    }

    // Add ambient effects
    this.createAmbientEffects();

    // Add location-themed details
    this.createEnvironmentDetails();
  }

  update() {
    if (this.isGameOver || !this.starship || this.hasLanded) {
      // Stop updating physics after landing to prevent bouncing
      return;
    }

    // Handle engine thrust (SPACE key for desktop, touch events set this.enginesOn for mobile)
    const enginesActive = this.spaceKey.isDown || this.enginesOn;
    if (enginesActive) {
      // Apply upward thrust
      this.starship.body.setAccelerationY(STARSHIP.ENGINE_THRUST);
    } else {
      // No thrust, only gravity
      this.starship.body.setAccelerationY(0);
    }

    // Handle horizontal input with acceleration (keyboard or touch)
    const steerLeft = this.cursors.left.isDown || this.touchingLeft;
    const steerRight = this.cursors.right.isDown || this.touchingRight;

    if (steerLeft) {
      this.starship.body.setAccelerationX(-800);
      this.starship.body.setMaxVelocity(STARSHIP.HORIZONTAL_SPEED);
      this.starship.setRotation(-STARSHIP.ROTATION_SPEED);
    } else if (steerRight) {
      this.starship.body.setAccelerationX(800);
      this.starship.body.setMaxVelocity(STARSHIP.HORIZONTAL_SPEED);
      this.starship.setRotation(STARSHIP.ROTATION_SPEED);
    } else {
      this.starship.body.setAccelerationX(0);
      // Gradually return to upright position
      this.starship.setRotation(this.starship.rotation * STARSHIP.ROTATION_DAMPING);
    }

    // Update starship visuals (engine flames based on engine state)
    this.starship.update(enginesActive);

    // Update UI with real-time data
    if (this.speedText && this.altitudeText) {
      const speed = Math.abs(Math.round(this.starship.body.velocity.y));
      const altitude = Math.max(0, Math.round(this.catchZone.y - this.starship.y));

      this.speedText.setText(`Speed: ${speed} m/s`);
      this.speedText.setColor(speed > STARSHIP.MAX_LANDING_SPEED ? '#FF0000' : '#00FF00');

      this.altitudeText.setText(`Altitude: ${altitude} m`);
    }

    // Check if starship has reached landing zone height (catch zone)
    if (!this.hasLanded) {
      const horizontalBuffer = 15;
      const landingY = this.catchZone.y;
      const catchZoneLeft = this.catchZone.x - this.catchZone.width / 2 - horizontalBuffer;
      const catchZoneRight = this.catchZone.x + this.catchZone.width / 2 + horizontalBuffer;

      // CRITICAL: Rocket must be AT THE CENTER between the arms, not just entering the zone
      // Only trigger landing when rocket center is within ±8px of the exact center line
      const centerTolerance = 8;
      const catchCenterY = landingY; // The exact center between upper and lower arms
      const catchZoneTop = catchCenterY - centerTolerance;
      const catchZoneBottom = catchCenterY + centerTolerance;

      // Check if in catch zone (both X and Y)
      const inCatchZoneX = this.starship.x >= catchZoneLeft && this.starship.x <= catchZoneRight;
      const inCatchZoneY = this.starship.y >= catchZoneTop && this.starship.y <= catchZoneBottom;

      if (inCatchZoneX && inCatchZoneY) {
        // Rocket center is exactly between the arms - evaluate landing
        this.checkLandingConditions();
      }
    }

    // Check if rocket has hit the ground
    const groundLevel = this.gameHeight - 30;
    if (
      !this.isGameOver &&
      !this.hasLanded &&
      this.starship.y >= groundLevel - STARSHIP.HEIGHT / 2
    ) {
      this.hasLanded = true;
      this.isGameOver = true; // Prevent multiple triggers
      this.starship.body.setVelocity(0, 0);
      this.starship.body.setGravityY(0);
      this.starship.body.setAcceleration(0, 0);

      // Hide the starship (it's destroyed)
      this.starship.setVisible(false);

      // Create explosion effect
      this.createExplosion(this.starship.x, groundLevel);

      // Delay game over to show explosion
      this.time.delayedCall(800, () => {
        this.scene.start('GameOverScene', {
          success: false,
          reason: MESSAGES.FAILURE_MISSED,
        });
      });
    }
  }

  checkLandingConditions() {
    const speed = Math.abs(this.starship.body.velocity.y);
    const starshipX = this.starship.x;
    const starshipY = this.starship.y;

    // Verify rocket is at the exact catch point (between the arms)
    const horizontalBuffer = 15;
    const centerTolerance = 8;
    const catchZoneLeft = this.catchZone.x - this.catchZone.width / 2 - horizontalBuffer;
    const catchZoneRight = this.catchZone.x + this.catchZone.width / 2 + horizontalBuffer;
    const catchCenterY = this.catchZone.y;
    const catchZoneTop = catchCenterY - centerTolerance;
    const catchZoneBottom = catchCenterY + centerTolerance;

    const inCatchZoneX = starshipX >= catchZoneLeft && starshipX <= catchZoneRight;
    const inCatchZoneY = starshipY >= catchZoneTop && starshipY <= catchZoneBottom;
    const inCatchZone = inCatchZoneX && inCatchZoneY;

    // Determine success or failure
    let success = false;
    let reason = '';

    if (!inCatchZone) {
      // Not at exact catch point - don't freeze, let it continue falling
      return;
    } else if (speed > STARSHIP.MAX_LANDING_SPEED) {
      reason = MESSAGES.FAILURE_SPEED;
    } else {
      success = true;
    }

    // Landing attempt made - completely freeze the starship
    this.hasLanded = true;
    this.enginesOn = false;
    this.starship.body.setVelocity(0, 0);
    this.starship.body.setAcceleration(0, 0);
    this.starship.body.setGravityY(0);

    // Add brief delay before transition
    this.time.delayedCall(1000, () => {
      this.endGame(success, reason, { speed });
    });
  }

  endGame(success, reason, stats = {}) {
    if (this.isGameOver) {
      return;
    }
    this.isGameOver = true;

    // Visual feedback - more subtle
    if (success) {
      // Gentle white flash for success
      this.cameras.main.flash(400, 255, 255, 255, false, null, 0.3);
    } else {
      // Subtle shake and red tint for failure
      this.cameras.main.shake(200, 0.008);
    }

    // Determine next location (if Earth success, go to Mars)
    let nextLocation = null;
    if (success && this.currentLocationKey === 'EARTH') {
      nextLocation = 'MARS';
    }

    // Smooth fade out transition
    this.time.delayedCall(800, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('GameOverScene', {
          success,
          reason,
          stats,
          location: this.currentLocationKey,
          nextLocation,
        });
      });
    });
  }

  createBackground() {
    const width = this.gameWidth;
    const height = this.gameHeight;

    // Sky gradient - location-specific colors
    const graphics = this.add.graphics();
    const gradientSteps = 60;

    const skyTop = Phaser.Display.Color.HexStringToColor(this.currentLocation.skyTop);
    const skyBottom = Phaser.Display.Color.HexStringToColor(this.currentLocation.skyBottom);

    for (let i = 0; i < gradientSteps; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        skyTop,
        skyBottom,
        gradientSteps,
        i
      );

      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      graphics.fillRect(0, (height / gradientSteps) * i, width, height / gradientSteps);
    }

    const horizonY = height * 0.55;

    // Earth-specific: ocean and beach
    if (this.currentLocationKey === 'EARTH') {
      // Horizon line
      graphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.HORIZON).color);
      graphics.fillRect(0, horizonY, width, 2);

      // Ocean in the distance (Gulf of Mexico)
      graphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.OCEAN).color);
      graphics.fillRect(0, horizonY, width, height * 0.08);

      // Add wave texture to ocean
      graphics.lineStyle(0.5, 0x6aa8bb, 0.3);
      for (let i = 0; i < 8; i++) {
        const y = horizonY + i * 6;
        graphics.beginPath();
        for (let x = 0; x < width; x += 20) {
          graphics.lineTo(x, y + Math.sin(x * 0.1) * 1);
        }
        graphics.strokePath();
      }

      // Beach/sandy shore - extends all the way to ground level
      const beachY = horizonY + height * 0.08;
      const groundY = height - 30;
      graphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.BEACH).color);
      graphics.fillRect(0, beachY, width, groundY - beachY);

      // Add subtle beach texture
      for (let i = 0; i < 50; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(beachY, groundY);
        graphics.fillStyle(0xd4c4a8, 0.3);
        graphics.fillCircle(x, y, Phaser.Math.Between(1, 2));
      }

      // Sand dunes for desert depth - using ellipses for smooth curves
      // Dune 1 - Left side, distant
      const dune1X = width * 0.15;
      const dune1Y = beachY + (groundY - beachY) * 0.4;
      const dune1Width = width * 0.25;
      const dune1Height = 35;

      graphics.fillStyle(0xd4c4a8, 0.5);
      graphics.fillEllipse(dune1X + dune1Width / 2, dune1Y, dune1Width, dune1Height);

      // Dune shadow (darker on right side)
      graphics.fillStyle(0xa89878, 0.3);
      graphics.fillEllipse(
        dune1X + dune1Width * 0.7,
        dune1Y + 5,
        dune1Width * 0.4,
        dune1Height * 0.8
      );

      // Dune 2 - Right side, mid-distance
      const dune2X = width * 0.6;
      const dune2Y = beachY + (groundY - beachY) * 0.5;
      const dune2Width = width * 0.3;
      const dune2Height = 45;

      graphics.fillStyle(0xd4c4a8, 0.5);
      graphics.fillEllipse(dune2X + dune2Width / 2, dune2Y, dune2Width, dune2Height);

      graphics.fillStyle(0xa89878, 0.3);
      graphics.fillEllipse(
        dune2X + dune2Width * 0.7,
        dune2Y + 5,
        dune2Width * 0.4,
        dune2Height * 0.8
      );

      // Dune 3 - Center background, smaller
      const dune3X = width * 0.35;
      const dune3Y = beachY + (groundY - beachY) * 0.25;
      const dune3Width = width * 0.2;
      const dune3Height = 28;

      graphics.fillStyle(0xd4c4a8, 0.4);
      graphics.fillEllipse(dune3X + dune3Width / 2, dune3Y, dune3Width, dune3Height);

      graphics.fillStyle(0xa89878, 0.25);
      graphics.fillEllipse(
        dune3X + dune3Width * 0.7,
        dune3Y + 4,
        dune3Width * 0.4,
        dune3Height * 0.8
      );

      // Clouds - puffy Texas clouds
      for (let i = 0; i < 5; i++) {
        const cloudGraphics = this.add.graphics();
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(height * 0.1, height * 0.4);

        // Multi-circle cloud
        cloudGraphics.fillStyle(0xffffff, 0.7);
        cloudGraphics.fillCircle(x, y, 25);
        cloudGraphics.fillCircle(x + 20, y, 20);
        cloudGraphics.fillCircle(x - 15, y, 18);
        cloudGraphics.fillCircle(x + 10, y - 10, 15);

        // Cloud shadow
        cloudGraphics.fillStyle(0xe0e0e0, 0.3);
        cloudGraphics.fillEllipse(x, y + 15, 40, 8);
      }

      // Distant structures (water tanks, buildings)
      graphics.fillStyle(0x505050, 0.4);
      // Water tank
      graphics.fillRect(width * 0.15, horizonY - 15, 8, 15);
      graphics.fillCircle(width * 0.15 + 4, horizonY - 15, 4);
      // Building
      graphics.fillRect(width * 0.25, horizonY - 12, 12, 12);
      // Another structure
      graphics.fillRect(width * 0.85, horizonY - 18, 10, 18);
    } else {
      // Mars-specific: rocky terrain, habitat domes
      const groundY = height - 30;

      // Horizon line (subtle)
      graphics.lineStyle(2, this.currentLocation.horizonColor, 0.3);
      graphics.lineBetween(0, horizonY, width, horizonY);

      // Rocky Mars terrain from horizon to ground
      graphics.fillStyle(this.currentLocation.groundColor, 0.6);
      graphics.fillRect(0, horizonY, width, groundY - horizonY);

      // Add darker rocky patches
      graphics.fillStyle(0x6b3410, 0.4);
      graphics.fillEllipse(width * 0.2, horizonY + height * 0.15, 100, 40);
      graphics.fillEllipse(width * 0.6, horizonY + height * 0.2, 120, 50);
      graphics.fillEllipse(width * 0.85, horizonY + height * 0.12, 80, 35);

      // Reddish rocks/boulders
      for (let i = 0; i < 30; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(horizonY, groundY);
        graphics.fillStyle(0x6b3410, Phaser.Math.FloatBetween(0.3, 0.6));
        graphics.fillCircle(x, y, Phaser.Math.Between(1, 3));
      }

      // Distant habitat domes (Mars colony)
      graphics.fillStyle(0xc0c0c0, 0.5);
      graphics.fillCircle(width * 0.2, horizonY + 5, 12);
      graphics.fillCircle(width * 0.25, horizonY + 7, 10);
      graphics.fillCircle(width * 0.3, horizonY + 6, 8);

      // Solar panel array (small, distant)
      graphics.fillStyle(0x2f4f4f, 0.5);
      graphics.fillRect(width * 0.75, horizonY, 20, 2);
      graphics.fillRect(width * 0.75 + 25, horizonY, 20, 2);
    }
  }

  createGround() {
    const width = this.gameWidth;
    const height = this.gameHeight;
    const groundHeight = 30;
    const groundY = height - groundHeight;

    const graphics = this.add.graphics();

    // Ground - location-specific color
    graphics.fillStyle(this.currentLocation.groundColor);
    graphics.fillRect(0, groundY, width, groundHeight);

    // Darker patches
    if (this.currentLocationKey === 'EARTH') {
      graphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.GROUND_DARK).color, 0.4);
    } else {
      graphics.fillStyle(0x6b3410, 0.5); // Darker Mars rocks
    }
    graphics.fillEllipse(width * 0.2, groundY + 15, 80, 20);
    graphics.fillEllipse(width * 0.6, groundY + 18, 100, 25);
    graphics.fillEllipse(width * 0.85, groundY + 12, 60, 18);

    // Concrete launch pad under Mechazilla
    const padWidth = 180;
    const padX = width / 2 - padWidth / 2;
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(COLORS.CONCRETE).color);
    graphics.fillRect(padX, groundY, padWidth, groundHeight);

    // Concrete grid pattern
    graphics.lineStyle(1, 0x555555, 0.8);
    for (let i = 0; i <= 6; i++) {
      const x = padX + (padWidth / 6) * i;
      graphics.lineBetween(x, groundY, x, height);
    }
    for (let i = 0; i <= 2; i++) {
      const y = groundY + (groundHeight / 2) * i;
      graphics.lineBetween(padX, y, padX + padWidth, y);
    }

    // Concrete edge highlight
    graphics.lineStyle(2, 0x808080, 0.6);
    graphics.lineBetween(padX, groundY, padX + padWidth, groundY);

    // Add sandy texture to ground
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(groundY, height);
      // Skip concrete area
      if (x < padX || x > padX + padWidth) {
        graphics.fillStyle(0xa08060, Phaser.Math.FloatBetween(0.1, 0.3));
        graphics.fillCircle(x, y, Phaser.Math.Between(1, 2));
      }
    }

    // Tire tracks in the sand
    graphics.lineStyle(1.5, 0x6b5a45, 0.3);
    graphics.lineBetween(50, groundY + 15, 300, groundY + 18);
    graphics.lineBetween(55, groundY + 18, 305, groundY + 21);

    // Launch mount base (under tower)
    const mountX = width / 2;
    graphics.fillStyle(0x404040);
    graphics.fillRect(mountX - 40, groundY - 5, 80, 5);
    graphics.fillStyle(0x505050);
    graphics.fillRect(mountX - 35, groundY - 10, 70, 5);
  }

  createUI() {
    // Speed indicator (updated in real-time)
    this.speedText = this.add.text(10, 10, 'Speed: 0', {
      font: '14px monospace',
      fill: '#00FF00',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: { x: 8, y: 4 },
    });

    // Altitude indicator
    this.altitudeText = this.add.text(10, 35, 'Altitude: 0', {
      font: '14px monospace',
      fill: '#00BFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: { x: 8, y: 4 },
    });

    // Location label in top right corner
    const locationText = this.add.text(this.gameWidth - 10, 10, this.currentLocation.name, {
      font: '14px Arial',
      fill: '#FFFFFF',
      align: 'right',
      alpha: 0.8,
    });
    locationText.setOrigin(1, 0); // Anchor to top right
  }

  createAmbientEffects() {
    const width = this.gameWidth;
    const height = this.gameHeight;

    // Location-specific particles
    const particleColor = this.currentLocation.particleColor;
    const particleCount = this.currentLocationKey === 'MARS' ? 12 : 8;

    for (let i = 0; i < particleCount; i++) {
      const x = Phaser.Math.Between(width * 0.3, width * 0.9);
      const particle = this.add.circle(
        x,
        height - 30,
        this.currentLocationKey === 'MARS' ? 1.5 : 2,
        particleColor,
        this.currentLocationKey === 'MARS' ? 0.15 : 0.1
      );

      this.tweens.add({
        targets: particle,
        y: height - 200,
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    // Dust/sand particles blowing across ground
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        height - Phaser.Math.Between(10, 25),
        1,
        0xc9b896,
        0.4
      );

      this.tweens.add({
        targets: particle,
        x: width + 50,
        duration: Phaser.Math.Between(8000, 12000),
        repeat: -1,
        onRepeat: () => {
          particle.x = -50;
          particle.y = height - Phaser.Math.Between(10, 25);
        },
      });
    }
  }

  createEnvironmentDetails() {
    const width = this.gameWidth;
    const height = this.gameHeight;
    const groundY = height - 30;

    const graphics = this.add.graphics();

    if (this.currentLocationKey === 'EARTH') {
      this.createEarthVehicle(graphics, width, height, groundY);
    } else {
      this.createMarsVehicle(graphics, width, height, groundY);
    }
  }

  createEarthVehicle(graphics, width, height, groundY) {
    // Cybertruck parked beside the tower (more to the left on desktop)
    const truckOffset = this.isMobile ? 160 : 240; // Further left on desktop
    const truckX = width / 2 - truckOffset;
    const truckY = groundY - 10;

    // Cybertruck distinctive stainless steel angular design
    graphics.fillStyle(0x1a1a1a); // Matte black/dark steel

    // BACK SECTION - Vault/Bed with angular tonneau cover
    graphics.beginPath();
    graphics.moveTo(truckX, truckY + 10);
    graphics.lineTo(truckX, truckY + 2); // Back vertical
    graphics.lineTo(truckX + 2, truckY - 1); // Angled tonneau cover back
    graphics.lineTo(truckX + 28, truckY - 4); // Sloped tonneau top
    graphics.lineTo(truckX + 28, truckY + 10);
    graphics.closePath();
    graphics.fillPath();

    // CABIN - Distinctive angular shape with extreme slant
    graphics.beginPath();
    graphics.moveTo(truckX + 28, truckY + 10);
    graphics.lineTo(truckX + 28, truckY - 4); // Cab back
    graphics.lineTo(truckX + 38, truckY - 10); // Rear windshield slant (very steep!)
    graphics.lineTo(truckX + 48, truckY - 10); // Flat roof section
    graphics.lineTo(truckX + 56, truckY - 6); // Front windshield slant
    graphics.lineTo(truckX + 56, truckY + 10);
    graphics.closePath();
    graphics.fillPath();

    // FRONT - More substantial angular nose/hood (the signature triangle)
    graphics.beginPath();
    graphics.moveTo(truckX + 56, truckY + 10);
    graphics.lineTo(truckX + 56, truckY - 6); // Base of hood
    graphics.lineTo(truckX + 64, truckY - 3); // Hood top line (angled down)
    graphics.lineTo(truckX + 72, truckY + 2); // Sharp angular front point
    graphics.lineTo(truckX + 72, truckY + 10); // Front bottom
    graphics.closePath();
    graphics.fillPath();

    // Hood detail - shows the angular character line
    graphics.fillStyle(0x252525);
    graphics.beginPath();
    graphics.moveTo(truckX + 56, truckY - 6);
    graphics.lineTo(truckX + 64, truckY - 3);
    graphics.lineTo(truckX + 64, truckY);
    graphics.lineTo(truckX + 56, truckY - 2);
    graphics.closePath();
    graphics.fillPath();

    // Lighter grey highlights to show edges and depth
    graphics.fillStyle(0x2e2e2e);
    // Top edge line of bed
    graphics.fillRect(truckX + 2, truckY - 1, 26, 1);
    // Roof line
    graphics.fillRect(truckX + 38, truckY - 10, 10, 1);
    // Hood edge
    graphics.fillRect(truckX + 56, truckY - 6, 8, 0.5);

    // Extremely dark/tinted windows
    graphics.fillStyle(0x0a0a0a, 0.95);
    // Rear windshield (triangle)
    graphics.beginPath();
    graphics.moveTo(truckX + 29, truckY - 3);
    graphics.lineTo(truckX + 37, truckY - 9);
    graphics.lineTo(truckX + 37, truckY);
    graphics.closePath();
    graphics.fillPath();

    // Side windows
    graphics.fillRect(truckX + 39, truckY - 8, 8, 5);

    // Front windshield (triangle)
    graphics.beginPath();
    graphics.moveTo(truckX + 48, truckY - 9);
    graphics.lineTo(truckX + 55, truckY - 5);
    graphics.lineTo(truckX + 55, truckY);
    graphics.closePath();
    graphics.fillPath();

    // Distinctive LED light bar (thin red line at front) - more prominent
    graphics.fillStyle(0xff0000, 0.7);
    graphics.fillRect(truckX + 70, truckY + 1, 2, 1.5);

    // Undercarriage shadow - extended to match longer front
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRect(truckX + 5, truckY + 9, 62, 2);

    // Wheels - larger and more visible, better positioned
    graphics.fillStyle(0x1c1c1c);
    graphics.fillCircle(truckX + 14, truckY + 10, 4);
    graphics.fillCircle(truckX + 52, truckY + 10, 4);

    // Wheel covers - angular/geometric
    graphics.fillStyle(0x3a3a3a);
    graphics.fillCircle(truckX + 14, truckY + 10, 2.5);
    graphics.fillCircle(truckX + 52, truckY + 10, 2.5);

    // Inner rim detail
    graphics.fillStyle(0x505050);
    graphics.fillCircle(truckX + 14, truckY + 10, 1.2);
    graphics.fillCircle(truckX + 52, truckY + 10, 1.2);

    // Sharp body edge lines (what makes Cybertruck distinctive)
    graphics.lineStyle(1.5, 0x404040, 0.9);
    graphics.lineBetween(truckX, truckY + 2, truckX + 72, truckY + 2); // Main body line
    graphics.lineBetween(truckX + 28, truckY + 10, truckX + 28, truckY - 4); // Cab separation
    graphics.lineBetween(truckX + 56, truckY - 6, truckX + 72, truckY + 2); // Angular front edge

    // Bed edge highlight
    graphics.lineStyle(1, 0x2a2a2a, 0.7);
    graphics.lineBetween(truckX + 2, truckY - 1, truckX + 28, truckY - 4);

    // Texas flag on truck bed with longer pole
    const flagPoleX = truckX + 8;
    const flagPoleY = truckY - 20; // Extended by 8px (was -12, now -20)

    // Flag pole (longer)
    graphics.lineStyle(1.5, 0x505050, 0.9);
    graphics.lineBetween(flagPoleX, truckY, flagPoleX, flagPoleY);

    // Texas flag (extends to the left of pole over truck bed)
    // Blue vertical stripe (on the left)
    graphics.fillStyle(0x002868);
    graphics.fillRect(flagPoleX - 13, flagPoleY, 3, 10);

    // White horizontal stripe (top right)
    graphics.fillStyle(0xffffff);
    graphics.fillRect(flagPoleX - 10, flagPoleY, 10, 5);

    // Red horizontal stripe (bottom right)
    graphics.fillStyle(0xbf0a30);
    graphics.fillRect(flagPoleX - 10, flagPoleY + 5, 10, 5);

    // White star on blue field (tiny)
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(flagPoleX - 11.5, flagPoleY + 5, 0.8);

    // A few cacti on the edges, away from the chopsticks and truck area
    // Left cactus - position it far left to avoid the truck on mobile
    const leftCactusX = this.isMobile ? width * 0.05 : width * 0.12;
    this.createCactus(graphics, leftCactusX, groundY - 12, 2.8, 13, 0x3a5f3a, 0.65); // Far left
    this.createCactus(graphics, width * 0.88, groundY - 10, 2.5, 10, 0x3a5f3a, 0.6); // Far right
    this.createCactus(graphics, width * 0.95, groundY - 10, 2.5, 10, 0x3a5f3a, 0.55); // Far right edge

    // Oil pumpjack in far distance (very subtle)
    const pumpjackX = width * 0.92;
    const pumpjackY = height * 0.55 - 8;

    graphics.fillStyle(0x404040, 0.3);
    // Base
    graphics.fillRect(pumpjackX - 3, pumpjackY + 8, 6, 2);
    // Support beam
    graphics.lineStyle(1.5, 0x505050, 0.3);
    graphics.lineBetween(pumpjackX, pumpjackY + 8, pumpjackX, pumpjackY);
    // Pump head
    graphics.fillStyle(0x505050, 0.3);
    graphics.fillRect(pumpjackX - 2, pumpjackY, 8, 3);

    // Add subtle animation to pumpjack
    const pumpjackHead = this.add.rectangle(pumpjackX + 2, pumpjackY + 1.5, 8, 3, 0x505050, 0.3);
    pumpjackHead.setOrigin(0, 0.5);
    this.tweens.add({
      targets: pumpjackHead,
      angle: -15,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createCactus(graphics, x, y, trunkWidth, height, color, alpha) {
    graphics.fillStyle(color, alpha);

    // Main trunk
    graphics.fillRect(x, y, trunkWidth, height);

    // Left arm (if cactus is tall enough)
    if (height > 8) {
      const armY = y + height * 0.4;
      graphics.fillRect(x - trunkWidth * 1.3, armY, trunkWidth * 1.3, trunkWidth * 0.7);
      graphics.fillRect(x - trunkWidth * 1.3, y + height * 0.2, trunkWidth * 0.7, height * 0.3);
    }

    // Right arm (if cactus is tall enough)
    if (height > 8) {
      const armY = y + height * 0.5;
      graphics.fillRect(x + trunkWidth, armY, trunkWidth, trunkWidth * 0.7);
      graphics.fillRect(x + trunkWidth * 1.3, y + height * 0.3, trunkWidth * 0.7, height * 0.25);
    }
  }

  createMarsVehicle(graphics, width, height, groundY) {
    // Mars rover parked beside the tower (Perseverance-style)
    const roverOffset = this.isMobile ? 160 : 240;
    const roverX = width / 2 - roverOffset;
    const roverY = groundY - 8;

    // Main rover body - white/silver aluminum
    graphics.fillStyle(0xc0c0c0);
    graphics.fillRect(roverX, roverY - 6, 40, 12);

    // Top equipment deck (darker)
    graphics.fillStyle(0x909090);
    graphics.fillRect(roverX + 2, roverY - 10, 36, 4);

    // Front mast/camera (like Perseverance's head)
    graphics.fillStyle(0xa0a0a0);
    graphics.fillRect(roverX + 32, roverY - 16, 4, 6);
    graphics.fillStyle(0x606060);
    graphics.fillCircle(roverX + 34, roverY - 16, 2); // Camera head

    // Solar panel outriggers
    graphics.fillStyle(0x2f4f4f);
    graphics.fillRect(roverX - 4, roverY - 4, 4, 8);
    graphics.fillRect(roverX + 40, roverY - 4, 4, 8);

    // Robot arm (simplified)
    graphics.lineStyle(1.5, 0x808080);
    graphics.lineBetween(roverX + 8, roverY - 2, roverX + 4, roverY + 4);
    graphics.fillStyle(0x707070);
    graphics.fillCircle(roverX + 4, roverY + 4, 2);

    // Six wheels (Mars rovers have 6 wheels)
    graphics.fillStyle(0x404040);
    const wheelY = roverY + 6;
    graphics.fillCircle(roverX + 6, wheelY, 3);
    graphics.fillCircle(roverX + 18, wheelY, 3);
    graphics.fillCircle(roverX + 30, wheelY, 3);

    // Wheel treads
    graphics.fillStyle(0x303030);
    graphics.fillCircle(roverX + 6, wheelY, 1.5);
    graphics.fillCircle(roverX + 18, wheelY, 1.5);
    graphics.fillCircle(roverX + 30, wheelY, 1.5);

    // Suspension/rocker-bogie (small detail)
    graphics.lineStyle(1, 0x707070);
    graphics.lineBetween(roverX + 6, wheelY, roverX + 18, wheelY);
    graphics.lineBetween(roverX + 18, wheelY, roverX + 30, wheelY);

    // Mars colony flag on rover with longer pole
    const flagPoleX = roverX + 10;
    const flagPoleY = roverY - 24;

    // Flag pole
    graphics.lineStyle(1.5, 0x808080, 0.9);
    graphics.lineBetween(flagPoleX, roverY - 10, flagPoleX, flagPoleY);

    // Mars flag (red planet with white symbol)
    graphics.fillStyle(0xcd5c5c); // Mars red
    graphics.fillRect(flagPoleX - 13, flagPoleY, 13, 10);

    // White circle (Mars symbol)
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(flagPoleX - 6.5, flagPoleY + 5, 3);

    // Arrow pointing up-right (Mars symbol ♂)
    graphics.lineStyle(1, 0xffffff, 1);
    graphics.lineBetween(flagPoleX - 6.5, flagPoleY + 5, flagPoleX - 3.5, flagPoleY + 2);
    graphics.lineBetween(flagPoleX - 3.5, flagPoleY + 2, flagPoleX - 3.5, flagPoleY + 4);
    graphics.lineBetween(flagPoleX - 3.5, flagPoleY + 2, flagPoleX - 5.5, flagPoleY + 2);

    // Martian rocks scattered across the terrain
    graphics.fillStyle(0x6b3410, 0.7);
    graphics.fillCircle(width * 0.2, groundY - 3, 4);
    graphics.fillCircle(width * 0.35, groundY - 2, 3);
    graphics.fillCircle(width * 0.75, groundY - 4, 5);
    graphics.fillCircle(width * 0.88, groundY - 3, 3.5);
    graphics.fillCircle(width * 0.95, groundY - 2, 3);

    // Add angular rock shapes (more realistic)
    graphics.fillStyle(0x8b4513, 0.6);
    graphics.fillTriangle(
      width * 0.15,
      groundY,
      width * 0.15 + 6,
      groundY,
      width * 0.15 + 3,
      groundY - 5
    );
    graphics.fillTriangle(
      width * 0.82,
      groundY,
      width * 0.82 + 8,
      groundY,
      width * 0.82 + 4,
      groundY - 6
    );
  }

  createExplosion(x, y) {
    // Bright flash
    const flash = this.add.circle(x, y, 30, 0xffffff, 1);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Orange/red fireball particles
    for (let i = 0; i < 20; i++) {
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(50, 150);
      const color = Phaser.Math.RND.pick([0xff6600, 0xff3300, 0xff9900, 0xffcc00]);
      const size = Phaser.Math.Between(3, 8);

      const particle = this.add.circle(x, y, size, color, 1);

      const velocityX = Math.cos((angle * Math.PI) / 180) * speed;
      const velocityY = Math.sin((angle * Math.PI) / 180) * speed - 50; // Bias upward

      this.tweens.add({
        targets: particle,
        x: particle.x + velocityX,
        y: particle.y + velocityY,
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(400, 800),
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    // Grey smoke particles rising
    for (let i = 0; i < 12; i++) {
      const offsetX = Phaser.Math.Between(-15, 15);
      const smoke = this.add.circle(x + offsetX, y, Phaser.Math.Between(4, 10), 0x505050, 0.6);

      this.tweens.add({
        targets: smoke,
        y: smoke.y - Phaser.Math.Between(80, 150),
        x: smoke.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        scale: 2,
        duration: Phaser.Math.Between(1000, 1500),
        ease: 'Power1',
        delay: Phaser.Math.Between(0, 200),
        onComplete: () => smoke.destroy(),
      });
    }

    // Debris particles
    for (let i = 0; i < 8; i++) {
      const angle = Phaser.Math.Between(-120, -60); // Upward spread
      const speed = Phaser.Math.Between(100, 200);
      const debris = this.add.rectangle(
        x,
        y,
        Phaser.Math.Between(2, 4),
        Phaser.Math.Between(2, 4),
        0x808080
      );

      const velocityX = Math.cos((angle * Math.PI) / 180) * speed;
      const velocityY = Math.sin((angle * Math.PI) / 180) * speed;

      this.tweens.add({
        targets: debris,
        x: debris.x + velocityX,
        y: debris.y + velocityY + 100, // Gravity effect
        angle: Phaser.Math.Between(0, 360),
        alpha: 0,
        duration: Phaser.Math.Between(600, 1000),
        ease: 'Quad.easeOut',
        onComplete: () => debris.destroy(),
      });
    }

    // Camera shake for impact
    this.cameras.main.shake(400, 0.01);
  }

  createMobileControls() {
    const width = this.gameWidth;
    const height = this.gameHeight;

    // Single full-screen drag zone
    const touchZone = this.add.zone(0, 0, width, height).setOrigin(0, 0).setInteractive();

    touchZone.on('pointerdown', (pointer) => {
      // Start engines immediately on touch
      this.enginesOn = true;
      this.isDragging = true;
      this.touchStartX = pointer.x;
      this.currentTouchX = pointer.x;
    });

    touchZone.on('pointermove', (pointer) => {
      if (this.isDragging) {
        this.currentTouchX = pointer.x;

        // Calculate drag distance from start
        const dragDistance = this.currentTouchX - this.touchStartX;

        // Apply steering based on drag distance (threshold of 20px)
        if (dragDistance < -20) {
          this.touchingLeft = true;
          this.touchingRight = false;
        } else if (dragDistance > 20) {
          this.touchingRight = true;
          this.touchingLeft = false;
        } else {
          // In dead zone - no steering
          this.touchingLeft = false;
          this.touchingRight = false;
        }
      }
    });

    touchZone.on('pointerup', () => {
      this.enginesOn = false;
      this.touchingLeft = false;
      this.touchingRight = false;
      this.isDragging = false;
    });

    touchZone.on('pointerout', () => {
      this.enginesOn = false;
      this.touchingLeft = false;
      this.touchingRight = false;
      this.isDragging = false;
    });
  }
}
