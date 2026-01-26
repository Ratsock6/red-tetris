import { describe, it, expect } from "vitest";
import Game from "../Game";

const ROWS = 20;
const COLS = 10;

function makeEmptyCells() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function makeFullRow(value = 1) {
  return Array(COLS).fill(value);
}

describe("Game", () => {
  it("Init 20x10 board filled with 0, active=true, current_block=0", () => {
    const game = new Game();

    expect(game.active).toBe(true);
    expect(game.current_block).toBe(0);

    const board = game.GetBoard();
    expect(board).toHaveLength(ROWS);
    board.forEach((row) => {
      expect(row).toHaveLength(COLS);
      row.forEach((cell) => expect(cell).toBe(0));
    });
  });

  it("GetBoard returns a reference to the internal board (current behavior)", () => {
    const game = new Game();
    const board = game.GetBoard();

    board[0][0] = 7;
    expect(game.GetBoard()[0][0]).toBe(7);
  });

  it("updateBoard copies values from cells", () => {
    const game = new Game();
    const cells = makeEmptyCells();
    cells[0][0] = 3;
    cells[19][9] = 8;

    game.updateBoard(cells);

    const board = game.GetBoard();
    expect(board[0][0]).toBe(3);
    expect(board[19][9]).toBe(8);
  });

  it("updateBoard does not keep the same reference for rows (copies cell by cell)", () => {
    const game = new Game();
    const cells = makeEmptyCells();
    game.updateBoard(cells);

    expect(game.GetBoard()[0]).not.toBe(cells[0]);
  });

  it("handleFullLines returns 0 if no line is full", () => {
    const game = new Game();
    const cleared = game.handleFullLines();

    expect(cleared).toBe(0);

    const board = game.GetBoard();
    board.forEach((row) => row.forEach((cell) => expect(cell).toBe(0)));
  });

  it("handleFullLines removes 1 full line at the bottom and inserts an empty line at the top", () => {
    const game = new Game();
    const board = game.GetBoard();

    board[ROWS - 1] = makeFullRow(1);

    const cleared = game.handleFullLines();
    expect(cleared).toBe(1);

    const newBoard = game.GetBoard();

    expect(newBoard[0].every((c) => c === 0)).toBe(true);

    expect(newBoard[ROWS - 1].every((c) => c === 0)).toBe(true);
  });

  it("handleFullLines removes multiple full lines (non-adjacent) and preserves order", () => {
    const game = new Game();
    const board = game.GetBoard();

    board[10][0] = 9;

    board[19] = makeFullRow(1);
    board[17] = makeFullRow(2);

    const cleared = game.handleFullLines();
    expect(cleared).toBe(2);

    const newBoard = game.GetBoard();

    expect(newBoard[0].every((c) => c === 0)).toBe(true);
    expect(newBoard[1].every((c) => c === 0)).toBe(true);

    const markerFound = newBoard.some((row) => row[0] === 9);
    expect(markerFound).toBe(true);
  });

  it("handleFullLines correctly handles 2 adjacent full lines", () => {
    const game = new Game();
    const board = game.GetBoard();

    board[19] = makeFullRow(1);
    board[18] = makeFullRow(1);

    const cleared = game.handleFullLines();
    expect(cleared).toBe(2);

    const newBoard = game.GetBoard();
    expect(newBoard[0].every((c) => c === 0)).toBe(true);
    expect(newBoard[1].every((c) => c === 0)).toBe(true);
  });
});
