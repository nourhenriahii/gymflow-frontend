import { useState } from "react";
import "./App.css";
import { getStatus } from "./utils/getStatus";
import { members as initialMembers, PLANS } from "./data/members";
import LockerWall from "./components/LockerWall";
import MemberSheet from "./components/MemberSheet";

function App() {
  const [members, setMembers] = useState(initialMembers);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const selectedMember = members.find((m) => m.locker === selected);

  function updateMember(locker, changes) {
    setMembers(
      members.map((m) => (m.locker === locker ? { ...m, ...changes } : m)),
    );
  }

  function handleRenew(locker) {
    const member = members.find((m) => m.locker === locker);
    const plan = PLANS[member.plan];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const base = member.endDate > today ? member.endDate : today;
    const newEnd = new Date(base);
    newEnd.setDate(newEnd.getDate() + plan.days);

    updateMember(locker, {
      endDate: newEnd,
      owes: member.owes + plan.price,
    });
  }

  function handlePay(locker) {
    updateMember(locker, { owes: 0 });
  }

  const counts = members.reduce(
    (acc, m) => {
      acc[getStatus(m.endDate)] += 1;
      return acc;
    },
    { active: 0, warning: 0, expired: 0 },
  );

  return (
    <div>
      <h1>GymFlow</h1>

      <p>
        Active: {counts.active} | Ending soon: {counts.warning} | Expired:{" "}
        {counts.expired}
      </p>

      <input
        type="search"
        placeholder="Find a member or locker number"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={() => setFilter("all")}>All</button>
      <button onClick={() => setFilter("warning")}>Ending soon</button>
      <button onClick={() => setFilter("expired")}>Expired</button>

      <LockerWall
        members={members}
        query={query}
        filter={filter}
        onSelect={setSelected}
      />

      {selectedMember && (
        <MemberSheet
          member={selectedMember}
          onClose={() => setSelected(null)}
          onRenew={() => handleRenew(selectedMember.locker)}
          onPay={() => handlePay(selectedMember.locker)}
        />
      )}
    </div>
  );
}

export default App;
