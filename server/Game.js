const ROWS = 20;
const COLS = 10;
class Game {
	constructor() {
		this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
		this.active = true;
	}
	updateBoard(cells) {
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				this.board[r][c] = cells[r][c];
			}
		}
	}
	handleFullLines() {
		let linesCleared = 0;
		for (let r = ROWS - 1; r >= 0; r--) {
			if (this.board[r].every(cell => cell !== 0)) {
				this.board.splice(r, 1);
				this.board.unshift(Array(COLS).fill(0));
				linesCleared++;
				r++; // recheck the same row after shifting
			}
		}
		return linesCleared;
	}
	printBoard() {
		console.log(this.board.map(row => row.join(' ')).join('\n'));
	}

}
export default Game;
