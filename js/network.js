// Network manager yang aman untuk single player (tanpa server)
// dan siap untuk multiplayer di masa depan.
class NetworkManager {
  constructor() {
    // Jangan buat koneksi di sini. Cukup siapkan properti.
    this.socket = null;
    this.roomCode = null;
    this.playerIndex = null;
    this.listeners = {};
    this.isMultiplayerMode = false;
  }

  // Metode ini dipanggil HANYA saat pemain memilih mode multiplayer.
  connect() {
    if (this.isMultiplayerMode || this.socket) return; // Sudah terhubung
    console.log('🔌 Menghubungkan ke server untuk mode multiplayer...');
    this.socket = io(); // `io` tersedia dari socket.io-client CDN
    this.setupListeners();
    this.isMultiplayerMode = true;
  }

  setupListeners() {
    if (!this.socket) return;

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

  // Metode createRoom, joinRoom, dan sendPaddle sekarang
  // bisa dipanggil dengan aman karena akan mengecek koneksi.
  createRoom() {
    if (!this.socket) this.connect();
    this.socket.emit('createRoom');
  }

  joinRoom(code) {
    if (!this.socket) this.connect();
    this.socket.emit('joinRoom', { code });
  }

  sendPaddle(y) {
    // Kirim hanya jika ada koneksi dan mode multiplayer aktif.
    if (this.socket && this.roomCode) {
      this.socket.emit('paddleMove', { code: this.roomCode, y });
    }
  }
}

const network = new NetworkManager();