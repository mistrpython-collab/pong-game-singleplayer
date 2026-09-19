class SinglePlayerScene extends Phaser.Scene {
  constructor() { super('SinglePlayerScene'); }

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
    this.add.text(200, 100, 'YOU', {
      fontSize: '14px', fill: '#0F0', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);
    this.add.text(600, 100, 'CPU', {
      fontSize: '14px', fill: '#666', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Info kontrol
    this.add.text(400, 570, 'Mouse: gerakkan  |  Keyboard: W/S atau ↑/↓', {
      fontSize: '12px', fill: '#555', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // State
    this.state = {
      ball: { x: 400, y: 300, vx: 5, vy: 3 },
      score: [0, 0],
      winner: null
    };

    this.inputMode = 'mouse';
    this.aiSpeed = 5;
    this.aiReaction = 0.08;

    // ===== INPUT MOUSE =====
    this.input.on('pointermove', (pointer) => {
      if (this.state.winner !== null) return;
      this.inputMode = 'mouse';
      const worldY = pointer.worldY !== undefined ? pointer.worldY : pointer.y;
      this.paddleLeft.y = Phaser.Math.Clamp(worldY - 50, 0, 500);
    });

    // ===== INPUT KEYBOARD =====
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,S');

    this.input.keyboard.on('keydown-W', () => { this.inputMode = 'keyboard'; });
    this.input.keyboard.on('keydown-S', () => { this.inputMode = 'keyboard'; });
    this.input.keyboard.on('keydown-UP', () => { this.inputMode = 'keyboard'; });
    this.input.keyboard.on('keydown-DOWN', () => { this.inputMode = 'keyboard'; });

    // ESC untuk kembali
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  update() {
    if (this.state.winner !== null) return;

    // ===== KONTROL PEMAIN BERDASARKAN inputMode =====
    if (this.inputMode === 'keyboard') {
      const speed = 8;
      if (this.keys.W.isDown || this.cursors.up.isDown) {
        this.paddleLeft.y = Math.max(0, this.paddleLeft.y - speed);
      }
      if (this.keys.S.isDown || this.cursors.down.isDown) {
        this.paddleLeft.y = Math.min(500, this.paddleLeft.y + speed);
      }
    }

    // ===== AI =====
    const targetY = this.state.ball.y - 50;
    const diff = targetY - this.paddleRight.y;
    if (Math.abs(diff) > 5) {
      this.paddleRight.y += Math.sign(diff) * Math.min(this.aiSpeed, Math.abs(diff) * this.aiReaction);
    }
    this.paddleRight.y = Math.max(0, Math.min(500, this.paddleRight.y));

    // Update bola
    this.updateBall();

    // Render
    this.ball.x = this.state.ball.x;
    this.ball.y = this.state.ball.y;
    this.scoreTextLeft.setText(this.state.score[0]);
    this.scoreTextRight.setText(this.state.score[1]);

    // Cek menang
    if (this.state.winner !== null) {
      this.showWinner(this.state.winner === 0 ? 'YOU WIN! 🎉' : 'CPU WINS! 😢');
    }
  }

  updateBall() {
    const ball = this.state.ball;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Pantul atas/bawah
    if (ball.y <= 8) { ball.y = 8; ball.vy = Math.abs(ball.vy); }
    if (ball.y >= 592) { ball.y = 592; ball.vy = -Math.abs(ball.vy); }

    // Paddle kiri (pemain)
    if (ball.x <= 40 && ball.x >= 17 &&
        ball.y >= this.paddleLeft.y &&
        ball.y <= this.paddleLeft.y + 100 &&
        ball.vx < 0) {
      ball.vx = Math.abs(ball.vx) * 1.05;
      ball.x = 40;
    }

    // Paddle kanan (AI)
    if (ball.x >= 760 && ball.x <= 783 &&
        ball.y >= this.paddleRight.y &&
        ball.y <= this.paddleRight.y + 100 &&
        ball.vx > 0) {
      ball.vx = -Math.abs(ball.vx) * 1.05;
      ball.x = 760;
    }

    // Batas kecepatan
    const maxSpeed = 15;
    if (Math.abs(ball.vx) > maxSpeed) {
      ball.vx = Math.sign(ball.vx) * maxSpeed;
    }

    // Skor
    if (ball.x < -20) {
      this.state.score[1]++;
      if (this.state.score[1] >= 3) this.state.winner = 1;
      else this.resetBall();
    } else if (ball.x > 820) {
      this.state.score[0]++;
      if (this.state.score[0] >= 3) this.state.winner = 0;
      else this.resetBall();
    }
  }

  resetBall() {
    this.state.ball.x = 400;
    this.state.ball.y = 300;
    this.state.ball.vx = (Math.random() > 0.5 ? 5 : -5);
    this.state.ball.vy = (Math.random() * 4 - 2);
  }

  showWinner(text) {
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    this.add.text(400, 250, text, {
      fontSize: '64px', fill: '#FFF', fontFamily: 'Courier New, monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.text(400, 380, 'KEMBALI KE MENU', {
      fontSize: '24px', fill: '#FFF', fontFamily: 'Courier New, monospace',
      backgroundColor: '#111', padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#333' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#111' }));
    btn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}