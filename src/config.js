export const COLS = 6;
export const TOTAL_LOCKERS = 30;

// Keep equal to MAX_LOCKERS in backend/.env (default 500).
export const MAX_LOCKERS = 500;

// For display only (plan names and prices in the "add member" form).
// The server is the source of truth for prices and durations.
export const PLANS = {
  monthly: { price: 40, days: 30 },
  quarterly: { price: 105, days: 90 },
  yearly: { price: 380, days: 365 },
};
