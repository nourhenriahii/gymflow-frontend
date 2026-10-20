import { useState } from "react";
import { PLANS } from "../data/members";
import "./MemberSheet.css";

function AddMemberSheet({ locker, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("monthly");

  function handleSubmit(e) {
    e.preventDefault();
    if (name.trim() === "") return;
    onAdd({ name: name.trim(), plan });
  }

  return (
    <aside className="sheet">
      <button type="button" className="sheet-close" onClick={onClose}>
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

        <button type="submit">Add member</button>
      </form>
    </aside>
  );
}

export default AddMemberSheet;
