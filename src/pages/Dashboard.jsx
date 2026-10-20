import { useState, useEffect, useCallback } from "react";
import { getStatus } from "../utils/getStatus";
import { membersApi } from "../utils/api";
import { COLS, TOTAL_LOCKERS, MAX_LOCKERS } from "../config";
import LockerWall from "../components/LockerWall";
import MemberSheet from "../components/MemberSheet";
import AddMemberSheet from "../components/AddMemberSheet";
import NotificationBell from "../components/NotificationBell";
import ChatBot from "../components/ChatBot";

const TOTAL_KEY = "gymflow_total";

function readTotal() {
  try {
    const n = Number(localStorage.getItem(TOTAL_KEY));
    return Number.isInteger(n) && n >= COLS ? n : TOTAL_LOCKERS;
  } catch {
    return TOTAL_LOCKERS;
  }
}

function Dashboard({ onLogout }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [total, setTotal] = useState(readTotal);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const list = await membersApi.list();
      setMembers(list);
      // Make sure every saved locker fits on the wall.
      const highest = Math.max(0, ...list.map((m) => m.locker));
      setTotal((t) => Math.max(t, Math.ceil(highest / COLS) * COLS));
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    try {
      localStorage.setItem(TOTAL_KEY, String(total));
    } catch {}
  }, [total]);

  const selectedMember = members.find((m) => m.locker === selected);

  async function refresh() {
    try {
      setMembers(await membersApi.list());
    } catch {}
  }

  async function guarded(action) {
    try {
      return await action();
    } catch (err) {
      refresh();
      throw err;
    }
  }

  const replace = (updated) =>
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));

  const handleRenew = (member) =>
    guarded(async () => replace(await membersApi.renew(member.id)));

  const handlePay = (member) =>
    guarded(async () => replace(await membersApi.pay(member.id)));

  const handleAdd = (locker, { name, plan }) =>
    guarded(async () => {
      const created = await membersApi.create({ name, locker, plan });
      setMembers((prev) => [...prev, created]);
    });

  const handleRemove = (member) =>
    guarded(async () => {
      await membersApi.remove(member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      setSelected(null);
    });

  const canGrow = total + COLS <= MAX_LOCKERS;
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
          <button className="btn" onClick={onLogout}>
            Log out
          </button>
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

      {loadError && (
        <div className="banner" role="alert">
          <span>{loadError}</span>
          <button className="chip" onClick={loadMembers}>
            Retry
          </button>
        </div>
      )}

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
        <button
          className="chip"
          disabled={!canGrow}
          onClick={() => setTotal(total + COLS)}
        >
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
        {loading ? (
          <p className="status-line">Loading members…</p>
        ) : loadError ? null : (
          <LockerWall
            members={members}
            total={total}
            query={query}
            filter={filter}
            onSelect={setSelected}
          />
        )}
      </div>

      {selectedMember && (
        <MemberSheet
          key={selectedMember.id}
          member={selectedMember}
          onClose={() => setSelected(null)}
          onRenew={() => handleRenew(selectedMember)}
          onPay={() => handlePay(selectedMember)}
          onRemove={() => handleRemove(selectedMember)}
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
          Designed &amp; built by <strong>Nourhen Riahi</strong>
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

export default Dashboard;
