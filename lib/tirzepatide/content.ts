/**
 * ============================================================
 * TIRZEPATIDE TREATMENT ASSISTANT: CONTENT
 * All page copy, SEO content, FAQ and medication data for the
 * Calqulate Vitals Tirzepatide Treatment Assistant.
 * calqulate.net/health/tirzepatide-dose-calculator
 *
 * Everything the page says lives here. The UI
 * (components/calculators/tirzepatide-treatment-assistant.tsx)
 * only renders this data.
 * ============================================================
 */

export const SITE = {
  name: "Calqulate Vitals",
  url: "https://calqulate.net",
  pageUrl: "https://calqulate.net/health/tirzepatide-dose-calculator",
  pagePath: "/health/tirzepatide-dose-calculator",
} as const;

/* ------------------------------------------------------------------ */
/* SEO METADATA                                                        */
/* ------------------------------------------------------------------ */

export const seo = {
  title: "Tirzepatide Dose Calculator: Weekly Schedule, Chart & Drug Activity",
  description:
    "Free tirzepatide dose calculator. Check your current treatment stage, the standard FDA weekly dose schedule for Mounjaro and Zepbound, dose escalation timing, estimated drug activity, protein and hydration targets. Instant results, no sign-up required.",
  keywords: [
    "tirzepatide dose calculator",
    "tirzepatide dosage calculator",
    "tirzepatide dosing calculator",
    "mounjaro dose calculator",
    "zepbound dose calculator",
    "tirzepatide weekly dose",
    "tirzepatide dose chart",
    "GLP-1 dose calculator",
    "tirzepatide treatment calculator",
    "tirzepatide titration schedule",
  ],
  ogTitle: "Tirzepatide Dose Calculator | Calqulate Vitals",
  ogDescription:
    "Understand your tirzepatide treatment in seconds: current stage, FDA weekly dose schedule for Mounjaro and Zepbound, estimated drug activity, and what to expect next. Free, private, no sign-up.",
} as const;

/* ------------------------------------------------------------------ */
/* MEDICATION DATA: FDA prescribing schedules                          */
/* (Sources: Mounjaro & Zepbound Prescribing Information, Eli Lilly)   */
/* ------------------------------------------------------------------ */

export type MedicationId = "mounjaro" | "zepbound" | "compounded";

export interface DoseStep {
  fromWeek: number; // inclusive
  toWeek: number | null; // inclusive; null = onwards
  doseMg: number;
  label: string;
  phase: "initiation" | "escalation" | "maintenance";
}

export interface Medication {
  id: MedicationId;
  name: string;
  genericLabel: string;
  doses: number[]; // selectable weekly doses (mg)
  schedule: DoseStep[];
  maintenanceDoseMg: number[];
  note: string;
}

/** Every tirzepatide product titrates in 2.5 mg steps, minimum 4 weeks per step. */
export const MEDICATIONS: Medication[] = [
  {
    id: "mounjaro",
    name: "Mounjaro",
    genericLabel: "tirzepatide (type 2 diabetes)",
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    schedule: [
      { fromWeek: 1, toWeek: 4, doseMg: 2.5, label: "Weeks 1 to 4", phase: "initiation" },
      { fromWeek: 5, toWeek: 8, doseMg: 5, label: "Weeks 5 to 8", phase: "escalation" },
      { fromWeek: 9, toWeek: 12, doseMg: 7.5, label: "Weeks 9 to 12 (if needed)", phase: "escalation" },
      { fromWeek: 13, toWeek: 16, doseMg: 10, label: "Weeks 13 to 16 (if needed)", phase: "escalation" },
      { fromWeek: 17, toWeek: 20, doseMg: 12.5, label: "Weeks 17 to 20 (if needed)", phase: "escalation" },
      { fromWeek: 21, toWeek: null, doseMg: 15, label: "Week 21 onwards (max)", phase: "maintenance" },
    ],
    maintenanceDoseMg: [5, 7.5, 10, 12.5, 15],
    note: "FDA-approved for type 2 diabetes. The 2.5 mg starting dose is for treatment initiation only and is not intended for glycemic control. Any dose from 5 mg to 15 mg can be a maintenance dose, and your prescriber increases only if more blood sugar control is needed, with at least 4 weeks at each step.",
  },
  {
    id: "zepbound",
    name: "Zepbound",
    genericLabel: "tirzepatide (chronic weight management)",
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    schedule: [
      { fromWeek: 1, toWeek: 4, doseMg: 2.5, label: "Weeks 1 to 4", phase: "initiation" },
      { fromWeek: 5, toWeek: 8, doseMg: 5, label: "Weeks 5 to 8", phase: "escalation" },
      { fromWeek: 9, toWeek: 12, doseMg: 7.5, label: "Weeks 9 to 12", phase: "escalation" },
      { fromWeek: 13, toWeek: 16, doseMg: 10, label: "Weeks 13 to 16", phase: "escalation" },
      { fromWeek: 17, toWeek: 20, doseMg: 12.5, label: "Weeks 17 to 20", phase: "escalation" },
      { fromWeek: 21, toWeek: null, doseMg: 15, label: "Week 21 onwards (max)", phase: "maintenance" },
    ],
    maintenanceDoseMg: [5, 10, 15],
    note: "FDA-approved for chronic weight management. The recommended maintenance doses are 5 mg, 10 mg or 15 mg once weekly. The 2.5 mg starting dose is for treatment initiation only and is not a maintenance dose.",
  },
  {
    id: "compounded",
    name: "Compounded Tirzepatide",
    genericLabel: "compounded tirzepatide (provider-specific)",
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    schedule: [
      { fromWeek: 1, toWeek: 4, doseMg: 2.5, label: "Weeks 1 to 4 (typical)", phase: "initiation" },
      { fromWeek: 5, toWeek: 8, doseMg: 5, label: "Weeks 5 to 8 (typical)", phase: "escalation" },
      { fromWeek: 9, toWeek: 12, doseMg: 7.5, label: "Weeks 9 to 12 (typical)", phase: "escalation" },
      { fromWeek: 13, toWeek: 16, doseMg: 10, label: "Weeks 13 to 16 (typical)", phase: "escalation" },
      { fromWeek: 17, toWeek: 20, doseMg: 12.5, label: "Weeks 17 to 20 (typical)", phase: "escalation" },
      { fromWeek: 21, toWeek: null, doseMg: 15, label: "Week 21 onwards (typical)", phase: "maintenance" },
    ],
    maintenanceDoseMg: [5, 7.5, 10, 12.5, 15],
    note: "Compounded tirzepatide is not FDA-approved and protocols vary by provider. Most providers mirror the Zepbound titration schedule, but concentrations differ between pharmacies and doses are often drawn in units rather than pre-set pen clicks. Always follow your prescriber's exact instructions.",
  },
];

/** Tirzepatide elimination half-life in days (label: approx. 5 days). */
export const HALF_LIFE_DAYS = 5;
/** Weeks of once-weekly dosing to reach approximately steady state. */
export const STEADY_STATE_WEEKS = 4;
/** Length of the pivotal SURMOUNT-1 trial, used as the timeline horizon. */
export const TIMELINE_WEEKS = 72;

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: "Free GLP-1 Treatment Tool",
  headline: "Tirzepatide Dose Calculator",
  subheadline:
    "Calculate your current tirzepatide treatment stage, standard weekly dosing schedule, estimated medication activity, and personalised treatment insights in seconds.",
  trustBadges: [
    { icon: "check", text: "Free forever" },
    { icon: "shield", text: "Based on FDA prescribing schedules" },
    { icon: "user-x", text: "No sign-up required" },
    { icon: "lock", text: "Private, runs entirely in your browser" },
  ],
  cta: "Start Calculator",
  secondaryCta: "View Weekly Dose Schedule",
  secondaryCtaHref: "#dose-schedule",
} as const;

/* ------------------------------------------------------------------ */
/* WIZARD (6 steps)                                                    */
/* ------------------------------------------------------------------ */

export const wizard = {
  stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
  steps: [
    {
      id: "medication",
      question: "Which medication are you taking?",
      helper: "Mounjaro and Zepbound contain the same drug and titrate the same way. Compounded protocols vary by provider.",
    },
    {
      id: "dose",
      question: "What is your current weekly dose?",
      helper: "Check your pen or vial label. Tirzepatide is dosed in milligrams (mg), injected once weekly.",
    },
    {
      id: "weeks",
      question: "How many weeks have you been taking tirzepatide?",
      helper: "Count from your very first injection, including your 2.5 mg starting weeks.",
    },
    {
      id: "weight",
      question: "What is your current weight?",
      helper: "Used only to personalise your protein and hydration targets. Never stored, never sent anywhere.",
    },
    {
      id: "goal",
      question: "What is your treatment goal?",
      helper: "This tailors your snapshot: pacing, targets, and what to watch for.",
    },
    {
      id: "symptoms",
      question: "Any symptoms right now?",
      helper: "Optional. Select everything you are feeling this week, or choose None.",
    },
  ],
  goals: [
    { id: "weight-loss", label: "Weight Loss", desc: "Reduce body weight and appetite" },
    { id: "diabetes", label: "Type 2 Diabetes", desc: "Improve blood sugar control" },
    { id: "maintenance", label: "Maintenance", desc: "Hold results at a stable dose" },
  ],
  symptoms: [
    { id: "nausea", label: "Nausea" },
    { id: "constipation", label: "Constipation" },
    { id: "fatigue", label: "Fatigue" },
    { id: "none", label: "None" },
  ],
  back: "Back",
  next: "Continue",
  skip: "Skip this step",
  finish: "See My Treatment Snapshot",
} as const;

export type SymptomId = "nausea" | "constipation" | "fatigue" | "none";

/** Practical, stage-aware guidance for each symptom the user reports. */
export const symptomTips: Record<Exclude<SymptomId, "none">, string> = {
  nausea:
    "Nausea is the most common tirzepatide side effect and is usually worst in the first days after an injection and in the weeks following a dose increase. Smaller portions, less fried and fatty food, eating slowly, and staying upright after meals all help. Tell your prescriber if you cannot keep fluids down.",
  constipation:
    "Tirzepatide slows the gut, so constipation is common. Fibre, fluid and daily movement are the first line of defence, and hitting your hydration target below matters more than usual. Ask your prescriber before starting any laxative.",
  fatigue:
    "Fatigue often tracks with eating too little rather than the drug itself. When appetite drops, calories and protein can fall further than intended. Check that you are hitting the protein target below and not skipping meals entirely, and mention persistent fatigue to your prescriber.",
};

/* ------------------------------------------------------------------ */
/* RESULT SNAPSHOT: labels and insight copy                            */
/* ------------------------------------------------------------------ */

export const snapshot = {
  title: "Your Treatment Snapshot",
  subtitle: "A full picture of where you are today, not just a number.",
  labels: {
    medication: "Current Medication",
    stage: "Treatment Stage",
    dose: "Current Dose",
    activity: "Estimated Drug Activity",
    fdaStage: "Standard Titration Stage",
    nextReview: "Next Standard Review",
    sideEffects: "Common Side Effects",
    appetite: "Expected Appetite",
    energy: "Expected Energy",
    hydration: "Hydration Goal",
    protein: "Protein Goal",
    pace: "Estimated Weight Loss Pace",
    muscleRisk: "Muscle Preservation Risk",
    status: "Overall Treatment Status",
  },
  statusOnTrack: "🟢 On Track",
  statusAhead: "🟡 Ahead of Schedule, confirm with your prescriber",
  statusBehind: "🟡 Behind Typical Schedule, this can be intentional. Ask your prescriber",
  statusMaintenance: "🟢 Maintenance Phase",
  disclaimer:
    "This snapshot is educational, based on published FDA prescribing schedules and pharmacokinetics. It is not medical advice and never replaces your prescriber's instructions. Never change your dose without talking to your healthcare provider.",
} as const;

/** Phase-specific insight paragraphs (explain why, not just the result). */
export const insightsByPhase: Record<string, (week: number) => string> = {
  initiation: (week) =>
    `You have completed approximately ${week} week${week === 1 ? "" : "s"} of treatment, which is the initiation phase. The 2.5 mg starting dose is deliberately below the therapeutic range: its job is to let your digestive system adapt so that later doses are tolerable. Little or no weight change at this stage is completely normal and expected.`,
  escalation: (week) =>
    `At approximately week ${week}, many people have adjusted to appetite suppression and begin seeing more consistent weight loss trends. This stage is a good time to focus on preserving muscle with adequate protein intake and resistance training, because tirzepatide creates the calorie deficit for you and your job is to aim that deficit at fat rather than lean tissue.`,
  maintenance: (week) =>
    `At roughly week ${week}, you are in the maintenance phase. The goal shifts from escalating dose to holding results: consistent weekly injections, steady protein, hydration and strength work. Plateaus here are common and usually reflect your body settling at a new set point rather than treatment failure.`,
};

export const sideEffectsByPhase: Record<string, string> = {
  initiation: "Mild nausea, occasional fatigue",
  escalation: "Mild nausea, early satiety, constipation",
  maintenance: "Usually mild or none, occasional GI discomfort after dose day",
};

export const appetiteByPhase: Record<string, string> = {
  initiation: "Slightly reduced",
  escalation: "Reduced",
  maintenance: "Low and stable",
};

export const energyByPhase: Record<string, string> = {
  initiation: "Normal",
  escalation: "Normal, dips possible after dose day",
  maintenance: "Stable",
};

/* ------------------------------------------------------------------ */
/* "WHAT YOU'LL MISS" TIMELINE (differentiator section)                */
/* ------------------------------------------------------------------ */

export const missTimeline = {
  headline: "What you will miss if you do not save today's result",
  rows: [
    { week: "Week 1", text: "Today's dose", unlocked: true },
    { week: "Week 2", text: "Drug levels between injections", unlocked: true },
    { week: "Week 4", text: "Weight trend", unlocked: true },
    { week: "Week 8", text: "Fat vs. muscle estimate", unlocked: false },
    { week: "Week 12", text: "Plateau prediction", unlocked: false },
    { week: "Week 20", text: "Progress forecast", unlocked: false },
  ],
  cta: "Start Tracking Free",
} as const;

/* ------------------------------------------------------------------ */
/* FREE FEATURES + SIGN-UP CTA                                         */
/* ------------------------------------------------------------------ */

export const freeFeatures = {
  headline: "Everything here stays free, forever",
  items: [
    "Dose calculator",
    "Standard FDA dosing schedule",
    "Estimated drug activity",
    "Weekly treatment timeline",
    "PK curve",
    "Hydration recommendation",
    "Protein recommendation",
    "Educational insights",
    "Side-effect overview",
    "Current treatment stage",
  ],
} as const;

export const freeCta = {
  headline: "Continue Your Tirzepatide Journey",
  body: "Today's result is only one moment in your treatment. Create a free Calqulate account to:",
  bullets: [
    "Save today's dose",
    "Build your injection history",
    "Track every week's progress",
    "Never lose your data",
    "Continue across all your devices",
  ],
  primary: "Start Tracking Free",
  secondary: "Continue Without Saving",
  badge: "Free forever",
} as const;

/* ------------------------------------------------------------------ */
/* DASHBOARD PREVIEW                                                   */
/* ------------------------------------------------------------------ */

export const dashboardPreview = {
  title: "Your dashboard, one tap away",
  tiles: [
    "Today's Injection",
    "Drug Activity",
    "Weight Trend",
    "Protein",
    "Hydration",
    "PK Curve",
    "Timeline",
    "Recent Entries",
    "Forecast",
  ],
  badge: "FREE",
  cta: "Continue My Treatment",
} as const;

/* ------------------------------------------------------------------ */
/* PREMIUM: "See What's Next"                                          */
/* ------------------------------------------------------------------ */

export interface PremiumCard {
  title: string;
  desc: string;
  /** Cards without a CTA are shown as plain feature tiles. */
  cta?: string;
}

export const premium = {
  headline: "See What's Next",
  body: "Calqulate Vitals predicts your treatment, not just today's dose. Free answers the question “what should I do today?”. Premium answers “what happens next?”",
  cards: [
    {
      title: "Progress Forecast",
      desc: "Projects your weight curve week by week from your own data, not a population average.",
      cta: "Forecast My Progress",
    },
    {
      title: "Plateau Prediction",
      desc: "Flags the week your loss is statistically likely to stall, before the scale stops moving.",
      cta: "See My 8-Week Outlook",
    },
    {
      title: "Fat vs Muscle Trend",
      desc: "Splits every kilogram you lose into fat and lean mass, so the scale stops lying to you.",
      cta: "Protect My Muscle",
    },
    {
      title: "Muscle Loss Detection",
      desc: "Alerts you the moment your rate of loss, protein intake and training suggest muscle is going with the fat.",
    },
    {
      title: "Correlation Engine",
      desc: "Connects side effects, dose timing, protein, sleep and training to what actually moves your results.",
    },
    {
      title: "Trajectory Simulator",
      desc: "Model different dose paths and protein targets and see where each one lands you in 12 weeks.",
    },
    {
      title: "Doctor PDF Report",
      desc: "One tap turns your doses, drug levels, weight and side effects into a report your prescriber can read in 30 seconds.",
      cta: "Generate Doctor Report",
    },
    {
      title: "Adaptive Coach",
      desc: "Weekly guidance that changes as your data changes, instead of generic tips.",
    },
    {
      title: "Multi-compound Tracking",
      desc: "Switching between tirzepatide and semaglutide, or stacking supporting medication, stays on one timeline.",
    },
    {
      title: "Refill Tracker",
      desc: "Counts the doses left in your pen and warns you before a gap in treatment forces a titration restart.",
    },
  ] as PremiumCard[],
  primary: "Forecast My Progress",
  secondary: "See My Future",
} as const;

/* ------------------------------------------------------------------ */
/* UNIQUE POSITIONING: "The Scale Doesn't Tell the Whole Story"         */
/* ------------------------------------------------------------------ */

export const scaleStory = {
  headline: "The Scale Doesn't Tell the Whole Story",
  paragraphs: [
    "Two people can lose the same 10 kg on tirzepatide and end up in completely different places. One loses mostly fat and keeps their muscle, their metabolism and their strength. The other loses a significant share of lean tissue, which lowers resting calorie burn and makes the weight far easier to regain the moment they taper off.",
    "The scale reports one number for both of them. Tracking over time is what separates the two.",
  ],
  unlocks: [
    "Fat vs. Muscle Loss Trend",
    "Muscle Loss Alerts",
    "Longevity Score",
    "Metabolic Health Score",
    "Plateau Prediction",
    "Personalised Progress Forecast",
  ],
  cta: "Start Tracking Free, Protect More Than Just Your Weight",
} as const;

/* ------------------------------------------------------------------ */
/* EDUCATIONAL SEO CONTENT                                             */
/* Each section opens with a direct 40 to 60 word answer for AI        */
/* Overviews and featured snippets.                                    */
/* ------------------------------------------------------------------ */

export interface ContentSection {
  id: string;
  heading: string;
  paragraphs: string[];
  table?: { caption: string; headers: string[]; rows: string[][] };
  list?: string[];
  tip?: string;
}

export const educationSections: ContentSection[] = [
  {
    id: "what-is-tirzepatide",
    heading: "What is Tirzepatide?",
    paragraphs: [
      "Tirzepatide is a once-weekly injectable medication that activates two gut hormone receptors, GIP and GLP-1. It is sold as Mounjaro for type 2 diabetes and as Zepbound for chronic weight management. Both contain the identical drug, are injected once a week, and follow the same 2.5 mg to 15 mg dose schedule.",
      "That dual action is what sets tirzepatide apart from semaglutide, which acts on GLP-1 alone. In the SURMOUNT-1 trial, adults without diabetes taking 15 mg lost an average of about 21 percent of their body weight over 72 weeks, the largest average reduction seen with any approved anti-obesity medication to date.",
      "Because the drug acts strongly on the digestive system, treatment always starts at a low dose and steps up gradually, a process called titration. This calculator maps exactly where you are in that process.",
    ],
  },
  {
    id: "how-tirzepatide-works",
    heading: "How Tirzepatide Works",
    paragraphs: [
      "Tirzepatide mimics two hormones your gut releases after eating, GIP and GLP-1. Together they slow stomach emptying, increase insulin release when blood sugar is high, suppress glucagon, and act on appetite centres in the brain. The result is that you feel full sooner, stay full longer, and feel hungry less often.",
      "The practical consequence is that the calorie deficit happens on its own. You are not fighting hunger with willpower, which is why the medication works where dieting alone often fails. It also explains the side effects: the same slowed digestion that keeps you full is what causes nausea and constipation.",
      "It also explains why what you eat during treatment matters so much. When total intake falls without effort, protein is usually the first thing to drop, and that is precisely what puts your muscle at risk.",
    ],
    tip: "Expert tip: treat the appetite suppression as a tool, not a diet. Use the smaller amount of food you now want for protein and vegetables first, and let everything else fill the space that is left.",
  },
  {
    id: "dose-schedule",
    heading: "FDA Weekly Dose Schedule",
    paragraphs: [
      "Tirzepatide starts at 2.5 mg once weekly for 4 weeks, then increases to 5 mg. After that, the dose can rise in 2.5 mg steps, with at least 4 weeks at each step, up to a maximum of 15 mg weekly. Mounjaro and Zepbound share this schedule exactly.",
      "The 2.5 mg starting dose is an initiation dose. It is not intended to control blood sugar or produce weight loss, so judging whether the medication is working during your first month is premature by design.",
    ],
    table: {
      caption: "FDA standard titration schedule for tirzepatide (once-weekly injection)",
      headers: ["Weeks", "Weekly dose", "Stage"],
      rows: [
        ["1 to 4", "2.5 mg", "Initiation (not a therapeutic dose)"],
        ["5 to 8", "5 mg", "First therapeutic dose"],
        ["9 to 12", "7.5 mg", "Escalation, only if needed"],
        ["13 to 16", "10 mg", "Escalation, only if needed"],
        ["17 to 20", "12.5 mg", "Escalation, only if needed"],
        ["21 onwards", "15 mg", "Maximum dose"],
      ],
    },
  },
  {
    id: "dose-escalation-timeline",
    heading: "Dose Escalation Timeline",
    paragraphs: [
      "Each tirzepatide dose is held for at least 4 weeks before stepping up 2.5 mg. Four weeks matters for two reasons: tirzepatide has a half-life of about 5 days, so blood levels take roughly 4 weeks to plateau at any new dose, and gradual increases give your gut time to adapt, which sharply reduces nausea and vomiting.",
      "Escalation is not automatic. Many people stay at 5 mg or 10 mg for months because it is working, and prescribers routinely delay a step-up, or drop back a level, when side effects are hard to tolerate. Both are normal, FDA-anticipated adjustments rather than setbacks.",
      "The maximum is 15 mg weekly. There is no approved dose above it, and reaching the top of the ladder is not a goal in itself: the right dose is the lowest one that gives you the result you need.",
    ],
    tip: "Expert tip: if a new dose is rough, ask your prescriber about holding it an extra 4 weeks rather than pushing through. Tolerability drives adherence, and adherence drives results.",
  },
  {
    id: "mounjaro-vs-zepbound",
    heading: "Mounjaro vs Zepbound: What Is the Difference?",
    paragraphs: [
      "Mounjaro and Zepbound are the same drug, tirzepatide, made by the same manufacturer, with the same 2.5 mg to 15 mg weekly schedule. The difference is the approved indication: Mounjaro is approved for type 2 diabetes, Zepbound for chronic weight management and obstructive sleep apnoea in adults with obesity. That distinction mostly affects insurance coverage.",
    ],
    table: {
      caption: "Mounjaro and Zepbound compared",
      headers: ["", "Mounjaro", "Zepbound"],
      rows: [
        ["Active drug", "Tirzepatide", "Tirzepatide"],
        ["FDA indication", "Type 2 diabetes", "Chronic weight management, obstructive sleep apnoea"],
        ["Dose range", "2.5 mg to 15 mg weekly", "2.5 mg to 15 mg weekly"],
        ["Titration", "2.5 mg steps, minimum 4 weeks each", "2.5 mg steps, minimum 4 weeks each"],
        ["Maintenance doses", "5 mg to 15 mg, whatever controls glucose", "5 mg, 10 mg or 15 mg"],
      ],
    },
  },
  {
    id: "expected-weight-loss",
    heading: "Expected Weight Loss on Tirzepatide",
    paragraphs: [
      "In the 72-week SURMOUNT-1 trial, adults with obesity and without diabetes lost an average of 15 percent of body weight on 5 mg, 19.5 percent on 10 mg, and 20.9 percent on 15 mg, compared with about 3 percent on placebo. Results in people with type 2 diabetes are typically somewhat lower.",
      "These are averages over 72 weeks, not promises, and the curve is not linear. Loss is usually slow during the 2.5 mg initiation month, accelerates through escalation, then flattens as your body approaches a new set point. A plateau is the expected shape of the curve, not a sign of failure.",
    ],
    table: {
      caption: "Average weight loss at 72 weeks, SURMOUNT-1 (adults with obesity, without diabetes)",
      headers: ["Weekly dose", "Average total body weight lost"],
      rows: [
        ["5 mg", "About 15 percent"],
        ["10 mg", "About 19.5 percent"],
        ["15 mg", "About 20.9 percent"],
        ["Placebo", "About 3 percent"],
      ],
    },
  },
  {
    id: "half-life",
    heading: "Tirzepatide Half-Life Explained",
    paragraphs: [
      "Tirzepatide has an elimination half-life of about 5 days, which is what makes once-weekly dosing possible. Each dose adds to what remains of the previous ones, so levels climb for roughly 4 weeks after starting or increasing a dose before settling into a stable weekly rhythm called steady state.",
      "Two practical consequences follow. First, a new dose does not show its full effect immediately: give it about 4 weeks before judging it. Second, washout is slow. After your last injection, meaningful drug activity persists for weeks, which is why effects taper off gradually rather than stopping the day you stop.",
      "It is also why a missed dose is not an emergency. If fewer than 4 days have passed you can usually take it and keep your schedule, and if the gap is longer your prescriber decides whether to skip it or restart lower.",
    ],
  },
  {
    id: "drug-activity",
    heading: "What Estimated Drug Activity Means",
    paragraphs: [
      "Estimated drug activity is how close your blood level is to the plateau for your current dose. With a 5-day half-life, each weekly injection stacks on the remains of earlier ones, so levels rise for about 4 weeks after any dose change. A figure near 100 percent means your current dose is fully established.",
      "It is a model, not a measurement. The number is calculated in your browser from published pharmacokinetics and the dose and week you entered, and it does not reflect a blood test. Its practical use is to tell you whether a dose has had a fair chance to show what it can do yet.",
    ],
  },
  {
    id: "protein",
    heading: "Protein Needs on Tirzepatide",
    paragraphs: [
      "Aim for roughly 1.2 to 1.6 grams of protein per kilogram of body weight per day during active weight loss, spread across every meal. Appetite suppression makes protein the easiest macro to under-eat, and low protein during rapid loss is what turns fat loss into muscle loss. Your snapshot above calculates your personal target.",
      "Pair that protein with resistance training two or three times a week. Together they are the best-evidenced way to keep the weight you lose coming from fat. Protein first at every meal is the single most useful habit on this medication, because you will simply run out of appetite before you run out of plate.",
    ],
    tip: "Expert tip: on low-appetite days, drink your protein. A shake, Greek yogurt or cottage cheese goes down when a chicken breast will not.",
  },
  {
    id: "hydration",
    heading: "Hydration on Tirzepatide",
    paragraphs: [
      "Aim for about 30 to 35 ml of fluid per kilogram of body weight daily, roughly 2 to 3 litres for most adults, and more during nausea or vomiting. Tirzepatide dulls thirst signals along with hunger, and GI side effects increase fluid loss, so dehydration creeps up quietly.",
      "Consistent hydration measurably reduces two of the most common complaints on this drug: headaches and constipation. If you only change one habit during escalation weeks, make it this one.",
    ],
  },
  {
    id: "exercise",
    heading: "Exercise on Tirzepatide",
    paragraphs: [
      "Resistance training two to three times a week is the highest-value exercise on tirzepatide, because it is the signal that tells your body to keep muscle while it sheds fat. Add about 150 minutes of moderate cardio weekly for cardiovascular health. Neither needs to be elaborate to work.",
      "Schedule harder sessions away from the 24 to 48 hours after your injection if that window is when nausea and fatigue hit you. Consistency across the month matters far more than intensity in any single session.",
    ],
  },
  {
    id: "side-effects",
    heading: "Common Side Effects of Tirzepatide",
    paragraphs: [
      "The most common tirzepatide side effects are gastrointestinal: nausea, diarrhoea, constipation, vomiting and indigestion. They are usually mild, appear in the first weeks at any new dose, and fade as your body adapts. Gradual titration exists specifically to keep them manageable.",
    ],
    list: [
      "Nausea: the most common effect, usually worst in the days after an injection or a dose increase",
      "Constipation or diarrhoea: often improved with fibre, fluid and daily movement",
      "Early satiety: feeling full very quickly, so eat smaller, protein-first meals",
      "Fatigue and headache: most common during escalation weeks and often linked to under-eating or dehydration",
      "Injection-site reactions: rotate between abdomen, thigh and upper arm",
      "Hair thinning: usually a response to rapid weight loss rather than the drug itself, and typically temporary",
    ],
  },
  {
    id: "when-to-contact-your-doctor",
    heading: "When to Contact Your Doctor",
    paragraphs: [
      "Most tirzepatide side effects are mild and self-limiting, but a few warrant prompt medical attention. Contact your prescriber or seek urgent care if you experience any of the following, and never adjust your dose on your own to manage them.",
    ],
    list: [
      "Severe or persistent abdominal pain, especially pain that radiates to your back, which can signal pancreatitis",
      "Persistent vomiting, or any inability to keep fluids down",
      "Signs of dehydration such as dizziness, dark urine or a racing heart",
      "Symptoms of low blood sugar, particularly if you also take insulin or a sulfonylurea",
      "A lump or swelling in your neck, hoarseness, or trouble swallowing",
      "Severe allergic reaction: rash, swelling of the face or throat, or difficulty breathing, which is a medical emergency",
      "Vision changes if you have diabetic retinopathy",
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
    question: "How does the tirzepatide dose calculator work?",
    answer:
      "Enter your medication (Mounjaro, Zepbound or compounded tirzepatide), your current weekly dose, how many weeks you have been on treatment, your weight, your goal and any symptoms. The calculator compares your inputs with the FDA prescribing schedule, estimates your drug activity from tirzepatide's 5-day half-life, and generates a full treatment snapshot. Everything runs in your browser and nothing is stored or transmitted.",
  },
  {
    question: "What is the standard tirzepatide dose schedule?",
    answer:
      "Start at 2.5 mg once weekly for 4 weeks, then move to 5 mg. After that the dose may increase in 2.5 mg steps, with at least 4 weeks at each step: 7.5 mg, 10 mg, 12.5 mg and a maximum of 15 mg weekly. Mounjaro and Zepbound follow the identical schedule.",
  },
  {
    question: "When should my tirzepatide dose increase?",
    answer:
      "No sooner than 4 weeks at your current dose, and only if your prescriber decides more effect is needed. Plenty of people stay at 5 mg or 10 mg long term because it is working well. Delaying a step-up because of nausea, or dropping back a level, are both normal and clinically expected.",
  },
  {
    question: "What is the maximum dose of tirzepatide?",
    answer:
      "15 mg once weekly is the maximum approved dose for both Mounjaro and Zepbound. There is no approved dose above 15 mg, and reaching the top of the ladder is not a treatment goal in itself. The best dose is the lowest one that delivers the result you need with side effects you can live with.",
  },
  {
    question: "Are Mounjaro and Zepbound the same thing?",
    answer:
      "They contain the same drug, tirzepatide, from the same manufacturer, with the same dose range and titration schedule. The difference is the approved use: Mounjaro is approved for type 2 diabetes, Zepbound for chronic weight management and obstructive sleep apnoea in adults with obesity. In practice the distinction matters most for insurance coverage.",
  },
  {
    question: "How much weight will I lose on tirzepatide?",
    answer:
      "In the 72-week SURMOUNT-1 trial, adults with obesity and without diabetes lost an average of 15 percent of body weight on 5 mg, 19.5 percent on 10 mg and 20.9 percent on 15 mg. Those are averages over more than a year, and individual results vary widely with dose, adherence, protein intake and activity.",
  },
  {
    question: "What is the half-life of tirzepatide?",
    answer:
      "About 5 days, which is what allows once-weekly injections. Because each dose stacks on what remains of the previous ones, blood levels keep climbing for roughly 4 weeks after you start or increase a dose before reaching steady state. It also means the drug takes several weeks to clear after your final injection.",
  },
  {
    question: "What happens if I miss a dose of tirzepatide?",
    answer:
      "If it has been fewer than 4 days since your missed dose, take it as soon as you remember and keep your usual weekly day. If more than 4 days have passed, skip it and take the next dose on schedule. Never take two doses within 3 days of each other, and contact your prescriber after a long gap.",
  },
  {
    question: "Why am I nauseous on tirzepatide?",
    answer:
      "Tirzepatide slows how quickly your stomach empties and acts on appetite centres in the brain, so nausea is the most common side effect. It is usually worst in the days after an injection and in the weeks following a dose increase, then fades as you adapt. Smaller, lower-fat meals, eating slowly and staying hydrated all help.",
  },
  {
    question: "Why has my weight loss stalled on tirzepatide?",
    answer:
      "Plateaus are normal and expected. Common causes are your body settling at a new set point, levels still stabilising after a recent dose change, muscle loss lowering your metabolic rate, or intake drifting up as you adapt to the appetite suppression. If a plateau lasts more than 4 to 6 weeks, discuss it with your prescriber.",
  },
  {
    question: "Am I losing fat or muscle on tirzepatide?",
    answer:
      "Both, and the split is what matters. During rapid weight loss without enough protein or resistance training, a meaningful share of what you lose can be lean tissue. Losing muscle lowers resting calorie burn and makes weight easier to regain later. Adequate protein and lifting two to three times a week are what tilt the ratio toward fat.",
  },
  {
    question: "Is compounded tirzepatide dosed the same way?",
    answer:
      "Usually similar, because most compounding providers mirror the Zepbound schedule. But compounded tirzepatide is not FDA-approved, concentrations vary between pharmacies, and doses are often drawn in units rather than pre-set pen clicks. Follow your provider's exact protocol and treat this calculator's compounded mode as a general educational reference only.",
  },
  {
    question: "Can this calculator tell me what dose to take?",
    answer:
      "No, and no online tool should. It shows where your current dose sits relative to the standard FDA schedule and explains what is typical at your stage. Every dosing decision belongs to your prescriber, who knows your history, your labs and how you have responded so far.",
  },
  {
    question: "Is the calculator free? Do I need an account?",
    answer:
      "The calculator is completely free with no sign-up required. Every result, chart and target is shown instantly. A free Calqulate account is optional and adds saving, injection tracking and a progress timeline. Premium adds predictions: plateau forecasts, fat vs. muscle trends, trajectory simulation and doctor-ready reports.",
  },
];

/* ------------------------------------------------------------------ */
/* MEDICAL REFERENCES                                                  */
/* ------------------------------------------------------------------ */

export const references = [
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
    label: "Frías JP et al. Tirzepatide versus Semaglutide Once Weekly in Type 2 Diabetes (SURPASS-2). NEJM 2021",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2107519",
  },
  {
    label: "FDA: Zepbound approval for chronic weight management",
    url: "https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management",
  },
  {
    label: "NIDDK (NIH): Prescription medications to treat overweight and obesity",
    url: "https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity",
  },
] as const;

export const medicalDisclaimer =
  "Calqulate Vitals provides educational information based on published FDA prescribing schedules and clinical literature. It is not medical advice, does not create a doctor and patient relationship, and must not be used to start, stop or change any medication. Always follow your prescriber's instructions. If you experience severe abdominal pain, persistent vomiting, symptoms of low blood sugar or an allergic reaction, seek medical care immediately.";
