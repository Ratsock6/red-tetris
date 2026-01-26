import Block from './Block.js';
class Room {
	constructor(id) {
		this.id = id;
		this.players = [];
		this.max_players = 4;
		this.blocklist = Block.generateBlockList(10000);
		this.gameLoopInterval = null;
	}
	addPlayer(player) {
		if (this.players.length >= this.max_players) {
			return "Room is full"; // Room is full
		}
		if (this.players.find(p => p.id === player.id)) {
			return "Player already in the room"; // Player already in the room
		}
		if (this.players.find(p => p.name === player.name)) {
			return "Player name already taken"; // Player name already taken
		}
		this.players.push(player);
		return "Player added"; // Player successfully added
	}

	removePlayer(playerId) {
		this.players = this.players.filter(p => p.id !== playerId);
	}
	getPlayerCount() {
		return this.players.length;
	}
	getPlayers() {
		return this.players;
	}
	Get_all_players_info() {
		return this.players.map(player => ({
			id: player.id,
			name: player.name,
			score: player.score,
			gameSate: player.game.GetBoard()

		}));
	}
}

export default Room;
