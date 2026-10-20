import { useState } from "react";
import { getStatus, getDaysLeft } from "../utils/getStatus";
import "./NotificationBell.css";

function message(m) {
  if (m.days < 0) return `Expired ${-m.days} days ago`;
  if (m.days === 0) return "Ends today";
  return `Ends in ${m.days} days`;
}

function NotificationBell({ members, onSelect }) {
  const [open, setOpen] = useState(false);

  const alerts = members
    .map((m) => ({
      ...m,
      days: getDaysLeft(m.endDate),
      status: getStatus(m.endDate),
    }))
    .filter((m) => m.status !== "active")
    .sort((a, b) => a.days - b.days);

  function handlePick(locker) {
    onSelect(locker);
    setOpen(false);
  }

  return (
    <div className="bell-wrap">
      <button
        className="bell"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Alerts, ${alerts.length} members need attention`}
      >
        Alerts
        {alerts.length > 0 && <span className="badge">{alerts.length}</span>}
      </button>

      {open && (
        <div className="alerts">
          {alerts.length === 0 && (
            <p className="alerts-empty">All memberships are up to date.</p>
          )}
          {alerts.map((m) => (
            <button
              key={m.id}
              className="alert"
              onClick={() => handlePick(m.locker)}
            >
              <span className={`dot ${m.status}`} />
              <strong>{m.name}</strong> (locker {m.locker})
              <small>{message(m)}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
