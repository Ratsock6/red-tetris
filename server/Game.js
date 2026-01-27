const ROWS = 20;
const COLS = 10;
const GRAVITY_INTERVAL = 800; // milliseconds (0.8 second per line)

class Game {
	constructor(blockList = [], blockIndex = 0) {
		this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
		this.active = true;
		this.blockList = blockList;
		this.blockIndex = blockIndex;
		this.currentBlock = null;
		this.currentPosition = null;
		this.gravityTimer = null;

		// Place initial block if blockList is provided
		if (blockList.length > 0) {
			const block = blockList[blockIndex];
			this.currentPosition = { x: 3, y: 0 };
			this.currentBlock = block;
			this.placeBlock(block, this.currentPosition);
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
				r++;
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

	isValidPosition(block, position) {
		if (!block || !position) return false;
		
		const { shape, id } = block;
		const { x, y } = position;
		
		for (let r = 0; r < shape.length; r++) {
			for (let c = 0; c < shape[r].length; c++) {
				if (shape[r][c]) {
					const boardRow = y + r;
					const boardCol = x + c;
					
					if (boardRow < 0 || boardRow >= ROWS || boardCol < 0 || boardCol >= COLS) {
						return false;
					}
					
					if (this.board[boardRow][boardCol] !== 0) {
						return false;
					}
				}
			}
		}
		return true;
	}

	clearBlock(block, position) {
		if (!block || !position) return;
		
		const { shape, id } = block;
		const { x, y } = position;
		
		for (let r = 0; r < shape.length; r++) {
			for (let c = 0; c < shape[r].length; c++) {
				if (shape[r][c]) {
					const boardRow = y + r;
					const boardCol = x + c;
					if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
						if (this.board[boardRow][boardCol] === id) {
							this.board[boardRow][boardCol] = 0;
						}
					}
				}
			}
		}
	}

	applyGravity() {
		if (!this.active || !this.currentBlock || !this.currentPosition) return;
		
		this.clearBlock(this.currentBlock, this.currentPosition);
		
		const newPosition = { x: this.currentPosition.x, y: this.currentPosition.y + 1 };
		
		if (this.isValidPosition(this.currentBlock, newPosition)) {
			this.currentPosition = newPosition;
			this.placeBlock(this.currentBlock, this.currentPosition);
		} else {
			this.placeBlock(this.currentBlock, this.currentPosition);
			this.lockBlock();
		}
	}

	lockBlock() {
		this.currentBlock = null;
		this.currentPosition = null;
		
		const linesCleared = this.handleFullLines();
		
		if (this.active && this.blockIndex < this.blockList.length) {
			this.blockIndex++;
			const nextBlock = this.blockList[this.blockIndex];
			this.currentBlock = nextBlock;
			this.currentPosition = { x: 3, y: 0 };
			
			if (!this.isValidPosition(this.currentBlock, this.currentPosition)) {
				this.active = false;
				return { gameOver: true, linesCleared };
			}
			
			this.placeBlock(this.currentBlock, this.currentPosition);
		}
		
		return { gameOver: false, linesCleared };
	}

	startGravity() {
		if (this.gravityTimer) {
			clearInterval(this.gravityTimer);
		}
		
		this.gravityTimer = setInterval(() => {
			this.applyGravity();
		}, GRAVITY_INTERVAL);
	}

	stopGravity() {
		if (this.gravityTimer) {
			clearInterval(this.gravityTimer);
			this.gravityTimer = null;
		}
	}

}
export default Game;
