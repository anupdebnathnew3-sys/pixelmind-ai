import type { Holiday } from '../types';

// ─── Date Helpers ──────────────────────────────────────────────────────────────

function d(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** nth weekday of a month. weekday: 0=Sun,1=Mon,...6=Sat. n: 1=first, 2=second, etc. */
function nthWeekday(year: number, month: number, n: number, weekday: number): string {
  const date = new Date(year, month - 1, 1);
  let count = 0;
  while (date.getMonth() === month - 1) {
    if (date.getDay() === weekday) {
      count++;
      if (count === n) return d(year, month, date.getDate());
    }
    date.setDate(date.getDate() + 1);
  }
  return d(year, month, 1);
}

/** Last weekday in a month. */
function lastWeekday(year: number, month: number, weekday: number): string {
  const date = new Date(year, month, 0); // last day of month
  while (date.getDay() !== weekday) date.setDate(date.getDate() - 1);
  return d(year, date.getMonth() + 1, date.getDate());
}

/** Easter Sunday (Gregorian) using the anonymous Gregorian algorithm. */
function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const e = b % 4;
  const f = Math.floor(b / 4);
  const g = Math.floor((b + 8) / 25);
  const h = Math.floor((b - g + 1) / 3);
  const i = (19 * a + b - f - h + 15) % 30;
  const k = c % 4;
  const l = Math.floor(c / 4);
  const m = (32 + 2 * e + 2 * l - i - k) % 7;
  const n = Math.floor((a + 11 * i + 22 * m) / 451);
  const month = Math.floor((i + m - 7 * n + 114) / 31);
  const day = ((i + m - 7 * n + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function easterDate(year: number): string {
  const e = easter(year);
  return d(year, e.getMonth() + 1, e.getDate());
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return d(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

// ─── Holiday Generators by Country ────────────────────────────────────────────

function bangladeshHolidays(year: number): Holiday[] {
  return [
    { date: d(year, 1, 1), name: "New Year's Day", country: 'Bangladesh', type: 'holiday' },
    { date: d(year, 2, 21), name: 'International Mother Language Day (Shaheed Dibosh)', country: 'Bangladesh', type: 'holiday' },
    { date: d(year, 3, 17), name: 'Birth Anniversary of Sheikh Mujibur Rahman', country: 'Bangladesh', type: 'holiday' },
    { date: d(year, 3, 26), name: 'Independence Day', country: 'Bangladesh', type: 'holiday' },
    { date: d(year, 4, 14), name: 'Pahela Baishakh (Bengali New Year)', country: 'Bangladesh', type: 'holiday' },
    { date: d(year, 5, 1), name: 'May Day (International Labour Day)', country: 'Bangladesh', type: 'holiday' },
    { date: d(year, 8, 15), name: 'National Mourning Day', country: 'Bangladesh', type: 'holiday' },
    { date: d(year, 12, 16), name: 'Victory Day', country: 'Bangladesh', type: 'holiday' },
    { date: d(year, 12, 25), name: 'Christmas Day', country: 'Bangladesh', type: 'observance' },
    // Islamic holidays (approximate dates — shift by ~11 days each year)
    // 2025 approximate dates
    ...(year === 2025 ? [
      { date: d(2025, 3, 30), name: 'Eid ul-Fitr (Day 1)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2025, 3, 31), name: 'Eid ul-Fitr (Day 2)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2025, 4, 1), name: 'Eid ul-Fitr (Day 3)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2025, 6, 7), name: 'Eid ul-Adha (Day 1)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2025, 6, 8), name: 'Eid ul-Adha (Day 2)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2025, 6, 9), name: 'Eid ul-Adha (Day 3)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2025, 7, 5), name: 'Ashura (Muharram)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2025, 9, 4), name: 'Eid-e-Miladunnabi (Prophet\'s Birthday)', country: 'Bangladesh', type: 'holiday' as const },
    ] : []),
    ...(year === 2026 ? [
      { date: d(2026, 3, 20), name: 'Eid ul-Fitr (Day 1)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2026, 3, 21), name: 'Eid ul-Fitr (Day 2)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2026, 3, 22), name: 'Eid ul-Fitr (Day 3)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2026, 5, 27), name: 'Eid ul-Adha (Day 1)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2026, 5, 28), name: 'Eid ul-Adha (Day 2)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2026, 5, 29), name: 'Eid ul-Adha (Day 3)', country: 'Bangladesh', type: 'holiday' as const },
      { date: d(2026, 6, 25), name: 'Ashura (Muharram)', country: 'Bangladesh', type: 'holiday' as const },
    ] : []),
  ];
}

function usaHolidays(year: number): Holiday[] {
  const e = easterDate(year);
  return [
    { date: d(year, 1, 1), name: "New Year's Day", country: 'USA', type: 'holiday' },
    { date: nthWeekday(year, 1, 3, 1), name: 'Martin Luther King Jr. Day', country: 'USA', type: 'holiday' },
    { date: nthWeekday(year, 2, 3, 1), name: "Presidents' Day", country: 'USA', type: 'holiday' },
    { date: addDays(e, -2), name: 'Good Friday', country: 'USA', type: 'observance' },
    { date: e, name: 'Easter Sunday', country: 'USA', type: 'observance' },
    { date: lastWeekday(year, 5, 1), name: 'Memorial Day', country: 'USA', type: 'holiday' },
    { date: d(year, 6, 19), name: 'Juneteenth National Independence Day', country: 'USA', type: 'holiday' },
    { date: d(year, 7, 4), name: 'Independence Day', country: 'USA', type: 'holiday' },
    { date: nthWeekday(year, 9, 1, 1), name: 'Labor Day', country: 'USA', type: 'holiday' },
    { date: nthWeekday(year, 10, 2, 1), name: 'Columbus Day', country: 'USA', type: 'holiday' },
    { date: d(year, 10, 31), name: 'Halloween', country: 'USA', type: 'observance' },
    { date: d(year, 11, 11), name: "Veterans Day", country: 'USA', type: 'holiday' },
    { date: nthWeekday(year, 11, 4, 4), name: 'Thanksgiving Day', country: 'USA', type: 'holiday' },
    { date: d(year, 12, 24), name: 'Christmas Eve', country: 'USA', type: 'observance' },
    { date: d(year, 12, 25), name: 'Christmas Day', country: 'USA', type: 'holiday' },
    { date: d(year, 12, 31), name: "New Year's Eve", country: 'USA', type: 'observance' },
  ];
}

function ukHolidays(year: number): Holiday[] {
  const e = easterDate(year);
  return [
    { date: d(year, 1, 1), name: "New Year's Day", country: 'UK', type: 'holiday' },
    { date: addDays(e, -2), name: 'Good Friday', country: 'UK', type: 'holiday' },
    { date: e, name: 'Easter Sunday', country: 'UK', type: 'holiday' },
    { date: addDays(e, 1), name: 'Easter Monday', country: 'UK', type: 'holiday' },
    { date: nthWeekday(year, 5, 1, 1), name: 'Early May Bank Holiday', country: 'UK', type: 'holiday' },
    { date: lastWeekday(year, 5, 1), name: 'Spring Bank Holiday', country: 'UK', type: 'holiday' },
    { date: lastWeekday(year, 8, 1), name: 'Summer Bank Holiday', country: 'UK', type: 'holiday' },
    { date: d(year, 11, 5), name: "Guy Fawkes Night", country: 'UK', type: 'observance' },
    { date: d(year, 11, 11), name: 'Remembrance Day', country: 'UK', type: 'observance' },
    { date: d(year, 12, 25), name: 'Christmas Day', country: 'UK', type: 'holiday' },
    { date: d(year, 12, 26), name: 'Boxing Day', country: 'UK', type: 'holiday' },
    { date: d(year, 12, 31), name: "New Year's Eve", country: 'UK', type: 'observance' },
  ];
}

function canadaHolidays(year: number): Holiday[] {
  const e = easterDate(year);
  return [
    { date: d(year, 1, 1), name: "New Year's Day", country: 'Canada', type: 'holiday' },
    { date: nthWeekday(year, 2, 3, 1), name: 'Family Day', country: 'Canada', type: 'holiday' },
    { date: addDays(e, -2), name: 'Good Friday', country: 'Canada', type: 'holiday' },
    { date: e, name: 'Easter Sunday', country: 'Canada', type: 'holiday' },
    { date: addDays(e, 1), name: 'Easter Monday', country: 'Canada', type: 'holiday' },
    { date: lastWeekday(year, 5, 1), name: 'Victoria Day', country: 'Canada', type: 'holiday' },
    { date: d(year, 6, 24), name: 'Saint-Jean-Baptiste Day (Quebec)', country: 'Canada', type: 'holiday' },
    { date: d(year, 7, 1), name: 'Canada Day', country: 'Canada', type: 'holiday' },
    { date: nthWeekday(year, 8, 1, 1), name: 'Civic Holiday', country: 'Canada', type: 'holiday' },
    { date: nthWeekday(year, 9, 1, 1), name: 'Labour Day', country: 'Canada', type: 'holiday' },
    { date: d(year, 9, 30), name: 'National Day for Truth and Reconciliation', country: 'Canada', type: 'holiday' },
    { date: nthWeekday(year, 10, 2, 1), name: 'Thanksgiving Day', country: 'Canada', type: 'holiday' },
    { date: d(year, 11, 11), name: 'Remembrance Day', country: 'Canada', type: 'holiday' },
    { date: d(year, 12, 25), name: 'Christmas Day', country: 'Canada', type: 'holiday' },
    { date: d(year, 12, 26), name: 'Boxing Day', country: 'Canada', type: 'holiday' },
  ];
}

function australiaHolidays(year: number): Holiday[] {
  const e = easterDate(year);
  // Australia Day: January 26 (if weekend, observed Monday)
  const janDate = new Date(year, 0, 26);
  let australiaDayObserved = d(year, 1, 26);
  if (janDate.getDay() === 6) australiaDayObserved = d(year, 1, 28); // Sat → Mon
  if (janDate.getDay() === 0) australiaDayObserved = d(year, 1, 27); // Sun → Mon

  return [
    { date: d(year, 1, 1), name: "New Year's Day", country: 'Australia', type: 'holiday' },
    { date: australiaDayObserved, name: 'Australia Day', country: 'Australia', type: 'holiday' },
    { date: addDays(e, -2), name: 'Good Friday', country: 'Australia', type: 'holiday' },
    { date: addDays(e, -1), name: 'Holy Saturday', country: 'Australia', type: 'holiday' },
    { date: e, name: 'Easter Sunday', country: 'Australia', type: 'holiday' },
    { date: addDays(e, 1), name: 'Easter Monday', country: 'Australia', type: 'holiday' },
    { date: d(year, 4, 25), name: 'ANZAC Day', country: 'Australia', type: 'holiday' },
    { date: nthWeekday(year, 6, 2, 1), name: "Queen's/King's Birthday (most states)", country: 'Australia', type: 'holiday' },
    { date: nthWeekday(year, 8, 1, 1), name: 'Bank Holiday / Picnic Day', country: 'Australia', type: 'holiday' },
    { date: nthWeekday(year, 10, 1, 1), name: 'Labour Day (most states)', country: 'Australia', type: 'holiday' },
    { date: d(year, 12, 25), name: 'Christmas Day', country: 'Australia', type: 'holiday' },
    { date: d(year, 12, 26), name: 'Boxing Day', country: 'Australia', type: 'holiday' },
  ];
}

function indiaHolidays(year: number): Holiday[] {
  return [
    { date: d(year, 1, 1), name: "New Year's Day", country: 'India', type: 'holiday' },
    { date: d(year, 1, 14), name: 'Makar Sankranti / Pongal', country: 'India', type: 'holiday' },
    { date: d(year, 1, 23), name: 'Netaji Subhas Chandra Bose Jayanti', country: 'India', type: 'holiday' },
    { date: d(year, 1, 26), name: 'Republic Day', country: 'India', type: 'holiday' },
    { date: d(year, 4, 14), name: 'Dr. B.R. Ambedkar Jayanti', country: 'India', type: 'holiday' },
    { date: d(year, 5, 1), name: 'Labour Day / Maharashtra Day', country: 'India', type: 'holiday' },
    { date: d(year, 8, 15), name: 'Independence Day', country: 'India', type: 'holiday' },
    { date: d(year, 10, 2), name: 'Gandhi Jayanti', country: 'India', type: 'holiday' },
    { date: d(year, 11, 14), name: "Children's Day (Nehru Jayanti)", country: 'India', type: 'holiday' },
    { date: d(year, 12, 25), name: 'Christmas Day', country: 'India', type: 'holiday' },
    // Festivals (approximate — Hindu lunar calendar)
    ...(year === 2025 ? [
      { date: d(2025, 3, 14), name: 'Holi', country: 'India', type: 'holiday' as const },
      { date: d(2025, 3, 30), name: 'Eid ul-Fitr', country: 'India', type: 'holiday' as const },
      { date: d(2025, 4, 6), name: 'Ram Navami', country: 'India', type: 'holiday' as const },
      { date: d(2025, 4, 18), name: 'Good Friday', country: 'India', type: 'holiday' as const },
      { date: d(2025, 5, 12), name: 'Buddha Purnima', country: 'India', type: 'holiday' as const },
      { date: d(2025, 6, 7), name: 'Eid ul-Adha', country: 'India', type: 'holiday' as const },
      { date: d(2025, 8, 16), name: 'Raksha Bandhan', country: 'India', type: 'event' as const },
      { date: d(2025, 8, 23), name: 'Janmashtami', country: 'India', type: 'holiday' as const },
      { date: d(2025, 9, 2), name: 'Ganesh Chaturthi', country: 'India', type: 'holiday' as const },
      { date: d(2025, 10, 2), name: 'Dussehra (Vijayadashami)', country: 'India', type: 'holiday' as const },
      { date: d(2025, 10, 20), name: 'Diwali (Deepavali)', country: 'India', type: 'holiday' as const },
      { date: d(2025, 10, 22), name: 'Bhai Dooj', country: 'India', type: 'event' as const },
      { date: d(2025, 11, 5), name: 'Guru Nanak Jayanti', country: 'India', type: 'holiday' as const },
    ] : []),
    ...(year === 2026 ? [
      { date: d(2026, 3, 3), name: 'Holi', country: 'India', type: 'holiday' as const },
      { date: d(2026, 3, 20), name: 'Eid ul-Fitr', country: 'India', type: 'holiday' as const },
      { date: d(2026, 4, 3), name: 'Good Friday', country: 'India', type: 'holiday' as const },
      { date: d(2026, 5, 27), name: 'Eid ul-Adha', country: 'India', type: 'holiday' as const },
      { date: d(2026, 10, 9), name: 'Dussehra (Vijayadashami)', country: 'India', type: 'holiday' as const },
      { date: d(2026, 10, 29), name: 'Diwali (Deepavali)', country: 'India', type: 'holiday' as const },
    ] : []),
  ];
}

// ─── Universal Observances ─────────────────────────────────────────────────────

function globalObservances(year: number): Holiday[] {
  return [
    { date: d(year, 1, 1), name: "New Year's Day", country: 'All', type: 'holiday' },
    { date: d(year, 2, 14), name: "Valentine's Day", country: 'All', type: 'observance' },
    { date: d(year, 3, 8), name: "International Women's Day", country: 'All', type: 'observance' },
    { date: d(year, 4, 1), name: "April Fools' Day", country: 'All', type: 'event' },
    { date: d(year, 4, 22), name: 'Earth Day', country: 'All', type: 'observance' },
    { date: d(year, 5, 1), name: "International Labour Day", country: 'All', type: 'observance' },
    { date: d(year, 6, 5), name: 'World Environment Day', country: 'All', type: 'observance' },
    { date: d(year, 10, 31), name: 'Halloween', country: 'All', type: 'observance' },
    { date: d(year, 12, 21), name: 'Winter Solstice', country: 'All', type: 'event' },
    { date: d(year, 12, 25), name: 'Christmas Day', country: 'All', type: 'holiday' },
    { date: d(year, 12, 31), name: "New Year's Eve", country: 'All', type: 'observance' },
  ];
}

// ─── Main Export ───────────────────────────────────────────────────────────────

let cachedYear = -1;
let cachedHolidays: Holiday[] = [];

export function getHolidaysForYear(year: number): Holiday[] {
  if (cachedYear === year) return cachedHolidays;
  cachedYear = year;
  cachedHolidays = [
    ...globalObservances(year),
    ...bangladeshHolidays(year),
    ...usaHolidays(year),
    ...ukHolidays(year),
    ...canadaHolidays(year),
    ...australiaHolidays(year),
    ...indiaHolidays(year),
  ].sort((a, b) => a.date.localeCompare(b.date));
  return cachedHolidays;
}

export function getHolidaysForMonth(year: number, month: number): Holiday[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getHolidaysForYear(year).filter(h => h.date.startsWith(prefix));
}

export function getUpcomingHolidays(count = 5): Holiday[] {
  const today = new Date();
  const todayStr = d(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const allThisYear = getHolidaysForYear(today.getFullYear());
  const allNextYear = getHolidaysForYear(today.getFullYear() + 1);
  return [...allThisYear, ...allNextYear]
    .filter(h => h.date >= todayStr)
    .slice(0, count);
}
