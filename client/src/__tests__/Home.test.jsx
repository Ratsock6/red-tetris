import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Home from "../pages/Home";

const mockNavigate = vi.fn();
const mockIsAlphaNum = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("../utils/validation.js", () => ({
    isAlphaNum: (...args) => mockIsAlphaNum(...args),
}));

describe("Home", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        mockIsAlphaNum.mockReset();

        mockIsAlphaNum.mockImplementation((value) => /^[a-z0-9]+$/i.test(value));
    });

    it("renders title and form fields", () => {
        render(<Home />);

        expect(screen.getByRole("heading", { name: /red tetris/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Antwane")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Room code")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /join/i })).toBeInTheDocument();
    });

    it("disables join button when fields are empty", () => {
        render(<Home />);

        const joinButton = screen.getByRole("button", { name: /join/i });
        expect(joinButton).toBeDisabled();
    });

    it("enables join button when pseudo and room are valid", () => {
        render(<Home />);

        fireEvent.change(screen.getByPlaceholderText("Antwane"), {
            target: { value: "Antoine" },
        });
        fireEvent.change(screen.getByPlaceholderText("Room code"), {
            target: { value: "Room42" },
        });

        const joinButton = screen.getByRole("button", { name: /join/i });
        expect(joinButton).toBeEnabled();
    });

    it("shows validation error and disables join when values are not alphanumeric", () => {
        render(<Home />);

        fireEvent.change(screen.getByPlaceholderText("Antwane"), {
            target: { value: "Antoine!" },
        });
        fireEvent.change(screen.getByPlaceholderText("Room code"), {
            target: { value: "Room42" },
        });

        expect(
            screen.getByText(/should only contain alphanumeric characters/i)
        ).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /join/i })).toBeDisabled();
    });

    it("does not show validation error if only one field is filled", () => {
        render(<Home />);

        fireEvent.change(screen.getByPlaceholderText("Antwane"), {
            target: { value: "Antoine!" },
        });

        expect(
            screen.queryByText(/should only contain alphanumeric characters/i)
        ).not.toBeInTheDocument();
    });

    it("calls navigate on submit with valid values", () => {
        render(<Home />);

        fireEvent.change(screen.getByPlaceholderText("Antwane"), {
            target: { value: "Antoine" },
        });
        fireEvent.change(screen.getByPlaceholderText("Room code"), {
            target: { value: "Room42" },
        });

        fireEvent.click(screen.getByRole("button", { name: /join/i }));

        expect(mockNavigate).toHaveBeenCalledWith("/Room42/Antoine");
    });

    it("resets both fields when reset button is clicked", () => {
        render(<Home />);

        const pseudoInput = screen.getByPlaceholderText("Antwane");
        const roomInput = screen.getByPlaceholderText("Room code");

        fireEvent.change(pseudoInput, {
            target: { value: "Antoine" },
        });
        fireEvent.change(roomInput, {
            target: { value: "Room42" },
        });

        expect(pseudoInput).toHaveValue("Antoine");
        expect(roomInput).toHaveValue("Room42");

        fireEvent.click(screen.getByRole("button", { name: /reset/i }));

        expect(pseudoInput).toHaveValue("");
        expect(roomInput).toHaveValue("");
    });

    it("prevents submit navigation when button is disabled", () => {
        render(<Home />);

        fireEvent.change(screen.getByPlaceholderText("Antwane"), {
            target: { value: "Antoine!" },
        });
        fireEvent.change(screen.getByPlaceholderText("Room code"), {
            target: { value: "Room42" },
        });

        const joinButton = screen.getByRole("button", { name: /join/i });
        expect(joinButton).toBeDisabled();

        fireEvent.click(joinButton);

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});