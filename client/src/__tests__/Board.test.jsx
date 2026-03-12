import { render, screen } from "@testing-library/react";
import Board from "../components/Board";

describe("Board", () => {
  it("returns null when grid is not an array", () => {
    const { container } = render(<Board grid={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a board with the correct number of cells", () => {
    const grid = [
      [0, 1, 0],
      [2, 0, 3],
    ];

    const { container } = render(<Board grid={grid} />);

    const board = screen.getByRole("grid", { name: /tetris-board/i });
    expect(board).toBeInTheDocument();

    const cells = container.querySelectorAll(".cell");
    expect(cells).toHaveLength(6);
  });

  it("applies empty class for 0 values and vX class for filled values", () => {
    const grid = [[0, 2, 3]];

    const { container } = render(<Board grid={grid} />);

    const cells = container.querySelectorAll(".cell");

    expect(cells[0]).toHaveClass("cell", "empty");
    expect(cells[0]).toHaveAttribute("data-value", "0");

    expect(cells[1]).toHaveClass("cell", "v2");
    expect(cells[1]).toHaveAttribute("data-value", "2");

    expect(cells[2]).toHaveClass("cell", "v3");
    expect(cells[2]).toHaveAttribute("data-value", "3");
  });

  it("uses the default size when no size prop is provided", () => {
    const grid = [[0]];
    render(<Board grid={grid} />);

    const board = screen.getByRole("grid", { name: /tetris-board/i });
    expect(board).toHaveStyle("--size: 24");
    expect(board).toHaveStyle("--cell-size: 24px");
  });

  it("applies a custom size through CSS variables", () => {
    const grid = [[0]];
    render(<Board grid={grid} size={32} />);

    const board = screen.getByRole("grid", { name: /tetris-board/i });
    expect(board).toHaveStyle("--size: 32");
    expect(board).toHaveStyle("--cell-size: 32px");
  });

  it("renders ghost cells according to the first filled cell in each column when fog is enabled", () => {
    const grid = [
      [0, 0],
      [2, 0],
      [0, 3],
    ];

    const { container } = render(<Board grid={grid} fog />);

    const cells = container.querySelectorAll(".cell");

    expect(cells).toHaveLength(6);

    expect(cells[0]).toHaveClass("empty");
    expect(cells[1]).toHaveClass("empty");

    expect(cells[2]).toHaveClass("ghost");
    expect(cells[2]).toHaveAttribute("data-value", "1");

    expect(cells[3]).toHaveClass("empty");
    expect(cells[3]).toHaveAttribute("data-value", "0");

    expect(cells[4]).toHaveClass("ghost");
    expect(cells[4]).toHaveAttribute("data-value", "1");

    expect(cells[5]).toHaveClass("ghost");
    expect(cells[5]).toHaveAttribute("data-value", "1");
  });

  it("keeps columns empty in fog mode if they contain no filled cells", () => {
    const grid = [
      [0, 0],
      [0, 4],
      [0, 0],
    ];

    const { container } = render(<Board grid={grid} fog />);

    const cells = container.querySelectorAll(".cell");

    expect(cells[0]).toHaveClass("empty");
    expect(cells[2]).toHaveClass("empty");
    expect(cells[4]).toHaveClass("empty");

    expect(cells[1]).toHaveClass("empty");
    expect(cells[3]).toHaveClass("ghost");
    expect(cells[5]).toHaveClass("ghost");
  });
});