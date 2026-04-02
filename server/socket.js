import Player from './Player.js';
import Room from './Room.js';

export function initializeSocket(io, rooms) {
	io.on('connection', (socket) => {
		console.log(socket.id, ' connected');

		let player = null;
		let currentRoom = null;
		let playerName = null;

		// Set player name first
		socket.on('setPlayerName', (name) => {
			console.log('Player Name:', name);
			playerName = name;
		});

		socket.on('joinRoom', (roomId) => {
			if (!playerName) {
				socket.emit('error', 'Player name not set');
				return;
			}

			let room;

			if (rooms.has(roomId)) {
				room = rooms.get(roomId);
			} else {
				room = new Room(roomId);
				room.gameStarted = false;
				rooms.set(roomId, room);
				console.log("New room created:", roomId);
			}

			const onGameUpdate = () => {
				if (currentRoom && player) {
					const gameInfo = currentRoom.Get_all_players_info();
					io.to(roomId).emit('gameUpdate', gameInfo);
				}
			};

			player = new Player(socket.id, playerName, room, onGameUpdate);

			const result = room.addPlayer(player);

			if (result === "Player added") {
				currentRoom = room;
				socket.join(roomId);

				console.log(`Player ${socket.id} joined room ${roomId}`);

				if (player.game) {
					player.game.printBoard();
				}

				socket.emit('joinedRoom', roomId);
			} else {
				socket.emit('roomFull', roomId);
				console.log(`Room ${roomId} join failed: ${result}`);
			}
		});

		socket.on('disconnect', () => {
			console.log(socket.id, ' disconnected');

			if (currentRoom) {
				currentRoom.removePlayer(socket.id);

				// Clean empty room
				if (currentRoom.players.length === 0) {
					rooms.delete(currentRoom.id);
					console.log(`Room ${currentRoom.id} deleted as it became empty.`);
				}
			}

			currentRoom = null;
			player = null;

			socket.leaveAll();
		});

		// ---------------- GAME EVENTS ----------------

		socket.on('Gameinfo', (callback) => {
			if (currentRoom) {
				const gameInfo = currentRoom.Get_all_players_info();

				if (typeof callback === 'function') {
					callback(gameInfo);
				} else {
					socket.emit('gameinfo', gameInfo);
				}
			}
		});

		socket.on('moveBlock', (direction) => {
			if (!player || !player.game || !player.game.active) return;

			player.game.moveBlock(direction);
		});

		socket.on('hardDrop', () => {
			if (!player || !player.game || !player.game.active) return;

			player.game.hardDrop();
		});

		socket.on('dropBlock', () => {
			if (!player || !player.game || !player.game.active) return;

			player.game.applyGravity();
		});

		socket.on('RotateBlock', (direction) => {
			if (!player || !player.game || !player.game.active) return;

			player.game.rotateBlock(direction);
		});

		// ---------------- GAME CONTROL ----------------

		socket.on('startGame', () => {
			if (!player) return;

			if (player.game.active) return;

			if (!player.isHost) {
				socket.emit('notHost');
				return;
			}

			if (currentRoom) {
				currentRoom.gameStarted = true;

				for (const p of currentRoom.players) {
					p.game.startGravity();
				}

				io.to(currentRoom.id).emit('gameStarted');
				console.log(`Game started in room ${currentRoom.id}`);
			}
		});

		socket.on('stopGame', () => {
			if (!player) return;

			if (!player.isHost) {
				socket.emit('notHost');
				return;
			}

			if (currentRoom) {
				for (const p of currentRoom.players) {
					p.game.active = false;
					p.game.stopGravity();
				}

				currentRoom.gameStarted = false;

				io.to(currentRoom.id).emit('gameStopped');
				console.log(`Game stopped in room ${currentRoom.id}`);
			}
		});
	});
}
