import "../styles/board.css";

export default function Board({ grid, size = "large" }) {
  if (!Array.isArray(grid)) return null;

  return (
    <div
      className={`board ${size === "small" ? "board--small" : "board--large"}`}
      role="grid"
      aria-label="tetris-board"
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const value = Number(cell) || 0;

          return (
            <div
              key={`${r}-${c}`}
              className={`cell ${value === 0 ? "empty" : `v${value}`}`}
              data-value={value}
            />
          );
        })
      )}
    </div>
  );
}
