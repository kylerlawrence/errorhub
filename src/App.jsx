import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import FixPage from "./pages/FixPage";

export default function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.className = newTheme;
  };

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <header className="flex justify-between p-4 shadow-md bg-white dark:bg-gray-800">
          <Link to="/" className="text-xl font-bold">ErrorHub</Link>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-blue-500 text-white"
          >
            Toggle {theme === "light" ? "Dark" : "Light"}
          </button>
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/error/:errorId" element={<FixPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
