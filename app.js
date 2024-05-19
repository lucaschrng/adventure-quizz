import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { readFile } from 'fs/promises';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const port = 3000;
const playerScores = {};

app.use(express.static('public'));

function generateRoomId(length = 4) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

async function fetchQuizData(config) {
  const url = new URL('https://opentdb.com/api.php');
  url.searchParams.set('amount', config.amount);
  url.searchParams.set('category', config.category);
  url.searchParams.set('difficulty', config.difficulty);
  url.searchParams.set('type', config.type);

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function broadcastQuiz(room, quizData) {
  let currentIndex = 0;
  function sendNextQuestion() {
    if (currentIndex < quizData.results.length) {
      let countdownTime = 20;
      const countdownInterval = setInterval(() => {
        if (countdownTime === 20) {
          io.to(room).emit('displayQuestion', quizData.results[currentIndex]);
          currentIndex++;
        }

        io.to(room).emit('countdown', countdownTime);
        countdownTime--;

        if (countdownTime < 0) {
          clearInterval(countdownInterval);
          if (currentIndex < quizData.results.length) {
            setTimeout(sendNextQuestion, 1000);
          } else {
            const finalScores = Object.values(playerScores[room]);
            io.to(room).emit('quizOver', finalScores);
          }
        }
      }, 1000);
    }
  }
  sendNextQuestion();
}

app.get('/create-room', (req, res) => {
  const roomId = generateRoomId();
  res.redirect(`/${roomId}?admin=true`);
});

app.get('/:roomId', async (req, res) => {
  const roomId = req.params.roomId;
  try {
    let content = await readFile(`${process.cwd()}/public/room.html`, 'utf8');
    content = content.replace('<!--roomIdPlaceholder-->', roomId);
    res.send(content);
  } catch (error) {
    res.status(500).send("Error loading the room page.");
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (room, username) => {
    socket.join(room);
    if (!playerScores[room]) {
      playerScores[room] = {};
    }
    playerScores[room][socket.id] = { score: 0, username };
    console.log(`User ${username} (${socket.id}) joined room: ${room}`);
    io.to(room).emit('user-joined', room, playerScores[room]);
  });

  socket.on('leave-room', (room) => {
    if (playerScores[room] && playerScores[room][socket.id]) {
      const username = playerScores[room][socket.id].username;
      delete playerScores[room][socket.id];
      socket.leave(room);
      console.log(`User ${username} (${socket.id}) left room: ${room}`);
      io.to(room).emit('user-left', room, socket.id, playerScores[room]);
    }
  });

  socket.on('message', (room, { message, username }) => {
    io.to(room).emit('new-message', { message, username });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const room in playerScores) {
      if (playerScores[room][socket.id] !== undefined) {
        const username = playerScores[room][socket.id].username;
        delete playerScores[room][socket.id];
        io.to(room).emit('user-left', room, socket.id, playerScores[room]);
        break;
      }
    }
  });

  socket.on('startQuiz', async (room, config) => {
    try {
      const quizData = await fetchQuizData(config);
      let countdownTime = 5;
      const countdownInterval = setInterval(() => {
        io.to(room).emit('countdown', countdownTime);
        countdownTime--;
        if (countdownTime < 0) {
          clearInterval(countdownInterval);
          broadcastQuiz(room, quizData);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch quiz data:', error);
      socket.to(room).emit('error', 'Failed to start quiz');
    }
  });

  socket.on('answer', (data, room) => {
    const { answer, correctAnswer, time, isCorrect } = data;
    const elapsedTime = (Date.now() - time) / 1000;
    const points = Math.max(20 - Math.floor(elapsedTime), 1);

    if (!playerScores[room] || !playerScores[room].hasOwnProperty(socket.id)) {
      console.error(`No player score found for room: ${room} and user: ${socket.id}`);
      return;
    }

    if (isCorrect) {
      playerScores[room][socket.id].score += points;
    }

    console.log(`${socket.id} answered in room ${room}: ${isCorrect} at ${time}`);
    io.to(room).emit('score-update', playerScores[room]);
  });

  socket.on('resetScores', (room) => {
    if (playerScores[room]) {
      for (const playerId in playerScores[room]) {
        playerScores[room][playerId].score = 0;
      }
      io.to(room).emit('score-update', playerScores[room]);
    }
  });

  socket.on('restartQuiz', async (room, config) => {
    try {
      const quizData = await fetchQuizData(config);
      io.to(room).emit('quizData', quizData);
    } catch (error) {
      console.error('Failed to fetch quiz data:', error);
      socket.to(room).emit('error', 'Failed to restart quiz');
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
