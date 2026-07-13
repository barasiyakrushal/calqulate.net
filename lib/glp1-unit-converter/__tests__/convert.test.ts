import { describe, expect, it } from "vitest";

import { computeConversion, recommendSyringe } from "../convert";
import { clusterGroups, safetyInsight } from "../content";

/**
 * This arithmetic decides how much medication someone draws into a syringe, so the
 * tests assert the real conversion code against the exact figures the page publishes.
 * If a chart and the calculator ever disagree, that is a safety bug, and these tests
 * are what catch it.
 */

const sema = { medication: "semaglutide", direction: "mg-to-units" } as const;

describe("mg to units", () => {
  it.each([
    // dose mg, concentration, expected units, expected mL
    [0.25, 2.5, 10, 0.1],
    [0.25, 5, 5, 0.05],
    [0.25, 1, 25, 0.25],
    [0.5, 2.5, 20, 0.2],
    [0.5, 5, 10, 0.1],
    [0.5, 1, 50, 0.5],
    [1, 2.5, 40, 0.4],
    [1, 5, 20, 0.2],
    [1, 1, 100, 1],
    [1.7, 2.5, 68, 0.68],
    [1.7, 5, 34, 0.34],
    [2.4, 2.5, 96, 0.96],
    [2.4, 5, 48, 0.48],
  ])("%s mg at %s mg/mL is %s units", (dose, concentration, units, ml) => {
    const r = computeConversion({ ...sema, concentration, value: dose });
    expect(r.units).toBe(units);
    expect(r.volumeMl).toBe(ml);
    expect(r.doseMg).toBe(dose);
  });

  it("converts 5 mg of tirzepatide at each common concentration", () => {
    const at = (concentration: number) =>
      computeConversion({
        medication: "tirzepatide",
        direction: "mg-to-units",
        concentration,
        value: 5,
      }).units;

    expect(at(5)).toBe(100);
    expect(at(10)).toBe(50);
    expect(at(20)).toBe(25);
  });
});

describe("units to mg", () => {
  it.each([
    [10, 2.5, 0.25],
    [10, 5, 0.5],
    [10, 10, 1],
    [20, 2.5, 0.5],
    [20, 5, 1],
    [20, 10, 2],
    [30, 2.5, 0.75],
    [30, 5, 1.5],
    [30, 10, 3],
    [50, 2.5, 1.25],
    [50, 5, 2.5],
    [50, 10, 5],
    [100, 2.5, 2.5],
    [100, 5, 5],
    [100, 10, 10],
  ])("%s units at %s mg/mL is %s mg", (units, concentration, mg) => {
    const r = computeConversion({
      medication: "compounded",
      direction: "units-to-mg",
      concentration,
      value: units,
    });
    expect(r.doseMg).toBe(mg);
    expect(r.units).toBe(units);
  });
});

describe("mL and units are two views of the same volume", () => {
  it("converts mL to units at 100 units per mL", () => {
    const r = computeConversion({
      medication: "compounded",
      direction: "ml-to-units",
      concentration: 5,
      value: 0.2,
    });
    expect(r.units).toBe(20);
    expect(r.doseMg).toBe(1);
  });

  it("converts units to mL independently of concentration", () => {
    const at = (concentration: number) =>
      computeConversion({
        medication: "compounded",
        direction: "units-to-ml",
        concentration,
        value: 40,
      }).volumeMl;

    expect(at(2.5)).toBe(0.4);
    expect(at(10)).toBe(0.4); // volume is volume: only the mg it carries changes
  });

  it("round-trips mg to units and back", () => {
    const forward = computeConversion({ ...sema, concentration: 2.5, value: 1.7 });
    const back = computeConversion({
      medication: "semaglutide",
      direction: "units-to-mg",
      concentration: 2.5,
      value: forward.units,
    });
    expect(back.doseMg).toBe(1.7);
  });
});

describe("the page's own charts", () => {
  it("matches the mg-to-units chart cell for cell", () => {
    const group = clusterGroups.find((g) => g.id === "mg-to-units")!;
    const concentrations = [1, 2.5, 5]; // the chart's three columns

    for (const row of group.table!.rows) {
      const doseMg = parseFloat(row[0]);
      if (row[0].includes("tirzepatide")) continue; // charted separately

      row.slice(1).forEach((cell, i) => {
        if (cell === "Not applicable") return;
        const expected = parseFloat(cell); // "68 units" and "170 units (2 syringes)" both parse
        const actual = computeConversion({
          ...sema,
          concentration: concentrations[i],
          value: doseMg,
        }).units;
        expect(actual, `${doseMg} mg at ${concentrations[i]} mg/mL`).toBe(expected);
      });
    }
  });

  it("matches the units-to-mg chart cell for cell", () => {
    const group = clusterGroups.find((g) => g.id === "units-to-mg")!;
    const concentrations = [2.5, 5, 10];

    for (const row of group.table!.rows) {
      const units = parseFloat(row[0]);
      row.slice(1).forEach((cell, i) => {
        const expected = parseFloat(cell);
        const actual = computeConversion({
          medication: "compounded",
          direction: "units-to-mg",
          concentration: concentrations[i],
          value: units,
        }).doseMg;
        expect(actual, `${units} units at ${concentrations[i]} mg/mL`).toBe(expected);
      });
    }
  });

  it("matches the safety insight table, where the same 1 mg is three different numbers", () => {
    for (const [label, ml, units] of safetyInsight.compare.rows) {
      const concentration = parseFloat(label);
      const r = computeConversion({ ...sema, concentration, value: 1 });
      expect(r.volumeMl).toBeCloseTo(parseFloat(ml), 3);
      expect(r.units).toBe(parseFloat(units));
    }
  });
});

describe("syringe recommendation", () => {
  it("picks the smallest barrel the dose fits inside", () => {
    expect(recommendSyringe(10).id).toBe("30");
    expect(recommendSyringe(30).id).toBe("30");
    expect(recommendSyringe(31).id).toBe("50");
    expect(recommendSyringe(50).id).toBe("50");
    expect(recommendSyringe(51).id).toBe("100");
    expect(recommendSyringe(100).id).toBe("100");
  });
});

describe("safety guards", () => {
  it("is confident about a clean, well-sized dose", () => {
    const r = computeConversion({ ...sema, concentration: 5, value: 1 }); // 20 units
    expect(r.confidence.id).toBe("high");
    expect(r.warnings).toHaveLength(0);
    expect(r.landsOnMarking).toBe(true);
  });

  it("stops the user when the dose does not fit the chosen syringe", () => {
    const r = computeConversion({ ...sema, concentration: 2.5, value: 2.4, syringe: "50" }); // 96 units
    expect(r.confidence.id).toBe("stop");
    expect(r.warnings.join(" ")).toContain("does not fit");
  });

  it("stops the user when the dose falls between markings on a 100-unit barrel", () => {
    // 0.85 mg at 2.5 mg/mL = 34 units, which is not a line on a 2-unit-marked barrel...
    // 35 units is: 0.875 mg at 2.5 mg/mL.
    const r = computeConversion({ ...sema, concentration: 2.5, value: 0.875, syringe: "100" });
    expect(r.units).toBe(35);
    expect(r.landsOnMarking).toBe(false);
    expect(r.confidence.id).toBe("stop");
    expect(r.warnings.join(" ")).toContain("not a whole line");
  });

  it("accepts that same 35-unit dose on a 50-unit barrel, which is marked in 1-unit steps", () => {
    const r = computeConversion({ ...sema, concentration: 2.5, value: 0.875, syringe: "50" });
    expect(r.units).toBe(35);
    expect(r.landsOnMarking).toBe(true);
    expect(r.confidence.id).toBe("high");
  });

  it("flags a dose too small to measure accurately", () => {
    const r = computeConversion({ ...sema, concentration: 5, value: 0.25 }); // 5 units
    expect(r.confidence.id).toBe("check");
    expect(r.warnings.join(" ")).toContain("very small amount");
  });

  it("flags a dose above every approved weekly maximum", () => {
    const r = computeConversion({
      medication: "compounded",
      direction: "units-to-mg",
      concentration: 20,
      value: 100,
    }); // 20 mg
    expect(r.doseMg).toBe(20);
    expect(r.confidence.id).toBe("stop");
    expect(r.warnings.join(" ")).toContain("above the maximum approved weekly dose");
  });

  it("warns that pre-filled pens must never be drawn into a syringe", () => {
    const r = computeConversion({
      medication: "ozempic",
      direction: "mg-to-units",
      concentration: 1.34,
      value: 0.5,
    });
    expect(r.confidence.id).not.toBe("high");
    expect(r.warnings.join(" ")).toContain("pre-filled pen");
  });

  it("catches the double-dose error: same units, wrong concentration", () => {
    // Believing the vial is 2.5 mg/mL when it is really 5 mg/mL doubles the dose.
    const believed = computeConversion({
      medication: "compounded",
      direction: "units-to-mg",
      concentration: 2.5,
      value: 40,
    });
    const actual = computeConversion({
      medication: "compounded",
      direction: "units-to-mg",
      concentration: 5,
      value: 40,
    });
    expect(believed.doseMg).toBe(1);
    expect(actual.doseMg).toBe(2);
  });
});
