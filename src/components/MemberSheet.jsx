import { useState } from "react";
import { getStatus, getDaysLeft } from "../utils/getStatus";
import useEscape from "../utils/useEscape";
import "./MemberSheet.css";

function MemberSheet({ member, onClose, onRenew, onPay, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const status = getStatus(member.endDate);
  const days = getDaysLeft(member.endDate);

  useEscape(onClose);

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="sheet" role="dialog" aria-label={`Member ${member.name}`}>
      <button className="sheet-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <h2>{member.name}</h2>
      <p>Locker: {member.locker}</p>
      <p>Plan: {member.plan}</p>
      <p>Ends: {member.endDate.toLocaleDateString("en-GB")}</p>
      <p>
        Status: {status} ({days} d)
      </p>
      <p>Amount due: €{member.owes}</p>

      {error && (
        <p className="sheet-error" role="alert">
          {error}
        </p>
      )}

      <button onClick={() => run(onRenew)} disabled={busy}>
        Renew {member.plan}
      </button>
      <button
        onClick={() => run(onPay)}
        disabled={busy || member.owes === 0}
      >
        {member.owes === 0 ? "Paid in full" : "Record payment"}
      </button>

      {confirming ? (
        <div className="confirm">
          <p>
            Remove {member.name} and free locker {member.locker}?
            {member.owes > 0 && ` They still owe €${member.owes}.`}
          </p>
          <button onClick={() => run(onRemove)} disabled={busy}>
            Yes, remove
          </button>
          <button onClick={() => setConfirming(false)} disabled={busy}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} disabled={busy}>
          Remove member
        </button>
      )}
    </aside>
  );
}

export default MemberSheet;
