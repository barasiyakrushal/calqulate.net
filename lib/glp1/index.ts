/**
 * Calqulate Vitals — GLP-1 tracker shared core (barrel).
 *
 * Import domain types, validation, and pure calculations from here:
 *   import { drugLevelCurve, bodyCompChange, proteinTarget } from "@/lib/glp1";
 *
 * Persistence (`repository.ts`) is SERVER-ONLY and intentionally NOT re-exported
 * here, so it can never be pulled into a client bundle by accident. Import it
 * directly: `import { createRecord } from "@/lib/glp1/repository";`
 */

export * from "./types";
export * from "./schemas";
export * from "./pk";
export * from "./bodyComposition";
export * from "./nutrition";
export * from "./reminders";
export * from "./benchmark";
export * from "./forecast";
export * from "./trajectory";
export * from "./correlation";
export * from "./scorecard";
export * from "./sweetSpot";
export * from "./reconstitution";
export * from "./refill";
export * from "./foods";
export * from "./foodParser";
export * from "./coach";
