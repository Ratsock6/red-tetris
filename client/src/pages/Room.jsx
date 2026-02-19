import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/Board";
import roomData from "../data/room.json";
import "../styles/home.css";

function normalizePlayers(data) {
  if (!Array.isArray(data)) return [];
  if (Array.isArray(data[0])) return data.flat();
  return data;
}

export default function Room() {
  const { room, pseudo } = useParams();
  const [gameStarted, setGameStarted] = useState(false);

  const players = useMemo(() => {
    return normalizePlayers(roomData);
  }, []);

  const currentPlayer = useMemo(() => {
    return players.find((p) => p.name === pseudo) ?? null;
  }, [players, pseudo]);

  const isHost = Boolean(currentPlayer?.isHost);

  const otherPlayers = useMemo(() => {
    return players.filter((p) => p.name !== pseudo);
  }, [players, pseudo]);

  const startGame = () => {
    if (!isHost) return;
    setGameStarted(true);
    console.log(`Host "${pseudo}" started game in room "${room}"`);
  };

  if (!currentPlayer) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Room : {room}</h1>
        <p>Player "{pseudo}" not found in room data.</p>
      </main>
    );
  }

   return (
    <div style={{ padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Room : {room}</h1>
          <p style={{ margin: 0 }}>
            Player : <strong>{pseudo}</strong> {isHost && <strong>(Host)</strong>}
          </p>
        </div>

        {!gameStarted && (
          <div>
            <button
              onClick={startGame}
              disabled={!isHost}
              title={!isHost ? "Only the host can start the game" : "Start game"}
              style={{
                padding: "10px 16px",
                fontSize: 16,
                cursor: isHost ? "pointer" : "not-allowed",
                opacity: isHost ? 1 : 0.6,
              }}
            >
              Start game
            </button>
            {!isHost && (
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                Waiting for host…
              </div>
            )}
          </div>
        )}
      </header>

      {!gameStarted && (
        <section style={{ marginTop: 18 }}>
          <h2>Players</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {players.map((p) => (
              <li key={p.id} style={{ padding: "6px 0" }}>
                {p.name} {p.name === pseudo && <strong>(You)</strong>}{" "}
                {p.isHost && <strong>(Host)</strong>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {gameStarted && (
        <section
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "1fr 320px", // gauche: ton board, droite: side panel
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* TON BOARD (grand) */}
          <div>
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>
                {currentPlayer.name} <span style={{ fontSize: 14, opacity: 0.8 }}>(You)</span>
              </h2>
              <p style={{ margin: 0 }}>Score : <strong>{currentPlayer.score}</strong></p>
            </div>

            <Board grid={currentPlayer.gameSate} size="large" />
          </div>

          {/* AUTRES JOUEURS (petit + score) */}
          <aside
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.15)",
              paddingLeft: 16,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Other players</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {otherPlayers.map((p) => (
                <div key={p.id} style={{ paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong>{p.name}</strong>
                    <span style={{ fontSize: 13, opacity: 0.85 }}>Score: {p.score}</span>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <Board grid={p.gameSate} size="small" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}


/*
export default function Room() {
  const { room, pseudo } = useParams();

  const players = useMemo(() => normalizePlayers(roomData), []);

  const currentPlayer = useMemo(() => {
    const found = players.find((p) => p?.name === pseudo);
    return found || players[0] || null;
  }, [players, pseudo]);

  const grid = currentPlayer?.gameSate;
  const score = currentPlayer?.score ?? -1;

  return (
    <div className="room-page">
      <header className="room-header">
        <h1>Room : {room}</h1>
        <p>
          Player : <strong>{pseudo}</strong>
        </p>
      </header>

      <main className="room-layout">
        <h1>{roomData[0]?.name || "Unknown Room"}</h1>
        
        <aside className="sidebar">
          <h2>Players</h2>
          <ul className="player-list">
            {players.map((p) => (
              <li
                key={p.id}
                className={
                  p.name === currentPlayer?.name ? "player active" : "player"
                }
              >
                <span className="player-name">{p.name}</span>
                <span className="player-score"> {p.score}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="board-section">
          <h2>
            Board — {currentPlayer?.name}
          </h2>
          <p className="score">Score : {score}</p>

          {Array.isArray(grid) ? (
            <div className="board-container">
              <Board grid={grid} />
            </div>
          ) : (
            <p className="error">
              Grid not found (expected field: <code>gameState</code>)
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
*/
