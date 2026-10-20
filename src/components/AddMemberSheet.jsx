import { useState } from "react";
import { PLANS } from "../config";
import useEscape from "../utils/useEscape";
import "./MemberSheet.css";

function AddMemberSheet({ locker, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEscape(onClose);

  async function handleSubmit(e) {
    e.preventDefault();
    if (name.trim() === "") return;

    setBusy(true);
    setError("");
    try {
      await onAdd({ name: name.trim(), plan });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <aside className="sheet" role="dialog" aria-label={`Locker ${locker}`}>
      <button
        type="button"
        className="sheet-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <h2>Locker {locker}</h2>
      <p>This locker is free. Add a member to assign it.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus
          />
        </label>

        <label>
          Plan
          <select value={plan} onChange={(e) => setPlan(e.target.value)}>
            {Object.keys(PLANS).map((p) => (
              <option key={p} value={p}>
                {p} (€{PLANS[p].price})
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="sheet-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy}>
          {busy ? "Adding..." : "Add member"}
        </button>
      </form>
    </aside>
  );
}

export default AddMemberSheet;
