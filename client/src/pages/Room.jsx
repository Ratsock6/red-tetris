import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/Board";
import { socket } from "../lib/socket";
import "../styles/room.css";

export default function Room() {
  const { room, pseudo } = useParams();

  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    function onConnect() {
      setSocketId(socket.id);
      setStatus("connected");

      socket.emit("setPlayerName", pseudo);
      socket.emit("joinRoom", room);
    }


    function onDisconnect() {
      setStatus("disconnected");
      setSocketId(null);
    }

    function onJoined(roomId) {
      console.log("joinedRoom:", roomId);
      setStatus("ok");
    }

    function onFull(roomId) {
      console.log("roomFull:", roomId);
      setStatus("full");
    }

    function onGameUpdate(gameInfo) {
      console.log("gameUpdate reçu:", gameInfo);
      if (Array.isArray(gameInfo)) {
        setPlayers(gameInfo);
      }
    }

    function onGameStarted() {
      console.log("Game started");
    }


    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("joinedRoom", onJoined);
    socket.on("roomFull", onFull);
    socket.on("gameUpdate", onGameUpdate);
    socket.on("gameStarted", onGameStarted);

    if (!socket.connected) {
      socket.connect();
    } else {
      onConnect();
    }



    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("joinedRoom", onJoined);
      socket.off("roomFull", onFull);
      socket.off("gameUpdate", onGameUpdate);
      socket.off("gameStarted", onGameStarted);
      socket.disconnect();
    };
  }, [room, pseudo]);

  const currentPlayer = useMemo(() => {
    if (!socketId) return null;
    return players.find((p) => p.id === socketId) ?? null;
  }, [players, socketId]);

  const otherPlayers = useMemo(() => {
    if (!socketId) return players;
    return players.filter((p) => p.id !== socketId);
  }, [players, socketId]);

  const isHost = Boolean(currentPlayer?.isHost);
  const gameStarted = Boolean(currentPlayer?.gameActive);

  useEffect(() => {
    if (!gameStarted) return;

    function onKeyDown(event) {
      if (!socket.connected) return;
      console.log("Key pressed:", event.key);
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          socket.emit("moveBlock", -1);
          break;

        case "ArrowRight":
          event.preventDefault();
          socket.emit("moveBlock", 1);
          break;

        case "ArrowUp":
          event.preventDefault();
          socket.emit("RotateBlock", "clockwise");
          break;

        case "ArrowDown":
          event.preventDefault();
          socket.emit("dropBlock", 1);
          break;

        case " ":
          event.preventDefault();
          socket.emit("hardDrop", 1);
          break;

        case "z":
        case "Z":
          event.preventDefault();
          socket.emit("RotateBlock", "clockwise");
          break;

        case "x":
        case "X":
          event.preventDefault();
          socket.emit("RotateBlock", "counterclockwise");
          break;

        case "r":
        case "R":
          event.preventDefault();
          socket.emit("dropBlock");
          break;

        case "p":
        case "P":
          event.preventDefault();
          socket.emit("hardDrop");
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [gameStarted]);

  const startGame = () => {
    if (!isHost) return;
    console.log("Starting game...");
    socket.emit("startGame");
  };

  const stopGame = () => {
    if (!isHost) return;
    socket.emit("stopGame");
  };

  if (status === "full") {
    return (
      <main style={{ padding: 24 }}>
        <h1>Room {room}</h1>
        <p>Room is full.</p>
      </main>
    );
  }

  socket.emit("Gameinfo", (gameInfo) => {
    if (Array.isArray(gameInfo)) {
      setPlayers(gameInfo);
    }
  });

  if (!currentPlayer) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Room {room}</h1>
        <p>Connexion…</p>
        <p>Pseudo : {pseudo}</p>
        <p>Socket ID : {socketId ?? "en attente"}</p>
        <p>Players reçus : {players.length}</p>
      </main>
    );
  }

  return (
    <div className="room">
      <header className="roomHeader">
        <div>
          <h1 style={{ margin: 0 }}>Room : {room}</h1>
          <p style={{ margin: 0 }}>
            Player : <strong>{currentPlayer.name}</strong>{" "}
            {isHost && <strong>(Host)</strong>}
          </p>
          <p style={{ margin: "6px 0 0 0" }}>
            Status :{" "}
            <strong>{gameStarted ? "RUNNING" : "WAITING"}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {!gameStarted && (
            <button onClick={startGame} disabled={!isHost}>
              Start game
            </button>
          )}

          {gameStarted && isHost && (
            <button onClick={stopGame}>
              Stop game
            </button>
          )}
        </div>
      </header>

      {gameStarted ? (
        <section className="roomContent">
          <div className="playerPanel">
            <p style={{ margin: "10px 0" }}>
              Score : <strong>{currentPlayer.score ?? 0}</strong>
            </p>

            <Board grid={currentPlayer.gameState} />
          </div>

          <aside className="sidePanel">
            {otherPlayers.map((p) => (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{p.name}</strong>
                  <span>Score: {p.score ?? 0}</span>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Board grid={p.gameState} size={8} fog={true} />
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
                {p.name} {p.id === socketId && <strong>(You)</strong>}{" "}
                {p.isHost && <strong>(Host)</strong>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}