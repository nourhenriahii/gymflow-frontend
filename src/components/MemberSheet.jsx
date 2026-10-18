import { getStatus, getDaysLeft } from "../utils/getStatus";
import "./MemberSheet.css";

function MemberSheet({ member, onClose, onRenew, onPay }) {
  const status = getStatus(member.endDate);
  const days = getDaysLeft(member.endDate);

  return (
    <aside className="sheet">
      <button className="sheet-close" onClick={onClose}>
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

      <button onClick={onRenew}>Renew {member.plan}</button>
      <button onClick={onPay} disabled={member.owes === 0}>
        {member.owes === 0 ? "Paid in full" : "Record payment"}
      </button>
    </aside>
  );
}

export default MemberSheet;
