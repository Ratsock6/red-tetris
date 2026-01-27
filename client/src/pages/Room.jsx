import { useMemo } from "react";
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

  const players = useMemo(() => normalizePlayers(roomData), []);

  const currentPlayer = useMemo(() => {
    const found = players.find((p) => p?.name === pseudo);
    return found || players[0] || null;
  }, [players, pseudo]);

  const grid = currentPlayer?.gameSate;
  const score = currentPlayer?.score ?? 0;

  return (
    <div className="room-page">
      <header className="room-header">
        <h1>Room : {room}</h1>
        <p>
          Joueur : <strong>{pseudo}</strong>
        </p>
      </header>

      <main className="room-layout">
        
        <aside className="sidebar">
          <h2>Joueurs</h2>
          <ul className="player-list">
            {players.map((p) => (
              <li
                key={p.id}
                className={
                  p.name === currentPlayer?.name ? "player active" : "player"
                }
              >
                <span className="player-name">{p.name}</span>
                <span className="player-score">{p.score}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="board-section">
          <h2>
            Plateau — {currentPlayer?.name}
          </h2>
          <p className="score">Score : {score}</p>

          {Array.isArray(grid) ? (
            <div className="board-container">
              <Board grid={grid} />
            </div>
          ) : (
            <p className="error">
              Grille introuvable (champ attendu : <code>gameSate</code>)
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
