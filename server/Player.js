
import Game from './Game.js';
class Player {
	constructor(id, name) {
		this.id = id;
		this.name = name;
		this.score = 0;
		this.game = new Game();
	}

	newGame() {
		this.game = new Game();
		this.score = 0;

	}
	updateScore(points) {
		this.score += points;
	}

}

export default Player;
