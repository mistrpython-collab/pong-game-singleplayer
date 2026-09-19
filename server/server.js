const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Sajikan file client
app.use(express.static(path.join(__dirname, '../client')));

// Penyimpanan room
const rooms = {};

// ===== UTILITY FUNCTIONS =====

function generateRoomCode() {
  let code;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (rooms[code]); // Pastikan tidak duplikat
  return code;
}

function createInitialState() {
  return {
    ball: {
      x: 400, y: 300,
      vx: (Math.random() > 0.5 ? 5 : -5),
      vy: (Math.random() * 4 - 2)
    },
    paddles: [
      { x: 17, y: 250, width: 15, height: 100 },   // Kiri
      { x: 768, y: 250, width: 15, height: 100 }   // Kanan
    ],
    score: [0, 0],
    winner: null
  };
}

function resetBall(state) {
  state.ball.x = 400;
  state.ball.y = 300;
  state.ball.vx = (Math.random() > 0.5 ? 5 : -5);
  state.ball.vy = (Math.random() * 4 - 2);
}

function updateBall(state) {
  state.ball.x += state.ball.vx;
  state.ball.y += state.ball.vy;

  // Pantul atas/bawah
  if (state.ball.y <= 8) {
    state.ball.y = 8;
    state.ball.vy = Math.abs(state.ball.vy);
  }
  if (state.ball.y >= 592) {
    state.ball.y = 592;
    state.ball.vy = -Math.abs(state.ball.vy);
  }

  // Paddle kiri
  const p0 = state.paddles[0];
  if (state.ball.x <= p0.x + p0.width + 8 &&
      state.ball.x >= p0.x &&
      state.ball.y >= p0.y &&
      state.ball.y <= p0.y + p0.height &&
      state.ball.vx < 0) {
    state.ball.vx = Math.abs(state.ball.vx) * 1.05;
    state.ball.x = p0.x + p0.width + 8;
  }

  // Paddle kanan
  const p1 = state.paddles[1];
  if (state.ball.x >= p1.x - 8 &&
      state.ball.x <= p1.x + p1.width &&
      state.ball.y >= p1.y &&
      state.ball.y <= p1.y + p1.height &&
      state.ball.vx > 0) {
    state.ball.vx = -Math.abs(state.ball.vx) * 1.05;
    state.ball.x = p1.x - 8;
  }

  // Batasi kecepatan maksimum
  const maxSpeed = 15;
  if (Math.abs(state.ball.vx) > maxSpeed) {
    state.ball.vx = Math.sign(state.ball.vx) * maxSpeed;
  }

  // Skor
  if (state.ball.x < -20) {
    state.score[1]++;
    if (state.score[1] >= 3) {
      state.winner = 1;
    } else {
      resetBall(state);
    }
  } else if (state.ball.x > 820) {
    state.score[0]++;
    if (state.score[0] >= 3) {
      state.winner = 0;
    } else {
      resetBall(state);
    }
  }
}

// ===== SOCKET.IO HANDLERS =====

io.on('connection', (socket) => {
  console.log('✅ Pemain terhubung:', socket.id);

  // Buat room
  socket.on('createRoom', () => {
    const code = generateRoomCode();
    rooms[code] = {
      players: [socket.id],
      state: createInitialState(),
      started: false,
      interval: null
    };
    socket.join(code);
    socket.emit('roomCreated', { code });
    console.log(`🏠 Room ${code} dibuat oleh ${socket.id}`);
  });

  // Join room
  socket.on('joinRoom', ({ code }) => {
    const upperCode = code.toUpperCase();
    const room = rooms[upperCode];

    if (!room) {
      return socket.emit('errorMsg', 'Kode room tidak ditemukan');
    }
    if (room.players.length >= 2) {
      return socket.emit('errorMsg', 'Room sudah penuh');
    }
    if (room.started) {
      return socket.emit('errorMsg', 'Game sudah berjalan');
    }

    room.players.push(socket.id);
    socket.join(upperCode);
    socket.emit('joinedRoom', { code: upperCode, playerIndex: 1 });
    console.log(`👥 ${socket.id} join room ${upperCode}`);

    // Kalau 2 pemain → mulai
    if (room.players.length === 2) {
      room.started = true;
      io.to(upperCode).emit('gameStart');
      startGameLoop(upperCode);
    }
  });

  // Input paddle dari client
  socket.on('paddleMove', ({ code, y }) => {
    const room = rooms[code];
    if (!room || !room.started) return;
    const playerIndex = room.players.indexOf(socket.id);
    if (playerIndex === -1) return;
    room.state.paddles[playerIndex].y = Math.max(0, Math.min(500, y));
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Pemain terputus:', socket.id);
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.indexOf(socket.id);
      if (idx !== -1) {
        io.to(code).emit('playerLeft');
        if (room.interval) clearInterval(room.interval);
        delete rooms[code];
        console.log(`🗑️  Room ${code} ditutup`);
      }
    }
  });
});

function startGameLoop(code) {
  const room = rooms[code];
  if (!room) return;

  room.interval = setInterval(() => {
    if (!rooms[code]) return;
    if (room.state.winner === null) {
      updateBall(room.state);
    }
    io.to(code).emit('state', room.state);

    if (room.state.winner !== null) {
      clearInterval(room.interval);
    }
  }, 1000 / 60); // 60 FPS
}

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log(`📡 Buka browser dan akses URL tersebut untuk main`);
});