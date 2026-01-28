
import Game from './Game.js';
class Player {
	constructor(id, name, room = null) {
		this.id = id;
		this.name = name;
		this.score = 0;
		this.room = room;
		this.blockIndex = 0;
		this.game = new Game(room ? room.blocklist : [], this.blockIndex);
		this.isHost = false;
	}

	newGame() {
		this.game = new Game(this.room ? this.room.blocklist : [], this.blockIndex);
		this.score = 0;

	}
	updateScore(points) {
		this.score += points;
	}

}

export default Player;
