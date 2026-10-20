import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { restoreSession, logout } from "./utils/auth";
import { setUnauthorizedHandler } from "./utils/api";
import Verify from "./pages/Verify";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));

    let alive = true;
    restoreSession().then((u) => {
      if (!alive) return;
      setUser(u);
      setChecking(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
  }

  if (checking) {
    return <p className="boot">Loading…</p>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route path="/register" element={<Register onLogin={setUser} />} />
      <Route path="/verify" element={<Verify onLogin={setUser} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
