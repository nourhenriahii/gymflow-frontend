import Locker from "./Locker";
import { TOTAL_LOCKERS } from "../data/members";
import { getStatus } from "../utils/getStatus";
import "./LockerWall.css";

function LockerWall({ members, query, filter, onSelect }) {
  const numbers = Array.from({ length: TOTAL_LOCKERS }, (_, i) => i + 1);
  const q = query.trim().toLowerCase();

  return (
    <div className="wall">
      {numbers.map((n) => {
        const member = members.find((m) => m.locker === n);

        if (!member) {
          const freeDim = (q !== "" && String(n) !== q) || filter !== "all";
          return (
            <div key={n} className={`locker free ${freeDim ? "dim" : ""}`}>
              +
            </div>
          );
        }

        const matchesQuery =
          q === "" || member.name.toLowerCase().includes(q) || String(n) === q;

        const matchesFilter =
          filter === "all" || getStatus(member.endDate) === filter;

        return (
          <Locker
            key={n}
            number={n}
            name={member.name}
            endDate={member.endDate}
            plan={member.plan}
            dimmed={!(matchesQuery && matchesFilter)}
            onClick={() => onSelect(n)}
          />
        );
      })}
    </div>
  );
}

export default LockerWall;
