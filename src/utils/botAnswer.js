import { getStatus, getDaysLeft } from "./getStatus";

const names = (list) => list.map((m) => m.name).join(", ");

export function botAnswer(text, members, total) {
  const t = text.toLowerCase().trim();

  const lockerMatch =
    t.match(/\blocker\s*#?\s*(\d+)\b/) ?? t.match(/^#?(\d+)$/);
  if (lockerMatch) {
    const n = Number(lockerMatch[1]);

    if (n < 1 || n > total) {
      return `Locker ${n} does not exist. Lockers go from 1 to ${total}.`;
    }

    const m = members.find((x) => x.locker === n);
    return m
      ? `Locker ${m.locker}: ${m.name}, ${m.plan}, ${getDaysLeft(m.endDate)} days left.`
      : `Locker ${n} is free.`;
  }

  if (/\bexpired\b/.test(t)) {
    const list = members.filter((m) => getStatus(m.endDate) === "expired");
    return list.length
      ? `${list.length} expired: ${names(list)}.`
      : "No expired memberships.";
  }

  if (/\b(soon|ending)\b/.test(t)) {
    const list = members.filter((m) => getStatus(m.endDate) === "warning");
    return list.length
      ? `${list.length} ending soon: ${names(list)}.`
      : "Nobody is ending soon.";
  }

  if (/\b(owe|owes|owed|due|unpaid)\b/.test(t)) {
    const list = members.filter((m) => m.owes > 0);
    const sum = list.reduce((s, m) => s + m.owes, 0);
    return list.length
      ? `${list.length} members owe €${sum}: ${names(list)}.`
      : "Everyone has paid.";
  }

  if (/\bfree\b/.test(t)) {
    const used = members.filter((m) => m.locker <= total).length;
    return `${total - used} lockers are free.`;
  }

  return "Try: who expired? who is ending soon? who owes money? how many free lockers? or type a locker number.";
}
