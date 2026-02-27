import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/Board";
import { socket } from "../lib/socket";
import "../styles/room.css";

export default function Room() {
  const { room, pseudo } = useParams();

  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    socket.connect();

    socket.emit("setPlayerName", pseudo);
    socket.emit("joinRoom", room);

    const onJoined = () => setStatus("ok");
    const onFull = () => setStatus("full");
    const onUpdate = (gameInfo) => setPlayers(gameInfo);

    socket.on("joinedRoom", onJoined);
    socket.on("roomFull", onFull);
    socket.on("gameUpdate", onUpdate);

    // optionnel: snapshot
    socket.emit("Gameinfo", (gameInfo) => setPlayers(gameInfo));

    return () => {
      socket.off("joinedRoom", onJoined);
      socket.off("roomFull", onFull);
      socket.off("gameUpdate", onUpdate);
      socket.disconnect();
    };
  }, [room, pseudo]);

  const currentPlayer = useMemo(
    () => players.find((p) => p.name === pseudo) ?? null,
    [players, pseudo]
  );

  const otherPlayers = useMemo(
    () => players.filter((p) => p.name !== pseudo),
    [players, pseudo]
  );

  const isHost = Boolean(currentPlayer?.isHost);
  const gameStarted = Boolean(currentPlayer?.gameActive);

  const startGame = () => {
    if (!isHost) return;
    socket.emit("startGame");
  };

  if (status === "full") {
    return (
      <main style={{ padding: 24 }}>
        <h1>Room {room}</h1>
        <p>Room is full.</p>
      </main>
    );
  }

  if (!currentPlayer) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Room {room}</h1>
        <p>Connexion…</p>
        <p>Pseudo: {pseudo}</p>
        <p>Players reçus: {players.length}</p>
      </main>
    );
  }

  return (
    <div className="room">
      <header className="roomHeader">
        <div>
          <h1 style={{ margin: 0 }}>Room : {room}</h1>
          <p style={{ margin: 0 }}>
            Player : <strong>{pseudo}</strong> {isHost && <strong>(Host)</strong>}
          </p>
        </div>

        {!gameStarted && (
          <button onClick={startGame} disabled={!isHost}>
            Start game
          </button>
        )}
      </header>

      {gameStarted ? (
        <section className="roomContent">
          <div className="playerPanel">
            <p style={{ margin: "10px 0" }}>
              Score : <strong>{currentPlayer.score}</strong>
            </p>
            <Board grid={currentPlayer.gameSate} size={24} fog={false} />
          </div>

          <aside className="sidePanel">
            {otherPlayers.map((p) => (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{p.name}</strong>
                  <span>Score: {p.score}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Board grid={p.gameSate} size={14} fog />
                </div>
              </div>
            ))}
          </aside>
        </section>
      ) : (
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
    </div>
  );
}