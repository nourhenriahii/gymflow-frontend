import { useState, useRef, useEffect } from "react";
import Locker from "./Locker";
import { COLS } from "../data/members";
import { getStatus } from "../utils/getStatus";
import "./LockerWall.css";

const PITCH_X = 70;
const PITCH_Y = 114;
const START_VIEW = { x: 58, z: -45 };
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function LockerWall({ members, total, query, filter, onSelect }) {
  const [view, setView] = useState(START_VIEW);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(1);
  const drag = useRef({ x: 0, y: 0, rx: 0, rz: 0 });
  const moved = useRef(false);
  const box = useRef(null);

  const rows = Math.ceil(total / COLS);
  const w = COLS * PITCH_X - 10;
  const h = rows * PITCH_Y - 54;
  const reach = (w + h) * 0.707; // العرض التقريبي بعد تدوير الأرضية 45 درجة
  const scale = fit * zoom;
  const height = (reach * 0.9 + 120) * scale;

  useEffect(() => {
    function measure() {
      setFit(Math.min(1, box.current.clientWidth / (reach + 80)));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reach]);

  const numbers = Array.from({ length: total }, (_, i) => i + 1);
  const q = query.trim().toLowerCase();

  function handlePointerDown(e) {
    drag.current = { x: e.clientX, y: e.clientY, rx: view.x, rz: view.z };
    moved.current = false;

    function onMove(ev) {
      const dx = ev.clientX - drag.current.x;
      const dy = ev.clientY - drag.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved.current = true;
      setView({
        x: clamp(drag.current.rx + dy * 0.3, 25, 75),
        z: drag.current.rz + dx * 0.4,
      });
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="viewport"
      ref={box}
      style={{ height }}
      onPointerDown={handlePointerDown}
      onClickCapture={(e) => {
        if (moved.current) {
          e.stopPropagation();
          moved.current = false;
        }
      }}
    >
      <div className="view-tools">
        <span>Drag to rotate</span>
        <button
          className="reset"
          onPointerDown={stop}
          onClick={() => setZoom(Math.max(0.5, +(zoom - 0.1).toFixed(1)))}
        >
          −
        </button>
        <button
          className="reset"
          onPointerDown={stop}
          onClick={() => setZoom(Math.min(2, +(zoom + 0.1).toFixed(1)))}
        >
          +
        </button>
        <button
          className="reset"
          onPointerDown={stop}
          onClick={() => {
            setView(START_VIEW);
            setZoom(1);
          }}
        >
          Reset view
        </button>
      </div>

      <div
        className="scene"
        style={{
          width: w,
          height: h,
          marginLeft: -w / 2,
          marginTop: -h / 2,
          transform: `scale(${scale}) rotateX(${view.x}deg) rotateZ(${view.z}deg)`,
        }}
      >
        <div className="floor" />

        {numbers.map((n) => {
          const i = n - 1;
          const pos = {
            left: (i % COLS) * PITCH_X,
            top: Math.floor(i / COLS) * PITCH_Y,
          };
          const member = members.find((m) => m.locker === n);

          if (!member) {
            const freeDim = (q !== "" && String(n) !== q) || filter !== "all";
            return (
              <div key={n} className="slot" style={pos}>
                <div
                  className={`locker free ${freeDim ? "dim" : ""}`}
                  onClick={() => onSelect(n)}
                  aria-label={`Locker ${n}, free. Add a member`}
                >
                  +
                </div>
              </div>
            );
          }

          const matchesQuery =
            q === "" ||
            member.name.toLowerCase().includes(q) ||
            String(n) === q;
          const matchesFilter =
            filter === "all" || getStatus(member.endDate) === filter;

          return (
            <div key={n} className="slot" style={pos}>
              <Locker
                number={n}
                name={member.name}
                endDate={member.endDate}
                plan={member.plan}
                dimmed={!(matchesQuery && matchesFilter)}
                onClick={() => onSelect(n)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LockerWall;
