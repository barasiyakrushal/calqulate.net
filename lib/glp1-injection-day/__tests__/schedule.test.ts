import { describe, expect, it } from "vitest";

import { computeSchedule, nextInjectionDate, recommendDay, HOUR_MS, DAY_MS } from "../schedule";
import { MEDICATIONS } from "../content";

/**
 * This logic tells people when it is safe to inject, so the tests pin the two rules
 * that actually protect them: the minimum gap between doses (semaglutide 48h,
 * tirzepatide 72h) and the missed-dose window (5 days, 4 days).
 *
 * All dates are fixed. `now` is always passed in, never read from the clock.
 */

// Monday 6 July 2026, 09:00 local.
const MON = new Date(2026, 6, 6, 9, 0);
const MONDAY = 1;
const FRIDAY = 5;
const WEDNESDAY = 3;

const hoursAfter = (from: Date, h: number) => new Date(from.getTime() + h * HOUR_MS);
const daysAfter = (from: Date, d: number) => new Date(from.getTime() + d * DAY_MS);

describe("the weekly schedule", () => {
  it("puts the next dose 7 days after the last one, on the same weekday", () => {
    const next = nextInjectionDate(MON, MONDAY, 48);
    expect(next.getDay()).toBe(MONDAY);
    expect(next.getTime() - MON.getTime()).toBe(7 * DAY_MS);
  });

  it("moves an off-day injection back to the usual weekday", () => {
    // Injected Monday, but normally injects Friday: the next dose is that Friday, 4 days later.
    const next = nextInjectionDate(MON, FRIDAY, 48);
    expect(next.getDay()).toBe(FRIDAY);
    expect(next.getTime() - MON.getTime()).toBe(4 * DAY_MS);
  });
});

describe("the minimum gap is never breached", () => {
  it("pushes a semaglutide dose out a week when the usual day is under 48 hours away", () => {
    // Injected Monday, usually injects Tuesday: that is only 24h, inside the 48h minimum.
    const next = nextInjectionDate(MON, 2, 48);
    const gapHours = (next.getTime() - MON.getTime()) / HOUR_MS;
    expect(gapHours).toBeGreaterThanOrEqual(48);
    expect(gapHours).toBe(24 + 7 * 24); // skipped to the following Tuesday
  });

  it("pushes a tirzepatide dose out a week when the usual day is under 72 hours away", () => {
    // Injected Monday, usually injects Wednesday: 48h, which clears semaglutide but not tirzepatide.
    expect((nextInjectionDate(MON, WEDNESDAY, 48).getTime() - MON.getTime()) / HOUR_MS).toBe(48);

    const tirz = nextInjectionDate(MON, WEDNESDAY, 72);
    const gapHours = (tirz.getTime() - MON.getTime()) / HOUR_MS;
    expect(gapHours).toBeGreaterThanOrEqual(72);
    expect(gapHours).toBe(48 + 7 * 24);
  });

  it("never returns a next dose inside the minimum gap, for any weekday or medication", () => {
    for (const med of MEDICATIONS) {
      for (let day = 0; day < 7; day++) {
        const next = nextInjectionDate(MON, day, med.minGapHours);
        const gapHours = (next.getTime() - MON.getTime()) / HOUR_MS;
        expect(gapHours, `${med.name}, day ${day}`).toBeGreaterThanOrEqual(med.minGapHours);
      }
    }
  });
});

describe("schedule status", () => {
  const base = { medication: "semaglutide", lastInjection: MON, typicalDay: MONDAY, intent: "next-dose" } as const;

  it("is on track early in the week", () => {
    const r = computeSchedule(base, daysAfter(MON, 2));
    expect(r.status).toBe("on-track");
    expect(r.statusTone).toBe("green");
    expect(r.missedDose).toBeNull();
  });

  it("flags the day before as due tomorrow", () => {
    const r = computeSchedule(base, daysAfter(MON, 6));
    expect(r.status).toBe("due-tomorrow");
  });

  it("flags injection day as due today", () => {
    const r = computeSchedule(base, daysAfter(MON, 7));
    expect(r.status).toBe("due-today");
    expect(r.hoursToNext).toBeCloseTo(0, 5);
  });

  it("refuses an injection inside the minimum gap", () => {
    const r = computeSchedule(base, hoursAfter(MON, 24)); // 24h after the last dose
    expect(r.status).toBe("too-soon");
    expect(r.statusTone).toBe("red");
    expect(r.canInjectNow).toBe(false);
  });

  it("allows an injection once the minimum gap has passed", () => {
    const r = computeSchedule(base, hoursAfter(MON, 48));
    expect(r.canInjectNow).toBe(true);
    expect(r.status).not.toBe("too-soon");
  });

  it("holds tirzepatide back for the full 72 hours", () => {
    const at48 = computeSchedule({ ...base, medication: "tirzepatide" }, hoursAfter(MON, 48));
    expect(at48.canInjectNow).toBe(false);

    const at72 = computeSchedule({ ...base, medication: "tirzepatide" }, hoursAfter(MON, 72));
    expect(at72.canInjectNow).toBe(true);
  });
});

describe("missed dose", () => {
  const semaglutide = { medication: "semaglutide", lastInjection: MON, typicalDay: MONDAY, intent: "missed-dose" } as const;
  const tirzepatide = { ...semaglutide, medication: "tirzepatide" } as const;

  it("tells semaglutide users to take a dose 3 days late", () => {
    const r = computeSchedule(semaglutide, daysAfter(MON, 10)); // dose was due at day 7
    expect(r.missedDose?.daysLate).toBe(3);
    expect(r.missedDose?.withinWindow).toBe(true);
    expect(r.status).toBe("overdue-in-window");
    expect(r.missedDose?.verdict).toContain("Take it as soon as you can");
  });

  it("tells semaglutide users to skip a dose 6 days late", () => {
    const r = computeSchedule(semaglutide, daysAfter(MON, 13));
    expect(r.missedDose?.daysLate).toBe(6);
    expect(r.missedDose?.withinWindow).toBe(false);
    expect(r.status).toBe("overdue-outside-window");
    expect(r.missedDose?.verdict).toContain("Skip this one");
  });

  it("holds the semaglutide boundary exactly at 5 days", () => {
    expect(computeSchedule(semaglutide, daysAfter(MON, 12)).missedDose?.withinWindow).toBe(true); // 5 days late
    expect(computeSchedule(semaglutide, daysAfter(MON, 13)).missedDose?.withinWindow).toBe(false); // 6 days late
  });

  it("holds the tirzepatide boundary exactly at 4 days", () => {
    expect(computeSchedule(tirzepatide, daysAfter(MON, 11)).missedDose?.withinWindow).toBe(true); // 4 days late
    expect(computeSchedule(tirzepatide, daysAfter(MON, 12)).missedDose?.withinWindow).toBe(false); // 5 days late
  });

  it("never tells anyone to double up", () => {
    for (const days of [8, 10, 12, 14, 20]) {
      const r = computeSchedule(semaglutide, daysAfter(MON, days));
      expect(r.missedDose?.verdict).toMatch(/[Dd]o not double up|Never take two doses/);
    }
  });
});

describe("the day-change planner", () => {
  it("marks days inside the minimum gap as too soon, for semaglutide", () => {
    const r = computeSchedule(
      { medication: "semaglutide", lastInjection: MON, typicalDay: MONDAY, intent: "change-day" },
      daysAfter(MON, 1),
    );

    // Injected Monday: Tuesday is 24h away, inside the 48h minimum.
    const tue = r.dayOptions.find((d) => d.weekday === 2)!;
    expect(tue.gapHours).toBe(24);
    expect(tue.verdict).toBe("too-soon");

    // Wednesday is 48h away, which exactly meets the semaglutide minimum.
    const wed = r.dayOptions.find((d) => d.weekday === WEDNESDAY)!;
    expect(wed.gapHours).toBe(48);
    expect(wed.verdict).toBe("safe");

    // Monday itself is the current day, a full week out.
    const mon = r.dayOptions.find((d) => d.weekday === MONDAY)!;
    expect(mon.verdict).toBe("current");
    expect(mon.gapHours).toBe(168);
  });

  it("is stricter for tirzepatide: Wednesday is no longer safe", () => {
    const r = computeSchedule(
      { medication: "tirzepatide", lastInjection: MON, typicalDay: MONDAY, intent: "change-day" },
      daysAfter(MON, 1),
    );

    const wed = r.dayOptions.find((d) => d.weekday === WEDNESDAY)!;
    expect(wed.gapHours).toBe(48); // under the 72h tirzepatide minimum
    expect(wed.verdict).toBe("too-soon");

    const thu = r.dayOptions.find((d) => d.weekday === 4)!;
    expect(thu.gapHours).toBe(72);
    expect(thu.verdict).toBe("safe");
  });

  it("offers every weekday exactly once", () => {
    const r = computeSchedule(
      { medication: "semaglutide", lastInjection: MON, typicalDay: MONDAY, intent: "change-day" },
      MON,
    );
    expect(r.dayOptions).toHaveLength(7);
    expect(new Set(r.dayOptions.map((d) => d.weekday)).size).toBe(7);
  });
});

describe("best day recommendation", () => {
  it("puts the peak on the weekend by injecting Friday", () => {
    expect(recommendDay("weekend", MONDAY)).toBe(FRIDAY);
  });

  it("keeps the weekend clear by injecting Monday", () => {
    expect(recommendDay("weekdays", FRIDAY)).toBe(MONDAY);
  });

  it("leaves the current day alone when any day is fine", () => {
    expect(recommendDay("any", WEDNESDAY)).toBe(WEDNESDAY);
  });

  it("recommends nothing when the question was skipped", () => {
    expect(recommendDay(undefined, MONDAY)).toBeNull();
  });
});

describe("off-schedule detection", () => {
  it("notices when the last injection was not on the usual day", () => {
    const r = computeSchedule(
      { medication: "semaglutide", lastInjection: MON, typicalDay: FRIDAY, intent: "next-dose" },
      MON,
    );
    expect(r.offSchedule).toBe(true);
    expect(r.nextInjection.getDay()).toBe(FRIDAY);
  });

  it("stays quiet when the injection was on the usual day", () => {
    const r = computeSchedule(
      { medication: "semaglutide", lastInjection: MON, typicalDay: MONDAY, intent: "next-dose" },
      MON,
    );
    expect(r.offSchedule).toBe(false);
  });
});
