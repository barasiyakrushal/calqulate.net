/**
 * Headline stats for the homepage + pricing.
 *
 * ⚠️ Use REAL figures only. Leave a value as "" to hide that stat. Member quotes
 * and success stories now live in lib/reviews.ts (genuine, permissioned only).
 */

export interface Stat {
  value: string;
  label: string;
}

/** Headline numbers. Set to your REAL figures, or "" to hide. */
export const STATS: Stat[] = [
  // "50+ free calculators" is deliberately gone. Counting calculators sells a
  // directory. The brand is a health trajectory, and the calculators are the way
  // in, not the thing being bought.
  { value: "", label: "Paid members" }, // e.g. "2,400+" once real
  { value: "", label: "Average rating" }, // e.g. "4.9 / 5" once real
  { value: "", label: "Pounds of muscle protected" }, // e.g. "18,400" once real
  { value: "", label: "Reports shared with doctors" },
];
