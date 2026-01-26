const L_block = [
	[false, false, true],
	[true, true, true],
];
const line_block = [
	[true, true, true, true],
];
const RL_block = [
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

const RZ_block = [
	[false, true, true],
	[true, true, false],
];
const block_block = [
	[true, true],
	[true, true],
];

const BLOCKS = {
	1: L_block,
	2: line_block,
	3: RL_block,
	4: T_block,
	5: Z_block,
	6: RZ_block,
	7: block_block,
};
class block {
	constructor(id) {
		this.id = id;
		this.shape = BLOCKS[id];
	}

}

function generateBlockList(count) {
	const blockList = [];
	for (let i = 0; i < count; i++) {
		const randomId = Math.floor(Math.random() * 7) + 1;
		blockList.push(new block(randomId));
	}
	return blockList;
}

export default generateBlockList;
