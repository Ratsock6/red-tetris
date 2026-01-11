import Block from './Block.js';
class Room {
	constructor(id) {
		this.id = id;
		this.players = [];
		this.max_players = 4;
		this.blocklist = Block.generateBlockList(10000);
	}
	addPlayer(player) {
		if (this.players.length < this.max_players) {
			this.players.push(player);
			return true;
		}
		return false;
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
}

export default Room;
