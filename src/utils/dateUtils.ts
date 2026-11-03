export interface WorkingDayOption {
  id: string; // 'yyyy-MM-dd'
  dayNumber: number;
  dayName: string; // 'Mon', 'Tue', ...
  fullDate: string; // 'Mon, 2 Nov 2026'
  shortLabel: string; // '2 Nov'
  month: string; // 'NOV'
  dateObj: Date;
  isToday: boolean;
  isPast: boolean;
}

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Generates Monday-to-Saturday working days for a studio cycle.
 * Rules:
 * 1. Monday to Saturday only (Sundays strictly excluded).
 * 2. Once Saturday is done (or on Sunday), resets automatically into the upcoming Monday.
 * 3. Supports week offset (0 = current active cycle, 1 = next week, etc.).
 */
export function getWorkingWeekDays(weekOffset = 0, now = new Date()): WorkingDayOption[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let anchor = new Date(today);

  // If today is Sunday (day 0), Saturday is done -> reset to next Monday (day + 1)
  if (anchor.getDay() === 0) {
    anchor.setDate(anchor.getDate() + 1);
  } else {
    // Current working week starting on Monday (day 1)
    const day = anchor.getDay(); // 1 (Mon) .. 6 (Sat)
    const diff = anchor.getDate() - day + 1; // distance to Monday
    anchor.setDate(diff);
  }

  // Week offset
  if (weekOffset !== 0) {
    anchor.setDate(anchor.getDate() + weekOffset * 7);
  }

  const days: WorkingDayOption[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dayId = `${yyyy}-${mm}-${dd}`;
    const dayName = DAY_NAMES[d.getDay()];
    const monthShort = MONTH_SHORT[d.getMonth()];
    const monthUpper = MONTH_NAMES[d.getMonth()];

    days.push({
      id: dayId,
      dayNumber: d.getDate(),
      dayName: dayName,
      fullDate: `${dayName}, ${d.getDate()} ${monthShort} ${yyyy}`,
      shortLabel: `${d.getDate()} ${monthShort}`,
      month: monthUpper,
      dateObj: d,
      isToday: d.getTime() === today.getTime(),
      isPast: d.getTime() < today.getTime(),
    });
  }

  return days;
}

/**
 * Gets human-readable cycle label, e.g. "2 Nov – 7 Nov 2026 (Mon – Sat)"
 */
export function getCycleRangeLabel(days: WorkingDayOption[]): string {
  if (days.length === 0) return '';
  const first = days[0];
  const last = days[days.length - 1];
  return `${first.shortLabel} – ${last.shortLabel} ${last.dateObj.getFullYear()}`;
}
