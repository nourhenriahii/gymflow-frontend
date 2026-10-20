import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { verifyEmail, resendCode } from "../utils/auth";
import "./Login.css";

function Verify({ onLogin }) {
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const user = await verifyEmail(email, code);
      onLogin(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    try {
      await resendCode(email);
      setInfo("A new code was sent.");
      setCooldown(30);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>GymFlow</h1>
        <p>
          We sent a 6-digit code to <strong>{email}</strong>. It expires in 10
          minutes.
        </p>

        <label>
          Verification code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
          />
        </label>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        {info && <p>{info}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Confirm"}
        </button>

        <button
          type="button"
          className="link-btn"
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>

        <small>
          Wrong email? <Link to="/register">Go back</Link>
        </small>
      </form>
    </main>
  );
}

export default Verify;
