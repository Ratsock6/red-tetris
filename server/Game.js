const ROWS = 20;
const COLS = 10;
const GRAVITY_INTERVAL = 800; // milliseconds (0.8 second per line)

class Game {
	constructor(blockList = [], blockIndex = 0, onUpdate = null) {
		this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
		this.active = true;
		this.score = 0;
		this.blockList = blockList;
		this.blockIndex = blockIndex;
		this.current_block = 0;
		this.currentBlock = null;
		this.currentPosition = null;
		this.gravityTimer = null;
		this.onUpdate = onUpdate;

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
				this.score += 100;
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

	notifyUpdate() {
		if (this.onUpdate && typeof this.onUpdate === 'function') {
			this.onUpdate();
		}
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

		// Notifier les changements
		this.notifyUpdate();
	}
	hardDrop() {
		if (!this.active || !this.currentBlock || !this.currentPosition) return;

		this.clearBlock(this.currentBlock, this.currentPosition);

		let newPosition = { x: this.currentPosition.x, y: this.currentPosition.y };

		while (this.isValidPosition(this.currentBlock, { x: newPosition.x, y: newPosition.y + 1 })) {
			newPosition.y += 1;
		}

		this.currentPosition = newPosition;
		this.placeBlock(this.currentBlock, this.currentPosition);
		this.lockBlock();

		// Notifier les changements
		this.notifyUpdate();
	}
	moveBlock(direction) {

		if (direction !== -1 && direction !== 1) return;
		if (!this.active || !this.currentBlock || !this.currentPosition) return;


		const tempPosition = {
			x: this.currentPosition.x + direction,
			y: this.currentPosition.y
		};
		if (tempPosition.x < 0 || tempPosition.x + this.currentBlock.shape[0].length > COLS) return;
		this.clearBlock(this.currentBlock, this.currentPosition);

		const newPosition = {
			x: this.currentPosition.x + direction,
			y: this.currentPosition.y
		};

		if (this.isValidPosition(this.currentBlock, newPosition)) {
			this.currentPosition = newPosition;
			this.placeBlock(this.currentBlock, this.currentPosition);
		} else {
			this.placeBlock(this.currentBlock, this.currentPosition);
			this.lockBlock();
		}

		// Notifier les changements
		this.notifyUpdate();
	}
	rotateBlock(direction) {
		if (direction !== 'clockwise' && direction !== 'counterclockwise') return;
		if (!this.active || !this.currentBlock || !this.currentPosition) return;

		const rows = this.currentBlock.shape.length;
		const cols = this.currentBlock.shape[0].length;
		let rotatedShape = Array.from({ length: cols }, () => Array(rows));

		if (direction === 'clockwise') {
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					rotatedShape[c][rows - 1 - r] = this.currentBlock.shape[r][c];
				}
			}
		} else {
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					rotatedShape[cols - 1 - c][r] = this.currentBlock.shape[r][c];
				}
			}
		}

		const rotatedBlock = {
			...this.currentBlock,
			shape: rotatedShape
		};

		this.clearBlock(this.currentBlock, this.currentPosition);

		if (this.isValidPosition(rotatedBlock, this.currentPosition)) {
			this.currentBlock = rotatedBlock;
			this.placeBlock(this.currentBlock, this.currentPosition);
		} else {
			this.placeBlock(this.currentBlock, this.currentPosition);
		}

		// Notifier les changements
		this.notifyUpdate();
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
				this.endGame();
				return { gameOver: true, linesCleared };
			}

			this.placeBlock(this.currentBlock, this.currentPosition);
		}

		return { gameOver: false, linesCleared };
	}

	endGame() {
		this.active = false;
		this.stopGravity();
		this.currentBlock = null;
		this.currentPosition = null;
		this.notifyUpdate();
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
