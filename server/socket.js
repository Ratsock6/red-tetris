import Player from './Player.js';
import Room from './Room.js';


export function initializeSocket(io, rooms) {
	io.on('connection', (socket) => {
		console.log(socket.id, ' connected');
		let player = null;
		let currentRoom = null;

		socket.on('setPlayerName', (playerName) => {
			console.log('Player Name:', playerName);
			player = new Player(socket.id, playerName, null, null);
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
			const onGameUpdate = () => {
				if (currentRoom) {
					const gameInfo = currentRoom.Get_all_players_info();
					io.to(roomId).emit('gameUpdate', gameInfo);
				}
			};
			player = new Player(socket.id, player.name, room, onGameUpdate);
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
		// -1 : left, 1: right
		socket.on('moveBlock', (direction) => {
			if (currentRoom && player) {
				player.game.moveBlock(direction);
				console.log(`Player ${socket.id} moved block ${direction}`);
			}
		});
		socket.on('hardDrop', () => {
			if (currentRoom && player) {
				player.game.hardDrop();
				console.log(`Player ${socket.id} performed hard drop`);
			}
		});
		socket.on('dropBlock', () => {
			if (currentRoom && player) {
				player.game.applyGravity();
				console.log(`Player ${socket.id} dropped block`);
			}
		});

		socket.on('RotateBlock', (direction) => {
			if (currentRoom && player) {
				player.game.rotateBlock(direction);
				console.log(`Player ${socket.id} rotated block ${direction}`);
			}
		});

		// Start the game and gravity loop
		socket.on('startGame', () => {
			if (!player.isHost) {
				console.log(`Player ${socket.id} is not the host and cannot start the game.`);
				socket.emit('notHost');
				return;
			}
			if (currentRoom && player) {
				for (const p of currentRoom.players) {
					p.game.startGravity();
					console.log(`Game started for player ${socket.id}`);
					socket.emit('gameStarted');
				}
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
