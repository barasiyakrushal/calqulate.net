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

/**
 * GLP-1 tracker member count, shown on the signup page as
 * "Join {value} people tracking their GLP-1 progress".
 *
 * ⚠️ REAL number only, and only once it is genuinely reassuring. Leave "" to
 * hide the line entirely — an honest small number reads as "no one uses this",
 * so do not set it until it helps rather than hurts. When set, use a rounded,
 * defensible figure like "1,200+".
 */
export const GLP1_MEMBER_COUNT = "";

/**
 * Signup-page social proof. Every value here is a factual representation shown to
 * prospective users making a health decision, so it must be REAL and
 * substantiable. Empty strings are hidden and the UI falls back to truthful
 * copy — an honest empty state, never an invented number.
 *
 * ⚠️ Do NOT put aspirational or made-up figures here. Fabricated user counts,
 * ratings, or usage stats on a US health product are deceptive and actionable
 * under the FTC's fake-reviews/endorsements rule.
 */
export const SIGNUP_SOCIAL = {
  /** Real, rounded active-member count, e.g. "1,200+". "" hides it. */
  memberCount: "",
  /** Real average rating from genuine reviews in lib/reviews.ts, e.g. "4.8". */
  rating: "",
  /** How many real reviews back that rating, e.g. "130". */
  ratingCount: "",
  /** Real count of health logs saved, e.g. "40k+". */
  healthLogsSaved: "",
  /** Real count of dose reminders sent, e.g. "12K+". */
  remindersSent: "",
  /** Only if literally true, e.g. "all 50 U.S. states". */
  statesCovered: "",
} as const;

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
