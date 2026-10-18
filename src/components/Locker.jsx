import { getStatus, getDaysLeft } from "../utils/getStatus";
import "./Locker.css";
function Locker({ number, name, endDate, plan, dimmed, onClick }) {
  const status = getStatus(endDate);
  const days = getDaysLeft(endDate);

  return (
    <div
      className={`locker ${status} plan-${plan} ${dimmed ? "dim" : ""}`}
      onClick={onClick}
      aria-label={`Locker ${number}, ${name}, ${days} days left`}
    >
      <div className="cube">
        <div className="face inner" />
        <div className="face side" />
        <div className="face top" />
        <div className="face door">
          <span className="locker-number">{number}</span>
          <span className="locker-days">{days} d</span>
          <span className="led" />
        </div>
      </div>
    </div>
  );
}
export default Locker;
