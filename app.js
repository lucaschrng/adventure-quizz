import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
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

app.get('/create-room', (req, res) => {
  const roomId = generateRoomId();
  res.redirect(`/${roomId}`);
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

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    socket.to(room).emit('user-joined', room, socket.id);
  });

  socket.on('message', (room, message) => {
    io.to(room).emit('new-message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
