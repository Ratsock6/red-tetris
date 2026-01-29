import Game from './Game.js';
class Player {
	constructor(id, name, room = null, onGameUpdate = null) {
		this.id = id;
		this.name = name;
		this.room = room;
		this.blockIndex = 0;
		this.score = 0;
		this.onGameUpdate = onGameUpdate; // Callback pour les mises à jour du jeu
		this.game = new Game(room ? room.blocklist : [], this.blockIndex, this.onGameUpdate);
		this.isHost = false;
	}

	updateScore(points) {
		this.score += points;
	}

	newGame() {
		this.score = 0;
		this.game = new Game(this.room ? this.room.blocklist : [], this.blockIndex, this.onGameUpdate);

	}

}

export default Player;
