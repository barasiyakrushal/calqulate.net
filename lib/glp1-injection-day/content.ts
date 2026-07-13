/**
 * ============================================================
 * GLP-1 INJECTION DAY ASSISTANT: CONTENT
 * All page copy, SEO content, FAQ and medication rules for the
 * Calqulate Vitals GLP-1 Injection Day Calculator.
 * calqulate.net/health/glp-1-injection-day-calculator
 *
 * This is not a date calculator. It answers the question behind
 * the search: when should I inject next, and is it safe to move it?
 *
 * The two numbers everything rests on, both straight from the
 * FDA prescribing information:
 *   · minimum gap between two doses
 *       semaglutide  48 hours   tirzepatide  72 hours
 *   · how late a missed dose can still be taken
 *       semaglutide   5 days    tirzepatide   4 days
 * ============================================================
 */

export const SITE = {
  name: "Calqulate Vitals",
  url: "https://calqulate.net",
  pageUrl: "https://calqulate.net/health/glp-1-injection-day-calculator",
  pagePath: "/health/glp-1-injection-day-calculator",
} as const;

/* ------------------------------------------------------------------ */
/* SEO METADATA                                                        */
/* ------------------------------------------------------------------ */

export const seo = {
  title: "GLP-1 Injection Day Calculator: When Is My Next Dose Due?",
  description:
    "Free GLP-1 injection day calculator. See exactly when your next semaglutide or tirzepatide dose is due, whether you can move your injection day, what to do about a missed dose, and which day of the week keeps side effects off your workdays. Instant, private, no sign-up.",
  keywords: [
    "glp-1 injection day calculator",
    "when is my next glp-1 injection",
    "semaglutide injection day calculator",
    "ozempic injection day calculator",
    "can i change my injection day",
    "missed glp-1 dose",
    "mounjaro injection day",
    "wegovy injection schedule",
    "best day to inject glp-1",
    "glp-1 injection schedule calculator",
  ],
  ogTitle: "GLP-1 Injection Day Calculator | Calqulate Vitals",
  ogDescription:
    "When is your next injection due? Check your countdown, see whether it is safe to move your day, and get a clear answer on a missed dose. Free, private, no sign-up.",
} as const;

/* ------------------------------------------------------------------ */
/* MEDICATION RULES                                                    */
/* ------------------------------------------------------------------ */

export type MedicationId =
  | "semaglutide"
  | "tirzepatide"
  | "ozempic"
  | "wegovy"
  | "mounjaro"
  | "zepbound";

export interface Medication {
  id: MedicationId;
  name: string;
  genericLabel: string;
  /** Minimum hours that must pass between two consecutive doses (FDA label). */
  minGapHours: number;
  /** How many days late a missed dose can still be taken (FDA label). */
  missedDoseWindowDays: number;
  /** Elimination half-life in days, for context. */
  halfLifeDays: number;
  missedDoseRule: string;
  dayChangeRule: string;
}

export const MEDICATIONS: Medication[] = [
  {
    id: "semaglutide",
    name: "Semaglutide",
    genericLabel: "generic or compounded semaglutide",
    minGapHours: 48,
    missedDoseWindowDays: 5,
    halfLifeDays: 7,
    missedDoseRule:
      "Take a missed semaglutide dose as soon as you remember, up to 5 days late. Past 5 days, skip it and take your next dose on your usual day.",
    dayChangeRule:
      "You can change your semaglutide injection day whenever you need to, as long as at least 48 hours pass between two doses.",
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    genericLabel: "generic or compounded tirzepatide",
    minGapHours: 72,
    missedDoseWindowDays: 4,
    halfLifeDays: 5,
    missedDoseRule:
      "Take a missed tirzepatide dose as soon as you remember, up to 4 days late. Past 4 days, skip it and take your next dose on your usual day.",
    dayChangeRule:
      "You can change your tirzepatide injection day whenever you need to, as long as at least 72 hours pass between two doses.",
  },
  {
    id: "ozempic",
    name: "Ozempic",
    genericLabel: "semaglutide for type 2 diabetes",
    minGapHours: 48,
    missedDoseWindowDays: 5,
    halfLifeDays: 7,
    missedDoseRule:
      "Take a missed Ozempic dose within 5 days of the day it was due. If more than 5 days have passed, skip it and resume your usual day.",
    dayChangeRule:
      "Ozempic's label allows the day of weekly administration to be changed, as long as the time between two doses is at least 48 hours.",
  },
  {
    id: "wegovy",
    name: "Wegovy",
    genericLabel: "semaglutide for weight management",
    minGapHours: 48,
    missedDoseWindowDays: 5,
    halfLifeDays: 7,
    missedDoseRule:
      "If your next scheduled Wegovy dose is more than 2 days away, take the missed dose as soon as you remember. If it is less than 2 days away, skip it. If you miss more than 2 weeks in a row, speak to your prescriber before restarting.",
    dayChangeRule:
      "Wegovy's label allows the injection day to be changed, as long as at least 48 hours pass between two doses.",
  },
  {
    id: "mounjaro",
    name: "Mounjaro",
    genericLabel: "tirzepatide for type 2 diabetes",
    minGapHours: 72,
    missedDoseWindowDays: 4,
    halfLifeDays: 5,
    missedDoseRule:
      "Take a missed Mounjaro dose within 4 days of the day it was due. Past 4 days, skip it and take your next dose on your usual day.",
    dayChangeRule:
      "Mounjaro's label allows the injection day to be changed, as long as the time between two doses is at least 72 hours.",
  },
  {
    id: "zepbound",
    name: "Zepbound",
    genericLabel: "tirzepatide for weight management",
    minGapHours: 72,
    missedDoseWindowDays: 4,
    halfLifeDays: 5,
    missedDoseRule:
      "Take a missed Zepbound dose within 4 days of the day it was due. Past 4 days, skip it and take your next dose on your usual day.",
    dayChangeRule:
      "Zepbound's label allows the injection day to be changed, as long as the time between two doses is at least 72 hours.",
  },
];

export const WEEKDAYS = [
  { id: 0, label: "Sunday", short: "Sun" },
  { id: 1, label: "Monday", short: "Mon" },
  { id: 2, label: "Tuesday", short: "Tue" },
  { id: 3, label: "Wednesday", short: "Wed" },
  { id: 4, label: "Thursday", short: "Thu" },
  { id: 5, label: "Friday", short: "Fri" },
  { id: 6, label: "Saturday", short: "Sat" },
] as const;

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: "Free GLP-1 Scheduling Tool",
  headline: "GLP-1 Injection Day Calculator",
  subheadline:
    "See exactly when your next dose is due, whether it is safe to move your injection day, and what to do if you missed one. Built on the minimum dose gaps in the FDA labels.",
  trustBadges: [
    { icon: "check", text: "Free forever" },
    { icon: "shield", text: "Based on FDA prescribing schedules" },
    { icon: "lock", text: "Browser only" },
    { icon: "user-x", text: "No sign-up required" },
  ],
  cta: "Start Calculator",
  secondaryCta: "See the Missed Dose Rules",
  secondaryCtaHref: "#missed-dose",
} as const;

/* ------------------------------------------------------------------ */
/* WIZARD (5 steps)                                                    */
/* ------------------------------------------------------------------ */

export type Intent = "next-dose" | "change-day" | "missed-dose" | "travel";
export type RoughWindow = "weekend" | "weekdays" | "any";

export const wizard = {
  stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
  steps: [
    {
      id: "medication",
      question: "Which medication are you taking?",
      helper: "The minimum gap between doses and the missed-dose window are different for semaglutide and tirzepatide.",
    },
    {
      id: "injection",
      question: "When was your last injection?",
      helper: "Date and roughly what time. Every date below is measured from this.",
    },
    {
      id: "day",
      question: "Which day do you normally inject?",
      helper: "Your anchor day. If your last injection was not on it, we will tell you how to get back on track.",
    },
    {
      id: "intent",
      question: "What do you need to work out?",
      helper: "The answer changes depending on what you are actually trying to do.",
    },
    {
      id: "rough",
      question: "When can you afford to feel rough?",
      helper:
        "Optional. Side effects cluster in the 24 to 48 hours after your shot, so your injection day decides which days those land on.",
    },
  ],
  intents: [
    { id: "next-dose", label: "When is my next dose?", desc: "Countdown to your next injection" },
    { id: "change-day", label: "Can I change my injection day?", desc: "See which days are safe to switch to" },
    { id: "missed-dose", label: "I missed a dose", desc: "Take it now, or skip it?" },
    { id: "travel", label: "I am travelling", desc: "Time zones, flights and a shifted schedule" },
  ],
  roughWindows: [
    { id: "weekend", label: "The weekend", desc: "Keep my workdays clear" },
    { id: "weekdays", label: "Weekdays", desc: "Keep my weekend clear" },
    { id: "any", label: "Any day is fine", desc: "Keep my current day" },
  ],
  back: "Back",
  next: "Continue",
  finish: "See My Injection Plan",
} as const;

/* ------------------------------------------------------------------ */
/* RESULT                                                              */
/* ------------------------------------------------------------------ */

export const result = {
  title: "Your Injection Plan",
  subtitle: "When your next dose is due, and what you can safely change about it.",
  labels: {
    medication: "Medication",
    lastInjection: "Last Injection",
    nextInjection: "Next Injection",
    countdown: "Time Until Next Dose",
    earliestSafe: "Earliest You Could Inject",
    minGap: "Minimum Gap Between Doses",
    missedWindow: "Missed Dose Window",
    usualDay: "Your Usual Day",
    status: "Schedule Status",
  },
  statusOnTrack: "🟢 On Track",
  statusDueToday: "🟢 Due Today",
  statusDueTomorrow: "🟢 Due Tomorrow",
  statusOverdueInWindow: "🟡 Overdue, still inside the catch-up window",
  statusOverdueOutsideWindow: "🟡 Overdue, past the catch-up window. Skip it and resume your usual day",
  statusTooSoon: "🔴 Too soon. Injecting now would be inside the minimum gap",
  disclaimer:
    "These dates are calculated from the minimum dose gaps and missed-dose windows published in the FDA prescribing information, applied to the date you entered. They are educational and cannot replace the schedule your prescriber gave you. Never take two doses closer together than the minimum gap, and never double up to catch up on a dose you missed.",
} as const;

/** The three visual states of a candidate injection day. */
export type DayVerdict = "safe" | "too-soon" | "current";

export const dayChange = {
  title: "Which days can you switch to?",
  body: "Any day that leaves the minimum gap since your last injection is allowed. Days shown in amber are inside that gap, so injecting on them would stack two doses too closely.",
  legend: {
    safe: "Safe to inject",
    "too-soon": "Too soon, inside the minimum gap",
    current: "Your usual day",
  },
  note: "Once you have moved, keep the new day. The point of a fixed weekly day is that it makes a missed dose obvious.",
} as const;

export const bestDay = {
  title: "The best day to inject",
  weekend:
    "Inject on a Friday. Side effects cluster in the 24 to 48 hours after your shot, so a Friday injection puts the roughest window on Saturday and Sunday, when you can lie down, eat lightly, and not care.",
  weekdays:
    "Inject on a Monday. That puts the 24 to 48 hour peak window on Tuesday and Wednesday, leaving your weekend clear of the worst of it.",
  any: "Your current day is fine. The best injection day is simply the one you will not forget, because consistency matters far more than which square of the calendar you pick.",
  footer:
    "Whichever you choose, you still have to respect the minimum gap when you make the switch. The planner above shows you when the change can happen.",
} as const;

/* ------------------------------------------------------------------ */
/* TRAVEL                                                              */
/* ------------------------------------------------------------------ */

export const travel = {
  title: "Travelling with your GLP-1",
  body: "Time zones do not meaningfully affect a drug with a multi-day half-life. Keep your usual injection day and inject at whatever local time is convenient. The rules that matter on a trip are about the medication itself, not the clock.",
  items: [
    "Keep your usual injection day. A few hours either way is irrelevant to a drug with a half-life measured in days",
    "Carry pens and vials in your hand luggage, never in checked baggage, where the hold can freeze them",
    "Bring the pharmacy label or your prescription, which makes airport security straightforward",
    "Use a travel case with a cool pack, and never leave medication in a hot car or direct sun",
    "If the trip means missing your usual day, shifting a day or two is safer than skipping, as long as you keep the minimum gap",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* FREE FEATURES                                                       */
/* ------------------------------------------------------------------ */

export const freeFeatures = {
  headline: "Everything here stays free, forever",
  items: [
    "Next injection date and countdown",
    "Minimum gap check",
    "Missed dose decision",
    "Injection day planner",
    "Best day recommendation",
    "Travel guidance",
    "Weekly calendar",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* SIGN-UP CTA                                                         */
/* ------------------------------------------------------------------ */

export const freeCta = {
  headline: "Never Miss Another Injection",
  body: "You worked this date out once. A free Calqulate account works it out every week, without you having to remember anything.",
  bullets: [
    "Injection reminders on your day",
    "Your whole injection history in one place",
    "A missed dose flagged the moment it happens",
    "Drug levels between doses",
    "Continue across all your devices",
  ],
  primary: "Set My Injection Reminder Free",
  secondary: "Continue Without Saving",
  badge: "Free forever",
} as const;

/* ------------------------------------------------------------------ */
/* DASHBOARD PREVIEW                                                   */
/* ------------------------------------------------------------------ */

export const dashboardPreview = {
  title: "Your dashboard, one tap away",
  tiles: [
    "Next Injection",
    "Injection History",
    "Drug Level",
    "Missed Doses",
    "Weight",
    "Symptoms",
    "Timeline",
    "Forecast",
  ],
  badge: "FREE",
  cta: "Continue My Treatment",
} as const;

/* ------------------------------------------------------------------ */
/* PREMIUM                                                             */
/* ------------------------------------------------------------------ */

export interface PremiumCard {
  title: string;
  desc: string;
  cta?: string;
}

export const premium = {
  headline: "A Date Is One Week. A Pattern Is Your Treatment.",
  body: "Free answers the question “when do I inject next?”. Premium answers “is this treatment actually working?”",
  cards: [
    {
      title: "Adherence Score",
      desc: "How consistent your weekly injections really are, because gaps and drift show up in results long before you notice them.",
      cta: "See My Consistency",
    },
    {
      title: "Drug Activity",
      desc: "Watch your medication level rise and fall between injections, so today's hunger finally makes sense.",
    },
    {
      title: "Plateau Prediction",
      desc: "Flags the week your weight loss is statistically likely to stall, before the scale stops moving.",
      cta: "Predict My Plateau",
    },
    {
      title: "Fat vs Muscle Trend",
      desc: "Splits every kilogram you lose into fat and lean mass, so the scale stops lying to you.",
      cta: "Protect My Muscle",
    },
    {
      title: "Side Effect Correlation",
      desc: "Connects your injection day to when symptoms actually hit, so you can move the day for a reason rather than a hunch.",
    },
    {
      title: "Doctor Report",
      desc: "One tap turns your injections, doses, weight and side effects into a report your prescriber reads in 30 seconds.",
      cta: "Generate Doctor Report",
    },
    {
      title: "Refill Tracker",
      desc: "Counts the doses left in your pen or vial and warns you before a gap forces a titration restart.",
    },
    {
      title: "Adaptive Coach",
      desc: "Weekly guidance that changes as your data changes, instead of generic tips.",
    },
  ] as PremiumCard[],
  primary: "See My Progress",
  secondary: "Forecast My Treatment",
} as const;

/* ------------------------------------------------------------------ */
/* UNIQUE POSITIONING                                                  */
/* ------------------------------------------------------------------ */

export const consistencyStory = {
  headline: "The Best Injection Day Is the One You Never Forget.",
  paragraphs: [
    "There is no magic day of the week. Friday is not more effective than Tuesday, and no dose works better because of the square it sits on in your calendar. What actually moves your results is the thing this page cannot do for you: injecting week after week, without gaps.",
    "A single missed dose is recoverable. A pattern of missed doses quietly undoes months of titration, and most people do not notice the pattern because they are looking at one week at a time.",
  ],
  unlocks: [
    "Every injection on one timeline",
    "Missed doses flagged automatically",
    "Weekly consistency score",
    "Drug levels between doses",
    "Side effects mapped to your injection day",
    "Plateau risk",
    "Long-term progress",
  ],
  cta: "Start Tracking Free, Turn One Date Into a Treatment That Sticks",
} as const;

/** The GLP-1 journey: each calculator answers one urgent question. */
export const journey = {
  headline: "Where this fits in your GLP-1 journey",
  body: "Each Calqulate tool answers one urgent question. Together they are a single operating system for your treatment.",
  steps: [
    {
      question: "Am I taking the right dose?",
      label: "Semaglutide Dose Calculator",
      href: "/health/semaglutide-dose-calculator",
    },
    {
      question: "Am I taking the right dose?",
      label: "Tirzepatide Dose Calculator",
      href: "/health/tirzepatide-dose-calculator",
    },
    {
      question: "Is my medication still active?",
      label: "GLP-1 Half-Life Calculator",
      href: "/health/glp-1-half-life-calculator",
    },
    {
      question: "Am I measuring it correctly?",
      label: "GLP-1 Unit Converter",
      href: "/health/glp-1-unit-converter",
    },
    {
      question: "When should I inject next?",
      label: "GLP-1 Injection Day Calculator",
      href: "/health/glp-1-injection-day-calculator",
    },
    {
      question: "How is my treatment working over time?",
      label: "GLP-1 Progress Tracker",
      href: "/product/glp1-progress-tracker",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* EDUCATIONAL SEO CONTENT                                             */
/* Each section opens with a direct 40 to 60 word answer.              */
/* ------------------------------------------------------------------ */

export interface ContentSection {
  id: string;
  heading: string;
  paragraphs: string[];
  table?: { caption: string; headers: string[]; rows: string[][] };
  list?: string[];
  tip?: string;
  related?: { label: string; href: string };
}

export const educationSections: ContentSection[] = [
  {
    id: "when-is-my-next-injection",
    heading: "When Is My Next GLP-1 Injection Due?",
    paragraphs: [
      "Seven days after your last one, on the same day of the week. Every GLP-1 on the market is a once-weekly injection, so if you injected on Monday, your next dose is the following Monday. The time of day does not matter, and you can inject with or without food.",
      "The weekly rhythm exists because of the half-life. Semaglutide clears with a half-life of about 7 days and tirzepatide about 5, so a week between doses keeps enough medication in you to work continuously while letting levels fall far enough to avoid stacking. That is also why the exact hour is irrelevant but the day matters.",
    ],
    related: { label: "GLP-1 Half-Life Calculator", href: "/health/glp-1-half-life-calculator" },
  },
  {
    id: "minimum-gap",
    heading: "The Minimum Gap Between Two Doses",
    paragraphs: [
      "Semaglutide doses must be at least 48 hours apart. Tirzepatide doses must be at least 72 hours apart. These minimums come straight from the FDA labels, and they are the hard limit on every schedule change: you may move your injection day whenever you like, provided the gap between consecutive doses never falls below them.",
      "The reason is accumulation. Each dose stacks on what remains of the last one, so two injections too close together produce a level higher than either was meant to deliver. That is what turns manageable nausea into a day of vomiting, and it is the single most avoidable mistake in GLP-1 scheduling.",
    ],
    table: {
      caption: "The scheduling rules that actually constrain you (from the FDA prescribing information)",
      headers: ["Medication", "Minimum gap between doses", "Missed dose can be taken up to"],
      rows: [
        ["Ozempic (semaglutide)", "48 hours", "5 days late"],
        ["Wegovy (semaglutide)", "48 hours", "5 days late, if next dose is over 2 days away"],
        ["Mounjaro (tirzepatide)", "72 hours", "4 days late"],
        ["Zepbound (tirzepatide)", "72 hours", "4 days late"],
      ],
    },
    tip: "Expert tip: the minimum gap is a floor, not a target. Aim for a full 7 days and use the floor only when a genuine schedule change requires it.",
  },
  {
    id: "change-injection-day",
    heading: "Can I Change My GLP-1 Injection Day?",
    paragraphs: [
      "Yes. Both semaglutide and tirzepatide labels explicitly allow the day of weekly administration to be changed, as long as the minimum gap is respected: at least 48 hours between semaglutide doses, and at least 72 hours between tirzepatide doses. After that, simply keep the new day.",
      "In practice the easiest way to move your day is to let it drift forward. Shifting your injection later costs you nothing, because a longer gap never breaks the minimum. Moving earlier is the direction that needs checking, because that is where you risk landing inside the gap.",
    ],
    tip: "Expert tip: move your day later rather than earlier. A dose taken two days late is always safe on the gap rule. A dose taken two days early may not be.",
  },
  {
    id: "missed-dose",
    heading: "What To Do If You Miss a GLP-1 Dose",
    paragraphs: [
      "For semaglutide, take the missed dose within 5 days and then resume your normal day. For tirzepatide, take it within 4 days, as long as your next scheduled dose is at least 72 hours later. Outside those windows, skip the dose entirely and inject as normal on your usual day. Never double up.",
      "A single missed dose is not an emergency and does not undo your progress. The medication has a half-life measured in days, so a meaningful amount is still working. What you will probably notice is more hunger than usual, because you are sitting at the bottom of the curve for longer than a normal week.",
      "A longer gap is different. After several missed weeks, levels fall far enough that resuming your full dose can feel like starting over, and your prescriber may restart you lower and titrate back up. That is a normal precaution, not a punishment.",
    ],
    list: [
      "Semaglutide (Ozempic, Wegovy): take it up to 5 days late, otherwise skip it",
      "Tirzepatide (Mounjaro, Zepbound): take it up to 4 days late, otherwise skip it",
      "Never take two doses closer than the minimum gap, even to catch up",
      "Missed more than 2 weeks in a row: contact your prescriber before injecting your usual dose",
    ],
  },
  {
    id: "early-or-late",
    heading: "Can I Inject a Day Early or a Day Late?",
    paragraphs: [
      "A day late is always fine on the gap rule, because a longer interval can never breach a minimum. A day early is usually fine too, since 6 days comfortably exceeds both the 48 and 72 hour minimums. The only genuinely unsafe move is bunching two doses within the minimum gap.",
      "What you may feel is a slightly different week. Injecting late means longer at your weekly trough, so expect hunger to return before the new dose. Injecting early raises your level slightly sooner, which for some people means a little more nausea. Neither is dangerous, and neither undoes your treatment.",
    ],
    related: { label: "GLP-1 Half-Life Calculator", href: "/health/glp-1-half-life-calculator" },
  },
  {
    id: "best-day",
    heading: "What Is the Best Day of the Week to Inject?",
    paragraphs: [
      "The day that puts side effects where you can afford them. Nausea and fatigue cluster in the 24 to 48 hours after your shot, so a Friday injection lands the worst of it on the weekend, while a Monday injection keeps the weekend clear. Pharmacologically, no day is better than another.",
      "That freedom is the real answer to this question. There is no clinically superior injection day, so choose around your life: your workdays, your training schedule, your social plans. The one criterion that genuinely matters is memorability, because the day you will not forget beats the day that looked ideal on paper.",
    ],
    tip: "Expert tip: anchor the injection to something you already do every week without fail, and it stops being a thing you have to remember at all.",
  },
  {
    id: "travel-and-time-zones",
    heading: "Injecting While Travelling and Across Time Zones",
    paragraphs: [
      "Keep your usual injection day and inject at whatever local time suits you. A drug with a half-life measured in days does not notice a few hours of time-zone shift, so there is nothing to recalculate. What matters on a trip is keeping the medication cold, carrying it in your hand luggage, and not skipping the dose.",
      "If a long-haul trip means your usual day disappears entirely, shifting the injection a day or two is safer than missing it, provided you keep the minimum gap. Once you are home, return to your normal day at the next dose.",
    ],
    list: travel.items as unknown as string[],
  },
];

/* ------------------------------------------------------------------ */
/* CONTENT CLUSTER                                                     */
/* ------------------------------------------------------------------ */

export interface ClusterItem {
  question: string;
  answer: string;
}

export interface ClusterGroup {
  id: string;
  title: string;
  items: ClusterItem[];
}

export const clusterGroups: ClusterGroup[] = [
  {
    id: "timing",
    title: "Injection Timing",
    items: [
      {
        question: "How many days between GLP-1 injections?",
        answer:
          "Seven. Every approved GLP-1 is once weekly, so your next dose falls on the same weekday as your last. The minimum you may ever compress that to is 48 hours for semaglutide or 72 hours for tirzepatide, and only when you are deliberately changing your day.",
      },
      {
        question: "Does the time of day matter?",
        answer:
          "No. Semaglutide and tirzepatide can be injected at any time of day, with or without food. Pick a time you will remember. Some people prefer the evening so that the first hours of peak side effects happen while they sleep.",
      },
      {
        question: "Can I inject one day early?",
        answer:
          "Yes. Six days between doses comfortably clears both the 48-hour and 72-hour minimums. You may notice slightly more nausea, because your level rises again a little sooner than usual.",
      },
      {
        question: "Can I inject one day late?",
        answer:
          "Yes, and it never breaks the gap rule, because a longer interval is always safe. Expect a bit more hunger in the extra day, since you spend longer at the bottom of your weekly curve.",
      },
      {
        question: "What happens if I inject two doses too close together?",
        answer:
          "They stack. The second dose lands on top of what remains of the first, producing a higher level than either was meant to deliver, and the usual result is severe nausea and vomiting. This is exactly what the minimum gap exists to prevent. If you have done it, contact your prescriber.",
      },
    ],
  },
  {
    id: "missed-doses",
    title: "Missed Doses",
    items: [
      {
        question: "I missed my Ozempic dose, what now?",
        answer:
          "Take it as soon as you remember, up to 5 days after it was due, then resume your usual day. If more than 5 days have passed, skip that dose entirely and inject as normal on your next scheduled day. Never take two to catch up.",
      },
      {
        question: "I missed my Wegovy dose, what now?",
        answer:
          "If your next scheduled dose is more than 2 days away, take the missed one as soon as you remember. If it is less than 2 days away, skip it. If you have missed more than 2 weeks in a row, contact your prescriber, because you may need to restart at a lower dose.",
      },
      {
        question: "I missed my Mounjaro or Zepbound dose, what now?",
        answer:
          "Take it within 4 days of the day it was due, as long as your next dose will still be at least 72 hours later. Past 4 days, skip it and take your next dose on your usual day.",
      },
      {
        question: "Will one missed dose ruin my progress?",
        answer:
          "No. With a half-life of 5 to 7 days, a large amount of medication is still working when you miss a single dose. You will most likely notice extra hunger rather than any loss of progress. It is repeated missed doses, not one, that undo months of titration.",
      },
      {
        question: "I missed several weeks, can I just restart my old dose?",
        answer:
          "Ask your prescriber first. After a gap of several weeks, drug levels have fallen far enough that resuming your previous dose can bring back the nausea you titrated past. Restarting lower and stepping back up is a common and sensible precaution.",
      },
    ],
  },
  {
    id: "changing-day",
    title: "Changing Your Day",
    items: [
      {
        question: "Can I change my injection day permanently?",
        answer:
          "Yes. Both labels allow it. Move to your new day as long as at least 48 hours (semaglutide) or 72 hours (tirzepatide) separate the two doses, then keep the new day from then on.",
      },
      {
        question: "What is the safest way to switch days?",
        answer:
          "Shift later, not earlier. Delaying your injection to the new day always satisfies the minimum gap, because a longer interval can never be too short. Moving earlier is the direction that can accidentally breach it.",
      },
      {
        question: "Why did my prescriber pick my injection day?",
        answer:
          "Usually convenience, not pharmacology. There is no clinically superior day. If your current day means your worst side-effect window lands on your busiest workday, that is a good reason to move it, and it does not need permission so much as a check of the gap.",
      },
      {
        question: "Should I inject before or after the weekend?",
        answer:
          "Depends where you want to feel rough. A Friday injection puts peak side effects on Saturday and Sunday, which suits people who can rest then. A Monday injection keeps the weekend clear and puts the peak on Tuesday and Wednesday.",
      },
    ],
  },
  {
    id: "travel-questions",
    title: "Travel",
    items: [
      {
        question: "Do time zones affect my injection schedule?",
        answer:
          "Not meaningfully. A few hours of shift is irrelevant to a drug with a half-life of 5 to 7 days. Keep your usual day and inject at whatever local time is convenient.",
      },
      {
        question: "Can I fly with my GLP-1?",
        answer:
          "Yes. Carry it in your hand luggage, never in checked baggage, where the hold can freeze it and ruin it. Bring the pharmacy label or your prescription and airport security is straightforward.",
      },
      {
        question: "How do I keep my medication cold while travelling?",
        answer:
          "A travel case with a cool pack. Avoid hot cars and direct sun. If a pen has frozen, discard it even if it looks fine.",
      },
      {
        question: "What if my trip means missing my injection day?",
        answer:
          "Shift the dose a day or two rather than skipping it, keeping the minimum gap. Once you are home, return to your usual day at the next injection.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: "When is my next GLP-1 injection due?",
    answer:
      "Seven days after your last one, on the same day of the week. All approved GLP-1 medications are once weekly. This calculator works out the exact date from your last injection and your usual injection day, and tells you how long you have left.",
  },
  {
    question: "How many hours must there be between two GLP-1 doses?",
    answer:
      "At least 48 hours for semaglutide (Ozempic, Wegovy) and at least 72 hours for tirzepatide (Mounjaro, Zepbound). These minimums come from the FDA prescribing information and are the hard limit on any schedule change.",
  },
  {
    question: "Can I change my injection day?",
    answer:
      "Yes. Both labels explicitly allow the weekly injection day to be changed, provided the minimum gap between consecutive doses is respected. The safest way is to shift later rather than earlier, because a longer gap can never be too short.",
  },
  {
    question: "What should I do if I miss a dose?",
    answer:
      "Semaglutide can be taken up to 5 days late, tirzepatide up to 4 days late, after which you skip the dose and resume on your usual day. Never take two doses closer together than the minimum gap in order to catch up.",
  },
  {
    question: "Will missing one injection ruin my progress?",
    answer:
      "No. With a half-life of 5 to 7 days, plenty of medication is still active after one missed dose. You are most likely to notice extra hunger. Repeated missed doses are what genuinely set treatment back.",
  },
  {
    question: "What is the best day of the week to inject?",
    answer:
      "Whichever day puts the peak side-effect window, the 24 to 48 hours after your shot, somewhere you can afford it. A Friday injection lands it on the weekend, a Monday injection keeps the weekend clear. No day is pharmacologically better, so choose the one you will not forget.",
  },
  {
    question: "Does the time of day I inject matter?",
    answer:
      "No. You can inject at any time, with or without food. Consistency of day matters, consistency of hour does not.",
  },
  {
    question: "Do time zones change my schedule?",
    answer:
      "No. A drug with a multi-day half-life does not notice a few hours of shift. Keep your usual day and inject at a convenient local time.",
  },
  {
    question: "Is this calculator medical advice?",
    answer:
      "No. It applies the minimum gaps and missed-dose windows published in the FDA labels to the date you entered. It is educational, and it cannot replace the schedule your prescriber gave you. If your prescriber's instructions differ, follow theirs.",
  },
];

/* ------------------------------------------------------------------ */
/* MEDICAL REFERENCES                                                  */
/* ------------------------------------------------------------------ */

export const references = [
  {
    label: "Ozempic (semaglutide) Prescribing Information (Novo Nordisk / FDA)",
    url: "https://www.novo-pi.com/ozempic.pdf",
  },
  {
    label: "Wegovy (semaglutide) Prescribing Information (Novo Nordisk / FDA)",
    url: "https://www.novo-pi.com/wegovy.pdf",
  },
  {
    label: "Mounjaro (tirzepatide) Prescribing Information (Eli Lilly / FDA)",
    url: "https://uspl.lilly.com/mounjaro/mounjaro.html",
  },
  {
    label: "Zepbound (tirzepatide) Prescribing Information (Eli Lilly / FDA)",
    url: "https://uspl.lilly.com/zepbound/zepbound.html",
  },
  {
    label: "NIDDK (NIH): Prescription medications to treat overweight and obesity",
    url: "https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity",
  },
] as const;

export const medicalDisclaimer =
  "Calqulate Vitals provides educational information based on the minimum dose intervals and missed-dose instructions published in the FDA prescribing information. It is not medical advice, does not create a doctor and patient relationship, and must not be used to start, stop, delay or double a dose. Always follow the schedule your prescriber gave you. Never inject two doses closer together than the minimum gap for your medication. If you have missed several weeks of treatment, or believe you have double-dosed, contact your prescriber before injecting again.";
