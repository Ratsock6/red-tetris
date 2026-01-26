import { describe, it, expect } from "vitest";
import Player from "../Player";
import Game from "../Game";

describe("Player", () => {
  it("Init a player", () => {
    const player = new Player("p1", "aallou-v");

    expect(player.id).toBe("p1");
    expect(player.name).toBe("aallou-v");
    expect(player.score).toBe(0);

    expect(player.game).toBeInstanceOf(Game);
    expect(player.game.active).toBe(true);

    const board = player.game.GetBoard();
    expect(board).toHaveLength(20);
    board.forEach((row) => {
      expect(row).toHaveLength(10);
      row.forEach((cell) => expect(cell).toBe(0));
    });
  });

  it("updates the score correctly", () => {
    const player = new Player("p1", "aallou-v");

    player.updateScore(10);
    player.updateScore(5);

    expect(player.score).toBe(15);
  });

  it("newGame resets the score and creates a new game", () => {
    const player = new Player("p1", "aallou-v");
    const oldGame = player.game;

    player.updateScore(42);
    const board = player.game.GetBoard();
    board[19][0] = 9;

    player.newGame();

    expect(player.score).toBe(0);
    expect(player.game).toBeInstanceOf(Game);
    expect(player.game).not.toBe(oldGame);

    const newBoard = player.game.GetBoard();
    expect(newBoard[19][0]).toBe(0);
    expect(player.game.active).toBe(true);
  });
});
