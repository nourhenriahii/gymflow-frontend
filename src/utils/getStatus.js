const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDaysLeft(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((endDate - today) / MS_PER_DAY);
}

export function getStatus(endDate) {
  const days = getDaysLeft(endDate);
  if (days < 0) return "expired";
  if (days <= 7) return "warning";
  return "active";
}
