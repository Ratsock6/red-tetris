import Player from './Player.js';
import Room from './Room.js';


export function initializeSocket(io, rooms) {
	io.on('connection', (socket) => {
		console.log(socket.id, ' connected');
w
		const player = new Player(socket.id);
		player.game.printBoard();

		socket.on('disconnect', () => {
			rooms.forEach((room) => {
				room.removePlayer(socket.id);
			});
			console.log(socket.id, ' disconnected');
		});

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
}
