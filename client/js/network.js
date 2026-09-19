class NetworkManager {
  constructor() {
    this.socket = io();
    this.roomCode = null;
    this.playerIndex = null;
    this.listeners = {};
    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Terhubung ke server');
    });

    this.socket.on('roomCreated', ({ code }) => {
      this.roomCode = code;
      this.playerIndex = 0;
      console.log('🏠 Room dibuat:', code);
      this.emit('roomCreated', { code });
    });

    this.socket.on('joinedRoom', ({ code, playerIndex }) => {
      this.roomCode = code;
      this.playerIndex = playerIndex;
      console.log('👥 Join room:', code, 'sebagai pemain', playerIndex);
      this.emit('joinedRoom', { code, playerIndex });
    });

    this.socket.on('gameStart', () => {
      console.log('🎮 Game dimulai!');
      this.emit('gameStart');
    });

    this.socket.on('state', (state) => {
      this.emit('state', state);
    });

    this.socket.on('errorMsg', (msg) => {
      alert(msg);
      this.emit('errorMsg', msg);
    });

    this.socket.on('playerLeft', () => {
      alert('Lawan meninggalkan game');
      window.location.reload();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Terputus dari server');
    });
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  createRoom() {
    this.socket.emit('createRoom');
  }

  joinRoom(code) {
    this.socket.emit('joinRoom', { code });
  }

  sendPaddle(y) {
    if (this.roomCode) {
      this.socket.emit('paddleMove', { code: this.roomCode, y });
    }
  }
}

const network = new NetworkManager();