const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  input: {
    activePointers: 1,
    touch: { capture: true }
  },
  scene: [MenuScene, SinglePlayerScene]
};

const game = new Phaser.Game(config);