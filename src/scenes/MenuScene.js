import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Use dynamic dimensions for responsive layout
    const width = this.scale.width;
    const height = this.scale.height;

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Create gradient background
    this.createBackground();

    // Add subtle vignette effect
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0);
    vignette.fillRect(0, 0, width, height);
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.6, 0.6, 0, 0);

    // Title - minimalist, large (responsive)
    const titleFontSize = isMobile ? '48px' : '64px';
    const titleLetterSpacing = isMobile ? 4 : 8;
    const title = this.add.text(width / 2, height * 0.25, 'STARSHIP', {
      fontFamily: 'Arial, sans-serif',
      fontSize: titleFontSize,
      fontStyle: 'bold',
      fill: '#FFFFFF',
      letterSpacing: titleLetterSpacing,
    });
    title.setOrigin(0.5);
    title.setAlpha(0);

    // Fade in title
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1200,
      ease: 'Power2',
    });

    // Subtitle line - metallic silver
    const line = this.add.graphics();
    line.lineStyle(2, 0xbdc3c7, 0.8);
    line.lineBetween(width / 2 - 80, height * 0.35, width / 2 + 80, height * 0.35);
    line.setAlpha(0);

    this.tweens.add({
      targets: line,
      alpha: 1,
      duration: 800,
      delay: 400,
      ease: 'Power2',
    });

    // Main objective - clean and simple
    const objectiveFontSize = isMobile ? '15px' : '17px';
    const objectiveY = height * 0.43;
    const objective = this.add.text(
      width / 2,
      objectiveY,
      'Land between the orange\nMechazilla chopsticks',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: objectiveFontSize,
        fill: '#FFFFFF',
        align: 'center',
        lineSpacing: 5,
      }
    );
    objective.setOrigin(0.5);
    objective.setAlpha(0);

    this.tweens.add({
      targets: objective,
      alpha: 1,
      duration: 600,
      delay: 800,
      ease: 'Power2',
    });

    // Requirements
    const requirementSize = isMobile ? '13px' : '14px';
    const requirements = this.add.text(width / 2, objectiveY + 45, 'Landing speed < 80 m/s', {
      fontFamily: 'Arial, sans-serif',
      fontSize: requirementSize,
      fill: '#95A5A6',
      align: 'center',
    });
    requirements.setOrigin(0.5);
    requirements.setAlpha(0);

    this.tweens.add({
      targets: requirements,
      alpha: 1,
      duration: 600,
      delay: 900,
      ease: 'Power2',
    });

    // Separator line
    const separatorY = objectiveY + 68;
    const separator = this.add.graphics();
    separator.lineStyle(1, 0x7f8c8d, 0.3);
    separator.lineBetween(width / 2 - 100, separatorY, width / 2 + 100, separatorY);
    separator.setAlpha(0);

    this.tweens.add({
      targets: separator,
      alpha: 1,
      duration: 600,
      delay: 1000,
      ease: 'Power2',
    });

    // Controls instructions - clean and simple
    const instructionFontSize = isMobile ? '13px' : '15px';
    const controlsY = separatorY + 25;
    const controlsText = isMobile
      ? 'Hold & Drag  →  Steer + Engines'
      : '← →  Steer  •  SPACE  Fire Engines';

    const controls = this.add.text(width / 2, controlsY, controlsText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: instructionFontSize,
      fill: '#BDC3C7',
      align: 'center',
    });
    controls.setOrigin(0.5);
    controls.setAlpha(0);

    this.tweens.add({
      targets: controls,
      alpha: 0.85,
      duration: 600,
      delay: 1100,
      ease: 'Power2',
    });

    // Start instruction - elegant pulsing with steel accent (different for mobile)
    const startTextContent = isMobile ? 'TAP TO START' : 'PRESS SPACE TO BEGIN';
    const startFontSize = isMobile ? '13px' : '15px';
    const startLetterSpacing = isMobile ? 1 : 2;
    const startText = this.add.text(width / 2, height * 0.78, startTextContent, {
      fontFamily: 'Arial, sans-serif',
      fontSize: startFontSize,
      fill: '#ECF0F1',
      letterSpacing: startLetterSpacing,
    });
    startText.setOrigin(0.5);
    startText.setAlpha(0);

    // Delayed fade in then pulse
    this.tweens.add({
      targets: startText,
      alpha: 1,
      duration: 800,
      delay: 1400,
      ease: 'Power2',
    });

    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: startText,
        alpha: 0.4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // Function to start the game
    const startGame = () => {
      // Fade out effect
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene');
      });
    };

    // Start game on SPACE key (desktop)
    this.input.keyboard.once('keydown-SPACE', startGame);

    // Start game on tap/click (mobile and desktop)
    if (isMobile) {
      this.input.once('pointerdown', startGame);
    }
  }

  createBackground() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Industrial steel gradient - dark to lighter grey
    const graphics = this.add.graphics();
    const gradientSteps = 60;

    const steelTop = Phaser.Display.Color.HexStringToColor('#2C3E50');
    const steelBottom = Phaser.Display.Color.HexStringToColor('#5D6D7E');

    for (let i = 0; i < gradientSteps; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        steelTop,
        steelBottom,
        gradientSteps,
        i
      );

      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      graphics.fillRect(0, (height / gradientSteps) * i, width, height / gradientSteps);
    }

    // Metallic horizon line
    const horizonY = height * 0.72;
    graphics.lineStyle(2, 0x8a9ba8, 0.4);
    graphics.lineBetween(0, horizonY, width, horizonY);

    // Dark metallic ground
    graphics.fillStyle(0x34495e, 0.8);
    graphics.fillRect(0, horizonY, width, height - horizonY);

    // Add subtle steel texture with horizontal lines
    graphics.lineStyle(1, 0x95a5a6, 0.1);
    for (let i = 0; i < 40; i++) {
      const y = Phaser.Math.Between(0, height);
      graphics.lineBetween(0, y, width, y);
    }

    // Add industrial grid pattern overlay
    graphics.lineStyle(1, 0x7f8c8d, 0.05);
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // Atmospheric steel particles floating
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0xbdc3c7,
        Phaser.Math.FloatBetween(0.1, 0.3)
      );

      this.tweens.add({
        targets: particle,
        y: particle.y + Phaser.Math.Between(50, 150),
        x: particle.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: Phaser.Math.Between(8000, 12000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 5000),
      });
    }
  }
}
