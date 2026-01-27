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
		socket.on('Gameinfo', (callback) => {
			console.log('Game info requested');
			if (currentRoom) {
				const gameInfo = currentRoom.Get_all_players_info();
				console.log('Game info sent:', gameInfo);
				if (typeof callback === 'function') {
					callback(gameInfo);
				} else {
					socket.emit('gameinfo', gameInfo);
				}
			}
		});

		// Start the game and gravity loop
		socket.on('startGame', () => {
			if (currentRoom && player) {
				player.game.startGravity();
				console.log(`Game started for player ${socket.id}`);
				socket.emit('gameStarted');
			}
		});

		// Stop the game and gravity loop
		socket.on('stopGame', () => {
			if (player) {
				player.game.stopGravity();
				console.log(`Game stopped for player ${socket.id}`);
			}
		});
	});
}
