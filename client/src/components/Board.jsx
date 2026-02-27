import "../styles/board.css";

export default function Board({ grid, size = 24, fog = false }) {
  if (!Array.isArray(grid)) return null;

  function applyHeightFog(grid) {
    const rows = grid.length;
    const cols = grid[0].length;

    const newGrid = Array.from({ length: rows }, () =>
      Array(cols).fill(0)
    );

    for (let c = 0; c < cols; c++) {
      let firstFilled = rows;

      for (let r = 0; r < rows; r++) {
        if (Number(grid[r][c]) !== 0) {
          firstFilled = r;
          break;
        }
      }

      if (firstFilled !== rows) {
        for (let r = firstFilled; r < rows; r++) {
          newGrid[r][c] = 1;
        }
      }
    }

    return newGrid;
  }

  if (fog) {
    grid = applyHeightFog(grid);
  }

  return (
    <div
      className={`board`}
      style={{ 
        "--size": size,
        "--cell-size": `${size}px`
      }}
      role="grid"
      aria-label="tetris-board"
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const value = Number(cell) || 0;

          return (
            <div
              key={`${r}-${c}`}
              className={`cell ${value === 0 ? "empty" : fog ? "ghost" : `v${value}`}`}
              data-value={value}
            />
          );
        })
      )}
    </div>
  );
}
