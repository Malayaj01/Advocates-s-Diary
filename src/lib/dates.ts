// All calendar days are stored as UTC midnight so a "date" never shifts
// with the server's timezone. "Today" is always computed in India time.

const IST = "Asia/Kolkata";

/** "YYYY-MM-DD" for the current day in India. */
export function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(new Date());
}

/** Parse "YYYY-MM-DD" into a UTC-midnight Date. */
export function dayFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a stored day back to "YYYY-MM-DD". */
export function keyFromDay(day: Date): string {
  return day.toISOString().slice(0, 10);
}

export function today(): Date {
  return dayFromKey(todayKey());
}

export function addDays(day: Date, n: number): Date {
  const d = new Date(day);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

export function addMonths(day: Date, n: number): Date {
  const d = new Date(day);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d;
}

export function startOfMonth(day: Date): Date {
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
}

export function isValidDayKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return keyFromDay(dayFromKey(key)) === key;
}
