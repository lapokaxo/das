import Phaser from "phaser";
import Beam from "/js/beam.js";

export default class Scene extends Phaser.Scene {
  constructor() {
    super("bootGame");
    this.sceneWidth = 256;
    this.sceneHeight = 272;
  }

  preload() {
    this.load.image("background", "assets/bg.png");
    this.load.spritesheet("ship", "assets/hawk.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image("ship2", "assets/ship2.png");
    this.load.image("ship3", "assets/ship3.png");
    this.load.image("pu", "assets/powerup.png");

    this.load.spritesheet("beam", "assets/beam.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.spritesheet("explosion", "assets/explosion.png", {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create() {
    this.lives = 3;
    this.score = 0;

    this.spacebar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.background = this.add.image(0, 0, "background");
    this.background.setOrigin(0, 0);

    this.liveScoreText = this.add.text(160, 20, "Lives: " + this.lives);
    this.scoreText = this.add.text(160, 5, "Score: " + this.score);

    this.ship1 = this.physics.add.sprite(
      this.sceneWidth / 2 - 50,
      this.sceneHeight / 2,
      "ship"
    );
    this.ship2 = this.physics.add.image(this.sceneWidth / 2, 0, "ship2");
    this.ship3 = this.physics.add.image(this.sceneWidth / 2 + 50, 0, "ship3");

    this.enemyShips = this.physics.add.group();
    this.enemyShips.add(this.ship2);
    this.enemyShips.add(this.ship3);

    this.anims.create({
      key: "ship_anim",
      frames: this.anims.generateFrameNumbers("ship"),
      frameRate: 20,
      repeat: -1
    });
    this.ship1.play("ship_anim");

    this.keys = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(
      this.ship1,
      this.enemyShips,
      this.endGame,
      null,
      this
    );

    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion"),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: true
    });

    this.createPowerUps();
    this.createProjectiles();
  }

  createPowerUps() {
    this.powerUps = this.physics.add.group();

    this.powerUp1 = this.physics.add.sprite(0, 0, "pu");
    this.powerUp1.setRandomPosition(0, 0, this.sceneWidth, this.sceneHeight);
    this.powerUp1.setVelocity(100, 100);
    this.physics.world.setBoundsCollision();
    this.powerUp1.setCollideWorldBounds(true);
    this.powerUp1.setBounce(1);

    this.physics.add.overlap(
      this.powerUp1,
      this.ship1,
      this.onPowerUpPickup,
      null,
      this
    );
  }

  createProjectiles() {
    this.projectiles = this.add.group();
    this.anims.create({
      key: "beam_anim",
      frames: this.anims.generateFrameNumbers("beam"),
      frameRate: 20,
      repeat: -1
    });

    this.physics.add.overlap(
      this.projectiles,
      this.enemyShips,
      this.hitEnemy,
      null,
      this
    );
  }

  hitEnemy(projectile, enemyShip) {
    projectile.destroy();

    this.score = this.score + 1;
    this.updateScore();

    this.resetShipPosition(enemyShip);
  }

  onPowerUpPickup(powerup) {
    this.lives = this.lives + 1;
    this.updateLives();
    powerup.destroy();
  }

  update() {
    let speed = 2;

    if (this.keys.left.isDown && this.ship1.x > 0) {
      this.ship1.x = this.ship1.x - speed;
    } else if (this.keys.right.isDown && this.ship1.x < this.sceneWidth) {
      this.ship1.x = this.ship1.x + speed;
    }

    if (this.keys.up.isDown && this.ship1.y > 0) {
      this.ship1.y = this.ship1.y - speed;
    } else if (this.keys.down.isDown && this.ship1.y < this.sceneHeight) {
      this.ship1.y = this.ship1.y + speed;
    }

    this.ship2.y += 0.7;
    this.ship3.y += 1.1;

    if (this.ship2.y > this.sceneHeight) {
      this.resetShipPosition(this.ship2);
    }

    if (this.ship3.y > this.sceneHeight) {
      this.resetShipPosition(this.ship3);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      this.shootBeam();
    }
    for (var i = 0; i < this.projectiles.getChildren().length; i++) {
      var beam = this.projectiles.getChildren()[i];
      beam.update();
    }
  }

  shootBeam() {
    var beam = new Beam(this);
  }

  endGame() {
    this.lives = this.lives - 1;
    this.updateLives();

    if (this.lives <= 0) {
      this.ship1.setTexture("explosion");
      this.ship1.play("explode");
      this.scene.start("endgame");
    } else {
      this.ship1.y = this.sceneHeight / 2;
      this.ship1.x = this.sceneWidth / 2;
    }
  }

  resetShipPosition(ship) {
    ship.y = 0;
    ship.x = Math.random() * this.sceneWidth;
  }

  updateLives() {
    this.liveScoreText.setText("Lives: " + this.lives);
  }

  updateScore() {
    this.scoreText.setText("Score: " + this.score);
  }
}
