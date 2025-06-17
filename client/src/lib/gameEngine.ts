import Phaser from "phaser";

class MathGameScene extends Phaser.Scene {
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private background?: Phaser.GameObjects.TileSprite;
  private player?: Phaser.GameObjects.Sprite;
  private stars?: Phaser.GameObjects.Group;

  constructor() {
    super({ key: "MathGameScene" });
  }

  preload() {
    // Create simple colored rectangles as sprites
    this.load.image("player", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
    this.load.image("star", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
  }

  create() {
    // Create animated background
    this.background = this.add.tileSprite(0, 0, this.scale.width * 2, this.scale.height * 2, "player");
    this.background.setTint(0x000033);
    this.background.setOrigin(0, 0);

    // Create player character (simple colored rectangle)
    this.player = this.add.sprite(this.scale.width / 2, this.scale.height / 2, "player");
    this.player.setDisplaySize(40, 40);
    this.player.setTint(0x00ff00);

    // Create floating stars for decoration
    this.stars = this.add.group();
    for (let i = 0; i < 20; i++) {
      const star = this.add.sprite(
        Math.random() * this.scale.width,
        Math.random() * this.scale.height,
        "star"
      );
      star.setDisplaySize(4, 4);
      star.setTint(0xffffff);
      star.setAlpha(0.6);
      this.stars.add(star);
    }

    // Add some simple animations
    this.tweens.add({
      targets: this.player,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Animate stars
    this.stars.children.entries.forEach((star, index) => {
      this.tweens.add({
        targets: star,
        y: star.y + (Math.random() * 100) - 50,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: index * 100,
        ease: "Sine.easeInOut"
      });
    });

    // Create particle system for correct answers
    this.particles = this.add.particles(this.scale.width / 2, this.scale.height / 2, "star", {
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      lifespan: 600,
      tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00],
      emitting: false
    });

    // Listen for game events
    this.game.events.on("correctAnswer", this.onCorrectAnswer, this);
    this.game.events.on("wrongAnswer", this.onWrongAnswer, this);
    this.game.events.on("timeWarning", this.onTimeWarning, this);
    this.game.events.on("timeUp", this.onTimeUp, this);
  }

  update() {
    // Scroll background
    if (this.background) {
      this.background.tilePositionX += 0.5;
      this.background.tilePositionY += 0.2;
    }
  }

  private onCorrectAnswer() {
    // Trigger particle explosion
    if (this.particles) {
      this.particles.explode(30);
    }

    // Flash player green
    if (this.player) {
      this.player.setTint(0x00ff00);
      this.tweens.add({
        targets: this.player,
        alpha: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.player!.setAlpha(1);
        }
      });
    }
  }

  private onWrongAnswer() {
    // Flash player red
    if (this.player) {
      this.player.setTint(0xff0000);
      this.tweens.add({
        targets: this.player,
        x: this.player.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          this.player!.setTint(0x00ff00);
        }
      });
    }
  }

  private onTimeWarning() {
    // Flash background orange for time warning
    if (this.background) {
      this.background.setTint(0xff6600);
      this.tweens.add({
        targets: this.background,
        alpha: 0.7,
        duration: 500,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.background!.setTint(0x000033);
          this.background!.setAlpha(1);
        }
      });
    }
  }

  private onTimeUp() {
    // Flash background red and shake player
    if (this.background) {
      this.background.setTint(0xff0000);
    }
    
    if (this.player) {
      this.tweens.add({
        targets: this.player,
        x: this.player.x + 20,
        duration: 100,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          if (this.background) {
            this.background.setTint(0x000033);
          }
        }
      });
    }
  }

  destroy() {
    this.game.events.off("correctAnswer", this.onCorrectAnswer, this);
    this.game.events.off("wrongAnswer", this.onWrongAnswer, this);
    this.game.events.off("timeWarning", this.onTimeWarning, this);
    this.game.events.off("timeUp", this.onTimeUp, this);
    super.destroy();
  }
}

let gameInstance: Phaser.Game | null = null;

export function initGame(container: HTMLElement, grade: number): Phaser.Game {
  if (gameInstance) {
    gameInstance.destroy(true);
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: container.clientWidth,
    height: container.clientHeight,
    parent: container,
    backgroundColor: "#000033",
    scene: MathGameScene,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };

  gameInstance = new Phaser.Game(config);
  return gameInstance;
}

export function destroyGame(game?: Phaser.Game) {
  if (game) {
    game.destroy(true);
  }
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
}

// Utility functions to trigger game events
export function triggerCorrectAnswer() {
  if (gameInstance) {
    gameInstance.events.emit("correctAnswer");
  }
}

export function triggerWrongAnswer() {
  if (gameInstance) {
    gameInstance.events.emit("wrongAnswer");
  }
}

export function triggerTimeWarning() {
  if (gameInstance) {
    gameInstance.events.emit("timeWarning");
  }
}

export function triggerTimeUp() {
  if (gameInstance) {
    gameInstance.events.emit("timeUp");
  }
}
