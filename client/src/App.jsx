import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import FirstPage from "./pages/FirstPage.jsx";
import Room from "./pages/Room.jsx";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/firstpage" element={<FirstPage />} />
        <Route path="/:room/:pseudo" element={<Room />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}
