import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import Player from './Player.js';
import Room from './Room.js';
// import Game from './Game.js';


const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

const rooms = new Map();

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, 'test.html'));
});

io.on('connection', (socket) => {

	socket.on('disconnect', () => {
		rooms.forEach((room) => {
			room.removePlayer(socket.id);
		});
		console.log(socket.id, ' disconnected');
	});
	console.log(socket.id, ' connected');
	const player = new Player(socket.id);
	player.game.printBoard();
	socket.on('joinRoom', (roomId) => {
		let room;
		if (rooms.has(roomId)) {
			room = rooms.get(roomId);
		} else {
			room = new Room(roomId);
			rooms.set(roomId, room);
		}
		if (room.addPlayer(player)) {
			socket.join(roomId);
			console.log(`Player ${socket.id} joined room ${roomId}`);
			socket.emit('joinedRoom', roomId);
		} else {
			socket.emit('roomFull', roomId);
			console.log(`Room ${roomId} is full. Player ${socket.id} could not join.`);
		}
	});
});

server.listen(3000, () => {
	console.log('server running at http://localhost:3000');
});
