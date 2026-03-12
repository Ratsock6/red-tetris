import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

const { default: Room } = await import("../pages/Room");
const { socket } = await import("../lib/socket");

const {
    mockNavigate,
    mockParams,
    socketHandlersRef,
    gameInfoResponseRef,
    intervalCallbacksRef,
} = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockParams: { room: "test-room", pseudo: "Antoine" },
    socketHandlersRef: { current: {} },
    gameInfoResponseRef: { current: [] },
    intervalCallbacksRef: { current: [] },
}));

let socketHandlers = {};
let gameInfoResponse = [];
let intervalCallbacks = [];

vi.mock("react-router-dom", () => ({
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
}));

vi.mock("../components/Board", () => ({
    default: ({ grid, size, fog }) => (
        <div
            data-testid="board"
            data-grid={JSON.stringify(grid ?? null)}
            data-size={size ?? "default"}
            data-fog={String(Boolean(fog))}
        >
            MockBoard
        </div>
    ),
}));

vi.mock("../lib/socket", () => ({
    socket: {
        id: "socket-1",
        connected: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
        emit: vi.fn((event, ...args) => {
            if (event === "Gameinfo") {
                const callback = args[0];
                if (typeof callback === "function") {
                    callback(gameInfoResponseRef.current);
                }
            }
        }),
        on: vi.fn((event, handler) => {
            socketHandlersRef.current[event] = handler;
        }),
        off: vi.fn((event) => {
            delete socketHandlersRef.current[event];
        }),
    },
}));

function setGameInfo(players) {
    gameInfoResponseRef.current = players;
}

function triggerSocketEvent(eventName, payload) {
    const handler = socketHandlersRef.current[eventName];
    if (handler) handler(payload);
}

describe("Room", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        socketHandlersRef.current = {};
        gameInfoResponseRef.current = [];
        intervalCallbacksRef.current = [];

        socket.id = "socket-1";
        socket.connected = true;

        socket.connect.mockClear();
        socket.disconnect.mockClear();
        socket.emit.mockClear();
        socket.on.mockClear();
        socket.off.mockClear();

        vi.spyOn(global, "setInterval").mockImplementation((cb) => {
            intervalCallbacksRef.current.push(cb);
            return 123;
        });

        vi.spyOn(global, "clearInterval").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // it("renders the full room screen when status becomes full", async () => {
    //     render(<Room />);

    //     await act(async () => {
    //         triggerSocketEvent("roomFull", "test-room");
    //     });

    //     expect(await screen.findByText(/room is full\./i)).toBeInTheDocument();
    //     expect(screen.getByRole("heading", { name: /room test-room/i })).toBeInTheDocument();
    // });

    it("renders connection screen when current player is not found", async () => {
        setGameInfo([
            {
                id: "socket-2",
                name: "OtherPlayer",
                isHost: true,
                gameStarted: false,
                gameActive: true,
                score: 0,
                gameState: [[0]],
            },
        ]);

        render(<Room />);

        expect(await screen.findByText(/connexion/i)).toBeInTheDocument();
        expect(screen.getByText(/pseudo : Antoine/i)).toBeInTheDocument();
        expect(screen.getByText(/players reçus : 1/i)).toBeInTheDocument();
    });

    // it("renders waiting room with player list and enabled start button for host", async () => {
    //     setGameInfo([
    //         {
    //             id: "socket-1",
    //             name: "Antoine",
    //             isHost: true,
    //             gameStarted: false,
    //             gameActive: true,
    //             score: 0,
    //             gameState: [[0]],
    //         },
    //         {
    //             id: "socket-2",
    //             name: "Jason",
    //             isHost: false,
    //             gameStarted: false,
    //             gameActive: true,
    //             score: 10,
    //             gameState: [[1]],
    //         },
    //     ]);

    //     render(<Room />);

    //     expect(await screen.findByText(/room : test-room/i)).toBeInTheDocument();
    //     expect(screen.getByText(/player :/i)).toBeInTheDocument();
    //     expect(screen.getByText(/Antoine/i)).toBeInTheDocument();
    //     expect(screen.getByText(/waiting/i)).toBeInTheDocument();

    //     expect(screen.getByText(/players/i)).toBeInTheDocument();
    //     expect(screen.getByText(/Jason/)).toBeInTheDocument();
    //     expect(screen.getByText(/\(You\)/i)).toBeInTheDocument();
    //     expect(screen.getByText(/\(Host\)/i)).toBeInTheDocument();

    //     const startButton = screen.getByRole("button", { name: /start game/i });
    //     expect(startButton).toBeEnabled();
    // });

    it("disables start button for non-host", async () => {
        setGameInfo([
            {
                id: "socket-1",
                name: "Antoine",
                isHost: false,
                gameStarted: false,
                gameActive: true,
                score: 0,
                gameState: [[0]],
            },
        ]);

        render(<Room />);

        const startButton = await screen.findByRole("button", { name: /start game/i });
        expect(startButton).toBeDisabled();
    });

    it("emits startGame when host clicks the start button", async () => {
        setGameInfo([
            {
                id: "socket-1",
                name: "Antoine",
                isHost: true,
                gameStarted: false,
                gameActive: true,
                score: 0,
                gameState: [[0]],
            },
        ]);

        render(<Room />);

        const startButton = await screen.findByRole("button", { name: /start game/i });
        fireEvent.click(startButton);

        expect(socket.emit).toHaveBeenCalledWith("startGame");
    });

    it("renders running game view with current board and opponent board", async () => {
        setGameInfo([
            {
                id: "socket-1",
                name: "Antoine",
                isHost: true,
                gameStarted: true,
                gameActive: true,
                score: 42,
                gameState: [[1, 0]],
            },
            {
                id: "socket-2",
                name: "Nathan",
                isHost: false,
                gameStarted: true,
                gameActive: false,
                score: 12,
                gameState: [[0, 1]],
            },
        ]);

        render(<Room />);

        expect(await screen.findByText(/running/i)).toBeInTheDocument();
        expect(screen.getByText(/score :/i)).toBeInTheDocument();
        expect(screen.getByText(/42/)).toBeInTheDocument();
        expect(screen.getByText(/Nathan/)).toBeInTheDocument();
        expect(screen.getByText(/Score: 12 \(mort\)/i)).toBeInTheDocument();

        const boards = screen.getAllByTestId("board");
        expect(boards).toHaveLength(2);

        expect(boards[0]).toHaveAttribute("data-size", "default");
        expect(boards[0]).toHaveAttribute("data-fog", "false");

        expect(boards[1]).toHaveAttribute("data-size", "8");
        expect(boards[1]).toHaveAttribute("data-fog", "true");
    });

    it("shows stop button and emits stopGame when host stops a running game", async () => {
        setGameInfo([
            {
                id: "socket-1",
                name: "Antoine",
                isHost: true,
                gameStarted: true,
                gameActive: true,
                score: 42,
                gameState: [[1]],
            },
        ]);

        render(<Room />);

        const stopButton = await screen.findByRole("button", { name: /stop game/i });
        fireEvent.click(stopButton);

        expect(socket.emit).toHaveBeenCalledWith("stopGame");
    });

    it("emits movement events on keydown when game is started", async () => {
        setGameInfo([
            {
                id: "socket-1",
                name: "Antoine",
                isHost: true,
                gameStarted: true,
                gameActive: true,
                score: 0,
                gameState: [[0]],
            },
        ]);

        render(<Room />);

        await screen.findByText(/running/i);

        fireEvent.keyDown(document, { key: "ArrowLeft" });
        fireEvent.keyDown(document, { key: "ArrowRight" });
        fireEvent.keyDown(document, { key: "ArrowUp" });
        fireEvent.keyDown(document, { key: "ArrowDown" });
        fireEvent.keyDown(document, { key: " " });
        fireEvent.keyDown(document, { key: "z" });
        fireEvent.keyDown(document, { key: "x" });
        fireEvent.keyDown(document, { key: "r" });
        fireEvent.keyDown(document, { key: "p" });
        fireEvent.keyDown(document, { key: "o" });

        expect(socket.emit).toHaveBeenCalledWith("moveBlock", -1);
        expect(socket.emit).toHaveBeenCalledWith("moveBlock", 1);
        expect(socket.emit).toHaveBeenCalledWith("RotateBlock", "clockwise");
        expect(socket.emit).toHaveBeenCalledWith("dropBlock", 1);
        expect(socket.emit).toHaveBeenCalledWith("hardDrop", 1);
        expect(socket.emit).toHaveBeenCalledWith("RotateBlock", "counterclockwise");
        expect(socket.emit).toHaveBeenCalledWith("dropBlock");
        expect(socket.emit).toHaveBeenCalledWith("hardDrop");
    });

    it("shows ranking screen when game started and all players are dead", async () => {
        setGameInfo([
            {
                id: "socket-1",
                name: "Antoine",
                isHost: true,
                gameStarted: true,
                gameActive: false,
                score: 20,
                gameState: [[0]],
            },
            {
                id: "socket-2",
                name: "Jason",
                isHost: false,
                gameStarted: true,
                gameActive: false,
                score: 50,
                gameState: [[0]],
            },
        ]);

        render(<Room />);

        expect(await screen.findByText(/fin de partie/i)).toBeInTheDocument();
        expect(screen.getByText(/classement/i)).toBeInTheDocument();
        expect(screen.getByText(/#1 Jason/i)).toBeInTheDocument();
        expect(screen.getByText(/#2 Antoine/i)).toBeInTheDocument();
        expect(screen.getByText(/\(You\)/i)).toBeInTheDocument();
        expect(screen.getByText(/\(Host\)/i)).toBeInTheDocument();
    });

    it("navigates back to home from ranking screen", async () => {
        setGameInfo([
            {
                id: "socket-1",
                name: "Antoine",
                isHost: true,
                gameStarted: true,
                gameActive: false,
                score: 20,
                gameState: [[0]],
            },
        ]);

        render(<Room />);

        const button = await screen.findByRole("button", { name: /retour au menu/i });
        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("registers socket listeners and polls Gameinfo", async () => {
        setGameInfo([
            {
                id: "socket-1",
                name: "Antoine",
                isHost: true,
                gameStarted: false,
                gameActive: true,
                score: 0,
                gameState: [[0]],
            },
        ]);

        render(<Room />);

        await waitFor(() => {
            expect(socket.on).toHaveBeenCalledWith("connect", expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith("joinedRoom", expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith("roomFull", expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith("gameUpdate", expect.any(Function));
            expect(socket.on).toHaveBeenCalledWith("gameStarted", expect.any(Function));
        });

        expect(socket.emit).toHaveBeenCalledWith("Gameinfo", expect.any(Function));
        expect(setInterval).toHaveBeenCalled();
    });
});