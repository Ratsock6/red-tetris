import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { initializeSocket } from './socket.js';
// import Game from './Game.js';


const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

const rooms = new Map();

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, 'test.html'));
});

// Initialiser tous les événements socket
initializeSocket(io, rooms);

server.listen(3000, () => {
	console.log('server running at http://localhost:3000');
});
