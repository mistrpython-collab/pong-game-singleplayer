class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // ===== JUDUL (TENGAH) =====
    this.add.text(400, 150, 'PONG', {
      fontSize: '96px', fill: '#FFF', fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 230, 'KLASIK 1972', {
      fontSize: '16px', fill: '#666', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Garis pemisah
    this.add.rectangle(400, 280, 400, 2, 0x333333);

    // ===== TOMBOL SINGLE PLAYER (TENGAH) =====
    this.createButton(400, 380, 'SINGLE PLAYER', () => {
      this.scene.start('SinglePlayerScene');
    });

    // Info kontrol
    this.add.text(400, 520, 'Mouse: gerakkan  |  Keyboard: W/S atau ↑/↓', {
      fontSize: '12px', fill: '#666', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    this.add.text(400, 550, 'First to 3 points wins!', {
      fontSize: '12px', fill: '#666', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Tombol fullscreen
    this.createFullscreenButton();
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

  // ===== TOMBOL FULLSCREEN =====
  createFullscreenButton() {
    const isSupported = document.fullscreenEnabled || 
                        document.webkitFullscreenEnabled;

    if (!isSupported) return;

    const btnX = 745;
    const btnY = 30;
    const btnSize = 55;

    // Background (yang bisa diklik)
    const btnBg = this.add.rectangle(btnX, btnY, btnSize, btnSize, 0x111111)
      .setStrokeStyle(2, 0x555555)
      .setInteractive({ useHandCursor: true });

    // Icon ⛶
    const icon = this.add.text(btnX, btnY, '⛶', {
      fontSize: '28px', fill: '#FFFFFF', fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    icon.setInteractive({ useHandCursor: true });

    const onHoverIn = () => {
      btnBg.setFillStyle(0x333333);
      btnBg.setStrokeStyle(2, 0xFFFFFF);
    };
    const onHoverOut = () => {
      btnBg.setFillStyle(0x111111);
      btnBg.setStrokeStyle(2, 0x555555);
    };
    const onClick = () => this.toggleFullscreen();

    btnBg.on('pointerover', onHoverIn);
    btnBg.on('pointerout', onHoverOut);
    btnBg.on('pointerdown', onClick);

    icon.on('pointerover', onHoverIn);
    icon.on('pointerout', onHoverOut);
    icon.on('pointerdown', onClick);
  }

  toggleFullscreen() {
    const el = document.documentElement;

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      return;
    }

    const requestFs = el.requestFullscreen ||
                      el.webkitRequestFullscreen ||
                      el.mozRequestFullScreen ||
                      el.msRequestFullscreen;

    if (requestFs) {
      requestFs.call(el).catch(err => console.warn('Fullscreen gagal:', err));
    }
  }
}