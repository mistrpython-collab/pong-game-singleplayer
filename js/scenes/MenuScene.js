class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // Judul
    this.add.text(400, 100, 'PONG', {
      fontSize: '96px', fill: '#FFF', fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 180, 'KLASIK 1972', {
      fontSize: '16px', fill: '#666', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Garis pemisah
    this.add.rectangle(400, 220, 400, 2, 0x333333);

    // Tombol Single Player
    this.createButton(400, 300, 'SINGLE PLAYER', () => {
      this.scene.start('SinglePlayerScene');
    });

    // Tombol Multiplayer
    this.createButton(400, 400, 'MULTIPLAYER', () => {
      this.scene.start('LobbyScene');
    });

    // Kontrol info
    this.add.text(400, 530, 'Single: W/S   |   Multiplayer: Mouse atau ↑/↓', {
      fontSize: '14px', fill: '#666', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    this.add.text(400, 560, 'First to 3 points wins!', {
      fontSize: '14px', fill: '#666', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);
  }

  createButton(x, y, text, onClick) {
    const btn = this.add.text(x, y, text, {
      fontSize: '28px', fill: '#FFF', fontFamily: 'Courier New, monospace',
      backgroundColor: '#111',
      padding: { x: 40, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#333' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#111' }));
    btn.on('pointerdown', onClick);

    return btn;
  }
}