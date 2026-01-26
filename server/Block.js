const L_block = [
	[false, false, true],
	[true, true, true],
];
const I_block = [
	[true, true, true, true],
];
const J_block = [
	[true, false, false],
	[true, true, true],
];
const T_block = [
	[false, true, false],
	[true, true, true],
];
const Z_block = [
	[true, true, false],
	[false, true, true],
];

const S_block = [
	[false, true, true],
	[true, true, false],
];
const O_block = [
	[true, true],
	[true, true],
];

const BLOCKS = {
	1: L_block,
	2: I_block,
	3: J_block,
	4: T_block,
	5: Z_block,
	6: S_block,
	7: O_block,
};
class Block {
	constructor(id) {
		this.id = id;
		this.shape = BLOCKS[id];
	}

}

function generateBlockList(count) {
	const blockList = [];
	for (let i = 0; i < count; i++) {
		const randomId = Math.floor(Math.random() * 7) + 1;
		blockList.push(new Block(randomId));
	}
	return blockList;
}

export default generateBlockList;
