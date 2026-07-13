/**
 * GLP-1 dose conversion: the pure, testable core.
 *
 * Kept out of the React component deliberately. This arithmetic decides how much
 * medication someone draws into a syringe, so it is covered by unit tests in
 * __tests__/convert.test.ts.
 *
 * The single rule everything rests on:
 *   U-100 syringe: 100 units = 1 mL
 *   volume (mL) = dose (mg) / concentration (mg/mL)
 *   units       = volume (mL) x 100
 */

import {
  CONFIDENCE,
  MEDICATIONS,
  SYRINGES,
  UNITS_PER_ML,
  warnings,
  type Confidence,
  type Direction,
  type Medication,
  type MedicationId,
  type Syringe,
} from "./content";

/** Above both approved weekly maximums (semaglutide 2.4 mg, tirzepatide 15 mg). */
const IMPLAUSIBLE_DOSE_MG = 15;
/** Below this, a dose is hard to measure accurately on any barrel. */
const TINY_DOSE_UNITS = 6;

export interface ConversionInput {
  medication: MedicationId;
  concentration: number; // mg/mL
  direction: Direction;
  value: number;
  syringe?: Syringe["id"];
}

export interface ConversionResult {
  med: Medication;
  concentration: number;
  direction: Direction;
  doseMg: number;
  volumeMl: number;
  units: number;
  /** The syringe the user picked, or the smallest one the dose fits in. */
  syringe: Syringe;
  userSyringe: Syringe | null;
  confidence: Confidence;
  warnings: string[];
  /** True when the dose lands exactly on a readable marking of the barrel. */
  landsOnMarking: boolean;
}

/** Smallest syringe the dose actually fits inside. */
export function recommendSyringe(units: number): Syringe {
  return SYRINGES.find((s) => units <= s.capacityUnits) ?? SYRINGES[SYRINGES.length - 1];
}

function round(value: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

export function computeConversion(input: ConversionInput): ConversionResult {
  const med = MEDICATIONS.find((m) => m.id === input.medication)!;
  const c = input.concentration;
  const v = input.value;

  // Every direction routes through volume in mL, the bridge between mg and units.
  let volumeMl: number;
  switch (input.direction) {
    case "mg-to-units":
      volumeMl = v / c;
      break;
    case "units-to-mg":
    case "units-to-ml":
      volumeMl = v / UNITS_PER_ML;
      break;
    case "ml-to-units":
      volumeMl = v;
      break;
  }

  const doseMg = round(volumeMl * c, 3);
  const units = round(volumeMl * UNITS_PER_ML, 1);
  volumeMl = round(volumeMl, 3);

  const recommended = recommendSyringe(units);
  const userSyringe = input.syringe ? SYRINGES.find((s) => s.id === input.syringe)! : null;
  const syringe = userSyringe ?? recommended;

  const increment = syringe.increment;
  const landsOnMarking = Math.abs(units / increment - Math.round(units / increment)) < 1e-9;

  const list: string[] = [];
  let confidence: Confidence = CONFIDENCE.high;

  if (med.penOnly) {
    list.push(warnings.penProduct);
    confidence = CONFIDENCE.check;
  }
  if (units > syringe.capacityUnits) {
    list.push(warnings.overCapacity(units, syringe.label));
    confidence = CONFIDENCE.stop;
  }
  if (!landsOnMarking) {
    list.push(warnings.fractionalUnits(units));
    confidence = CONFIDENCE.stop;
  }
  if (units > 0 && units < TINY_DOSE_UNITS) {
    list.push(warnings.tinyVolume(units));
    if (confidence.id === "high") confidence = CONFIDENCE.check;
  }
  if (doseMg > IMPLAUSIBLE_DOSE_MG) {
    list.push(warnings.highDose(doseMg));
    confidence = CONFIDENCE.stop;
  }

  return {
    med,
    concentration: c,
    direction: input.direction,
    doseMg,
    volumeMl,
    units,
    syringe,
    userSyringe,
    confidence,
    warnings: list,
    landsOnMarking,
  };
}
