import Player from './Player.js';
import Room from './Room.js';


export function initializeSocket(io, rooms) {
	io.on('connection', (socket) => {
		console.log(socket.id, ' connected');
		let player = null;
		let currentRoom = null;

	socket.on('setPlayerName', (playerName) => {
		console.log('Player Name:', playerName);
		player = new Player(socket.id, playerName, null);
	});

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
			// Recreate player with room reference
			player = new Player(socket.id, player.name, room);
			if (room.addPlayer(player)) {
				currentRoom = room;
				socket.join(roomId);
				console.log(`Player ${socket.id} joined room ${roomId}`);
				player.game.printBoard();
				socket.emit('joinedRoom', roomId);
			} else {
				socket.emit('roomFull', roomId);
				console.log(`Room ${roomId} is full. Player ${socket.id} could not join.`);
			}
		});
		//game events
		socket.on('Gameinfo', () => {
			console.log('Game info requested');
			if (currentRoom) {
				socket.emit('gameinfo', currentRoom.Get_all_players_info());
				console.log('Game info sent');
			}
		});
	});
}
