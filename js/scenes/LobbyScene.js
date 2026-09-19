class LobbyScene extends Phaser.Scene {
  constructor() { super('LobbyScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(400, 80, 'MULTIPLAYER', {
      fontSize: '48px', fill: '#FFF', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // ===== OPSI 1: BUAT ROOM =====
    this.add.text(400, 160, 'Pemain 1 (Host)', {
      fontSize: '18px', fill: '#888', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    const createBtn = this.makeButton(400, 210, 'BUAT ROOM', () => {
      this.hideButtons();
      this.statusText.setText('Membuat room...');
      network.createRoom();
    });

    // ===== OPSI 2: JOIN ROOM =====
    this.add.text(400, 310, 'Pemain 2 (Join)', {
      fontSize: '18px', fill: '#888', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Input field (pakai DOM)
    this.inputCode = this.add.dom(400, 370).createFromHTML(
      '<input type="text" id="roomCodeInput" maxlength="6" placeholder="KODE" ' +
      'style="font-size:24px; padding:12px; text-align:center; ' +
      'text-transform:uppercase; width:180px; letter-spacing:4px;">'
    );

    const joinBtn = this.makeButton(400, 440, 'JOIN ROOM', () => {
      const code = document.getElementById('roomCodeInput').value.toUpperCase().trim();
      if (code.length === 6) {
        this.hideButtons();
        this.statusText.setText('Bergabung ke room ' + code + '...');
        network.joinRoom(code);
      } else {
        alert('Kode harus 6 karakter');
      }
    });

    // Tombol kembali
    const backBtn = this.add.text(50, 560, '← MENU', {
      fontSize: '18px', fill: '#888', fontFamily: 'Courier New, monospace'
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#FFF' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#888' }));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Status text
    this.statusText = this.add.text(400, 530, '', {
      fontSize: '18px', fill: '#0F0', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Simpan referensi tombol untuk hide
    this.buttons = [createBtn, joinBtn];
    this.hintText = this.add.text(400, 500, 'ESC: Kembali ke menu', {
      fontSize: '12px', fill: '#555', fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Setup network listeners
    network.on('roomCreated', ({ code }) => {
      this.statusText.setText(
        'ROOM CODE: ' + code + '\n\nBagikan kode ini ke temanmu\n\nMenunggu pemain lain...'
      );
      this.statusText.setFontSize(24);
      this.statusText.setAlign('center');
      this.statusText.setColor('#0F0');
    });

    network.on('gameStart', () => {
      this.statusText.setText('Game dimulai!');
      this.time.delayedCall(500, () => {
        this.scene.start('MultiplayerGameScene');
      });
    });

    // ESC
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  makeButton(x, y, text, onClick) {
    const btn = this.add.text(x, y, text, {
      fontSize: '24px', fill: '#FFF', fontFamily: 'Courier New, monospace',
      backgroundColor: '#111', padding: { x: 30, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#333' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#111' }));
    btn.on('pointerdown', onClick);
    return btn;
  }

  hideButtons() {
    this.buttons.forEach(b => b.setVisible(false));
    this.hintText.setVisible(false);
  }
}