class MultiplayerGameScene extends Phaser.Scene {
  constructor() { super('MultiplayerGameScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    // Garis tengah
    for (let y = 0; y < 600; y += 30) {
      this.add.rectangle(400, y + 10, 4, 20, 0xFFFFFF).setOrigin(0.5);
    }

    // Paddles
    this.paddleLeft = this.add.rectangle(17, 250, 15, 100, 0xFFFFFF).setOrigin(0, 0);
    this.paddleRight = this.add.rectangle(768, 250, 15, 100, 0xFFFFFF).setOrigin(0, 0);

    // Bola
    this.ball = this.add.circle(400, 300, 8, 0xFFFFFF);

    // Skor
    this.scoreTextLeft = this.add.text(200, 50, '0', {
      fontSize: '64px', fill: '#FFF', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);
    this.scoreTextRight = this.add.text(600, 50, '0', {
      fontSize: '64px', fill: '#FFF', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Label
    const myIndex = network.playerIndex;
    this.add.text(200, 100, myIndex === 0 ? 'YOU' : 'LAWAN', {
      fontSize: '14px', fill: myIndex === 0 ? '#0F0' : '#666',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);
    this.add.text(600, 100, myIndex === 1 ? 'YOU' : 'LAWAN', {
      fontSize: '14px', fill: myIndex === 1 ? '#0F0' : '#666',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Info kontrol
    this.add.text(400, 570, 'Mouse: gerakkan  |  Keyboard: W/S atau ↑/↓', {
      fontSize: '12px', fill: '#555', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Winner text
    this.winnerText = this.add.text(400, 300, '', {
      fontSize: '64px', fill: '#FFF', fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // Back button
    const backBtn = this.add.text(50, 570, '← KELUAR', {
      fontSize: '14px', fill: '#666', fontFamily: 'Courier New, monospace'
    }).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      if (confirm('Keluar dari game?')) window.location.reload();
    });

    // State
    this.inputMode = 'mouse';
    this.lastSentY = -1;

    // ===== INPUT MOUSE =====
    this.input.on('pointermove', (pointer) => {
      const idx = network.playerIndex;
      if (idx === null) return;
      if (this.winnerText.visible) return;
      
      this.inputMode = 'mouse';
      const worldY = pointer.worldY !== undefined ? pointer.worldY : pointer.y;
      const y = Phaser.Math.Clamp(worldY - 50, 0, 500);
      
      // Kirim ke server (hanya kalau berubah)
      if (Math.abs(y - this.lastSentY) > 2) {
        this.lastSentY = y;
        network.sendPaddle(y);
      }
    });

    // ===== INPUT KEYBOARD =====
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S');

    // Deteksi keyboard aktif
    this.input.keyboard.on('keydown-W', () => { this.inputMode = 'keyboard'; });
    this.input.keyboard.on('keydown-S', () => { this.inputMode = 'keyboard'; });
    this.input.keyboard.on('keydown-UP', () => { this.inputMode = 'keyboard'; });
    this.input.keyboard.on('keydown-DOWN', () => { this.inputMode = 'keyboard'; });

    // Listener dari server
    network.on('state', (state) => {
      this.updateFromServer(state);
    });
  }

  update() {
    const idx = network.playerIndex;
    if (idx === null || this.winnerText.visible) return;

    // ===== KONTROL KEYBOARD (hanya kalau inputMode = keyboard) =====
    if (this.inputMode === 'keyboard') {
      const myPaddle = (idx === 0) ? this.paddleLeft : this.paddleRight;
      let y = myPaddle.y;
      let moved = false;
      const speed = 8;

      // Host pakai W/S, Guest pakai ↑/↓
      if (idx === 0) {
        if (this.keys.W.isDown) { y -= speed; moved = true; }
        if (this.keys.S.isDown) { y += speed; moved = true; }
      } else {
        if (this.cursors.up.isDown) { y -= speed; moved = true; }
        if (this.cursors.down.isDown) { y += speed; moved = true; }
      }

      if (moved) {
        y = Phaser.Math.Clamp(y, 0, 500);
        network.sendPaddle(y);
        this.lastSentY = y;
      }
    }
  }

  updateFromServer(state) {
    const idx = network.playerIndex;

    // Update hanya paddle LAWAN (paddle kita di-control lokal)
    if (idx !== 0) {
      this.paddleLeft.y = state.paddles[0].y;
    }
    if (idx !== 1) {
      this.paddleRight.y = state.paddles[1].y;
    }

    // Update bola
    this.ball.x = state.ball.x;
    this.ball.y = state.ball.y;

    // Update skor
    this.scoreTextLeft.setText(state.score[0]);
    this.scoreTextRight.setText(state.score[1]);

    // Winner
    if (state.winner !== null && !this.winnerText.visible) {
      const text = (state.winner === idx) ? 'YOU WIN! 🎉' : 'YOU LOSE 😢';
      this.winnerText.setText(text);
      this.winnerText.setVisible(true);
    }
  }
}