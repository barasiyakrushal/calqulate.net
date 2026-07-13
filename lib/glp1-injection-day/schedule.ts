/**
 * GLP-1 injection scheduling: the pure, testable core.
 *
 * Kept out of the React component deliberately. This logic tells people when it is
 * safe to inject, so it is covered by unit tests in __tests__/schedule.test.ts.
 *
 * `now` is always injected as an argument rather than read from the clock, so the
 * behaviour is deterministic and testable.
 *
 * The two rules, straight from the FDA labels:
 *   · minimum gap between doses: semaglutide 48h, tirzepatide 72h
 *   · missed dose can still be taken: semaglutide 5 days, tirzepatide 4 days
 */

import {
  MEDICATIONS,
  WEEKDAYS,
  result as resultCopy,
  type DayVerdict,
  type Intent,
  type Medication,
  type MedicationId,
  type RoughWindow,
} from "./content";

export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;

export interface ScheduleInput {
  medication: MedicationId;
  /** The moment of the last injection. */
  lastInjection: Date;
  /** The weekday the user normally injects on, 0 = Sunday. */
  typicalDay: number;
  intent: Intent;
  roughWindow?: RoughWindow;
}

export interface DayOption {
  weekday: number;
  label: string;
  date: Date;
  /** Hours since the last injection if you were to inject on this date. */
  gapHours: number;
  verdict: DayVerdict;
}

export type ScheduleStatusId =
  | "on-track"
  | "due-today"
  | "due-tomorrow"
  | "overdue-in-window"
  | "overdue-outside-window"
  | "too-soon";

export interface ScheduleResult {
  med: Medication;
  lastInjection: Date;
  typicalDay: number;
  typicalDayLabel: string;
  /** The next dose on the usual weekly schedule. */
  nextInjection: Date;
  nextInjectionLabel: string;
  /** Negative once the dose is overdue. */
  hoursToNext: number;
  countdownLabel: string;
  status: ScheduleStatusId;
  statusLabel: string;
  statusTone: "green" | "amber" | "red";
  /** The earliest moment a dose could be taken without breaching the minimum gap. */
  earliestSafe: Date;
  canInjectNow: boolean;
  /** True when the last injection was not on the usual weekday. */
  offSchedule: boolean;
  /** Present only when a dose is actually overdue. */
  missedDose: {
    daysLate: number;
    withinWindow: boolean;
    verdict: string;
  } | null;
  /** One row per weekday, for the "can I switch to this day?" planner. */
  dayOptions: DayOption[];
  /** Recommended weekday given when the user can afford side effects. */
  recommendedDay: number | null;
}

/** Local-midnight-safe day arithmetic: add whole days without DST drift surprises. */
function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * The next dose on the usual weekly schedule: the next occurrence of the user's
 * weekday strictly after their last injection, never closer than the minimum gap.
 */
export function nextInjectionDate(lastInjection: Date, typicalDay: number, minGapHours: number): Date {
  let daysAhead = (typicalDay - lastInjection.getDay() + 7) % 7;
  if (daysAhead === 0) daysAhead = 7; // injected on the usual day, so next week
  let next = addDays(lastInjection, daysAhead);

  // A day change must never bunch two doses closer than the label allows.
  while (next.getTime() - lastInjection.getTime() < minGapHours * HOUR_MS) {
    next = addDays(next, 7);
  }
  return next;
}

function formatCountdown(hours: number): string {
  const days = Math.floor(hours / 24);
  const rem = Math.round(hours % 24);
  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"}, ${rem} hour${rem === 1 ? "" : "s"}`;
  }
  const h = Math.max(1, rem);
  return `${h} hour${h === 1 ? "" : "s"}`;
}

function formatDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()].label}, ${date.getDate()} ${date.toLocaleString("en-GB", { month: "long" })}`;
}

/** Which weekday puts the 24 to 48 hour side-effect peak where the user can afford it. */
export function recommendDay(roughWindow: RoughWindow | undefined, typicalDay: number): number | null {
  switch (roughWindow) {
    case "weekend":
      return 5; // Friday: peak lands on Saturday and Sunday
    case "weekdays":
      return 1; // Monday: peak lands on Tuesday and Wednesday
    case "any":
      return typicalDay;
    default:
      return null;
  }
}

export function computeSchedule(input: ScheduleInput, now: Date): ScheduleResult {
  const med = MEDICATIONS.find((m) => m.id === input.medication)!;
  const { lastInjection, typicalDay } = input;

  const minGapMs = med.minGapHours * HOUR_MS;
  const earliestSafe = new Date(lastInjection.getTime() + minGapMs);
  const canInjectNow = now.getTime() >= earliestSafe.getTime();

  const nextInjection = nextInjectionDate(lastInjection, typicalDay, med.minGapHours);
  const hoursToNext = (nextInjection.getTime() - now.getTime()) / HOUR_MS;

  // Status. "Too soon" only matters while the user is still inside the minimum gap.
  let status: ScheduleStatusId;
  let statusLabel: string;
  let statusTone: ScheduleResult["statusTone"] = "green";

  if (!canInjectNow) {
    status = "too-soon";
    statusLabel = resultCopy.statusTooSoon;
    statusTone = "red";
  } else if (hoursToNext > 48) {
    status = "on-track";
    statusLabel = resultCopy.statusOnTrack;
  } else if (hoursToNext >= 24) {
    status = "due-tomorrow";
    statusLabel = resultCopy.statusDueTomorrow;
  } else if (hoursToNext >= 0) {
    status = "due-today";
    statusLabel = resultCopy.statusDueToday;
  } else {
    const daysLate = Math.floor(-hoursToNext / 24);
    const withinWindow = daysLate <= med.missedDoseWindowDays;
    status = withinWindow ? "overdue-in-window" : "overdue-outside-window";
    statusLabel = withinWindow ? resultCopy.statusOverdueInWindow : resultCopy.statusOverdueOutsideWindow;
    statusTone = "amber";
  }

  // Missed dose verdict, only when a dose is genuinely overdue.
  let missedDose: ScheduleResult["missedDose"] = null;
  if (hoursToNext < 0) {
    const daysLate = Math.floor(-hoursToNext / 24);
    const withinWindow = daysLate <= med.missedDoseWindowDays;
    missedDose = {
      daysLate,
      withinWindow,
      verdict: withinWindow
        ? `Your dose is ${daysLate === 0 ? "due now" : `${daysLate} day${daysLate === 1 ? "" : "s"} overdue`}, which is still inside the ${med.missedDoseWindowDays}-day catch-up window for ${med.name}. Take it as soon as you can, then go back to injecting on your usual day. Do not double up.`
        : `Your dose is ${daysLate} days overdue, which is past the ${med.missedDoseWindowDays}-day catch-up window for ${med.name}. Skip this one and take your next dose on your usual day. Never take two doses to catch up. If you have now missed more than 2 weeks in a row, speak to your prescriber before injecting your usual dose, because you may need to restart at a lower one.`,
    };
  }

  // The planner: for each weekday, the next time that day comes around after the
  // last injection, and whether injecting then would breach the minimum gap.
  const dayOptions: DayOption[] = WEEKDAYS.map((day) => {
    let daysAhead = (day.id - lastInjection.getDay() + 7) % 7;
    if (daysAhead === 0) daysAhead = 7;
    const date = addDays(lastInjection, daysAhead);
    const gapHours = (date.getTime() - lastInjection.getTime()) / HOUR_MS;

    let verdict: DayVerdict;
    if (gapHours < med.minGapHours) verdict = "too-soon";
    else if (day.id === typicalDay) verdict = "current";
    else verdict = "safe";

    return { weekday: day.id, label: day.label, date, gapHours, verdict };
  });

  return {
    med,
    lastInjection,
    typicalDay,
    typicalDayLabel: WEEKDAYS[typicalDay].label,
    nextInjection,
    nextInjectionLabel: formatDate(nextInjection),
    hoursToNext,
    countdownLabel:
      hoursToNext >= 0
        ? formatCountdown(hoursToNext)
        : `${Math.floor(-hoursToNext / 24)} day${Math.floor(-hoursToNext / 24) === 1 ? "" : "s"} overdue`,
    status,
    statusLabel,
    statusTone,
    earliestSafe,
    canInjectNow,
    offSchedule: lastInjection.getDay() !== typicalDay,
    missedDose,
    dayOptions,
    recommendedDay: recommendDay(input.roughWindow, typicalDay),
  };
}
