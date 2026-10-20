import { getStatus, getDaysLeft } from "./getStatus";

const names = (list) => list.map((m) => m.name).join(", ");

export function botAnswer(text, members, total) {
  const t = text.toLowerCase();

  if (t.includes("expired")) {
    const list = members.filter((m) => getStatus(m.endDate) === "expired");
    return list.length
      ? `${list.length} expired: ${names(list)}.`
      : "No expired memberships.";
  }

  if (t.includes("soon") || t.includes("ending")) {
    const list = members.filter((m) => getStatus(m.endDate) === "warning");
    return list.length
      ? `${list.length} ending soon: ${names(list)}.`
      : "Nobody is ending soon.";
  }

  if (t.includes("owe") || t.includes("due") || t.includes("unpaid")) {
    const list = members.filter((m) => m.owes > 0);
    const sum = list.reduce((s, m) => s + m.owes, 0);
    return list.length
      ? `${list.length} members owe €${sum}: ${names(list)}.`
      : "Everyone has paid.";
  }

  if (t.includes("free")) {
    return `${total - members.length} lockers are free.`;
  }

  const num = t.match(/\d+/);
  if (num) {
    const n = Number(num[0]);

    if (n < 1 || n > total) {
      return `Locker ${n} does not exist. Lockers go from 1 to ${total}.`;
    }

    const m = members.find((x) => x.locker === n);
    return m
      ? `Locker ${m.locker}: ${m.name}, ${m.plan}, ${getDaysLeft(m.endDate)} days left.`
      : `Locker ${n} is free.`;
  }

  return "Try: who expired? who is ending soon? who owes money? how many free lockers? or type a locker number.";
}
