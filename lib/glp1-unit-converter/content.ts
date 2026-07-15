/**
 * ============================================================
 * GLP-1 INJECTION SAFETY ASSISTANT: CONTENT
 * All page copy, conversion data and SEO content for the
 * Calqulate Vitals GLP-1 Unit Converter.
 * calqulate.net/health/glp-1-unit-converter
 *
 * This is not a unit converter. It answers the question behind
 * the search: am I drawing the correct amount into my syringe?
 *
 * The one rule the whole page rests on:
 *   a U-100 insulin syringe has 100 units per 1 mL.
 *   volume (mL) = dose (mg) / concentration (mg/mL)
 *   units       = volume (mL) x 100
 * ============================================================
 */

export const SITE = {
  name: "Calqulate Vitals",
  url: "https://calqulate.net",
  pageUrl: "https://calqulate.net/health/glp-1-unit-converter",
  pagePath: "/health/glp-1-unit-converter",
} as const;

/** A U-100 insulin syringe holds 100 units in 1 mL. Everything follows from this. */
export const UNITS_PER_ML = 100;

/* ------------------------------------------------------------------ */
/* SEO METADATA                                                        */
/* ------------------------------------------------------------------ */

export const seo = {
  title: "GLP-1 Unit Converter: mg to Units, Units to mg & Syringe Guide",
  description:
    "Free GLP-1 unit converter for semaglutide and tirzepatide. Convert mg to units, units to mg and mL to units using your own concentration, see exactly where to fill your insulin syringe, and check your dose before you draw it. Educational, private, no sign-up.",
  keywords: [
    "glp-1 unit converter",
    "semaglutide unit converter",
    "tirzepatide unit converter",
    "mg to units calculator",
    "units to mg converter",
    "semaglutide dosing in units",
    "tirzepatide dosing in units",
    "glp-1 syringe calculator",
    "semaglutide conversion chart",
    "compounded semaglutide units",
  ],
  ogTitle: "GLP-1 Unit Converter | Calqulate Vitals",
  ogDescription:
    "How many units is your dose? Convert mg, mL and syringe units with your exact concentration, and see the fill level on the syringe before you draw it. Free, private, no sign-up.",
} as const;

/* ------------------------------------------------------------------ */
/* MEDICATIONS                                                         */
/* ------------------------------------------------------------------ */

export type MedicationId =
  | "semaglutide"
  | "tirzepatide"
  | "ozempic"
  | "wegovy"
  | "mounjaro"
  | "zepbound"
  | "compounded";

export interface Medication {
  id: MedicationId;
  name: string;
  genericLabel: string;
  /** Concentrations commonly dispensed for this medication, in mg/mL. */
  concentrations: number[];
  /** True when the product is a pre-filled pen that is dialled in mg, not drawn in units. */
  penOnly: boolean;
  note: string;
}

export const MEDICATIONS: Medication[] = [
  {
    id: "semaglutide",
    name: "Semaglutide",
    genericLabel: "vial, compounded or generic",
    concentrations: [1, 2, 2.5, 5],
    penOnly: false,
    note: "Compounded semaglutide is dispensed in vials at concentrations that vary between pharmacies. The concentration on your label is the only number that makes your conversion correct.",
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    genericLabel: "vial, compounded or generic",
    concentrations: [5, 10, 20],
    penOnly: false,
    note: "Compounded tirzepatide is usually more concentrated than semaglutide, so the same number of units carries far more medication. Never reuse a units figure from a different vial.",
  },
  {
    id: "compounded",
    name: "Compounded Medication",
    genericLabel: "any vial, your own concentration",
    concentrations: [1, 2, 2.5, 5, 10, 20],
    penOnly: false,
    note: "Enter the exact concentration printed on your vial. Compounding pharmacies prepare the same drug at different strengths, and that single number changes every conversion on this page.",
  },
  {
    id: "ozempic",
    name: "Ozempic",
    genericLabel: "semaglutide, pre-filled pen",
    concentrations: [1.34, 2.68],
    penOnly: true,
    note: "Ozempic is a pre-filled pen. You dial the dose in milligrams and the pen measures it for you, so you should never draw it into an insulin syringe or count units. The concentrations shown here are for reference only.",
  },
  {
    id: "wegovy",
    name: "Wegovy",
    genericLabel: "semaglutide, single-dose pen",
    concentrations: [0.5, 1, 2, 3.2, 4.8],
    penOnly: true,
    note: "Wegovy comes as a single-dose pen that delivers its full fixed dose. There is nothing to measure and no units to count, so a unit conversion does not apply.",
  },
  {
    id: "mounjaro",
    name: "Mounjaro",
    genericLabel: "tirzepatide, single-dose pen or vial",
    concentrations: [2.5, 5, 7.5, 10, 12.5, 15],
    penOnly: true,
    note: "Mounjaro single-dose pens deliver a fixed dose with nothing to measure. Single-dose vials are drawn with the syringe supplied and are also intended to be used in full, so a partial unit measurement is not part of the approved instructions.",
  },
  {
    id: "zepbound",
    name: "Zepbound",
    genericLabel: "tirzepatide, single-dose pen or vial",
    concentrations: [2.5, 5, 7.5, 10, 12.5, 15],
    penOnly: true,
    note: "Zepbound single-dose pens and vials each contain one full dose. There is no unit conversion to perform, and drawing a partial amount is not part of the approved instructions.",
  },
];

/** Warning shown whenever a pre-filled pen product is selected. */
export const penWarning = {
  title: "This product is a pen, not a syringe draw",
  body: "Brand pens are dialled or pre-set in milligrams and measure the dose for you. Do not draw them into an insulin syringe and do not count units. If your pharmacy gave you a multi-dose vial instead, choose Compounded Medication and enter the concentration printed on that vial.",
} as const;

/* ------------------------------------------------------------------ */
/* SYRINGES                                                            */
/* ------------------------------------------------------------------ */

export interface Syringe {
  id: "30" | "50" | "100";
  label: string;
  capacityUnits: number;
  capacityMl: number;
  /** Smallest reliably readable increment on the barrel, in units. */
  increment: number;
  note: string;
}

export const SYRINGES: Syringe[] = [
  {
    id: "30",
    label: "30-unit insulin syringe",
    capacityUnits: 30,
    capacityMl: 0.3,
    increment: 1,
    note: "The easiest to read for small doses, because 30 units are spread across the whole barrel. Marked in 1-unit steps.",
  },
  {
    id: "50",
    label: "50-unit insulin syringe",
    capacityUnits: 50,
    capacityMl: 0.5,
    increment: 1,
    note: "A good middle ground. Marked in 1-unit steps, and comfortable for doses up to 50 units.",
  },
  {
    id: "100",
    label: "100-unit insulin syringe",
    capacityUnits: 100,
    capacityMl: 1,
    increment: 2,
    note: "Holds the largest volume, but the markings are usually in 2-unit steps, which makes very small doses harder to measure precisely.",
  },
];

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: "Free GLP-1 Safety Tool",
  headline: "GLP-1 Unit Converter",
  subheadline:
    "Convert mg ↔ units ↔ mL for compounded semaglutide and tirzepatide using your vial's concentration.",
  /** Capability chips shown directly under the headline. These capture the primary search demand. */
  capabilities: [
    "mg → Units",
    "Units → mg",
    "Semaglutide",
    "Tirzepatide",
    "U-100 Syringe",
    "Instant",
  ],
  trustBadges: [
    { icon: "check", text: "Free forever" },
    { icon: "shield", text: "Educational only" },
    { icon: "lock", text: "Browser only" },
    { icon: "user-x", text: "No sign-up required" },
  ],
  cta: "Start Converting",
  secondaryCta: "Learn About Concentrations",
  secondaryCtaHref: "#why-concentration-matters",
} as const;

/* ------------------------------------------------------------------ */
/* WIZARD (5 steps)                                                    */
/* ------------------------------------------------------------------ */

export type Direction = "mg-to-units" | "units-to-mg" | "ml-to-units" | "units-to-ml";

export const wizard = {
  stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
  steps: [
    {
      id: "medication",
      question: "Which medication are you converting?",
      helper: "Pick the vial you are drawing from. Pre-filled pens measure the dose for you and need no conversion.",
    },
    {
      id: "concentration",
      question: "What is your concentration?",
      helper: "Read it from the label on your vial, written as mg/mL. This is the single most important number on this page.",
    },
    {
      id: "direction",
      question: "What do you want to convert?",
      helper: "Convert in whichever direction you are working: from a prescribed dose, or from a number on the syringe.",
    },
    {
      id: "value",
      question: "Enter your value",
      helper: "Type the number you have. Everything else is calculated from your concentration.",
    },
    {
      id: "syringe",
      question: "Which syringe are you using?",
      helper: "Optional. It lets us check that your dose actually fits and can be measured accurately.",
    },
  ],
  directions: [
    { id: "mg-to-units", label: "mg → Units", desc: "I know my dose in milligrams" },
    { id: "units-to-mg", label: "Units → mg", desc: "I know the units on my syringe" },
    { id: "ml-to-units", label: "mL → Units", desc: "I know the volume in millilitres" },
    { id: "units-to-ml", label: "Units → mL", desc: "I want the volume for my units" },
  ],
  customConcentration: "Custom concentration",
  back: "Back",
  next: "Continue",
  finish: "See My Injection Snapshot",
} as const;

/* ------------------------------------------------------------------ */
/* RESULT: labels and safety copy                                      */
/* ------------------------------------------------------------------ */

export const result = {
  title: "Your Injection Snapshot",
  subtitle: "The number, the volume, and the reason it is what it is.",
  labels: {
    medication: "Medication",
    concentration: "Concentration",
    dose: "Entered Dose",
    volume: "Injection Volume",
    units: "Syringe Units",
    syringe: "Recommended Syringe",
    confidence: "Injection Confidence",
    verified: "Conversion Verified",
  },
  verified: "✓",
  reminder:
    "Always confirm the concentration printed on your prescription label before measuring your dose. If the label and this result disagree, the label is right and this page is wrong.",
  disclaimer:
    "This converter is educational and is not a prescription, a dosing instruction or a substitute for your pharmacist. It cannot see your vial. Never change the dose your prescriber gave you, and if a result here does not match what your prescriber or pharmacist told you to draw, stop and call them before injecting.",
} as const;

export interface Confidence {
  id: "high" | "check" | "stop";
  label: string;
  tone: "green" | "amber";
}

export const CONFIDENCE: Record<Confidence["id"], Confidence> = {
  high: { id: "high", label: "🟢 High", tone: "green" },
  check: { id: "check", label: "🟡 Check with your pharmacist", tone: "amber" },
  stop: { id: "stop", label: "🟡 Stop and confirm before injecting", tone: "amber" },
};

/** Plain-language warnings, raised only when the numbers actually warrant one. */
export const warnings = {
  overCapacity: (units: number, syringe: string) =>
    `Your dose works out at ${units} units, which does not fit in a ${syringe}. You would have to inject twice from one dose, which is where measuring mistakes happen. A larger syringe, or a more concentrated vial, is the safer answer. Ask your pharmacist which they intend you to use.`,
  tinyVolume: (units: number) =>
    `Your dose is only ${units} units, which is a very small amount of liquid to measure accurately. On a 100-unit syringe, marked in 2-unit steps, a single mis-read line is a large percentage of this dose. A 30-unit syringe makes a dose this small much easier to draw correctly.`,
  fractionalUnits: (units: number) =>
    `Your dose lands on ${units} units, which is not a whole line on the barrel. Do not guess between the markings and do not round up. Ask your pharmacist how they intend this dose to be measured, because the answer is often a different concentration or a different syringe rather than a half-unit estimate.`,
  highDose: (mg: number) =>
    `A single dose of ${mg} mg is above the maximum approved weekly dose for both semaglutide (2.4 mg) and tirzepatide (15 mg). Please re-check the number you entered and the concentration on your label before going any further, and confirm the dose with your prescriber.`,
  penProduct:
    "You selected a pre-filled pen. Pens measure the dose for you, so this conversion is educational only and must not be used to draw the medication into a syringe.",
} as const;

/** The insight that explains why the same dose can be a different number of units. */
export const safetyInsight = {
  title: "Why the same dose can be a different number of units",
  body: "Different pharmacies may prepare compounded semaglutide at different concentrations. The same 1 mg dose can require different syringe units depending on the concentration. At 2.5 mg/mL, 1 mg is 40 units. At 5 mg/mL, the very same 1 mg is only 20 units. Nothing about your prescription changed, only the strength of the liquid it is dissolved in. This is why a units figure you saw in a forum, or one that worked with your previous vial, can be dangerously wrong with a new one.",
  compare: {
    caption: "The same 1 mg dose, at three different concentrations",
    headers: ["Concentration", "Volume to draw", "Units on a U-100 syringe"],
    rows: [
      ["1 mg/mL", "1.00 mL", "100 units"],
      ["2.5 mg/mL", "0.40 mL", "40 units"],
      ["5 mg/mL", "0.20 mL", "20 units"],
    ],
  },
};

/* ------------------------------------------------------------------ */
/* SAFETY CHECKLIST                                                    */
/* ------------------------------------------------------------------ */

export const safetyChecklist = {
  headline: "Before you draw, check these five things",
  items: [
    "The concentration on your vial label matches the concentration you entered here",
    "Your syringe is a U-100 insulin syringe, where 100 units equals 1 mL",
    "Your dose lands on a whole marking on the barrel, not between two lines",
    "The dose fits in one syringe, so you are not injecting twice to make up one dose",
    "The number matches what your prescriber or pharmacist told you to draw",
  ],
  footer:
    "If any one of these is not true, stop and call your pharmacy. They will tell you in a minute what a forum post cannot tell you at all.",
} as const;

/* ------------------------------------------------------------------ */
/* FREE FEATURES                                                       */
/* ------------------------------------------------------------------ */

export const freeFeatures = {
  headline: "Everything here stays free, forever",
  items: [
    "Conversion in every direction",
    "Dose visualisation",
    "Syringe fill guide",
    "Concentration explanation",
    "Educational insights",
    "Injection reminders",
    "Safety checklist",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* SIGN-UP CTA                                                         */
/* ------------------------------------------------------------------ */

export const freeCta = {
  headline: "Save Your Medication Settings",
  body: "Most people use the same medication every week. Create a free Calqulate account to:",
  bullets: [
    "Save your concentration",
    "Save your syringe preference",
    "Track every injection",
    "Keep your medication history",
    "Continue across devices",
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
    "Medication",
    "Dose",
    "Injection History",
    "Drug Level",
    "Weight",
    "Protein",
    "Hydration",
    "PK Curve",
  ],
  badge: "FREE",
  cta: "Track Every Injection",
} as const;

/* ------------------------------------------------------------------ */
/* PREMIUM: "Go Beyond Unit Conversion"                                */
/* ------------------------------------------------------------------ */

export interface PremiumCard {
  title: string;
  desc: string;
  cta?: string;
}

export const premium = {
  headline: "Go Beyond Unit Conversion",
  body: "Free answers the question “what should I inject today?”. Premium answers “how is my treatment changing over time?”",
  cards: [
    {
      title: "Injection History",
      desc: "Every dose, date and site on one timeline, so you never have to remember what you drew last week.",
      cta: "Track Every Injection",
    },
    {
      title: "Dose Trends",
      desc: "See your titration as a curve rather than a memory, including the weeks you held or stepped back.",
    },
    {
      title: "Drug Activity",
      desc: "Watch your medication level rise and fall between injections, so today's hunger finally makes sense.",
    },
    {
      title: "Plateau Prediction",
      desc: "Flags the week your weight loss is statistically likely to stall, before the scale stops moving.",
      cta: "Forecast My Treatment",
    },
    {
      title: "Fat vs Muscle Trend",
      desc: "Splits every kilogram you lose into fat and lean mass, so the scale stops lying to you.",
      cta: "Protect My Muscle",
    },
    {
      title: "Doctor Reports",
      desc: "One tap turns your doses, levels, weight and side effects into a report your prescriber reads in 30 seconds.",
      cta: "Doctor Report",
    },
    {
      title: "Adaptive Coach",
      desc: "Weekly guidance that changes as your data changes, instead of generic tips.",
    },
    {
      title: "Multi-compound Tracking",
      desc: "Switching between semaglutide and tirzepatide, or changing concentration, stays on one timeline.",
    },
    {
      title: "Refill Tracker",
      desc: "Counts the doses left in your vial and warns you before a gap in treatment forces a titration restart.",
    },
  ] as PremiumCard[],
  primary: "See My Progress",
  secondary: "Forecast My Treatment",
} as const;

/* ------------------------------------------------------------------ */
/* UNIQUE POSITIONING                                                  */
/* ------------------------------------------------------------------ */

export const beyondStory = {
  headline: "Converting Your Dose Is Only the Beginning.",
  paragraphs: [
    "A unit conversion solves one urgent problem: the syringe in your hand, right now. It is worth getting exactly right, and this page exists to make sure you do.",
    "But the number you draw this week is not what decides your results. What decides them is the pattern underneath: whether you inject consistently, whether your drug level holds through the week, whether the weight you are losing is fat or muscle, and whether you can see a plateau coming before it arrives.",
  ],
  unlocks: [
    "Weekly injections",
    "Drug activity",
    "Weight trends",
    "Fat vs. muscle loss",
    "Appetite patterns",
    "Side effects",
    "Plateau prediction",
    "Longevity and metabolic health",
  ],
  cta: "Start Tracking Free, Turn Every Injection Into Long-Term Progress",
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
    id: "how-to-convert",
    heading: "How to Convert mg to Units for a GLP-1",
    paragraphs: [
      "Divide your dose in milligrams by your vial's concentration in mg/mL to get the volume in millilitres, then multiply by 100 to get insulin syringe units. A U-100 syringe always holds 100 units in 1 mL. For example, 1 mg from a 5 mg/mL vial is 0.2 mL, which is 20 units.",
      "That is the entire calculation, and it never changes. What changes is the concentration, and that is why the same prescribed dose produces a different number of units for different people. The concentration is the only variable, and it is printed on your label.",
    ],
    table: {
      caption: "The conversion in three steps",
      headers: ["Step", "Formula", "Example: 1 mg at 5 mg/mL"],
      rows: [
        ["1. Volume", "dose (mg) ÷ concentration (mg/mL)", "1 ÷ 5 = 0.2 mL"],
        ["2. Units", "volume (mL) × 100", "0.2 × 100 = 20 units"],
        ["3. Check", "does it fit and land on a line?", "20 units fits a 30-unit syringe"],
      ],
    },
    tip: "Safety tip: run the calculation in the direction you are actually working. If your pharmacist told you a number of units, convert units back to mg and check it matches the dose your prescriber wrote.",
  },
  {
    id: "why-concentration-matters",
    heading: "Why Concentration Matters More Than Anything Else",
    paragraphs: [
      "Concentration is how much drug is dissolved in each millilitre of liquid, written as mg/mL. It is the number that turns a dose into a volume. Two vials can contain identical medication at different strengths, so the same 1 mg dose might be 40 units from one vial and 20 units from another.",
      "This is the single most common source of anxiety, and of genuine error, with compounded GLP-1 medication. A units figure is meaningless without the concentration it came from. If you switch pharmacies, switch vials, or your pharmacy reformulates, you must redo the conversion rather than reuse a number you remember.",
    ],
    table: safetyInsight.compare,
    tip: "Safety tip: never carry a units number across to a new vial. Read the concentration on the new label first, every single time.",
  },
  {
    id: "reading-insulin-syringes",
    heading: "How to Read an Insulin Syringe",
    paragraphs: [
      "Insulin syringes are marked in units, not millilitres, and U-100 syringes hold 100 units per 1 mL. They come in 30-unit (0.3 mL), 50-unit (0.5 mL) and 100-unit (1 mL) barrels. Smaller barrels spread fewer units over the same length, which makes small GLP-1 doses far easier to measure accurately.",
      "The practical consequence is that the best syringe is the smallest one your dose fits inside. A 20-unit dose on a 100-unit syringe sits near the bottom of a barrel marked in 2-unit steps. The same dose on a 30-unit syringe, marked in 1-unit steps, spans two thirds of the barrel and is much harder to misread.",
    ],
    table: {
      caption: "Insulin syringe sizes at a glance",
      headers: ["Syringe", "Holds", "Typical markings", "Best for"],
      rows: [
        ["30-unit", "0.3 mL", "1-unit steps", "Small doses, the easiest to read accurately"],
        ["50-unit", "0.5 mL", "1-unit steps", "Mid-range doses up to 50 units"],
        ["100-unit", "1 mL", "2-unit steps", "Large volumes, hardest to read for small doses"],
      ],
    },
    tip: "Safety tip: draw to the line, not between lines. If your dose lands between two markings, that is a signal to call your pharmacy, not to estimate.",
  },
  {
    id: "injection-safety",
    heading: "Can You Inject Too Much by Converting Incorrectly?",
    paragraphs: [
      "Yes, and concentration is almost always how it happens. If you assume 2.5 mg/mL when your vial is actually 5 mg/mL, the same 40 units delivers 2 mg instead of 1 mg, which is double your dose. The medication did not change. The strength of the liquid did, and the syringe cannot tell the difference.",
      "This is why the concentration on the label outranks every other number, including this page. An overdose of a GLP-1 typically means severe nausea, prolonged vomiting and dehydration, and it carries a risk of low blood sugar in people also taking insulin or a sulfonylurea. If you think you have injected too much, contact your prescriber or a poison information service straight away.",
    ],
    list: [
      "Read the concentration on the label before every new vial, not just the first one",
      "Convert in both directions and check the two answers agree",
      "Confirm the units figure with the person who dispensed it before your first injection from a new vial",
      "Never reuse a units number from a forum, a friend, or an older vial",
      "If the dose does not land on a whole marking, stop and ask rather than rounding",
    ],
    tip: "Safety tip: the label wins. If your label and this calculator disagree, your label is right and something you entered here is wrong.",
  },
  {
    id: "compounded-vs-brand",
    heading: "Compounded vs Brand-Name: Why Only One Needs Converting",
    paragraphs: [
      "Brand pens such as Ozempic, Wegovy, Mounjaro and Zepbound measure the dose for you. You dial or press in milligrams and never count units, so no conversion applies. Compounded medication is dispensed in vials at concentrations that vary by pharmacy, which is exactly why unit conversion exists at all.",
      "That difference matters for safety, not just convenience. A pen removes the measurement step, and with it the most common way people get their dose wrong. A vial hands that step back to you, which is manageable, but only if you treat the concentration on the label as the source of truth every single time.",
    ],
    table: {
      caption: "What you actually measure",
      headers: ["Product", "How the dose is measured", "Do you count units?"],
      rows: [
        ["Ozempic", "Dial the pen in mg", "No"],
        ["Wegovy", "Single-dose pen, fixed dose", "No"],
        ["Mounjaro", "Single-dose pen or vial, full dose", "No"],
        ["Zepbound", "Single-dose pen or vial, full dose", "No"],
        ["Compounded semaglutide", "You draw it from a multi-dose vial", "Yes"],
        ["Compounded tirzepatide", "You draw it from a multi-dose vial", "Yes"],
      ],
    },
    related: { label: "Semaglutide Dose Calculator", href: "/health/semaglutide-dose-calculator" },
  },
  {
    id: "semaglutide-vs-tirzepatide-units",
    heading: "Semaglutide vs Tirzepatide: Units Are Not Comparable",
    paragraphs: [
      "Never compare units between the two drugs. Semaglutide is dosed in fractions of a milligram, up to 2.4 mg weekly, while tirzepatide runs from 2.5 mg to 15 mg. Compounded tirzepatide is also usually more concentrated. The result is that 20 units of one is nothing like 20 units of the other.",
      "Units are a measure of volume, not of strength. They tell you how much liquid is in the barrel, and nothing at all about how much drug is in that liquid. Two people can inject the identical 20 units and receive completely different amounts of completely different medication.",
    ],
    tip: "Safety tip: whenever you see a units figure online, treat it as meaningless unless it comes with both the drug and the concentration.",
    related: { label: "Tirzepatide Dose Calculator", href: "/health/tirzepatide-dose-calculator" },
  },
];

/* ------------------------------------------------------------------ */
/* CONTENT CLUSTER                                                     */
/* Direct answers to what people actually type into Google.            */
/* ------------------------------------------------------------------ */

export interface ClusterItem {
  question: string;
  answer: string;
}

export interface ClusterGroup {
  id: string;
  title: string;
  intro?: string;
  table?: { caption: string; headers: string[]; rows: string[][] };
  items: ClusterItem[];
}

export const clusterGroups: ClusterGroup[] = [
  {
    id: "mg-to-units",
    title: "mg to Units",
    intro:
      "The answer always depends on your concentration. Here is every common semaglutide dose at the three concentrations compounding pharmacies dispense most often, on a U-100 insulin syringe.",
    table: {
      caption: "Semaglutide dose to syringe units, by concentration (U-100 syringe)",
      headers: ["Dose", "At 1 mg/mL", "At 2.5 mg/mL", "At 5 mg/mL"],
      rows: [
        ["0.25 mg", "25 units", "10 units", "5 units"],
        ["0.5 mg", "50 units", "20 units", "10 units"],
        ["1 mg", "100 units", "40 units", "20 units"],
        ["1.7 mg", "170 units (2 syringes)", "68 units", "34 units"],
        ["2.4 mg", "240 units (3 syringes)", "96 units", "48 units"],
        ["5 mg (tirzepatide)", "Not applicable", "200 units", "100 units"],
      ],
    },
    items: [
      {
        question: "How many units is 0.25 mg?",
        answer:
          "At 2.5 mg/mL, 0.25 mg is 10 units. At 5 mg/mL it is 5 units, and at 1 mg/mL it is 25 units. A 5-unit dose is very small to measure, so a 30-unit syringe is far safer than a 100-unit one here.",
      },
      {
        question: "How many units is 0.5 mg?",
        answer:
          "At 2.5 mg/mL, 0.5 mg is 20 units. At 5 mg/mL it is 10 units, and at 1 mg/mL it is 50 units. This is why 0.5 mg equals 20 units only sometimes, and why the answer is worthless without a concentration attached.",
      },
      {
        question: "How many units is 1 mg?",
        answer:
          "At 2.5 mg/mL, 1 mg is 40 units. At 5 mg/mL it is 20 units, and at 1 mg/mL it fills an entire 100-unit syringe. Same prescription, three different numbers on the barrel.",
      },
      {
        question: "How many units is 1.7 mg?",
        answer:
          "At 2.5 mg/mL, 1.7 mg is 68 units, and at 5 mg/mL it is 34 units. At 1 mg/mL it would be 170 units, which does not fit in a single syringe, so a more concentrated vial is the correct answer rather than two injections.",
      },
      {
        question: "How many units is 2.4 mg?",
        answer:
          "At 2.5 mg/mL, 2.4 mg is 96 units, which only just fits a 100-unit syringe. At 5 mg/mL it is 48 units, which is far more comfortable to draw. At the maintenance dose, concentration stops being a detail and starts deciding whether the dose fits at all.",
      },
      {
        question: "How many units is 5 mg of tirzepatide?",
        answer:
          "At 5 mg/mL, 5 mg is 100 units, a full syringe. At 10 mg/mL it is 50 units, and at 20 mg/mL it is 25 units. Compounded tirzepatide is usually supplied concentrated for exactly this reason.",
      },
    ],
  },
  {
    id: "units-to-mg",
    title: "Units to mg",
    intro:
      "Working backwards from the syringe: multiply your units by the concentration, then divide by 100. The same units figure means a completely different dose at a different strength.",
    table: {
      caption: "Syringe units to dose in mg, by concentration (U-100 syringe)",
      headers: ["Units", "At 2.5 mg/mL", "At 5 mg/mL", "At 10 mg/mL"],
      rows: [
        ["10 units", "0.25 mg", "0.5 mg", "1 mg"],
        ["20 units", "0.5 mg", "1 mg", "2 mg"],
        ["30 units", "0.75 mg", "1.5 mg", "3 mg"],
        ["50 units", "1.25 mg", "2.5 mg", "5 mg"],
        ["100 units", "2.5 mg", "5 mg", "10 mg"],
      ],
    },
    items: [
      {
        question: "10 units equals how many mg?",
        answer:
          "0.25 mg at 2.5 mg/mL, 0.5 mg at 5 mg/mL, or 1 mg at 10 mg/mL. Ten units is a tenth of a millilitre, and how much medication sits in that tenth is entirely down to your vial.",
      },
      {
        question: "20 units equals how many mg?",
        answer:
          "0.5 mg at 2.5 mg/mL, 1 mg at 5 mg/mL, or 2 mg at 10 mg/mL. If someone tells you 20 units is a standard dose, they are telling you about their vial, not yours.",
      },
      {
        question: "30 units equals how many mg?",
        answer:
          "0.75 mg at 2.5 mg/mL, 1.5 mg at 5 mg/mL, or 3 mg at 10 mg/mL. Thirty units is 0.3 mL, which fills a 30-unit syringe exactly.",
      },
      {
        question: "50 units equals how many mg?",
        answer:
          "1.25 mg at 2.5 mg/mL, 2.5 mg at 5 mg/mL, or 5 mg at 10 mg/mL. Note that 2.5 mg of semaglutide would be above the maximum approved weekly dose of 2.4 mg, which is the kind of mismatch worth catching before you inject.",
      },
      {
        question: "100 units equals how many mg?",
        answer:
          "2.5 mg at 2.5 mg/mL, 5 mg at 5 mg/mL, or 10 mg at 10 mg/mL. One hundred units is a full millilitre, the entire barrel of a 100-unit syringe.",
      },
    ],
  },
  {
    id: "concentration-questions",
    title: "Concentration",
    items: [
      {
        question: "Why does concentration matter so much?",
        answer:
          "Because it is the only thing standing between your dose in milligrams and the number on your syringe. Get it wrong and every unit you draw is wrong by the same factor. Assuming 2.5 mg/mL when the vial is 5 mg/mL doubles your dose.",
      },
      {
        question: "Why do pharmacies use different strengths?",
        answer:
          "Compounding pharmacies formulate independently, so vial strength varies by pharmacy, batch and the dose range they expect you to need. Higher concentrations keep the injection volume small at maintenance doses. It is normal, and it is why you must re-check every new vial.",
      },
      {
        question: "What concentration is compounded semaglutide?",
        answer:
          "Commonly 1, 2, 2.5 or 5 mg/mL, but there is no single standard and your pharmacy may use another. The only reliable source is the label on your own vial, never a chart, a forum or this page.",
      },
      {
        question: "What concentration is compounded tirzepatide?",
        answer:
          "Often 5, 10 or 20 mg/mL, because tirzepatide doses run much higher than semaglutide and a dilute vial would make the injection volume impractical. As always, your label is the authority.",
      },
      {
        question: "What does mg/mL actually mean?",
        answer:
          "How many milligrams of medication are dissolved in each millilitre of liquid. A 5 mg/mL vial holds 5 mg in every millilitre, so half a millilitre holds 2.5 mg. It describes the strength of the liquid, not the size of your dose.",
      },
    ],
  },
  {
    id: "syringe-questions",
    title: "Syringes",
    items: [
      {
        question: "What is a 30-unit syringe?",
        answer:
          "A 0.3 mL insulin syringe, usually marked in 1-unit steps. It is the easiest to read for small GLP-1 doses because those few units are spread across the full length of the barrel.",
      },
      {
        question: "What is a 50-unit syringe?",
        answer:
          "A 0.5 mL insulin syringe, typically marked in 1-unit steps. A comfortable middle ground for doses up to 50 units.",
      },
      {
        question: "What is a 100-unit syringe?",
        answer:
          "A 1 mL insulin syringe, usually marked in 2-unit steps. It holds the most liquid but is the hardest to read precisely, so it is a poor choice for a 5 or 10-unit dose.",
      },
      {
        question: "How do I read an insulin syringe?",
        answer:
          "The numbers on the barrel are units, not millilitres, and on a U-100 syringe 100 units equals 1 mL. Draw until the top of the plunger seal sits exactly on your line, at eye level, with no air bubble.",
      },
      {
        question: "Why did my pharmacy change my syringe?",
        answer:
          "Usually because your dose or your concentration changed and the old barrel no longer fits it well. A dose that outgrows a 30-unit syringe needs a 50 or 100-unit one, and a smaller dose is safer to measure on a smaller barrel.",
      },
    ],
  },
  {
    id: "injection-safety-questions",
    title: "Injection Safety",
    items: [
      {
        question: "Can I inject too much?",
        answer:
          "Yes, most often by using the wrong concentration in the conversion. Believing your vial is 2.5 mg/mL when it is 5 mg/mL doubles every dose you draw. Check the label before every new vial, and confirm your first draw with your pharmacist.",
      },
      {
        question: "What if I used the wrong concentration?",
        answer:
          "Work out what you actually injected: units divided by 100, multiplied by the true concentration. If that is more than your prescribed dose, contact your prescriber or a poison information service now. Expect nausea and vomiting, watch for dehydration, and do not take your next dose until you have spoken to them.",
      },
      {
        question: "What if my dose lands between two markings?",
        answer:
          "Do not estimate and do not round up. A dose that does not land on a line usually means the concentration and the syringe are mismatched, and the fix is a different vial or a different barrel. Ask your pharmacist.",
      },
      {
        question: "How do I double check my prescription?",
        answer:
          "Convert in both directions. Take the units you plan to draw, convert them back to milligrams at your concentration, and confirm the result equals the dose your prescriber wrote. If the two disagree, do not inject.",
      },
      {
        question: "What should the pharmacy label tell me?",
        answer:
          "The drug, the concentration in mg/mL, the total volume in the vial, your prescribed dose and how it is to be measured. If the concentration is missing from the label, call the pharmacy and ask for it before you inject.",
      },
    ],
  },
  {
    id: "medication-questions",
    title: "By Medication",
    items: [
      {
        question: "How do I convert Ozempic to units?",
        answer:
          "You do not. Ozempic is a pre-filled pen: you dial the dose in milligrams and the pen measures it. Never draw a pen into an insulin syringe. Unit conversion applies only to multi-dose vials.",
      },
      {
        question: "How do I convert Wegovy to units?",
        answer:
          "There is nothing to convert. Wegovy comes as a single-dose pen that delivers its full fixed dose, so there is no measurement step and no units to count.",
      },
      {
        question: "How do I convert Mounjaro to units?",
        answer:
          "Mounjaro single-dose pens and vials each contain one full dose, so a partial measurement is not part of the approved instructions. If you have been given a multi-dose compounded vial instead, convert using the concentration on that vial's label.",
      },
      {
        question: "How do I convert Zepbound to units?",
        answer:
          "The same as Mounjaro: single-dose pens and vials deliver one full dose and need no conversion. Only compounded multi-dose vials require you to measure units yourself.",
      },
      {
        question: "How do I convert compounded medication?",
        answer:
          "Divide your dose in mg by the concentration on your vial to get millilitres, then multiply by 100 for units on a U-100 syringe. This is the only category where you truly need this page.",
      },
    ],
  },
  {
    id: "common-questions",
    title: "Common Questions",
    items: [
      {
        question: "Why doesn't everyone use the same units?",
        answer:
          "Because units measure liquid, not medication. The number of units you draw depends on how concentrated your vial is, and compounding pharmacies use different concentrations. There is no universal units figure for any GLP-1 dose.",
      },
      {
        question: "Can two people use different units for the same dose?",
        answer:
          "Yes, and this is completely normal. One person drawing 40 units at 2.5 mg/mL and another drawing 20 units at 5 mg/mL are injecting the identical 1 mg dose.",
      },
      {
        question: "Why is my vial different from last time?",
        answer:
          "Pharmacies change formulations, and a new prescription may be filled at a different strength. Never assume the new vial matches the old one. Read the concentration and redo the conversion before your first injection from it.",
      },
      {
        question: "Is 0.5 mg equal to 20 units?",
        answer:
          "Only at 2.5 mg/mL. At 5 mg/mL, 0.5 mg is 10 units, and at 1 mg/mL it is 50 units. This exact question is the reason unit conversion errors happen, because the answer people remember was true for someone else's vial.",
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
    question: "How do I convert my GLP-1 dose from mg to units?",
    answer:
      "Divide your dose in milligrams by your vial's concentration in mg/mL to get the volume in millilitres, then multiply by 100 to get units on a U-100 insulin syringe. For example, 1 mg from a 5 mg/mL vial is 0.2 mL, which is 20 units. The concentration on your label is what makes the answer correct.",
  },
  {
    question: "Is 0.5 mg the same as 20 units?",
    answer:
      "Only if your concentration is 2.5 mg/mL. At 5 mg/mL, 0.5 mg is 10 units. At 1 mg/mL it is 50 units. A units figure without a concentration attached to it is not an answer, and copying one from someone else's vial is how dosing errors happen.",
  },
  {
    question: "Why does my syringe show different units than my friend's?",
    answer:
      "Because your vials are almost certainly different strengths. Units measure liquid volume, not medication, so a more concentrated vial needs fewer units for the identical dose. Both of you can be correct and see completely different numbers.",
  },
  {
    question: "Can I overdose by converting incorrectly?",
    answer:
      "Yes. The usual mechanism is using the wrong concentration: assuming 2.5 mg/mL when your vial is 5 mg/mL delivers double your intended dose. Always read the concentration on the label before every new vial, and confirm your first draw with your pharmacist.",
  },
  {
    question: "What if my pharmacy compounded it differently?",
    answer:
      "Then your conversion changes, and any units figure you were using is now wrong. Read the concentration on the new label, redo the conversion, and check the result with the pharmacy before your first injection from that vial.",
  },
  {
    question: "How many units are in 1 mL?",
    answer:
      "On a U-100 insulin syringe, 1 mL is exactly 100 units. That relationship never changes, which is why the volume in millilitres is the bridge between your dose in milligrams and the number on the barrel.",
  },
  {
    question: "Which insulin syringe should I use?",
    answer:
      "The smallest one your dose fits into. A 30-unit syringe is marked in 1-unit steps and is the easiest to read for small doses. A 100-unit syringe is often marked in 2-unit steps, which makes a 10-unit dose harder to measure precisely.",
  },
  {
    question: "Do Ozempic, Wegovy, Mounjaro or Zepbound need converting?",
    answer:
      "No. Those are pre-filled pens or single-dose products that measure the dose for you in milligrams. You should never draw them into an insulin syringe or count units. Unit conversion applies to compounded multi-dose vials.",
  },
  {
    question: "Is this converter medical advice?",
    answer:
      "No. It is an educational tool that performs a calculation from numbers you enter. It cannot see your vial or your prescription. If the result here disagrees with what your prescriber or pharmacist told you to draw, stop and call them before injecting.",
  },
];

/* ------------------------------------------------------------------ */
/* MEDICAL REFERENCES                                                  */
/* ------------------------------------------------------------------ */

export const references = [
  {
    label: "FDA: Medications containing semaglutide, including compounding information",
    url: "https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/medications-containing-semaglutide-marketed-type-2-diabetes-or-weight-loss",
  },
  {
    label: "FDA: Compounded tirzepatide, information for patients and providers",
    url: "https://www.fda.gov/drugs/human-drug-compounding/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss",
  },
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
] as const;

export const medicalDisclaimer =
  "Calqulate Vitals provides educational information only. This converter performs arithmetic on numbers you enter and cannot see your vial, your syringe or your prescription. It is not medical advice, is not a dosing instruction, and does not replace your prescriber or pharmacist. Always confirm your concentration and your dose against the label and with the person who dispensed it. Never change your prescribed dose. If you believe you have injected the wrong amount, contact your prescriber or a poison information service immediately.";

/* ================================================================== */
/* NEW MOBILE-FIRST PAGE ARCHITECTURE                                  */
/* Purpose-built, scannable blocks that map to the highest-intent      */
/* searches. Each block opens with a direct answer for AI Overviews.   */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/* CHART IMAGES                                                         */
/* Placeholders. Drop the matching files into /public/charts/ and the  */
/* images render automatically. Alt text is written for accessibility  */
/* and image SEO.                                                       */
/* ------------------------------------------------------------------ */

export interface ChartImage {
  src: string;
  alt: string;
  caption: string;
  /** Intended aspect ratio, used to reserve space and avoid layout shift. */
  width: number;
  height: number;
}

export const charts: Record<
  "mgToUnits" | "concentration" | "syringe",
  ChartImage
> = {
  mgToUnits: {
    src: "/charts/glp1-mg-to-units-conversion-chart.webp",
    alt: "Bar chart converting common semaglutide doses from 0.25 mg to 2.4 mg into insulin syringe units at 1 mg/mL, 2.5 mg/mL and 5 mg/mL concentrations",
    caption:
      "Every common semaglutide dose in syringe units, shown at the three concentrations pharmacies dispense most often (U-100 syringe).",
    width: 1600,
    height: 900,
  },
  concentration: {
    src: "/charts/glp1-concentration-comparison-chart.webp",
    alt: "Chart showing the same 1 mg semaglutide dose requiring 100 units at 1 mg/mL, 40 units at 2.5 mg/mL and 20 units at 5 mg/mL",
    caption:
      "The identical 1 mg dose draws a different number of units at every concentration. The concentration on your label is what decides.",
    width: 1600,
    height: 900,
  },
  syringe: {
    src: "/charts/glp1-insulin-syringe-sizes-chart.webp",
    alt: "Diagram comparing 30-unit, 50-unit and 100-unit U-100 insulin syringes, their barrel volumes and unit markings",
    caption:
      "30-unit, 50-unit and 100-unit insulin syringes side by side. The smallest barrel your dose fits is the easiest to read accurately.",
    width: 1600,
    height: 900,
  },
};

/* ------------------------------------------------------------------ */
/* UNDERSTANDING YOUR CONVERSION (worked example, sits above the fold  */
/* of the content)                                                     */
/* ------------------------------------------------------------------ */

export const understandingConversion = {
  heading: "Understanding your conversion",
  intro:
    "Every conversion on this page is one worked example: a prescribed dose in milligrams, your vial's concentration, and the number of units that lands on the syringe. Here is what a typical result looks like.",
  example: {
    caption: "Worked example: a 0.5 mg dose from a 2.5 mg/mL vial",
    rows: [
      { label: "Your prescribed dose", value: "0.5 mg" },
      { label: "Your concentration", value: "2.5 mg/mL" },
      { label: "Volume to draw", value: "0.20 mL" },
      { label: "Draw", value: "20 units", highlight: true },
      { label: "Recommended syringe", value: "30-unit syringe" },
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/* BEFORE YOU INJECT (3-step trust check, moved high on the page)      */
/* ------------------------------------------------------------------ */

export const beforeYouInject = {
  heading: "Before you inject, check three things",
  intro:
    "Almost every conversion error comes down to one of these three numbers being wrong. Confirm all three against the label in your hand before you draw.",
  checks: [
    {
      title: "Check your concentration",
      body: "Read the mg/mL printed on your vial and make sure it matches what you entered. This one number decides every unit you draw.",
    },
    {
      title: "Check your medication",
      body: "Confirm the drug and that it is a compounded vial, not a pre-filled pen. Pens measure the dose for you and are never drawn into a syringe.",
    },
    {
      title: "Check your syringe",
      body: "Use a U-100 insulin syringe, where 100 units equals 1 mL, and pick the smallest barrel your dose fits so the markings are easy to read.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* HOW MANY UNITS IS MY DOSE (scannable dose cards for AI Overviews)   */
/* ------------------------------------------------------------------ */

export interface DoseCard {
  dose: string;
  drug: "Semaglutide" | "Tirzepatide";
  /** Units at each concentration, ordered low to high strength. */
  values: { concentration: string; units: string }[];
}

export const doseConversions = {
  heading: "How many units is my GLP-1 dose?",
  answer:
    "A GLP-1 dose has no single unit value. It depends entirely on your vial's concentration. For example, 0.5 mg equals 20 units at 2.5 mg/mL but only 10 units at 5 mg/mL. Find your dose below, then read the column that matches the concentration on your label.",
  cards: [
    {
      dose: "0.25 mg",
      drug: "Semaglutide",
      values: [
        { concentration: "1 mg/mL", units: "25 units" },
        { concentration: "2.5 mg/mL", units: "10 units" },
        { concentration: "5 mg/mL", units: "5 units" },
      ],
    },
    {
      dose: "0.5 mg",
      drug: "Semaglutide",
      values: [
        { concentration: "1 mg/mL", units: "50 units" },
        { concentration: "2.5 mg/mL", units: "20 units" },
        { concentration: "5 mg/mL", units: "10 units" },
      ],
    },
    {
      dose: "1 mg",
      drug: "Semaglutide",
      values: [
        { concentration: "1 mg/mL", units: "100 units" },
        { concentration: "2.5 mg/mL", units: "40 units" },
        { concentration: "5 mg/mL", units: "20 units" },
      ],
    },
    {
      dose: "1.7 mg",
      drug: "Semaglutide",
      values: [
        { concentration: "2.5 mg/mL", units: "68 units" },
        { concentration: "5 mg/mL", units: "34 units" },
      ],
    },
    {
      dose: "2.4 mg",
      drug: "Semaglutide",
      values: [
        { concentration: "2.5 mg/mL", units: "96 units" },
        { concentration: "5 mg/mL", units: "48 units" },
      ],
    },
    {
      dose: "5 mg",
      drug: "Tirzepatide",
      values: [
        { concentration: "5 mg/mL", units: "100 units" },
        { concentration: "10 mg/mL", units: "50 units" },
        { concentration: "20 mg/mL", units: "25 units" },
      ],
    },
  ] as DoseCard[],
} as const;

/* ------------------------------------------------------------------ */
/* WHY CONCENTRATION MATTERS (one sentence + a two-row example)        */
/* ------------------------------------------------------------------ */

export const whyConcentration = {
  heading: "Why concentration matters",
  answer:
    "The same dose can equal completely different syringe units because pharmacies prepare compounded GLP-1 vials at different strengths.",
  example: {
    caption: "The same 1 mg dose at two different concentrations",
    rows: [
      { dose: "1 mg", concentration: "1 mg/mL", units: "100 units" },
      { dose: "1 mg", concentration: "5 mg/mL", units: "20 units" },
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/* BRAND PENS VS COMPOUNDED VIALS (do you convert? yes/no table)       */
/* ------------------------------------------------------------------ */

export const brandVsCompounded = {
  heading: "Brand pens vs compounded vials",
  answer:
    "Only compounded multi-dose vials need converting. Brand pens such as Ozempic, Wegovy, Mounjaro and Zepbound measure the dose for you in milligrams, so you never count units.",
  rows: [
    { medication: "Ozempic", convert: false },
    { medication: "Wegovy", convert: false },
    { medication: "Mounjaro", convert: false },
    { medication: "Zepbound", convert: false },
    { medication: "Compounded semaglutide", convert: true },
    { medication: "Compounded tirzepatide", convert: true },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* CHOOSING THE RIGHT SYRINGE (comparison cards)                       */
/* ------------------------------------------------------------------ */

export const syringeChoice = {
  heading: "Choosing the right syringe",
  answer:
    "Use the smallest U-100 insulin syringe your dose fits inside. Fewer units spread across the barrel are far easier to read without a mistake.",
  cards: [
    {
      size: "30-unit",
      volume: "0.3 mL",
      markings: "1-unit steps",
      bestFor: "Best for small starter doses",
    },
    {
      size: "50-unit",
      volume: "0.5 mL",
      markings: "1-unit steps",
      bestFor: "Best for most people, up to 50 units",
    },
    {
      size: "100-unit",
      volume: "1 mL",
      markings: "2-unit steps",
      bestFor: "Best for high-volume doses",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* COMMON CONVERSION MISTAKES                                          */
/* ------------------------------------------------------------------ */

export const commonMistakes = {
  heading: "Common conversion mistakes",
  answer:
    "Most GLP-1 dosing errors are not maths errors. They are the wrong concentration, a reused units figure, or the wrong syringe. Here are the mistakes worth catching before you draw.",
  items: [
    {
      title: "Reusing a units number from an old vial",
      body: "A new vial can be a different strength. Always read the concentration on the new label and redo the conversion.",
    },
    {
      title: "Copying a units figure from a forum or a friend",
      body: "A units number is meaningless without the concentration it came from. Their vial is almost certainly not yours.",
    },
    {
      title: "Assuming the wrong concentration",
      body: "Believing your vial is 2.5 mg/mL when it is really 5 mg/mL doubles every dose you draw. Confirm mg/mL first, every time.",
    },
    {
      title: "Rounding a dose that lands between two markings",
      body: "If your dose does not sit on a whole line, do not estimate. It usually means the concentration and the syringe are mismatched.",
    },
    {
      title: "Drawing a pen into an insulin syringe",
      body: "Ozempic, Wegovy, Mounjaro and Zepbound are measured in milligrams by the device. They are never counted in units.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* WHAT TO DO IF YOUR NUMBERS DON'T MATCH                              */
/* ------------------------------------------------------------------ */

export const numbersDontMatch = {
  heading: "What to do if your numbers don't match",
  answer:
    "If the units here disagree with what your prescriber or pharmacist told you to draw, do not inject. The label always wins. Work through these steps before you go any further.",
  steps: [
    "Re-read the concentration on your vial and confirm it matches the mg/mL you entered here.",
    "Convert in the other direction: take the units you plan to draw, convert them back to milligrams, and check it equals your prescribed dose.",
    "Confirm the medication is a compounded vial, not a pre-filled pen that measures the dose for you.",
    "If the two answers still disagree, call the pharmacy that dispensed it before you inject. They will resolve it in a minute.",
  ],
  footer:
    "If you believe you have already injected the wrong amount, contact your prescriber or a poison information service straight away.",
} as const;

/* ------------------------------------------------------------------ */
/* WHY YOU CAN TRUST THIS CALCULATOR (EEAT signals)                    */
/* ------------------------------------------------------------------ */

export const trustSignals = {
  heading: "Why you can trust this calculator",
  answer:
    "This converter uses the same arithmetic your pharmacist uses, with your own vial concentration and the U-100 insulin syringe standard, and it checks the answer in both directions.",
  items: [
    {
      title: "Uses your vial concentration",
      body: "Nothing is assumed. Every result is built from the mg/mL you read off your own label.",
    },
    {
      title: "U-100 insulin syringe standard",
      body: "All units assume 100 units per 1 mL, the standard for insulin syringes worldwide.",
    },
    {
      title: "Double-direction verification",
      body: "You can convert mg to units and units back to mg to confirm both answers agree before you draw.",
    },
    {
      title: "Browser-only calculations",
      body: "Every number is worked out on your device. Nothing you type is stored or sent anywhere.",
    },
    {
      title: "Educational safety checks",
      body: "The tool flags doses that don't fit, land between markings, or exceed approved maximums so you can stop and confirm.",
    },
  ],
  referencesNote:
    "Dose ranges and product information are drawn from FDA prescribing information and manufacturer labels for semaglutide (Novo Nordisk) and tirzepatide (Eli Lilly). See the sources below.",
} as const;
