import { useState } from "react";
import "./App.css";
import { getStatus } from "./utils/getStatus";
import {
  members as initialMembers,
  PLANS,
  COLS,
  TOTAL_LOCKERS,
} from "./data/members";
import LockerWall from "./components/LockerWall";
import MemberSheet from "./components/MemberSheet";
import AddMemberSheet from "./components/AddMemberSheet";
import NotificationBell from "./components/NotificationBell";
import ChatBot from "./components/ChatBot";

function App() {
  const [members, setMembers] = useState(initialMembers);
  const [total, setTotal] = useState(TOTAL_LOCKERS);
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

  function handleAdd(locker, { name, plan }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setDate(end.getDate() + PLANS[plan].days);

    const nextId = Math.max(0, ...members.map((m) => m.id)) + 1;

    setMembers([
      ...members,
      { id: nextId, name, locker, plan, endDate: end, owes: PLANS[plan].price },
    ]);
  }

  function handleRemove(locker) {
    setMembers(members.filter((m) => m.locker !== locker));
    setSelected(null);
  }

  // لا نسمح بحذف صف فيه أعضاء
  const canShrink =
    total > COLS && !members.some((m) => m.locker > total - COLS);

  const counts = members.reduce(
    (acc, m) => {
      acc[getStatus(m.endDate)] += 1;
      return acc;
    },
    { active: 0, warning: 0, expired: 0 },
  );

  const owed = members.reduce((sum, m) => sum + m.owes, 0);

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">GymFlow</span>
        <div className="topbar-right">
          <NotificationBell members={members} onSelect={setSelected} />
          <a
            className="btn"
            href="mailto:hello@gymflow.example?subject=Demo%20request"
          >
            Request a demo
          </a>
        </div>
      </header>

      <section className="hero">
        <h1>Step into your locker room.</h1>
        <p>
          Every member has a locker. Doors swing open as memberships run out.
          Tap any locker to renew or take a payment.
        </p>
      </section>

      <div className="stats">
        <div className="stat ok">
          <b>{counts.active}</b>
          <span>Active members</span>
        </div>
        <div className="stat warn">
          <b>{counts.warning}</b>
          <span>Ending within 7 days</span>
        </div>
        <div className="stat bad">
          <b>{counts.expired}</b>
          <span>Expired</span>
        </div>
        <div className="stat pool">
          <b>€{owed}</b>
          <span>Outstanding payments</span>
        </div>
      </div>

      <div className="tools">
        <input
          type="search"
          placeholder="Find a member or locker number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="chip"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className="chip"
          aria-pressed={filter === "warning"}
          onClick={() => setFilter("warning")}
        >
          Ending soon
        </button>
        <button
          className="chip"
          aria-pressed={filter === "expired"}
          onClick={() => setFilter("expired")}
        >
          Expired
        </button>
        <button className="chip" onClick={() => setTotal(total + COLS)}>
          + Add a row
        </button>
        <button
          className="chip"
          disabled={!canShrink}
          onClick={() => setTotal(total - COLS)}
        >
          − Remove empty row
        </button>
      </div>

      <div className="stage">
        <LockerWall
          members={members}
          total={total}
          query={query}
          filter={filter}
          onSelect={setSelected}
        />
      </div>

      {selectedMember && (
        <MemberSheet
          key={selectedMember.id}
          member={selectedMember}
          onClose={() => setSelected(null)}
          onRenew={() => handleRenew(selectedMember.locker)}
          onPay={() => handlePay(selectedMember.locker)}
          onRemove={() => handleRemove(selectedMember.locker)}
        />
      )}

      {selected !== null && !selectedMember && (
        <AddMemberSheet
          key={selected}
          locker={selected}
          onClose={() => setSelected(null)}
          onAdd={(data) => handleAdd(selected, data)}
        />
      )}

      <ChatBot members={members} total={total} />

      <footer className="footer">
        <span>
          Designed & built by <strong>Nourhen Riahi</strong>
        </span>
        <a
          href="https://github.com/nourhenriahii"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/nourhen-riahi"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
      </footer>
    </div>
  );
}

export default App;
