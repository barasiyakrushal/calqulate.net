// lib/glp1/sideEffects.ts
// Single source of truth for the GLP-1 side-effect system: powers the Side
// Effect Timeline, the "Am I Normal?" cohort checker, the side-effects hub, and
// the individual symptom pages at /health/glp-1-side-effects/[symptom].
//
// Content is general and educational — it never replaces a prescriber's advice.
// Frequency bands are directional (real-world reports and trial adverse-event
// tables vary widely by drug, dose, and how fast the dose was raised).

export type SideEffectCategory = "gi" | "systemic" | "food-drink";
export type Frequency = "very-common" | "common" | "less-common";

export interface SideEffect {
  slug: string;
  /** Display name / the question a searcher would ask. */
  name: string;
  /** Short chip label for the timeline and grids. */
  short: string;
  /** Search phrasings people use — also feeds keywords. */
  aka: string[];
  category: SideEffectCategory;
  frequency: Frequency;
  /** Plain-language "how common" line, e.g. "one of the most common". */
  howCommon: string;
  /**
   * Rough timeline in weeks from starting (or from a dose increase). Null for
   * lifestyle questions (food/drink) that don't follow a start-and-fade arc.
   */
  timeline: { onsetWeek: number; peakWeek: number; easesWeek: number } | null;
  /** One-sentence reassurance shown at the top of the answer. */
  tldr: string;
  /** Why it happens — 1-2 short paragraphs. */
  why: string[];
  /** How long it usually lasts (or, for food/drink, the practical rule). */
  howLong: string;
  /** Concrete things that help. */
  whatHelps: string[];
  /** When it's NOT normal — call a doctor / urgent care. */
  redFlags: string[];
  /** Slugs of related symptoms. */
  related: string[];
  /** Optional free tools relevant to this symptom. */
  tools?: { label: string; href: string }[];
}

export const SIDE_EFFECTS: SideEffect[] = [
  {
    slug: "nausea",
    name: "Why am I nauseous on a GLP-1, and how long does it last?",
    short: "Nausea",
    aka: ["why am i nauseous", "how long does nausea last", "ozempic nausea", "wegovy nausea", "feeling sick"],
    category: "gi",
    frequency: "very-common",
    howCommon: "the single most common GLP-1 side effect",
    timeline: { onsetWeek: 1, peakWeek: 2, easesWeek: 6 },
    tldr: "Nausea is the most common GLP-1 side effect and is almost always temporary — it usually flares after a dose increase and fades within a week or two.",
    why: [
      "GLP-1 medications slow how fast your stomach empties, so food sits longer and you feel full and queasy sooner. That delayed emptying is exactly how the drug curbs your appetite — the nausea is the same mechanism working a little too hard while your body adjusts.",
      "It's usually worst in the first days after starting and after each dose increase, which is why titration goes slowly on purpose.",
    ],
    howLong:
      "For most people, nausea is worst in the first 1–2 weeks at a new dose and settles as your body adjusts. If you're steady on a dose, it typically keeps improving rather than getting worse.",
    whatHelps: [
      "Eat smaller meals, slowly, and stop at 'satisfied' rather than full",
      "Avoid fried, very fatty, greasy, or spicy food while nausea is active",
      "Choose cold or room-temperature foods — they smell less intense than hot food",
      "Sip fluids between meals rather than during them",
      "Don't lie down right after eating",
    ],
    redFlags: [
      "Vomiting repeatedly or being unable to keep fluids down",
      "Severe stomach pain, especially pain radiating to your back",
      "Signs of dehydration — dizziness, very dark urine, not urinating",
    ],
    related: ["vomiting-food-tolerance", "sulfur-burps", "constipation"],
    tools: [{ label: "Protein / Macro Calculator", href: "/health/macro-calculator" }],
  },
  {
    slug: "sulfur-burps",
    name: "Why do I have sulfur burps (rotten-egg burps) on a GLP-1?",
    short: "Sulfur burps",
    aka: ["sulfur burps", "egg burps", "rotten egg burps", "smelly burps ozempic"],
    category: "gi",
    frequency: "common",
    howCommon: "a common and much-discussed GLP-1 complaint",
    timeline: { onsetWeek: 1, peakWeek: 3, easesWeek: 8 },
    tldr: "Those rotten-egg burps come from food sitting longer in a slowed-down gut — unpleasant, usually harmless, and manageable.",
    why: [
      "Because your stomach empties more slowly on a GLP-1, food (especially protein and fatty meals) lingers and ferments longer. That fermentation produces hydrogen sulfide gas — the same compound that makes rotten eggs smell — which comes back up as sulfur burps.",
      "It often clusters after larger or richer meals and after dose increases, when digestion is slowest.",
    ],
    howLong:
      "It tends to come and go with meals rather than being constant, and usually eases as your body adjusts to a dose. Larger, fattier meals reliably make it worse.",
    whatHelps: [
      "Eat smaller portions and avoid very fatty or heavy meals",
      "Slow down — don't gulp air with food or drink",
      "Stay hydrated and keep moving after meals to help digestion",
      "Some people find fewer sulfur-rich foods (eggs, red meat, garlic, onions) helps",
    ],
    redFlags: [
      "Sulfur burps with persistent vomiting or severe abdominal pain",
      "Signs your gut has stopped moving — bloating with no bowel movement and vomiting",
    ],
    related: ["nausea", "bloating-gas", "constipation"],
  },
  {
    slug: "constipation",
    name: "Why am I constipated on a GLP-1, and what helps?",
    short: "Constipation",
    aka: ["constipation", "cant poop ozempic", "no bowel movement", "wegovy constipation"],
    category: "gi",
    frequency: "very-common",
    howCommon: "one of the most common GLP-1 side effects",
    timeline: { onsetWeek: 1, peakWeek: 4, easesWeek: 10 },
    tldr: "Constipation is extremely common on GLP-1s — slower digestion plus eating less is the cause, and it's very manageable.",
    why: [
      "Two things stack up: the medication slows how fast everything moves through your gut, and you're simply eating less, so there's less bulk and less fiber going in. Add the dehydration that comes with a smaller appetite and stool gets slow and hard.",
      "It's most likely in the first weeks and after dose increases.",
    ],
    howLong:
      "It often improves as your body adapts, but for many people it's an ongoing thing to manage with fiber, fluids, and movement rather than something that fully disappears.",
    whatHelps: [
      "Drink more water than feels necessary — aim for pale-yellow urine",
      "Get fiber in deliberately (vegetables, fruit, whole grains, or a fiber supplement)",
      "Move daily — even a 10–15 minute walk helps your gut",
      "Ask your prescriber about a gentle stool softener or magnesium if it persists",
    ],
    redFlags: [
      "No bowel movement for several days with belly pain, bloating, and vomiting",
      "Severe or worsening abdominal pain",
    ],
    related: ["bloating-gas", "nausea", "dehydration-fluids"],
  },
  {
    slug: "diarrhea",
    name: "Why do I have diarrhea on a GLP-1?",
    short: "Diarrhea",
    aka: ["diarrhea", "loose stools", "ozempic diarrhea", "mounjaro diarrhea"],
    category: "gi",
    frequency: "common",
    howCommon: "a common GLP-1 side effect",
    timeline: { onsetWeek: 1, peakWeek: 3, easesWeek: 8 },
    tldr: "Diarrhea is a common early GLP-1 side effect that usually settles as your body adjusts to a dose.",
    why: [
      "GLP-1s change how your gut moves and how it handles fats, which can loosen stools — especially early on and after a dose increase. Rich, fatty, or greasy meals are frequent triggers.",
    ],
    howLong:
      "It's typically worst early and after dose changes, and improves within a week or two as you adjust. Persistent diarrhea deserves a check-in with your prescriber.",
    whatHelps: [
      "Avoid fried, greasy, and very fatty foods while it's active",
      "Stay hydrated — replace fluids and electrolytes",
      "Eat smaller, plainer meals for a few days",
      "Limit caffeine and alcohol, which can make it worse",
    ],
    redFlags: [
      "Diarrhea that won't stop, or signs of dehydration (dizziness, very dark urine)",
      "Blood in the stool, or severe abdominal pain",
    ],
    related: ["nausea", "dehydration-fluids", "fatty-food-pizza"],
  },
  {
    slug: "bloating-gas",
    name: "Why am I so bloated and gassy on a GLP-1?",
    short: "Bloating & gas",
    aka: ["bloating", "gas", "gassy ozempic", "distended stomach"],
    category: "gi",
    frequency: "common",
    howCommon: "a common GLP-1 side effect",
    timeline: { onsetWeek: 1, peakWeek: 4, easesWeek: 9 },
    tldr: "Bloating and gas come from food and gas moving through your gut more slowly — common, usually harmless, and helped by smaller meals.",
    why: [
      "Slowed digestion means food and gas linger longer, which feels like bloating and pressure. It's closely linked with constipation — when things back up, bloating follows.",
    ],
    howLong:
      "It usually eases as your gut adapts, and improves a lot when constipation is kept under control.",
    whatHelps: [
      "Smaller, slower meals; don't rush or gulp air",
      "Stay on top of constipation with fiber and fluids",
      "Walk after meals to move gas through",
      "Go easy on carbonated drinks and known gassy foods",
    ],
    redFlags: [
      "Severe, rapidly worsening bloating with pain and vomiting",
      "A hard, distended belly with no gas or bowel movement passing",
    ],
    related: ["constipation", "sulfur-burps", "nausea"],
  },
  {
    slug: "heartburn-reflux",
    name: "Why do I have heartburn or acid reflux on a GLP-1?",
    short: "Heartburn",
    aka: ["heartburn", "acid reflux", "gerd ozempic", "indigestion"],
    category: "gi",
    frequency: "common",
    howCommon: "a common GLP-1 side effect",
    timeline: { onsetWeek: 1, peakWeek: 4, easesWeek: 10 },
    tldr: "Reflux and heartburn happen because food sits in your stomach longer — manageable with smaller meals and timing.",
    why: [
      "Delayed stomach emptying means food and acid stay in your stomach longer, which can push acid up into your esophagus, especially after large or fatty meals or when you lie down soon after eating.",
    ],
    howLong:
      "It often improves as doses stabilize, but meal size, meal timing, and food choices strongly influence it day to day.",
    whatHelps: [
      "Smaller meals; avoid fatty, spicy, and acidic trigger foods",
      "Don't lie down for 2–3 hours after eating",
      "Raise the head of your bed if it's worse at night",
      "Ask your prescriber before using regular antacids or reflux medication",
    ],
    redFlags: [
      "Severe chest pain, or difficulty or pain when swallowing",
      "Vomiting blood or black, tarry stools",
    ],
    related: ["nausea", "fatty-food-pizza", "bloating-gas"],
  },
  {
    slug: "fatigue",
    name: "Why am I so tired and fatigued on a GLP-1?",
    short: "Fatigue",
    aka: ["fatigue", "tired", "exhausted", "no energy ozempic", "low energy"],
    category: "systemic",
    frequency: "common",
    howCommon: "commonly reported (more by patients than in trial tables)",
    timeline: { onsetWeek: 1, peakWeek: 4, easesWeek: 12 },
    tldr: "Fatigue on a GLP-1 is usually about eating much less — and it's often fixable with protein, enough food, and checking a few labs.",
    why: [
      "You're almost certainly eating fewer calories, which means less fuel. If protein or overall intake drops too low, you can also run short on iron, B12, or vitamin D, all of which affect energy. Slower digestion can mean nutrients absorb more gradually too.",
      "A 2026 analysis of GLP-1 users flagged fatigue as discussed far more often by patients than it appears in official adverse-event tables — so if you feel it, you're not imagining it.",
    ],
    howLong:
      "It often improves once you dial in protein and stop under-eating. If it lingers past a few weeks, it's worth checking labs.",
    whatHelps: [
      "Hit a real protein target and don't accidentally under-eat overall",
      "Prioritise iron- and B12-rich foods; ask your doctor about checking levels",
      "Keep hydrated and protect your sleep",
      "Gentle movement often helps more than rest",
    ],
    redFlags: [
      "Fatigue with a racing heart, breathlessness, or fainting",
      "Extreme weakness or confusion",
    ],
    related: ["feeling-cold", "dizziness", "hair-loss"],
    tools: [{ label: "TDEE Calculator", href: "/health/tdee-calculator" }],
  },
  {
    slug: "feeling-cold",
    name: "Why do I feel cold all the time on a GLP-1? (\"Ozempic chills\")",
    short: "Feeling cold",
    aka: ["feeling cold", "ozempic chills", "always cold", "cold hands and feet"],
    category: "systemic",
    frequency: "less-common",
    howCommon: "an under-reported but real symptom cluster",
    timeline: { onsetWeek: 4, peakWeek: 12, easesWeek: 36 },
    tldr: "Feeling cold usually tracks with losing fat and a slightly lower metabolic rate — real, common enough to be flagged in research, and usually harmless.",
    why: [
      "Rapid fat loss reduces your body's insulating layer, and losing weight quickly can slightly lower your resting metabolic rate — both make you run colder than before. A 2026 analysis of GLP-1 users flagged temperature changes and chills as a genuinely common, under-documented experience.",
    ],
    howLong:
      "It tends to track with the pace of your weight loss and often steadies as your weight and intake stabilise.",
    whatHelps: [
      "Make sure you're not under-eating — very low intake makes you colder",
      "Hit your protein target to protect metabolically active muscle",
      "Layer up and keep moving to generate heat",
      "Ask your doctor to check thyroid, iron, and B12 if it's severe",
    ],
    redFlags: [
      "Cold with a real fever, chest pain, or confusion",
      "You can't get warm no matter what you do",
    ],
    related: ["fatigue", "hair-loss", "dizziness"],
    tools: [{ label: "Metabolic Health Score", href: "/product/metabolic-health-tracker" }],
  },
  {
    slug: "headache",
    name: "Why do I get headaches on a GLP-1?",
    short: "Headaches",
    aka: ["headache", "headaches ozempic", "migraine glp-1"],
    category: "systemic",
    frequency: "common",
    howCommon: "commonly reported, especially early",
    timeline: { onsetWeek: 1, peakWeek: 2, easesWeek: 6 },
    tldr: "Early headaches on a GLP-1 are often about dehydration, under-eating, or low blood sugar — usually fixable with fluids and regular meals.",
    why: [
      "Eating and drinking less can leave you dehydrated and low on fuel, both classic headache triggers. If you take other blood-sugar medication, dips in blood sugar can also cause headaches.",
    ],
    howLong:
      "These usually ease within the first couple of weeks as you settle into eating and hydrating consistently.",
    whatHelps: [
      "Drink more water throughout the day",
      "Don't skip meals — eat small, regular, protein-forward meals",
      "Watch for low-blood-sugar signs if you're on other diabetes meds",
      "Protect your sleep and limit alcohol",
    ],
    redFlags: [
      "A sudden, severe 'worst-ever' headache",
      "Headache with vision changes, confusion, or weakness on one side",
    ],
    related: ["dehydration-fluids", "fatigue", "dizziness"],
  },
  {
    slug: "dizziness",
    name: "Why do I feel dizzy or lightheaded on a GLP-1?",
    short: "Dizziness",
    aka: ["dizzy", "lightheaded", "dizziness ozempic", "faint"],
    category: "systemic",
    frequency: "common",
    howCommon: "commonly reported, usually early",
    timeline: { onsetWeek: 1, peakWeek: 3, easesWeek: 8 },
    tldr: "Dizziness is often dehydration, under-eating, or low blood sugar — usually solved by fluids and regular meals, but worth watching.",
    why: [
      "Reduced appetite can leave you under-hydrated and under-fueled, which causes lightheadedness. If you're on insulin or a sulfonylurea, low blood sugar is another cause. Standing up quickly can make it more noticeable.",
    ],
    howLong:
      "It usually settles once your fluid and food intake are steady. Persistent dizziness needs a medical review.",
    whatHelps: [
      "Hydrate consistently and include some electrolytes",
      "Eat small, regular meals; don't go long stretches without food",
      "Stand up slowly",
      "If you take other diabetes meds, ask about checking blood sugar",
    ],
    redFlags: [
      "Fainting, chest pain, or a racing/irregular heartbeat",
      "Dizziness with confusion, slurred speech, or weakness",
    ],
    related: ["headache", "fatigue", "dehydration-fluids"],
  },
  {
    slug: "hair-loss",
    name: "Why is my hair falling out on a GLP-1?",
    short: "Hair loss",
    aka: ["hair loss", "hair falling out ozempic", "shedding", "telogen effluvium"],
    category: "systemic",
    frequency: "less-common",
    howCommon: "reported by some, tied to rapid weight loss",
    timeline: { onsetWeek: 8, peakWeek: 16, easesWeek: 36 },
    tldr: "Hair shedding is caused by rapid weight loss, not the drug directly — and for almost everyone it's temporary.",
    why: [
      "Fast, significant weight loss can trigger telogen effluvium, where more hair follicles than usual enter their resting phase at once. It typically starts 2–4 months after the weight loss begins — not immediately. Low protein, iron, or zinc from eating less can make it worse.",
    ],
    howLong:
      "It's temporary for the vast majority. Shedding usually slows within a few months and hair looks close to normal by 6–9 months, especially if you protect your protein intake.",
    whatHelps: [
      "Hit your protein target consistently",
      "Ask your doctor about checking iron, zinc, and vitamin D",
      "Avoid losing faster than about 1% of body weight per week if you can",
      "Be gentle with styling while it's shedding",
    ],
    redFlags: [
      "Patchy bald spots rather than diffuse thinning",
      "Hair loss with a rash, or other signs of illness",
    ],
    related: ["fatigue", "feeling-cold", "muscle-face-loss"],
    tools: [{ label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" }],
  },
  {
    slug: "injection-site",
    name: "Is a red, itchy, or sore injection site normal on a GLP-1?",
    short: "Injection site",
    aka: ["injection site reaction", "red lump injection", "itchy injection", "bruise injection"],
    category: "systemic",
    frequency: "common",
    howCommon: "common and usually minor",
    timeline: { onsetWeek: 1, peakWeek: 1, easesWeek: 2 },
    tldr: "Mild redness, itching, or a small lump at the injection site is common and usually fades in a few days.",
    why: [
      "A minor local reaction to the injection is normal. Rotating sites, injection technique, and needle handling all affect how much you get. A small bruise or bump that resolves on its own is expected.",
    ],
    howLong:
      "Minor reactions typically settle within a few days. Rotating your injection site each week helps prevent buildup.",
    whatHelps: [
      "Rotate sites weekly (abdomen, thigh, upper arm)",
      "Let the medication reach room temperature before injecting",
      "Don't rub the site hard afterward; a cool compress can ease itching",
      "Use a fresh needle each time",
    ],
    redFlags: [
      "Spreading redness, warmth, swelling, or pus (possible infection)",
      "Signs of a serious allergic reaction — swelling, trouble breathing, widespread rash",
    ],
    related: ["nausea"],
    tools: [{ label: "Injection Day Calculator", href: "/health/glp-1-injection-day-calculator" }],
  },
  {
    slug: "dehydration-fluids",
    name: "Do I need to drink more water on a GLP-1?",
    short: "Hydration",
    aka: ["dehydration", "how much water ozempic", "dry mouth", "thirsty"],
    category: "systemic",
    frequency: "very-common",
    howCommon: "an issue for most people, since appetite drives fluid intake",
    timeline: { onsetWeek: 1, peakWeek: 2, easesWeek: 12 },
    tldr: "Yes — a smaller appetite means less fluid from food and drink, so dehydration sneaks up and drives several other side effects.",
    why: [
      "A lot of your daily fluid normally comes from food. When appetite drops, so does that fluid — and dehydration is a hidden driver of headaches, fatigue, dizziness, and constipation on GLP-1s.",
    ],
    howLong:
      "It's an ongoing thing to stay ahead of the whole time you're on the medication, not a phase that passes.",
    whatHelps: [
      "Aim for pale-yellow urine as your gauge",
      "Keep a water bottle visible and sip through the day",
      "Add electrolytes if you're eating very little",
      "Count herbal tea and broth toward your fluids",
    ],
    redFlags: [
      "Dizziness or fainting, very dark urine, or not urinating",
      "Rapid heartbeat with confusion",
    ],
    related: ["headache", "constipation", "dizziness"],
  },
  {
    slug: "fatty-food-pizza",
    name: "Can I eat pizza and fatty food on a GLP-1?",
    short: "Fatty food & pizza",
    aka: ["can i eat pizza", "fatty food ozempic", "greasy food", "cheat meal glp-1"],
    category: "food-drink",
    frequency: "common",
    howCommon: "the food question almost everyone asks",
    timeline: null,
    tldr: "You can — but fatty, greasy foods like pizza are the ones most likely to make you feel awful on a GLP-1, so smaller portions win.",
    why: [
      "Because your stomach empties slowly, high-fat meals sit heavily and are the top trigger for nausea, reflux, sulfur burps, and diarrhea. Nothing is strictly forbidden, but rich, greasy food is where most people learn their limit the hard way.",
    ],
    howLong:
      "This is an ongoing tolerance thing, not a phase. Many people find their tolerance for heavy food drops noticeably and stays lower while on the medication.",
    whatHelps: [
      "Have a smaller portion than you used to, and eat it slowly",
      "Pair it with protein and don't eat to full",
      "Avoid heavy, greasy meals right after a dose increase, when the gut is slowest",
      "Notice your personal trigger foods and plan around them",
    ],
    redFlags: [
      "Severe stomach pain after fatty meals, especially upper-right pain (possible gallbladder issue)",
      "Persistent vomiting after eating",
    ],
    related: ["nausea", "heartburn-reflux", "diarrhea"],
  },
  {
    slug: "alcohol",
    name: "Can I drink alcohol on a GLP-1?",
    short: "Alcohol",
    aka: ["can i drink alcohol", "alcohol ozempic", "wine glp-1", "drinking on wegovy"],
    category: "food-drink",
    frequency: "common",
    howCommon: "a top lifestyle question",
    timeline: null,
    tldr: "There's no absolute ban, but many people find alcohol hits harder, and it can worsen nausea, dehydration, and low blood sugar — so go slow.",
    why: [
      "Interestingly, a lot of people on GLP-1s report wanting alcohol less. When you do drink, it can feel stronger, and it adds to dehydration and gut upset. If you take other diabetes medication, alcohol can also push blood sugar too low.",
    ],
    howLong:
      "This is ongoing guidance, not a phase. Your tolerance and desire for alcohol may stay changed while you're on the medication.",
    whatHelps: [
      "Start with much less than you used to and see how you feel",
      "Hydrate alongside and never drink on an empty stomach",
      "Be extra cautious if you're on insulin or a sulfonylurea (low blood sugar risk)",
      "Skip alcohol when nausea is active or right after a dose increase",
    ],
    redFlags: [
      "Signs of low blood sugar — shakiness, sweating, confusion",
      "Vomiting and inability to keep fluids down after drinking",
    ],
    related: ["nausea", "dehydration-fluids", "dizziness"],
  },
  {
    slug: "vomiting-food-tolerance",
    name: "I'm vomiting or food won't stay down on a GLP-1 — is that normal?",
    short: "Vomiting",
    aka: ["vomiting", "throwing up ozempic", "cant keep food down", "food aversion"],
    category: "gi",
    frequency: "common",
    howCommon: "common around dose increases, but a signal to act on",
    timeline: { onsetWeek: 1, peakWeek: 2, easesWeek: 6 },
    tldr: "Occasional queasiness that improves is expected; repeated vomiting or being unable to keep fluids down is a reason to call your prescriber, not tough it out.",
    why: [
      "The same slowed stomach emptying that causes nausea can tip into vomiting if you eat too much, too fast, or too rich — most often in the days after a dose increase. Real food aversions are also common as smells and textures change.",
    ],
    howLong:
      "Mild, occasional episodes usually ease within a week or two at a steady dose. Frequent vomiting is not something to wait out.",
    whatHelps: [
      "Drop back to small, plain, cool meals for a few days",
      "Sip fluids steadily to stay hydrated",
      "Avoid fatty, fried, and spicy food entirely while it's active",
      "Ask your prescriber whether to slow your titration",
    ],
    redFlags: [
      "Repeated vomiting or inability to keep any fluids down",
      "Severe stomach pain, especially radiating to the back",
      "Signs of dehydration — dizziness, very dark urine, not urinating",
    ],
    related: ["nausea", "fatty-food-pizza", "dehydration-fluids"],
  },
  {
    slug: "muscle-face-loss",
    name: "Am I losing muscle or getting \"Ozempic face\" on a GLP-1?",
    short: "Muscle / face loss",
    aka: ["ozempic face", "losing muscle", "saggy skin", "gaunt face"],
    category: "systemic",
    frequency: "common",
    howCommon: "a real risk with fast weight loss, not a drug side effect per se",
    timeline: { onsetWeek: 8, peakWeek: 24, easesWeek: 52 },
    tldr: "\"Ozempic face\" and muscle loss come from losing weight fast without protecting muscle — and they're largely preventable.",
    why: [
      "Up to 25–40% of the weight lost on a GLP-1 can come from lean muscle rather than fat if you don't actively protect it. Less muscle and less facial fat is what leaves the face looking hollow or gaunt.",
    ],
    howLong:
      "This is about the trajectory of your whole journey, not a passing phase — the habits you keep the whole way determine the outcome.",
    whatHelps: [
      "Eat enough protein (about 1.2–1.6 g per kg of body weight)",
      "Do resistance training 2–3 times a week",
      "Avoid losing faster than about 1% of body weight per week",
      "Track fat vs. muscle, not just the scale",
    ],
    redFlags: [
      "Rapid, unintended weight loss with weakness",
      "Loss of strength that affects daily activities",
    ],
    related: ["hair-loss", "fatigue", "feeling-cold"],
    tools: [{ label: "Fat-vs-Muscle Tracker", href: "/health/glp-1-dose-calculator" }],
  },
];

export const SIDE_EFFECT_SLUGS = SIDE_EFFECTS.map((s) => s.slug);

export function getSideEffect(slug: string): SideEffect | undefined {
  return SIDE_EFFECTS.find((s) => s.slug === slug);
}

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  "very-common": "Very common",
  common: "Common",
  "less-common": "Less common",
};

export type TimingStatus = "not-yet" | "starting" | "peak" | "easing" | "settled" | "ongoing";

/** Where a symptom sits for someone at `week` of treatment. */
export function timingAtWeek(se: SideEffect, week: number): TimingStatus {
  if (!se.timeline) return "ongoing";
  const { onsetWeek, peakWeek, easesWeek } = se.timeline;
  if (week < onsetWeek) return "not-yet";
  if (week < peakWeek) return "starting";
  if (week <= peakWeek + 1) return "peak";
  if (week <= easesWeek) return "easing";
  return "settled";
}

export const TIMING_COPY: Record<TimingStatus, { label: string; tone: "amber" | "red" | "emerald" | "slate" }> = {
  "not-yet": { label: "Usually hasn't started yet", tone: "slate" },
  starting: { label: "Typically starting now", tone: "amber" },
  peak: { label: "Most common right now", tone: "red" },
  easing: { label: "Usually easing by now", tone: "amber" },
  settled: { label: "Usually settled by now", tone: "emerald" },
  ongoing: { label: "Ongoing while on treatment", tone: "slate" },
};
