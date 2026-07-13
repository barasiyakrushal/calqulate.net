/**
 * ============================================================
 * FILE 2: CONTENT
 * All page copy, SEO content, FAQ, schema, and medication data
 * for the Calqulate Vitals Semaglutide Treatment Assistant.
 * calqulate.net/semaglutide-dose-calculator
 *
 * Everything the page says lives here. The UI (File 1:
 * components/TreatmentAssistant.tsx) only renders this data.
 * ============================================================
 */

export const SITE = {
  name: "Calqulate Vitals",
  url: "https://calqulate.net",
  pageUrl: "https://calqulate.net/health/semaglutide-dose-calculator",
  pagePath: "/health/semaglutide-dose-calculator",
} as const;

/* ------------------------------------------------------------------ */
/* SEO METADATA                                                        */
/* ------------------------------------------------------------------ */

export const seo = {
  title: "Semaglutide Dose Calculator: Dosage Schedule, Chart & Drug Activity",
  description:
    "Free Semaglutide dose calculator. Check your current treatment stage, standard FDA dose schedule (Wegovy & Ozempic), weekly dose escalation, estimated drug activity, protein and hydration targets. Instant results, no sign-up required.",
  keywords: [
    "semaglutide dose calculator",
    "semaglutide dosage calculator",
    "semaglutide dosing calculator",
    "semaglutide dose schedule",
    "semaglutide weekly dose",
    "semaglutide dose chart",
    "GLP-1 dose calculator",
    "wegovy dose schedule",
    "ozempic dose schedule",
    "semaglutide titration",
  ],
  ogTitle: "Semaglutide Dose Calculator | Calqulate Vitals",
  ogDescription:
    "Understand your Semaglutide treatment in seconds: current stage, FDA dose schedule, estimated drug activity, and what to expect next. Free, private, no sign-up.",
} as const;

/* ------------------------------------------------------------------ */
/* MEDICATION DATA: FDA prescribing schedules                         */
/* (Sources: Wegovy & Ozempic Prescribing Information, novo-pi.com)    */
/* ------------------------------------------------------------------ */

export type MedicationId = "wegovy" | "ozempic" | "compounded";

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

export const MEDICATIONS: Medication[] = [
  {
    id: "wegovy",
    name: "Wegovy",
    genericLabel: "semaglutide 2.4 mg (weight management)",
    doses: [0.25, 0.5, 1.0, 1.7, 2.4],
    schedule: [
      { fromWeek: 1, toWeek: 4, doseMg: 0.25, label: "Weeks 1–4", phase: "initiation" },
      { fromWeek: 5, toWeek: 8, doseMg: 0.5, label: "Weeks 5–8", phase: "escalation" },
      { fromWeek: 9, toWeek: 12, doseMg: 1.0, label: "Weeks 9–12", phase: "escalation" },
      { fromWeek: 13, toWeek: 16, doseMg: 1.7, label: "Weeks 13–16", phase: "escalation" },
      { fromWeek: 17, toWeek: null, doseMg: 2.4, label: "Week 17 onwards", phase: "maintenance" },
    ],
    maintenanceDoseMg: [1.7, 2.4],
    note: "FDA-approved for chronic weight management. Maintenance dose is 2.4 mg weekly (1.7 mg if 2.4 mg is not tolerated).",
  },
  {
    id: "ozempic",
    name: "Ozempic",
    genericLabel: "semaglutide (type 2 diabetes)",
    doses: [0.25, 0.5, 1.0, 2.0],
    schedule: [
      { fromWeek: 1, toWeek: 4, doseMg: 0.25, label: "Weeks 1–4", phase: "initiation" },
      { fromWeek: 5, toWeek: 8, doseMg: 0.5, label: "Weeks 5–8", phase: "escalation" },
      { fromWeek: 9, toWeek: 12, doseMg: 1.0, label: "Weeks 9–12 (if needed)", phase: "escalation" },
      { fromWeek: 13, toWeek: null, doseMg: 2.0, label: "Week 13+ (max, if needed)", phase: "maintenance" },
    ],
    maintenanceDoseMg: [0.5, 1.0, 2.0],
    note: "FDA-approved for type 2 diabetes. The 0.25 mg starting dose is for treatment initiation only and is not effective for glycemic control. Increases beyond 0.5 mg happen only if additional glycemic control is needed, with at least 4 weeks at each dose.",
  },
  {
    id: "compounded",
    name: "Compounded Semaglutide",
    genericLabel: "compounded semaglutide (provider-specific)",
    doses: [0.25, 0.5, 1.0, 1.7, 2.4],
    schedule: [
      { fromWeek: 1, toWeek: 4, doseMg: 0.25, label: "Weeks 1–4 (typical)", phase: "initiation" },
      { fromWeek: 5, toWeek: 8, doseMg: 0.5, label: "Weeks 5–8 (typical)", phase: "escalation" },
      { fromWeek: 9, toWeek: 12, doseMg: 1.0, label: "Weeks 9–12 (typical)", phase: "escalation" },
      { fromWeek: 13, toWeek: 16, doseMg: 1.7, label: "Weeks 13–16 (typical)", phase: "escalation" },
      { fromWeek: 17, toWeek: null, doseMg: 2.4, label: "Week 17 onwards (typical)", phase: "maintenance" },
    ],
    maintenanceDoseMg: [1.0, 1.7, 2.4],
    note: "Compounded semaglutide is not FDA-approved and protocols vary by provider. Most providers mirror the Wegovy titration schedule. Always follow your prescriber's exact instructions.",
  },
];

/** Semaglutide elimination half-life in days (label: approx. 1 week). */
export const HALF_LIFE_DAYS = 7;
/** Weeks of once-weekly dosing to reach ~steady state (4–5 weeks). */
export const STEADY_STATE_WEEKS = 5;

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: "Free GLP-1 Treatment Tool",
  headline: "Semaglutide Dose Calculator",
  subheadline:
    "Calculate your current treatment stage, standard dose schedule, and estimated medication activity in seconds.",
  trustBadges: [
    { icon: "check", text: "Free forever" },
    { icon: "shield", text: "Based on FDA prescribing schedules" },
    { icon: "user-x", text: "No sign-up required" },
    { icon: "lock", text: "Private, runs in your browser" },
  ],
  cta: "Start Calculator",
} as const;

/* ------------------------------------------------------------------ */
/* WIZARD                                                              */
/* ------------------------------------------------------------------ */

export const wizard = {
  stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
  steps: [
    {
      id: "medication",
      question: "Which medication are you taking?",
      helper: "Wegovy and Ozempic follow different FDA schedules. Compounded protocols vary by provider.",
    },
    {
      id: "dose",
      question: "What is your current weekly dose?",
      helper: "Check your pen or vial label. Doses are in milligrams (mg) injected once weekly.",
    },
    {
      id: "weeks",
      question: "How many weeks have you been on treatment?",
      helper: "Count from your very first injection, including your starting dose weeks.",
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
  ],
  goals: [
    { id: "weight-loss", label: "Weight loss", desc: "Reduce body weight and appetite" },
    { id: "diabetes", label: "Type 2 diabetes", desc: "Improve blood sugar control" },
    { id: "maintenance", label: "Maintenance", desc: "Hold results at a stable dose" },
  ],
  back: "Back",
  next: "Continue",
  finish: "See My Treatment Snapshot",
} as const;

/* ------------------------------------------------------------------ */
/* RESULT SNAPSHOT: labels and insight copy                           */
/* ------------------------------------------------------------------ */

export const snapshot = {
  title: "Your Treatment Snapshot",
  subtitle: "A full picture of where you are today, not just a number.",
  labels: {
    stage: "Current Stage",
    dose: "Current Dose",
    fdaStage: "Typical FDA Stage",
    activity: "Estimated Drug Activity",
    nextReview: "Next Standard Review",
    sideEffects: "Common Side Effects",
    appetite: "Expected Appetite",
    hydration: "Hydration Goal",
    protein: "Protein Goal",
    pace: "Weight Loss Pace",
    muscleRisk: "Muscle Loss Risk",
    status: "Overall Treatment Status",
  },
  statusOnTrack: "🟢 On Track",
  statusAhead: "🟡 Ahead of Schedule: confirm with your prescriber",
  statusBehind: "🟡 Behind Typical Schedule: this can be intentional, ask your prescriber",
  statusMaintenance: "🟢 Maintenance Phase",
  disclaimer:
    "This snapshot is educational, based on published FDA prescribing schedules and pharmacokinetics. It is not medical advice and never replaces your prescriber's instructions. Never change your dose without talking to your healthcare provider.",
} as const;

/** Phase-specific insight paragraphs ("explain why", not just "result"). */
export const insightsByPhase: Record<string, (week: number) => string> = {
  initiation: (week) =>
    `You've completed approximately ${week} week${week === 1 ? "" : "s"} of treatment, the initiation phase. This starting dose is intentionally low: it isn't the therapeutic target, it's there to let your digestive system adapt and reduce nausea. Slow weight change right now is completely normal and expected.`,
  escalation: (week) =>
    `You've completed approximately ${week} weeks of treatment and are in the dose-escalation phase. Many people at this stage begin adjusting to appetite suppression. Maintaining protein intake and resistance training becomes increasingly important, because rapid loss without them can cost you muscle, not just fat.`,
  maintenance: (week) =>
    `At roughly week ${week}, you're in the maintenance phase. The goal shifts from escalating dose to holding results: consistent weekly injections, steady protein, hydration, and strength work. Plateaus here are common and usually reflect your body finding a new set point, not treatment failure.`,
};

export const sideEffectsByPhase: Record<string, string> = {
  initiation: "Mild nausea, occasional fatigue",
  escalation: "Mild nausea, early satiety, constipation",
  maintenance: "Usually mild or none; occasional GI discomfort after dose day",
};

export const appetiteByPhase: Record<string, string> = {
  initiation: "Slightly reduced",
  escalation: "Low",
  maintenance: "Low and stable",
};

/* ------------------------------------------------------------------ */
/* "WHAT YOU'LL MISS" TIMELINE (differentiator section)                */
/* ------------------------------------------------------------------ */

export const missTimeline = {
  headline: "What you'll miss if you don't save today's result",
  rows: [
    { week: "Week 1", text: "Today's dose", unlocked: true },
    { week: "Week 2", text: "Drug levels", unlocked: true },
    { week: "Week 3", text: "Weight trend", unlocked: true },
    { week: "Week 4", text: "Fat vs. muscle estimate", unlocked: true },
    { week: "Week 8", text: "Plateau prediction", unlocked: false },
    { week: "Week 12", text: "Progress forecast", unlocked: false },
  ],
  cta: "Start Tracking Free",
} as const;

/* ------------------------------------------------------------------ */
/* FREE SIGN-UP CTA                                                    */
/* ------------------------------------------------------------------ */

export const freeCta = {
  headline: "Continue Your Progress",
  body: "Today's calculation is only one snapshot. Create a free Calqulate account to:",
  bullets: [
    "Save today's treatment",
    "Track every injection",
    "Watch medication levels rise and fall between doses",
    "Build your progress timeline week by week",
    "Never lose your history",
  ],
  primary: "Start Tracking Free",
  secondary: "Continue without saving",
  badge: "Free forever",
} as const;

/* ------------------------------------------------------------------ */
/* DASHBOARD PREVIEW                                                   */
/* ------------------------------------------------------------------ */

export const dashboardPreview = {
  title: "Your dashboard, one tap away",
  tiles: [
    "Today's Injection",
    "Drug Level",
    "Weight Trend",
    "PK Curve",
    "Protein",
    "Side Effects",
    "Timeline",
    "Forecast",
  ],
  badge: "Free forever",
  cta: "Continue My Treatment",
} as const;

/* ------------------------------------------------------------------ */
/* PREMIUM SECTION                                                     */
/* ------------------------------------------------------------------ */

export interface PremiumCard {
  title: string;
  desc: string;
  /** Cards without a CTA are shown as plain feature tiles. */
  cta?: string;
}

export const premium = {
  headline: "See What Happens Next",
  body: "Calqulate Vitals predicts your treatment, not just today's dose. Free answers “what should I do today?” Premium answers “what happens next?”",
  cards: [
    { title: "Predict your plateau", desc: "See the week your weight loss is statistically likely to slow, before it happens.", cta: "See My 8-Week Outlook" },
    { title: "Protect your muscle", desc: "Fat vs. muscle estimates flag when loss is coming from the wrong place.", cta: "Protect My Muscle" },
    { title: "Forecast your weight", desc: "A trajectory simulator projects your curve under different dose paths.", cta: "Forecast My Journey" },
    { title: "Doctor-ready reports", desc: "One-tap PDF of your doses, levels, weight, and side effects for appointments.", cta: "Generate My Doctor Report" },
    { title: "Correlation engine", desc: "Connects side effects, dose timing, protein, and sleep to what actually moves your results." },
    { title: "Adaptive coach", desc: "Weekly guidance that changes as your data changes, not generic tips." },
  ] as PremiumCard[],
  primary: "See My Future Progress",
  secondary: "Unlock Predictions",
} as const;

/* ------------------------------------------------------------------ */
/* EDUCATIONAL SEO CONTENT                                             */
/* ------------------------------------------------------------------ */

export interface ContentSection {
  id: string;
  heading: string;
  paragraphs: string[];
  table?: { caption: string; headers: string[]; rows: string[][] };
  list?: string[];
}

export const educationSections: ContentSection[] = [
  {
    id: "what-is-semaglutide",
    heading: "What is Semaglutide?",
    paragraphs: [
      "Semaglutide is a GLP-1 receptor agonist, a medication that mimics glucagon-like peptide-1, a natural gut hormone released after eating. By activating GLP-1 receptors, semaglutide slows stomach emptying, increases insulin release when blood sugar is high, and acts on appetite centres in the brain to reduce hunger.",
      "It is sold under three brand names: Ozempic (weekly injection for type 2 diabetes), Wegovy (weekly injection for chronic weight management), and Rybelsus (daily tablet for type 2 diabetes). Compounded semaglutide is also dispensed by some pharmacies and telehealth providers, though compounded versions are not FDA-approved.",
      "Because semaglutide affects the digestive system strongly, treatment always starts at a low dose and increases gradually, a process called dose escalation or titration. This calculator maps where you are in that process.",
    ],
  },
  {
    id: "dose-schedule",
    heading: "Standard Semaglutide Dose Schedule",
    paragraphs: [
      "Both Wegovy and Ozempic follow a stepped weekly schedule defined in their FDA prescribing information. Every dose is injected once weekly, on the same day each week, with or without food.",
    ],
    table: {
      caption: "FDA standard titration schedules (once-weekly injection)",
      headers: ["Weeks", "Wegovy (weight management)", "Ozempic (type 2 diabetes)"],
      rows: [
        ["1–4", "0.25 mg", "0.25 mg (starter dose, not therapeutic)"],
        ["5–8", "0.5 mg", "0.5 mg"],
        ["9–12", "1 mg", "1 mg (only if more glycemic control is needed)"],
        ["13–16", "1.7 mg", "2 mg (maximum, only if needed)"],
        ["17+", "2.4 mg (maintenance)", "continue effective dose"],
      ],
    },
  },
  {
    id: "dose-escalation",
    heading: "How Dose Escalation Works",
    paragraphs: [
      "Dose escalation means staying at each dose level for at least four weeks before moving up. Four weeks matters for two reasons. First, semaglutide has a half-life of about one week, so it takes four to five weeks of consistent dosing for blood levels to reach steady state, and only then do you feel a dose's full effect. Second, gradual increases give your digestive system time to adapt, which dramatically reduces nausea and vomiting.",
      "If side effects are difficult at a new dose, prescribers commonly delay the next escalation or step back down for a few weeks. That is a normal, FDA-anticipated adjustment, not a setback.",
    ],
  },
  {
    id: "why-titration-matters",
    heading: "Why Titration Matters",
    paragraphs: [
      "Skipping titration steps is the single most common cause of severe GI side effects with semaglutide. Clinical trials of Wegovy (STEP programme) and Ozempic (SUSTAIN programme) used the stepped schedule specifically because tolerability drove adherence: people who escalated gradually stayed on treatment longer and lost more weight.",
      "Titration also protects results. The starting 0.25 mg dose is not intended to produce weight loss or glycemic control; judging the medication's effectiveness in the first four weeks is premature by design.",
    ],
  },
  {
    id: "side-effects",
    heading: "Common Side Effects by Stage",
    paragraphs: [
      "Most semaglutide side effects are gastrointestinal, appear in the first weeks at any new dose, and fade as your body adapts.",
    ],
    list: [
      "Nausea: the most common effect, usually mild and worst 24–48 hours after injection",
      "Constipation or diarrhoea: often improved with fibre, water, and movement",
      "Early satiety: feeling full quickly; eat smaller, protein-first meals",
      "Fatigue and mild headache: most common during escalation weeks",
      "Injection-site reactions: rotate sites (abdomen, thigh, upper arm)",
      "Seek medical care promptly for severe abdominal pain, persistent vomiting, or signs of dehydration, as these can indicate rare but serious effects like pancreatitis",
    ],
  },
  {
    id: "protein",
    heading: "Protein Recommendations on Semaglutide",
    paragraphs: [
      "When appetite drops, protein is usually the first thing under-eaten, and inadequate protein during rapid weight loss accelerates muscle loss. Most clinicians recommend roughly 1.2–1.6 grams of protein per kilogram of body weight daily during active weight loss, prioritised at every meal. Combined with resistance training two to three times weekly, this is the most reliable way to keep loss coming from fat rather than muscle. Your snapshot above calculates a personalised daily target from your weight.",
    ],
  },
  {
    id: "hydration",
    heading: "Water Recommendations",
    paragraphs: [
      "Semaglutide reduces thirst signals along with hunger, and GI side effects increase fluid loss. Aim for roughly 30–35 ml per kilogram of body weight daily (about 2–3 litres for most adults), more in hot weather or during nausea episodes. Consistent hydration also measurably reduces headache and constipation during escalation weeks.",
    ],
  },
  {
    id: "exercise",
    heading: "Exercise Recommendations",
    paragraphs: [
      "Resistance training is the highest-value exercise on GLP-1 therapy: two to three full-body sessions weekly preserves muscle mass that dieting alone would sacrifice. Add 150 minutes of moderate cardio per week for cardiovascular health, and schedule harder sessions away from the 24–48 hours after injection if nausea is an issue for you.",
    ],
  },
  {
    id: "half-life",
    heading: "Semaglutide Half-Life & Drug Activity",
    paragraphs: [
      "Semaglutide's elimination half-life is approximately one week (about 7 days). This long half-life is what makes once-weekly dosing possible, but it has two practical consequences worth understanding.",
      "First, accumulation: each weekly dose adds to what remains from previous doses, so blood levels climb for four to five weeks after starting or changing a dose before levelling off at steady state. The 'Estimated Drug Activity' figure in your snapshot models this: it estimates how close your current levels are to that dose's steady-state plateau.",
      "Second, slow washout: after a missed or stopped dose, meaningful drug activity persists for weeks. This is why a single missed dose within 5 days can simply be taken late, while a longer gap may require restarting titration. Both decisions belong to your prescriber.",
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
    question: "How does the Semaglutide dose calculator work?",
    answer:
      "Enter your medication (Wegovy, Ozempic, or compounded semaglutide), current weekly dose, weeks on treatment, weight, and goal. The calculator compares your inputs against the FDA prescribing schedule for your medication, estimates your medication activity using semaglutide's one-week half-life, and generates a full treatment snapshot: stage, next standard review, side-effect expectations, and protein and hydration targets. Everything runs in your browser; nothing is stored or transmitted.",
  },
  {
    question: "What is the standard Semaglutide dose schedule?",
    answer:
      "For Wegovy: 0.25 mg weekly for weeks 1–4, then 0.5 mg (weeks 5–8), 1 mg (weeks 9–12), 1.7 mg (weeks 13–16), and 2.4 mg maintenance from week 17. For Ozempic: 0.25 mg for weeks 1–4, then 0.5 mg, increasing to 1 mg and a maximum of 2 mg only if additional blood sugar control is needed, with at least 4 weeks at each dose.",
  },
  {
    question: "When should my Semaglutide dose increase?",
    answer:
      "Under FDA schedules, dose increases happen after at least 4 weeks at each level. In practice your prescriber decides based on tolerability and response. Delaying an increase because of nausea, or holding a lower dose that's working well, are both normal and clinically expected.",
  },
  {
    question: "Why am I nauseous on Semaglutide?",
    answer:
      "Nausea is semaglutide's most common side effect. It happens because the medication slows stomach emptying and acts on appetite centres in the brain. It's typically worst in the 24–48 hours after injection and during the first weeks at a new dose, then fades as your body adapts. Smaller meals, less fat and sugar, more water, and not lying down after eating all help. Contact your provider for severe or persistent vomiting.",
  },
  {
    question: "What does 'estimated drug activity' mean?",
    answer:
      "Semaglutide has a half-life of about 7 days, so each weekly dose stacks on what remains of previous doses. For 4–5 weeks after starting or raising a dose, levels are still climbing toward a plateau called steady state. The drug activity percentage estimates how close your current levels are to that plateau. It is an educational model based on published pharmacokinetics, not a measurement of your blood.",
  },
  {
    question: "Why has my weight loss slowed?",
    answer:
      "Plateaus on semaglutide are normal and expected. Common reasons: your body reaching a new set point at the current dose, levels still stabilising after a recent dose change, muscle loss lowering your metabolic rate (protein and resistance training protect against this), or calorie intake drifting up as appetite adapts. If a plateau lasts more than 4–6 weeks, discuss it with your prescriber, since a dose adjustment may or may not be appropriate.",
  },
  {
    question: "What happens if I miss a dose of Semaglutide?",
    answer:
      "For Ozempic, take the missed dose within 5 days, then resume your schedule; if more than 5 days have passed, skip it. For Wegovy, if your next scheduled dose is more than 2 days away, take it as soon as possible; if you miss more than 2 consecutive weeks, contact your prescriber, as restarting at a lower dose may be needed. Never double up doses.",
  },
  {
    question: "Is the calculator free? Do I need an account?",
    answer:
      "The calculator is completely free with no sign-up required. Every result, chart, and target is shown instantly. A free Calqulate account is optional and adds saving, injection tracking, and a progress timeline. Premium adds predictions: plateau forecasts, fat-vs-muscle estimates, trajectory simulation, and doctor-ready reports.",
  },
  {
    question: "Is compounded semaglutide dosed the same way?",
    answer:
      "Usually similar, because most compounding providers mirror the Wegovy titration schedule. But compounded semaglutide is not FDA-approved, concentrations vary between pharmacies, and doses are often drawn in units rather than pre-set pen clicks. Always follow your specific provider's protocol, and use this calculator's compounded mode as a general educational reference only.",
  },
  {
    question: "How long does Semaglutide stay in your system?",
    answer:
      "With a one-week half-life, semaglutide takes roughly 5–7 weeks after the last dose to be essentially cleared (about five half-lives). This slow washout means effects, and some side effects, taper gradually rather than stopping abruptly when treatment ends.",
  },
  {
    question: "How much protein should I eat on Semaglutide?",
    answer:
      "Most clinicians recommend about 1.2–1.6 g of protein per kilogram of body weight daily during active weight loss on GLP-1 medication. For example, roughly 100–130 g/day for a 82 kg (180 lb) person. Spreading it across meals and pairing it with resistance training 2–3× weekly is the best-evidenced way to preserve muscle.",
  },
  {
    question: "Can this calculator tell me what dose to take?",
    answer:
      "No, and no online tool should. This calculator shows where your current dose sits relative to standard FDA schedules and explains what's typical at your stage. All dosing decisions belong to your prescriber, who knows your history, labs, and response.",
  },
];

/* ------------------------------------------------------------------ */
/* MEDICAL REFERENCES                                                  */
/* ------------------------------------------------------------------ */

export const references = [
  {
    label: "Wegovy (semaglutide) Prescribing Information (Novo Nordisk / FDA)",
    url: "https://www.novo-pi.com/wegovy.pdf",
  },
  {
    label: "Ozempic (semaglutide) Prescribing Information (Novo Nordisk / FDA)",
    url: "https://www.novo-pi.com/ozempic.pdf",
  },
  {
    label: "Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1). NEJM 2021",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
  },
  {
    label: "FDA: Medications Containing Semaglutide (incl. compounding information)",
    url: "https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/medications-containing-semaglutide-marketed-type-2-diabetes-or-weight-loss",
  },
  {
    label: "Hall KD et al. Protein intake and lean mass preservation during weight loss (review literature)",
    url: "https://pubmed.ncbi.nlm.nih.gov/",
  },
] as const;

export const medicalDisclaimer =
  "Calqulate Vitals provides educational information based on published FDA prescribing schedules and clinical literature. It is not medical advice, does not create a doctor–patient relationship, and must not be used to start, stop, or change any medication. Always follow your prescriber's instructions. If you experience severe abdominal pain, persistent vomiting, symptoms of low blood sugar, or an allergic reaction, seek medical care immediately.";

/* ------------------------------------------------------------------ */
/* JSON-LD STRUCTURED DATA                                             */
/* ------------------------------------------------------------------ */

export function buildJsonLd() {
  const medicalWebPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${SITE.pageUrl}#webpage`,
    name: seo.title,
    url: SITE.pageUrl,
    description: seo.description,
    inLanguage: "en",
    lastReviewed: "2026-07-01",
    about: {
      "@type": "Drug",
      name: "Semaglutide",
      nonProprietaryName: "semaglutide",
      drugClass: "GLP-1 receptor agonist",
      administrationRoute: "Subcutaneous injection",
      frequency: "Once weekly",
    },
    audience: { "@type": "Patient" },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntity: { "@id": `${SITE.pageUrl}#app` },
  };

  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE.pageUrl}#app`,
    name: "Semaglutide Dose Calculator",
    url: SITE.pageUrl,
    applicationCategory: "HealthApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "FDA dose schedule lookup for Wegovy and Ozempic",
      "Treatment stage identification",
      "Estimated drug activity (pharmacokinetic model)",
      "Personalised protein and hydration targets",
      "Interactive dose timeline and PK curve",
    ],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE.pageUrl}#faq`,
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE.url}/calculators` },
      { "@type": "ListItem", position: 3, name: "Semaglutide Dose Calculator", item: SITE.pageUrl },
    ],
  };

  return [medicalWebPage, webApplication, faqPage, breadcrumbs];
}
