/**
 * ============================================================
 * GLP-1 DRUG ACTIVITY ASSISTANT: CONTENT
 * All page copy, SEO content, FAQ and medication data for the
 * Calqulate Vitals GLP-1 Half-Life Calculator.
 * calqulate.net/health/glp-1-half-life-calculator
 *
 * This is not a half-life calculator. It answers the questions
 * people actually ask: is my medication still working, why am I
 * hungry today, and should I inject now?
 * ============================================================
 */

export const SITE = {
  name: "Calqulate Vitals",
  url: "https://calqulate.net",
  pageUrl: "https://calqulate.net/health/glp-1-half-life-calculator",
  pagePath: "/health/glp-1-half-life-calculator",
} as const;

/* ------------------------------------------------------------------ */
/* SEO METADATA                                                        */
/* ------------------------------------------------------------------ */

export const seo = {
  title: "GLP-1 Half-Life Calculator: Drug Activity, Levels & Injection Timing",
  description:
    "Free GLP-1 half-life calculator. See how much semaglutide, tirzepatide, Ozempic, Wegovy, Mounjaro or Zepbound is still active today, why your appetite changes through the week, and when your next injection is due. Instant, private, no sign-up.",
  keywords: [
    "glp-1 half-life calculator",
    "semaglutide half-life calculator",
    "ozempic half-life calculator",
    "tirzepatide half-life calculator",
    "glp-1 drug level calculator",
    "wegovy half life",
    "mounjaro half life",
    "zepbound half life",
    "glp-1 pk curve",
    "glp-1 injection schedule",
  ],
  ogTitle: "GLP-1 Half-Life Calculator | Calqulate Vitals",
  ogDescription:
    "How much of your GLP-1 medication is still active right now? See your drug level, your appetite outlook, and your injection countdown in seconds. Free, private, no sign-up.",
} as const;

/* ------------------------------------------------------------------ */
/* MEDICATION DATA                                                     */
/* Half-lives from FDA prescribing information.                        */
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
  /** Elimination half-life in days. */
  halfLifeDays: number;
  /** Selectable weekly doses (mg). */
  doses: number[];
  /** Days within which a missed dose can usually still be taken. */
  missedDoseWindowDays: number;
  note: string;
}

export const MEDICATIONS: Medication[] = [
  {
    id: "semaglutide",
    name: "Semaglutide",
    genericLabel: "generic or compounded semaglutide",
    halfLifeDays: 7,
    doses: [0.25, 0.5, 1, 1.7, 2.4],
    missedDoseWindowDays: 5,
    note: "Semaglutide has an elimination half-life of about 7 days, which is why it is injected once weekly.",
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    genericLabel: "generic or compounded tirzepatide",
    halfLifeDays: 5,
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    missedDoseWindowDays: 4,
    note: "Tirzepatide has an elimination half-life of about 5 days, so levels fall a little faster through the week than semaglutide.",
  },
  {
    id: "ozempic",
    name: "Ozempic",
    genericLabel: "semaglutide for type 2 diabetes",
    halfLifeDays: 7,
    doses: [0.25, 0.5, 1, 2],
    missedDoseWindowDays: 5,
    note: "Ozempic is semaglutide, with a half-life of about 7 days. A missed dose can be taken within 5 days, after which you skip it.",
  },
  {
    id: "wegovy",
    name: "Wegovy",
    genericLabel: "semaglutide for weight management",
    halfLifeDays: 7,
    doses: [0.25, 0.5, 1, 1.7, 2.4],
    missedDoseWindowDays: 5,
    note: "Wegovy is semaglutide, with a half-life of about 7 days. If your next dose is more than 2 days away, a missed dose can usually be taken as soon as you remember.",
  },
  {
    id: "mounjaro",
    name: "Mounjaro",
    genericLabel: "tirzepatide for type 2 diabetes",
    halfLifeDays: 5,
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    missedDoseWindowDays: 4,
    note: "Mounjaro is tirzepatide, with a half-life of about 5 days. A missed dose can be taken within 4 days, as long as the next dose is at least 72 hours later.",
  },
  {
    id: "zepbound",
    name: "Zepbound",
    genericLabel: "tirzepatide for weight management",
    halfLifeDays: 5,
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    missedDoseWindowDays: 4,
    note: "Zepbound is tirzepatide, with a half-life of about 5 days. A missed dose can be taken within 4 days, as long as the next dose is at least 72 hours later.",
  },
];

export const WEEKDAYS = [
  { id: 0, label: "Sunday" },
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
] as const;

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: "Free GLP-1 Drug Activity Tool",
  headline: "GLP-1 Half-Life Calculator",
  subheadline:
    "Estimate how much of your GLP-1 medication remains active, visualise drug levels over time, and better understand your injection schedule.",
  trustBadges: [
    { icon: "check", text: "Free forever" },
    { icon: "shield", text: "FDA-based pharmacokinetic models" },
    { icon: "lock", text: "Browser only" },
    { icon: "user-x", text: "No sign-up required" },
  ],
  cta: "Start Calculator",
} as const;

/* ------------------------------------------------------------------ */
/* WIZARD (5 steps)                                                    */
/* ------------------------------------------------------------------ */

export const wizard = {
  stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
  steps: [
    {
      id: "medication",
      question: "Which medication are you taking?",
      helper: "Pick the brand on your pen, or the generic if you use a compounded version.",
    },
    {
      id: "dose",
      question: "What is your current weekly dose?",
      helper:
        "Your dose does not change how fast the drug clears. Your weight does set your protein and hydration targets, so add it below. Neither is stored.",
    },
    {
      id: "injection",
      question: "When was your last injection?",
      helper: "Date and roughly what time. This is what the whole calculation is built on.",
    },
    {
      id: "day",
      question: "Which day do you normally inject?",
      helper: "Used to work out when your next dose is due and whether you are running early or late.",
    },
    {
      id: "appetite",
      question: "How is your appetite right now?",
      helper: "Optional. It lets us compare what you feel against what the drug level would predict.",
    },
  ],
  appetites: [
    { id: "very-hungry", label: "Very hungry", desc: "Hunger and cravings are back" },
    { id: "normal", label: "Normal", desc: "Hungry at meals, not between them" },
    { id: "low", label: "Low appetite", desc: "Full quickly, little interest in food" },
  ],
  back: "Back",
  next: "Continue",
  finish: "See My Medication Today",
} as const;

export type AppetiteId = "very-hungry" | "normal" | "low";

/* ------------------------------------------------------------------ */
/* RESULT: labels and interpretation copy                              */
/* ------------------------------------------------------------------ */

export const result = {
  title: "Your Medication Today",
  subtitle: "What is happening in your body right now, not just a half-life number.",
  labels: {
    medication: "Medication",
    daysSince: "Days Since Injection",
    active: "Estimated Active Medication",
    activity: "Drug Activity",
    appetite: "Expected Appetite",
    cravings: "Expected Cravings",
    sideEffects: "Expected Side Effects",
    nextInjection: "Next Injection",
    protein: "Protein Goal",
    hydration: "Hydration Goal",
    status: "Treatment Status",
  },
  disclaimer:
    "This is an educational estimate built from published pharmacokinetics, not a measurement of your blood. It cannot tell you when to inject. Follow the schedule your prescriber gave you, and never take an extra dose to raise a number you see here.",
} as const;

/** Bands for the estimated share of peak drug level still present. */
export interface ActivityBand {
  id: "peak" | "high" | "moderate" | "declining" | "low";
  min: number; // inclusive lower bound, % of peak
  label: string;
  tone: "green" | "amber";
  appetite: string;
  cravings: string;
  sideEffects: string;
  /** Explains what the number means, in plain language. */
  meaning: string;
}

export const ACTIVITY_BANDS: ActivityBand[] = [
  {
    id: "peak",
    min: 90,
    label: "🟢 Peak",
    tone: "green",
    appetite: "Strongly suppressed",
    cravings: "Very low",
    sideEffects: "Most likely now",
    meaning:
      "You are in the first day or two after your injection, when drug levels are at their highest for the week. Appetite suppression is usually strongest here, and so are side effects: nausea, fullness and fatigue cluster in this window for most people. Eat smaller, protein-first meals and expect to want very little food.",
  },
  {
    id: "high",
    min: 75,
    label: "🟢 High",
    tone: "green",
    appetite: "Well controlled",
    cravings: "Low",
    sideEffects: "Mild",
    meaning:
      "Most of your dose is still active. This is usually the most comfortable stretch of the week: appetite is well controlled, early nausea has settled, and food noise stays quiet. It is the best window to get your protein in and to train, because you feel normal and eating is not a battle.",
  },
  {
    id: "moderate",
    min: 55,
    label: "🟢 Moderate",
    tone: "green",
    appetite: "Controlled",
    cravings: "Low",
    sideEffects: "Mild",
    meaning:
      "Your medication is still estimated to be providing meaningful appetite suppression. Many people at this stage notice stable hunger control, though effects naturally decrease as the next injection approaches. Nothing is wrong: this gentle decline is exactly what a weekly medication is supposed to do.",
  },
  {
    id: "declining",
    min: 35,
    label: "🟡 Declining",
    tone: "amber",
    appetite: "Returning",
    cravings: "Rising",
    sideEffects: "Usually minimal",
    meaning:
      "Levels are falling toward their weekly low point. This is the classic day 5 to day 7 window where hunger and food noise creep back and people start to wonder whether the medication has stopped working. It has not. You are simply seeing the bottom of the curve, and your next injection resets it.",
  },
  {
    id: "low",
    min: 0,
    label: "🟡 Low",
    tone: "amber",
    appetite: "Largely returned",
    cravings: "High",
    sideEffects: "Usually none",
    meaning:
      "You are at or past the end of your dosing interval, so drug levels are at their lowest. Strong hunger here is expected and is not a sign of tolerance or failure. If your next injection is overdue, take it on the schedule your prescriber gave you rather than doubling up, and never take two doses close together to catch up.",
  },
];

/** Copy for the injection countdown, keyed by how the timing looks. */
export const timing = {
  dueIn: (days: number, hours: number) =>
    days > 0
      ? `${days} day${days === 1 ? "" : "s"}, ${hours} hour${hours === 1 ? "" : "s"}`
      : `${hours} hour${hours === 1 ? "" : "s"}`,
  dueNow: "Due now",
  overdue: (days: number) => `${days} day${days === 1 ? "" : "s"} overdue`,
  statusOnTrack: "🟢 On Track",
  statusDueToday: "🟢 Injection Due Today",
  statusOverdueInWindow: "🟡 Overdue, still inside the catch-up window",
  statusOverdueOutsideWindow: "🟡 Overdue, past the catch-up window. Ask your prescriber",
  onTrackNote: "Your last injection lines up with your usual injection day.",
  offDayNote:
    "Your last injection was not on your usual injection day, so your next dose is calculated 7 days after the injection you logged.",
} as const;

/* ------------------------------------------------------------------ */
/* FREE FEATURES                                                       */
/* ------------------------------------------------------------------ */

export const freeFeatures = {
  headline: "Everything here stays free, forever",
  items: [
    "Today's drug activity",
    "Half-life",
    "PK curve",
    "Medication timeline",
    "Appetite estimate",
    "Injection countdown",
    "Water goal",
    "Protein goal",
    "Educational tips",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* SIGN-UP CTA                                                         */
/* ------------------------------------------------------------------ */

export const freeCta = {
  headline: "Medication changes every day",
  body: "Today's calculation is just one snapshot. Track your medication every day with a free Calqulate account.",
  bullets: [
    "Daily drug activity",
    "Injection reminders",
    "Progress history",
    "Weight tracking",
    "Never lose your timeline",
  ],
  primary: "Track My Medication Free",
  secondary: "Continue Without Saving",
  badge: "Free forever",
} as const;

/* ------------------------------------------------------------------ */
/* DASHBOARD PREVIEW                                                   */
/* ------------------------------------------------------------------ */

export const dashboardPreview = {
  title: "Your dashboard, one tap away",
  tiles: [
    "Today's Drug Level",
    "Today's Weight",
    "Injection History",
    "Symptoms",
    "Forecast",
    "Recent Entries",
    "PK Curve",
  ],
  badge: "FREE",
  cta: "Continue My Treatment",
} as const;

/* ------------------------------------------------------------------ */
/* PREMIUM: "See Tomorrow Before It Happens"                           */
/* ------------------------------------------------------------------ */

export interface PremiumCard {
  title: string;
  desc: string;
  cta?: string;
}

export const premium = {
  headline: "See Tomorrow Before It Happens",
  body: "Free answers the question “what is happening today?”. Premium answers “what will happen tomorrow?”",
  cards: [
    {
      title: "Today's Forecast",
      desc: "Your drug level, appetite and side-effect outlook for the day, before the day happens.",
      cta: "See Tomorrow's Forecast",
    },
    {
      title: "Tomorrow's Appetite",
      desc: "Projects the day your hunger returns this week, so you can plan food and training around it.",
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
      title: "Muscle Loss Alert",
      desc: "Warns you when your rate of loss, protein intake and training suggest muscle is going with the fat.",
    },
    {
      title: "Doctor Report",
      desc: "One tap turns your injections, drug levels, weight and side effects into a report your prescriber can read in 30 seconds.",
      cta: "Generate Doctor Report",
    },
    {
      title: "Correlation Engine",
      desc: "Connects injection timing, protein, sleep and training to what actually moves your results.",
    },
    {
      title: "Trajectory",
      desc: "Simulate different dose paths and habits, and see where each one lands you in 12 weeks.",
    },
    {
      title: "Adaptive Coach",
      desc: "Weekly guidance that changes as your data changes, instead of generic tips.",
    },
  ] as PremiumCard[],
  primary: "Forecast My Progress",
  secondary: "See Tomorrow's Forecast",
} as const;

/* ------------------------------------------------------------------ */
/* UNIQUE POSITIONING                                                  */
/* ------------------------------------------------------------------ */

export const dailyStory = {
  headline: "Your Medication Changes Every Day. Your Decisions Should Too.",
  paragraphs: [
    "A half-life percentage is a snapshot. It is genuinely useful today: it tells you why you are hungry, whether a symptom lines up with your dose, and when your next injection is due. But one number on one day cannot show you the pattern you are actually living in.",
    "Weeks of those numbers, side by side with your weight, your protein and your symptoms, is what turns a calculation into a decision.",
  ],
  unlocks: [
    "Today's drug activity",
    "Tomorrow's appetite forecast",
    "Weekly injection consistency",
    "Fat vs. muscle loss trends",
    "Plateau risk",
    "Long-term progress",
    "Longevity and metabolic health changes",
  ],
  cta: "Start Tracking Free, Turn Daily Drug Levels Into Long-Term Health Insights",
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
    id: "what-is-glp-1-half-life",
    heading: "What is GLP-1 Half-Life?",
    paragraphs: [
      "A drug's half-life is the time it takes for half of it to leave your body. Semaglutide has a half-life of about 7 days and tirzepatide about 5 days. That is why both are injected once weekly: enough medication remains between doses to keep working, so levels never crash to zero.",
      "The number matters less than what it implies. A long half-life means each injection overlaps with the last, so levels build for the first month of any dose before settling into a stable weekly rhythm. It also means the drug fades gradually rather than switching off, which is exactly why your appetite feels different on day 2 than on day 6.",
    ],
    table: {
      caption: "Half-life and time to clear, by medication",
      headers: ["Medication", "Active drug", "Half-life", "Roughly cleared after"],
      rows: [
        ["Ozempic", "Semaglutide", "About 7 days", "5 to 7 weeks"],
        ["Wegovy", "Semaglutide", "About 7 days", "5 to 7 weeks"],
        ["Mounjaro", "Tirzepatide", "About 5 days", "About 4 weeks"],
        ["Zepbound", "Tirzepatide", "About 5 days", "About 4 weeks"],
      ],
    },
  },
  {
    id: "how-long-semaglutide-stays",
    heading: "How Long Does Semaglutide Stay In Your Body?",
    paragraphs: [
      "Semaglutide takes roughly 5 to 7 weeks to clear almost completely after your final injection, because a drug is considered essentially gone after about five half-lives and semaglutide's half-life is about 7 days. Meaningful appetite suppression usually fades within 2 to 4 weeks, well before the drug is fully gone.",
      "Within a normal week of treatment the picture is different. Seven days after an injection, roughly half of that dose is still in you, which is exactly why the once-weekly schedule works. This applies equally to Ozempic and Wegovy, because both are semaglutide.",
    ],
    related: { label: "Semaglutide Dose Calculator", href: "/health/semaglutide-dose-calculator" },
  },
  {
    id: "how-long-tirzepatide-stays",
    heading: "How Long Does Tirzepatide Stay Active?",
    paragraphs: [
      "Tirzepatide has a half-life of about 5 days, so it clears almost completely in roughly 4 weeks after your last dose. Between weekly injections, about 38 percent of each dose is still present when the next one is due, compared with 50 percent for semaglutide. Levels fall a little faster through the week.",
      "In practice this is why some people on Mounjaro or Zepbound notice hunger returning slightly earlier in the week than friends on semaglutide. It is a property of the molecule, not a sign that your dose has stopped working.",
    ],
    related: { label: "Tirzepatide Dose Calculator", href: "/health/tirzepatide-dose-calculator" },
  },
  {
    id: "why-appetite-changes",
    heading: "Why Appetite Changes During The Week",
    paragraphs: [
      "Your appetite tracks your drug level, and your drug level falls every day between injections. Levels peak in the first 24 to 48 hours, stay high through mid-week, then decline toward their lowest point on days 6 and 7. Hunger returning late in the week is the curve working normally, not the medication failing.",
      "This is the single most common worry on GLP-1 forums, and it has a boring answer: you are feeling the shape of the curve. Someone who injects on Sunday and feels ravenous on Saturday is not developing tolerance. They are at the bottom of their weekly trough, hours away from resetting it.",
      "Two things make that trough feel worse than it needs to. Under-eating protein earlier in the week leaves you genuinely hungrier, and a dose that has not yet reached steady state has a shallower peak to fall from. Both are fixable, and neither means the drug has stopped working.",
    ],
    tip: "Expert tip: if hunger reliably spikes on the same day each week, plan for it instead of fighting it. Put your highest-protein, highest-volume meals on that day rather than trying to white-knuckle through it.",
  },
  {
    id: "drug-activity-timeline",
    heading: "Drug Activity Timeline: What Happens Each Day",
    paragraphs: [
      "A weekly GLP-1 injection follows a predictable arc: absorption and peak in the first 1 to 2 days, a comfortable plateau through mid-week, then a steady decline to the weekly low just before your next dose. Side effects cluster near the peak, and hunger returns near the trough.",
    ],
    table: {
      caption: "A typical injection week (semaglutide, 7-day half-life, at steady state)",
      headers: ["Day", "Approximate drug level", "What most people feel"],
      rows: [
        ["Day 0 to 1", "Peak, near 100 percent", "Strongest appetite suppression, most nausea and fatigue"],
        ["Day 2 to 3", "About 80 to 90 percent", "The comfortable window: appetite controlled, side effects settling"],
        ["Day 4 to 5", "About 65 to 75 percent", "Still well suppressed, food noise stays quiet"],
        ["Day 6", "About 55 to 60 percent", "Hunger and cravings begin to return for many people"],
        ["Day 7", "About 50 percent, the trough", "The weekly low point, then the next injection resets it"],
      ],
    },
    tip: "Expert tip: schedule your hardest training session for days 2 to 4, when side effects have settled but appetite suppression is still strong enough to keep you disciplined.",
  },
  {
    id: "missing-an-injection",
    heading: "What Happens If You Miss An Injection?",
    paragraphs: [
      "Missing one dose is not an emergency, because a long half-life means meaningful drug remains for days. For semaglutide, take the missed dose within 5 days and then resume your normal day. For tirzepatide, take it within 4 days as long as your next dose is at least 3 days later. If you are outside that window, skip it.",
      "Never double up to catch up. Two doses close together stack on each other and produce exactly the nausea and vomiting that gradual titration is designed to avoid.",
      "After a longer gap, several weeks rather than several days, drug levels fall far enough that restarting at your full dose can feel like starting over. Your prescriber may restart you lower and titrate back up, which is a normal precaution rather than a setback.",
    ],
    list: [
      "Semaglutide (Ozempic, Wegovy): take it within 5 days, otherwise skip it",
      "Tirzepatide (Mounjaro, Zepbound): take it within 4 days if the next dose is at least 3 days away",
      "Never double up: semaglutide doses must be at least 48 hours apart, tirzepatide at least 72 hours",
      "After a gap of several weeks, contact your prescriber before injecting your usual dose",
    ],
  },
  {
    id: "delayed-injection",
    heading: "Can You Inject A Day Early Or A Day Late?",
    paragraphs: [
      "A day either side of your usual injection day is generally fine and is explicitly allowed for both semaglutide and tirzepatide, as long as consecutive doses stay at least 48 hours apart for semaglutide, or 72 hours for tirzepatide. Because the half-life is measured in days, shifting by 24 hours barely changes your level. Consistency still beats convenience.",
      "Changing your injection day permanently is also allowed, as long as you keep that minimum gap between doses: 48 hours for semaglutide, 72 hours for tirzepatide. Many people move their shot to a Friday or Saturday so that peak-day nausea lands on a day off rather than a workday.",
    ],
    tip: "Expert tip: pick your injection day around your life, not the pharmacy's calendar. If the 24 to 48 hours after your shot make you feel rough, put that window on a weekend.",
  },
  {
    id: "travel",
    heading: "Travel, Flying And Time Zones",
    paragraphs: [
      "Time zones do not meaningfully affect a drug with a multi-day half-life, so keep your usual injection day and inject at whatever local time is convenient. Carry pens in your hand luggage, never in checked baggage, where the hold can freeze them. A pharmacy label and your prescription make security straightforward.",
      "Keep the medication cool in transit with a travel case and a cool pack, and avoid leaving it in a hot car or in direct sun. If a trip means you will miss your usual day entirely, shifting the injection a day or two either side is safer than skipping it, as long as doses stay at least 48 hours apart for semaglutide, or 72 hours for tirzepatide.",
    ],
  },
  {
    id: "storage",
    heading: "Storage: Refrigeration And Warm Medication",
    paragraphs: [
      "Store unopened GLP-1 pens in the fridge between 2 and 8 degrees Celsius, and never freeze them. A pen that has frozen must be thrown away even if it looks normal. Once in use, most pens can be kept at room temperature for a limited period, which is set by the manufacturer, so check your own leaflet.",
      "Letting a cold pen sit out for 20 to 30 minutes before injecting makes the shot noticeably more comfortable, because cold liquid stings more going in. Never warm a pen deliberately with hot water or a microwave, and never use medication that looks cloudy, discoloured or has particles in it.",
    ],
    list: [
      "Unopened pens: refrigerate at 2 to 8 degrees Celsius and never freeze",
      "In use: room temperature is allowed for a limited window, check your specific leaflet",
      "Discard any pen that has frozen, even if it looks fine",
      "Let a cold pen reach room temperature naturally before injecting to reduce sting",
      "Never use medication that is cloudy, discoloured or contains particles",
    ],
  },
  {
    id: "protein",
    heading: "Protein: Eat It When You Can Actually Eat",
    paragraphs: [
      "Aim for roughly 1.2 to 1.6 grams of protein per kilogram of body weight daily during active weight loss. The practical challenge on a GLP-1 is timing, not arithmetic: appetite is lowest right after your injection, so front-load protein in the window where eating is easiest and always put it first on the plate.",
      "This matters because protein is what decides whether the weight you lose is fat or muscle. When appetite drops, protein is the first thing people under-eat, and low protein during rapid loss accelerates muscle loss, which lowers your metabolism and makes the weight easier to regain.",
    ],
    tip: "Expert tip: on peak days when solid food is unappealing, drink your protein. A shake, Greek yogurt or cottage cheese goes down when a chicken breast will not.",
    related: { label: "Macro Calculator", href: "/health/macro-calculator" },
  },
  {
    id: "exercise",
    heading: "Exercise: Timing Your Training Around The Curve",
    paragraphs: [
      "Train hard in the middle of your week, roughly days 2 to 5, when early nausea has settled but drug levels remain high. Resistance training two to three times weekly is the highest-value exercise on a GLP-1, because it is the signal that tells your body to keep muscle while it sheds fat. Add moderate cardio for heart health.",
      "The 24 to 48 hours right after an injection are the most likely to bring nausea and fatigue, so keep those days lighter: walking, mobility work, or an easy session rather than your heaviest lifts.",
    ],
    related: { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
  },
  {
    id: "hydration",
    heading: "Hydration: The Habit That Fixes The Most Symptoms",
    paragraphs: [
      "Aim for about 30 to 35 ml of fluid per kilogram of body weight daily, which is roughly 2 to 3 litres for most adults, and more when nausea or vomiting is in play. GLP-1 medications dull thirst signals along with hunger, so dehydration creeps up without you noticing.",
      "If you change one habit during your peak days, make it this one. Consistent hydration measurably reduces the two most common complaints on these drugs: headaches and constipation.",
    ],
    related: { label: "Daily Water Intake Calculator", href: "/health/daily-water-intake-calculator" },
  },
];

/* ------------------------------------------------------------------ */
/* CONTENT CLUSTER                                                     */
/* Direct answers to the long tail of questions people actually search */
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
    id: "medication-duration",
    title: "Medication Duration",
    items: [
      {
        question: "How long does semaglutide stay in your system?",
        answer:
          "About 5 to 7 weeks to clear almost completely after your last dose, based on a 7-day half-life and the rule that a drug is essentially gone after five half-lives. Appetite suppression usually fades within 2 to 4 weeks, well before the drug itself has gone.",
      },
      {
        question: "How long does tirzepatide stay in your body?",
        answer:
          "About 4 weeks after your final injection, based on a half-life of roughly 5 days. Between weekly doses, around 38 percent of each injection is still present when the next one is due.",
      },
      {
        question: "How many days does Ozempic last?",
        answer:
          "Ozempic is semaglutide, so a single dose stays meaningfully active for the full 7-day interval and beyond. Seven days after your injection, roughly half of that dose is still in your body, which is exactly why once-weekly dosing works.",
      },
      {
        question: "When does Wegovy wear off?",
        answer:
          "Not abruptly. Levels fall gradually all week and reach their lowest point just before your next dose, then the new injection resets them. After stopping entirely, appetite typically returns over 2 to 4 weeks as levels decline.",
      },
      {
        question: "When does Mounjaro stop working?",
        answer:
          "If hunger returns late in the week, Mounjaro has not stopped working. You are at the trough of a normal weekly curve. A genuine loss of effect over months is more often about dose, adherence or a weight plateau, and is a conversation for your prescriber.",
      },
    ],
  },
  {
    id: "drug-activity",
    title: "Drug Activity",
    items: [
      {
        question: "Is my GLP-1 still working?",
        answer:
          "Almost certainly yes. With a 5 to 7 day half-life, meaningful drug is present every single day of your dosing week. What changes is how much: levels peak within 1 to 2 days of injecting and fall to their weekly low just before the next dose.",
      },
      {
        question: "Why am I hungry before injection day?",
        answer:
          "Because your drug level is at its lowest point of the week. Hunger returning on day 6 or 7 is the expected shape of the curve, not tolerance, and your next injection resets it.",
      },
      {
        question: "How much drug activity is left after 3 days?",
        answer:
          "Roughly 75 percent of peak for semaglutide and about 66 percent for tirzepatide. Most people feel well controlled here: early side effects have settled and appetite suppression is still strong.",
      },
      {
        question: "How much drug activity is left after 5 days?",
        answer:
          "Roughly 61 percent of peak for semaglutide and about 50 percent for tirzepatide. This is where many people notice food becoming interesting again.",
      },
      {
        question: "How much drug activity is left after 7 days?",
        answer:
          "About 50 percent for semaglutide and about 38 percent for tirzepatide. This is the weekly trough, the moment your next injection is due.",
      },
    ],
  },
  {
    id: "injection-timing",
    title: "Injection Timing",
    items: [
      {
        question: "What if I miss my injection?",
        answer:
          "Take semaglutide within 5 days of the missed dose, or tirzepatide within 4 days provided the next dose is at least 72 hours later. Outside that window, skip it and resume your normal schedule. Never double up.",
      },
      {
        question: "Can I inject one day early?",
        answer:
          "Yes, as long as consecutive doses stay at least 48 hours apart for semaglutide, or 72 hours for tirzepatide. A 24-hour shift barely moves a drug with a multi-day half-life.",
      },
      {
        question: "Can I inject one day late?",
        answer:
          "Yes. A day late leaves you slightly lower at the trough, which you may feel as extra hunger, but it does not undo your treatment. Return to your usual day for the next dose.",
      },
      {
        question: "Can I change my injection day?",
        answer:
          "Yes. Both semaglutide and tirzepatide allow a permanent change of injection day, provided the minimum gap between consecutive doses is respected: at least 48 hours for semaglutide, at least 72 hours for tirzepatide.",
      },
      {
        question: "What is the best day of the week to inject a GLP-1?",
        answer:
          "Whichever day puts the peak side-effect window, the 24 to 48 hours after your shot, somewhere you can afford to feel rough. Many people choose Friday or Saturday so nausea lands on a day off rather than a workday.",
      },
    ],
  },
  {
    id: "appetite",
    title: "Appetite",
    items: [
      {
        question: "Why am I hungry on day 6?",
        answer:
          "Because day 6 sits near the bottom of your weekly drug curve. Levels have been falling since your injection, and hunger scales with that decline. It is the most predictable complaint on GLP-1 medication and the least worrying.",
      },
      {
        question: "Why do my cravings return before my next dose?",
        answer:
          "Cravings and food noise are among the first things to come back as drug levels approach their weekly low. Adequate protein earlier in the week noticeably softens this, because you arrive at the trough genuinely fed rather than under-eaten.",
      },
      {
        question: "What is appetite like right after an injection?",
        answer:
          "Usually at its lowest. The first 24 to 48 hours bring the strongest suppression of the week, and often the strongest side effects too. Eating small, protein-first meals during this window matters more than eating a lot.",
      },
      {
        question: "What is appetite like before the next dose?",
        answer:
          "Noticeably stronger. Expect hunger and cravings to return on days 6 and 7, plan your highest-protein and highest-volume meals for those days, and remember your next injection resets the curve.",
      },
    ],
  },
  {
    id: "side-effects",
    title: "Side Effects",
    items: [
      {
        question: "Why is nausea worse after an injection?",
        answer:
          "Because drug levels peak in the 24 to 48 hours after your shot, and nausea tracks that peak. It is also worst in the weeks following a dose increase, and it fades as your gut adapts.",
      },
      {
        question: "When are side effects strongest?",
        answer:
          "In the first 1 to 2 days after injection, and in the first weeks at any new dose. That is precisely why titration exists: each step gives your digestive system time to adapt before the next increase.",
      },
      {
        question: "What is the fatigue timeline on a GLP-1?",
        answer:
          "Fatigue typically appears near the peak, in the 1 to 2 days after injecting, and during escalation weeks. Persistent fatigue across the whole week is more often about under-eating and dehydration than about the drug itself, and is worth raising with your prescriber.",
      },
      {
        question: "What is the constipation timeline?",
        answer:
          "Constipation builds across the week rather than spiking after an injection, because slowed gut transit is a continuous effect. Fibre, fluid and daily movement are the first line of defence, and hydration matters more than most people expect.",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety",
    items: [
      {
        question: "What happens if I take a double dose?",
        answer:
          "Do not do it. Two doses close together stack, because the previous one has not cleared, and the usual result is severe nausea and vomiting. If you have accidentally double-dosed, contact your prescriber or a poison information line and watch for dehydration and low blood sugar.",
      },
      {
        question: "Does my medication need to be refrigerated?",
        answer:
          "Unopened pens: yes, at 2 to 8 degrees Celsius, and never frozen. Once in use, most pens tolerate room temperature for a limited window that is set by the manufacturer, so check your own leaflet.",
      },
      {
        question: "What if my medication got warm?",
        answer:
          "Brief periods at room temperature are usually acceptable within the manufacturer's stated window, but prolonged heat is not. If a pen has been left somewhere hot, has frozen, or looks cloudy or discoloured, do not use it and speak to your pharmacist.",
      },
      {
        question: "Can I let a cold pen warm up before injecting?",
        answer:
          "Yes, and it helps. Letting a pen sit at room temperature for 20 to 30 minutes makes the injection noticeably more comfortable. Never warm it deliberately with hot water or a microwave.",
      },
    ],
  },
  {
    id: "comparisons",
    title: "Comparisons",
    items: [
      {
        question: "Semaglutide vs tirzepatide half-life",
        answer:
          "Semaglutide is about 7 days, tirzepatide about 5 days. In practice, semaglutide holds roughly 50 percent of its peak at the end of the week, while tirzepatide holds about 38 percent, which is why hunger sometimes returns slightly earlier on tirzepatide.",
      },
      {
        question: "Ozempic vs Wegovy",
        answer:
          "The same drug, semaglutide, and the same 7-day half-life. They differ in approved indication and maximum dose: Ozempic is for type 2 diabetes up to 2 mg, Wegovy for weight management up to 2.4 mg.",
      },
      {
        question: "Mounjaro vs Zepbound",
        answer:
          "The same drug, tirzepatide, the same 5-day half-life and the same 2.5 mg to 15 mg dose range. The difference is the approved use: Mounjaro for type 2 diabetes, Zepbound for chronic weight management and obstructive sleep apnoea.",
      },
      {
        question: "Does half-life affect weight loss?",
        answer:
          "Indirectly. A long half-life is what keeps appetite suppression running between injections, so consistent weekly dosing matters more than the exact day. What drives your results is the dose, your adherence, your protein intake and your training, not the half-life number itself.",
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
    question: "How does the GLP-1 half-life calculator work?",
    answer:
      "You enter your medication, your weekly dose, when you last injected and your usual injection day. The calculator applies the published elimination half-life for your drug, about 7 days for semaglutide and about 5 days for tirzepatide, to estimate how much of your peak level is still active right now, what that means for appetite and side effects, and when your next dose is due. It runs entirely in your browser.",
  },
  {
    question: "What is the half-life of semaglutide?",
    answer:
      "About 7 days. That means 7 days after an injection, roughly half of that dose is still in your body, which is what makes once-weekly dosing possible. Full clearance after your final dose takes about 5 to 7 weeks.",
  },
  {
    question: "What is the half-life of tirzepatide?",
    answer:
      "About 5 days. Tirzepatide clears somewhat faster than semaglutide, holding around 38 percent of its peak at the end of a 7-day interval compared with about 50 percent for semaglutide.",
  },
  {
    question: "Is my GLP-1 still working if I feel hungry?",
    answer:
      "Yes. Hunger returning late in the week reflects the natural decline in drug level between injections, not tolerance or failure. Meaningful medication is present every day of your dosing week, but the amount falls steadily until your next injection resets it.",
  },
  {
    question: "Does the estimated drug activity percentage mean I need a higher dose?",
    answer:
      "No. The percentage describes where you are in a normal weekly cycle, and it falls every week by design. Dose decisions belong to your prescriber and are based on your response, your tolerability and the FDA titration schedule, never on a number from an online calculator.",
  },
  {
    question: "What happens if I miss a dose?",
    answer:
      "For semaglutide, take it within 5 days and then resume your usual day. For tirzepatide, take it within 4 days as long as the next dose is at least 72 hours later. Outside those windows, skip the dose. Never double up to catch up.",
  },
  {
    question: "Can I change my injection day?",
    answer:
      "Yes, provided consecutive doses stay at least 48 hours apart for semaglutide, or 72 hours for tirzepatide. Many people move their injection to a Friday or Saturday so that the peak side-effect window falls on a day off.",
  },
  {
    question: "Is this an actual measurement of my blood level?",
    answer:
      "No. It is an educational model built from published pharmacokinetics and the details you entered. It cannot account for your individual metabolism, kidney function or absorption, and it is not a blood test. Use it to understand your week, not to make dosing decisions.",
  },
  {
    question: "Is the calculator free? Do I need an account?",
    answer:
      "The calculator is completely free and needs no sign-up. Every result, chart and target appears instantly. A free Calqulate account is optional and adds daily drug activity tracking, injection reminders and your full progress history.",
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
    label: "Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1). NEJM 2022",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038",
  },
  {
    label: "Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1). NEJM 2021",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
  },
] as const;

export const medicalDisclaimer =
  "Calqulate Vitals provides educational information based on published FDA prescribing information and pharmacokinetic data. It is not medical advice, does not create a doctor and patient relationship, and must not be used to start, stop, delay or change any medication. The drug activity figure is a model, not a blood measurement. Always follow your prescriber's instructions, and never take an extra or double dose. If you experience severe abdominal pain, persistent vomiting, symptoms of low blood sugar or an allergic reaction, seek medical care immediately.";
