import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data) {
    // Use dynamic dimensions for responsive layout
    const width = this.scale.width;
    const height = this.scale.height;
    const { success, reason } = data;

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Create background
    this.createBackground();

    // Fade in from black
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Result message - clean and elegant (responsive)
    const resultText = success ? 'MISSION SUCCESS' : 'MISSION FAILED';
    const resultColor = success ? '#FFFFFF' : '#FF6B6B';

    // Responsive font size and letter spacing
    const resultFontSize = isMobile ? '28px' : '42px';
    const resultLetterSpacing = isMobile ? 2 : 4;

    const title = this.add.text(width / 2, height * 0.32, resultText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: resultFontSize,
      fontStyle: 'bold',
      fill: resultColor,
      letterSpacing: resultLetterSpacing,
    });
    title.setOrigin(0.5);
    title.setAlpha(0);

    // Fade in title
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 800,
      ease: 'Power2',
    });

    // Subtle line under title - metallic with status color
    const line = this.add.graphics();
    line.lineStyle(2, success ? 0xffffff : 0xff6b6b, 0.6);
    line.lineBetween(width / 2 - 100, height * 0.38, width / 2 + 100, height * 0.38);
    line.setAlpha(0);

    this.tweens.add({
      targets: line,
      alpha: 0.5,
      duration: 600,
      delay: 400,
      ease: 'Power2',
    });

    // Reason (if failed) - larger and more visible
    if (!success && reason) {
      const reasonText = this.add.text(
        width / 2,
        height * 0.43,
        reason.replace('MISSION FAILED - ', ''),
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: isMobile ? '15px' : '17px',
          fill: '#BDC3C7',
          align: 'center',
          wordWrap: { width: width * 0.8 },
        }
      );
      reasonText.setOrigin(0.5);
      reasonText.setAlpha(0);

      this.tweens.add({
        targets: reasonText,
        alpha: 0.8,
        duration: 600,
        delay: 600,
        ease: 'Power2',
      });
    }

    // Statistics - minimal and clean
    if (data.stats) {
      const speed = Math.round(data.stats.speed);
      const speedPass = speed <= 80;

      const statsY = height * 0.54;
      const statFontSize = isMobile ? '13px' : '15px';
      const statStyle = {
        fontFamily: 'Arial, sans-serif',
        fontSize: statFontSize,
        fill: '#BDC3C7',
      };

      // Speed
      const speedLabel = this.add.text(width / 2 - 80, statsY, 'Landing Speed', statStyle);
      speedLabel.setOrigin(0, 0.5);
      speedLabel.setAlpha(0);

      const speedValue = this.add.text(width / 2 + 80, statsY, `${speed} m/s`, {
        ...statStyle,
        fill: speedPass ? '#FFFFFF' : '#FF6B6B',
      });
      speedValue.setOrigin(1, 0.5);
      speedValue.setAlpha(0);

      // Fade in stats
      this.tweens.add({
        targets: [speedLabel, speedValue],
        alpha: 0.9,
        duration: 600,
        delay: 800,
        ease: 'Power2',
      });

      // Separator lines - metallic
      const separator = this.add.graphics();
      separator.lineStyle(1, 0x7f8c8d, 0.4);
      separator.lineBetween(width / 2 - 100, statsY - 15, width / 2 + 100, statsY - 15);
      separator.lineBetween(width / 2 - 100, statsY + 20, width / 2 + 100, statsY + 20);
      separator.setAlpha(0);

      this.tweens.add({
        targets: separator,
        alpha: 1,
        duration: 600,
        delay: 800,
        ease: 'Power2',
      });
    }

    // Success celebration
    if (success) {
      this.createCelebration();
    }

    // Retry instruction - elegant (different for mobile, responsive)
    const retryTextContent = isMobile ? 'TAP TO RETRY' : 'PRESS SPACE TO RETRY';
    const retryFontSize = isMobile ? '11px' : '13px';
    const retryLetterSpacing = isMobile ? 1 : 2;
    const retryText = this.add.text(width / 2, height * 0.82, retryTextContent, {
      fontFamily: 'Arial, sans-serif',
      fontSize: retryFontSize,
      fill: '#ECF0F1',
      letterSpacing: retryLetterSpacing,
    });
    retryText.setOrigin(0.5);
    retryText.setAlpha(0);

    this.tweens.add({
      targets: retryText,
      alpha: 0.8,
      duration: 600,
      delay: 1200,
      ease: 'Power2',
    });

    this.time.delayedCall(1800, () => {
      this.tweens.add({
        targets: retryText,
        alpha: 0.4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // Function to continue/restart the game
    const continueGame = () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        // If there's a next location (Earth success → Mars), go there
        // Otherwise, restart at Earth
        const nextLocation = data.nextLocation || 'EARTH';
        this.scene.start('GameScene', { location: nextLocation });
      });
    };

    // Continue/Restart on SPACE key (desktop)
    this.input.keyboard.once('keydown-SPACE', continueGame);

    // Continue/Restart on tap/click (mobile and desktop)
    if (isMobile) {
      this.input.once('pointerdown', continueGame);
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
    const horizonY = height * 0.7;
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

    // Atmospheric overlay for depth
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillRect(0, 0, width, height);
  }

  createCelebration() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Subtle particle effects - less intense, more elegant
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(width * 0.35, width * 0.65);
      const y = height * 0.32;
      const particle = this.add.circle(x, y, 2, 0xff8533, 0.8);

      this.tweens.add({
        targets: particle,
        x: Phaser.Math.Between(width * 0.2, width * 0.8),
        y: Phaser.Math.Between(height * 0.5, height * 0.9),
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(1500, 2500),
        ease: 'Cubic.easeOut',
        delay: Phaser.Math.Between(0, 400),
      });
    }

    // Add subtle glow effect - white/silver
    const glow = this.add.circle(width / 2, height * 0.32, 100, 0xffffff, 0);
    this.tweens.add({
      targets: glow,
      alpha: 0.12,
      scale: 1.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
