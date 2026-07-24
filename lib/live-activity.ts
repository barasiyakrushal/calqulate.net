/**
 * Live-activity feed for the signup page ("Sarah (Texas) logged Week 18").
 *
 * ⚠️ REAL, CONSENTED activity only. This is the single most powerful — and most
 * dangerous — social-proof surface: a feed of named people with health outcomes
 * reads as testimony. Inventing entries here (fake names, fake weight loss) is a
 * fabricated testimonial about a US health product and is directly actionable
 * under the FTC's 2024 fake-reviews/endorsements rule. It also misleads people
 * making medication decisions.
 *
 * The right way to populate this: derive it from genuine, recent, opted-in member
 * activity, anonymized to a first name + US state (never a full name, never a
 * precise figure that could identify someone). Until that pipeline exists, this
 * array stays EMPTY and the UI shows honest trust signals instead.
 */

export interface LiveActivityItem {
  /** First name only, as the member agreed to display. */
  firstName: string;
  /** US state (or region). Keep coarse for privacy. */
  state: string;
  /** What they did, in plain words, e.g. "Logged this week's weigh-in". */
  action: string;
  /** Optional trailing emoji. */
  emoji?: string;
}

/** Genuine, opted-in recent activity only. Empty by default — do NOT seed fakes. */
export const LIVE_ACTIVITY: LiveActivityItem[] = [];

export const hasLiveActivity = LIVE_ACTIVITY.length > 0;
