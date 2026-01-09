class Room {
	constructor(id) {
		this.id = id;
		this.players = [];
		this.maxPlayers = 4;
	}
	addPlayer(player) {
		if (this.players.length < this.maxPlayers) {
			this.players.push(player);
			return true;
		}
		return false;
	}

	removePlayer(playerId) {
		this.players = this.players.filter(p => p.id !== playerId);
	}
}

export default Room;
