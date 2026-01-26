const ROWS = 20;
const COLS = 10;
class Game {
	constructor(blockList = [], blockIndex = 0) {
		this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
		this.active = true;
		this.blockList = blockList;
		this.blockIndex = blockIndex;

		// Place initial block if blockList is provided
		if (blockList.length > 0) {
			const block = blockList[blockIndex];
			const initialPosition = { x: 3, y: 0 };
			this.placeBlock(block, initialPosition);
		}
	}
	updateBoard(cells) {
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				this.board[r][c] = cells[r][c];
			}
		}
	}
	placeBlock(block, position) {
		const { shape, id } = block;
		const { x, y } = position;
		for (let r = 0; r < shape.length; r++) {
			for (let c = 0; c < shape[r].length; c++) {
				if (shape[r][c]) {
					const boardRow = y + r;
					const boardCol = x + c;
					if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
						this.board[boardRow][boardCol] = id;
					}
				}
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
	GetBoard() {
		return this.board;
	}

}
export default Game;
