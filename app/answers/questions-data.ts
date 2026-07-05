/**
 * Question catalog for Calqulate.net's answer hub (/answers) and the standalone
 * high-intent pages (/answers/[slug]). The hub shows the short answer; pages
 * with a `slug` get their own URL with an expanded, human-toned answer and a
 * button straight to the matching Calqulate Vitals service.
 */
export interface RelatedLink {
  label: string;
  href: string;
}

export interface QA {
  q: string;
  /** Short answer shown on the hub. */
  a: string;
  links?: RelatedLink[];
  /** If present, this question gets its own page at /answers/<slug>. */
  slug?: string;
  /** Expanded answer paragraphs for the standalone page (avoids duplicate content). */
  longAnswer?: string[];
  /** Vitals service this question routes to. */
  serviceSlug?: "metabolic-health-tracker" | "heart-age-tracker" | "glp1-progress-tracker";
  serviceLabel?: string;
  /** SEO meta description for the standalone page. */
  metaDescription?: string;
}

export interface Group {
  id: string;
  title: string;
  blurb: string;
  items: QA[];
}

export const GROUPS: Group[] = [
  {
    id: "prediabetes",
    title: "Prediabetes & blood sugar (A1c)",
    blurb: "You got a borderline A1c and your doctor said \"come back in six months.\" Here's what people really want to know.",
    items: [
      {
        slug: "a1c-5-7-what-to-do",
        serviceSlug: "metabolic-health-tracker",
        serviceLabel: "Track my A1c risk with Calqulate Vitals",
        metaDescription:
          "An A1c of 5.7% is the bottom of the prediabetes range — and one of the most reversible numbers in medicine. Here's what it means and exactly what to do next, from Calqulate.net.",
        q: "My A1c is 5.7 — what does that actually mean and what do I do?",
        a: "5.7% is the very bottom of the prediabetes range (5.7–6.4%), not diabetes. It's a warning light, and it's one of the most reversible numbers in medicine if you act now. On Calqulate.net, run the free Diabetes Risk Calculator to see your specific drivers, then track whether your changes work with Calqulate Vitals.",
        longAnswer: [
          "First, breathe. An A1c of 5.7% sits at the very bottom edge of the prediabetes range (5.7–6.4%). It is not diabetes, and it is not a diagnosis you're stuck with — it's a warning light on the dashboard. A1c reflects your average blood sugar over roughly the last three months, so a 5.7 means your average has been creeping up a little, not that something has broken.",
          "Here's the part nobody has time to tell you in a seven-minute appointment: a 5.7 is one of the most reversible numbers in all of medicine, precisely because you caught it this early. The big needle-movers are losing about 5% of your body weight if you're carrying extra, walking for 10–15 minutes after meals (this blunts the post-meal spike that drives A1c up), cutting liquid sugar first, and adding a little resistance training so your muscles soak up glucose.",
          "The trap most people fall into is that A1c moves slowly, so they make changes, check again too soon or not at all, see nothing dramatic, and quit at week three. That's exactly backwards — the changes are usually working, you just can't feel it.",
          "On Calqulate.net you can run the free Diabetes Risk Calculator to see which of your specific factors (weight, waist, activity, family history) are pushing your number up. Then Calqulate Vitals tracks your trajectory over the following months and tells you whether you're genuinely trending down or just seeing normal noise — so you keep going through the boring middle, which is where it actually pays off.",
        ],
        links: [
          { label: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" },
          { label: "eAG (A1c → glucose) Calculator", href: "/health/estimated-average-glucose-calculator" },
        ],
      },
      {
        slug: "is-prediabetes-reversible",
        serviceSlug: "metabolic-health-tracker",
        serviceLabel: "Track my reversal with Calqulate Vitals",
        metaDescription:
          "Yes, prediabetes is reversible for most people — usually within 3–6 months of consistent change. Here's how long it takes and how to prove it's working, from Calqulate.net.",
        q: "Is prediabetes reversible, and how long does it take?",
        a: "Yes — for most people, prediabetes is reversible, and that's the whole point of catching it now. Many bring their A1c back under 5.7% within 3–6 months of consistent change. The hard part is A1c moves slowly, so people quit early. Calqulate Vitals tracks your trajectory so you know it's working before the next blood test.",
        longAnswer: [
          "Yes — for the large majority of people, prediabetes is reversible, and that's the entire reason it's a separate category from diabetes. It's the window where lifestyle change does the heavy lifting and you can get your numbers back into the normal range without medication.",
          "On timing: A1c reflects roughly the last three months of blood sugar, so meaningful change shows up on a 3-month re-test, and many people pull their A1c back under 5.7% within 3–6 months of consistent effort. Weight loss of around 5–7% of body weight, regular movement, and cutting refined carbs and liquid sugar are the proven levers.",
          "The honest obstacle isn't the biology — it's the waiting. Because A1c lags, you can be doing everything right for six weeks and have no feedback that it's working, which is when motivation dies. That feedback gap is the single biggest reason people give up right before the payoff.",
          "That's the exact problem Calqulate Vitals is built to solve. It runs a statistical model over your measurements between blood tests, separates the real signal from day-to-day noise, and tells you whether your trajectory is genuinely heading the right way. Start with the free snapshot on Calqulate.net, then let the tracker carry you through the slow middle.",
        ],
        links: [
          { label: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" },
          { label: "How the trajectory engine works", href: "/how-it-works" },
        ],
      },
      {
        slug: "doctor-said-come-back-in-6-months",
        serviceSlug: "metabolic-health-tracker",
        serviceLabel: "Turn the 6-month wait into a tracked plan",
        metaDescription:
          "Your doctor said 'come back in 6 months' and gave you no plan for your borderline labs. Here's how to use those months to actually reverse it — from Calqulate.net.",
        q: "My doctor said come back in 6 months and gave me no plan. What now?",
        a: "\"Come back in six months\" is a wait-and-see, not a plan — and you don't have to just sit in the danger zone. Get a baseline now, make 2–3 specific changes, and measure whether your numbers move so you return with data, not hope. Calqulate.net gives the free baseline; Calqulate Vitals turns the wait into a prove-it-yourself plan.",
        longAnswer: [
          "This is one of the most common — and most frustrating — situations we see. \"Come back in six months\" isn't bad medicine exactly; for a borderline result, watchful waiting is a legitimate call. But it lands on you as a void: a scary number, no explanation, and no plan. You're left to either spiral or ignore it.",
          "Here's the reframe: those six months are an opportunity, not a sentence. Instead of waiting to find out whether you got worse, you can use the time to actively get better and walk back in with proof. Get a clear baseline now, pick two or three specific, realistic changes (not 'eat healthy' — things like a 15-minute post-dinner walk and cutting soda), and measure whether your numbers actually move.",
          "When you return, you're no longer a passive patient hoping for good news — you're showing your doctor a trend line. That changes the entire conversation, and it's the kind of engaged patient clinicians love.",
          "Calqulate.net gives you the free baseline (your Diabetes Risk and Metabolic Health Score), and Calqulate Vitals turns the six-month wait into a tracked, prove-it-yourself plan — with your single highest-impact change identified and your trajectory monitored the whole way.",
        ],
        links: [
          { label: "Get my free Metabolic Health Score", href: "/product/metabolic-health-tracker" },
          { label: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" },
        ],
      },
      {
        q: "My A1c is 5.8 (or 6.0) — is that worse, and should I panic?",
        a: "No need to panic — 5.8 and 6.0 are still in the prediabetes band (5.7–6.4), just a little further along. What matters more than the decimal is the direction it's heading. A single reading is nearly useless on its own; a tracked trend is everything. Run your inputs on Calqulate.net and watch the trend with Calqulate Vitals.",
        links: [{ label: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" }],
      },
      {
        q: "My parent has type 2 diabetes — am I going to get it too?",
        a: "Family history raises your risk, but it's not a sentence — genes load the gun, lifestyle pulls the trigger. People with a diabetic parent who keep their waist in check, stay active, and catch a rising A1c early often never cross the line. Know your number now with Calqulate.net's free Diabetes Risk Calculator.",
        links: [
          { label: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" },
          { label: "Waist-to-Height Ratio Calculator", href: "/health/waist-to-height-ratio-calculator" },
        ],
      },
    ],
  },
  {
    id: "heart-risk",
    title: "Heart disease risk & ASCVD",
    blurb: "A risk percentage landed in your portal with zero explanation. Let's fix that.",
    items: [
      {
        slug: "what-does-ascvd-risk-mean",
        serviceSlug: "metabolic-health-tracker",
        serviceLabel: "Track my heart risk with Calqulate Vitals",
        metaDescription:
          "Your 10-year ASCVD risk is your estimated chance of a heart attack or stroke in the next decade. Here's what the percentage means and how to lower it — from Calqulate.net.",
        q: "What does a 10-year ASCVD risk of X% actually mean?",
        a: "It's your estimated chance of a heart attack or stroke in the next 10 years, from the same Pooled Cohort Equations cardiologists use. Rough brackets: under 5% low, 5–7.5% borderline, 7.5–20% intermediate, 20%+ high. It's a starting line, not a verdict — blood pressure, cholesterol, smoking and weight all move it. Get your number free on Calqulate.net.",
        longAnswer: [
          "Your 10-year ASCVD risk is an estimate of your chance of having a major cardiovascular event — a heart attack or stroke — within the next 10 years. It comes from the Pooled Cohort Equations, the same validated model cardiologists use, which weighs your age, sex, blood pressure, cholesterol, smoking status, and diabetes.",
          "The rough brackets: under 5% is low, 5–7.5% is borderline, 7.5–20% is intermediate, and 20% or higher is high. So a result of 10% means roughly a 1-in-10 chance over a decade. That's meaningful enough to act on, but it is very much movable — it's not a fixed fate.",
          "The most important thing to understand is that the number you got is a snapshot of your current trajectory, not a sentence. Two people the same age can have wildly different risk depending on blood pressure and smoking, and those are exactly the things you can change. Quitting smoking, getting systolic blood pressure toward 120, and lowering LDL cholesterol can each take real percentage points off.",
          "Calqulate.net's free ASCVD Risk Calculator gives you the number, and Calqulate Vitals goes further — it simulates each possible change against your own inputs and tells you which single one lowers your risk the most, then tracks the number falling over time.",
        ],
        links: [
          { label: "ASCVD Risk Calculator", href: "/health/ascvd-risk-calculator" },
          { label: "Framingham Risk Calculator", href: "/health/framingham-risk-score-calculator" },
        ],
      },
      {
        slug: "how-to-lower-heart-disease-risk",
        serviceSlug: "metabolic-health-tracker",
        serviceLabel: "Find my highest-impact change",
        metaDescription:
          "Don't try to fix everything at once. Here's how to find the single change that lowers YOUR heart disease risk the most — quantified in your own numbers, from Calqulate.net.",
        q: "How do I actually lower my heart disease risk — where do I even start?",
        a: "Start with the lever that moves YOUR number most, not a generic list. For a smoker, quitting is almost always #1. For others it's blood pressure, then LDL, then weight and activity. The mistake is trying to fix everything at once. Calqulate Vitals simulates each change against your own risk equations and ranks them, so you get 'lower BP 10 points → about −2% risk,' not 'eat healthy.'",
        longAnswer: [
          "The reason 'how do I lower my heart risk' feels overwhelming is that every article gives you the same generic list of ten things, and trying to do all ten at once is how people burn out by week two. The smarter approach is to find the one lever that moves your specific number the most, do that, then move to the next.",
          "For a smoker, quitting is almost always #1 — it can cut 10-year risk dramatically, more than any pill. For a non-smoker, it's usually blood pressure (getting systolic toward 120), then LDL cholesterol, then central weight and physical activity. But the order depends entirely on your inputs, which is why a personalized ranking beats a generic checklist.",
          "This is exactly what Calqulate Vitals does differently. Instead of advice, it runs a counterfactual: it changes one factor at a time toward a realistic target, re-runs the validated risk equations on your own numbers, and measures how far each change actually moves your risk. The output is concrete — 'lower your systolic BP by 10 points → about −2% 10-year risk' — ranked by impact per unit of effort.",
          "Start with your free number on Calqulate.net's ASCVD Risk Calculator, then let Calqulate Vitals tell you which single change to make first and track it falling.",
        ],
        links: [
          { label: "ASCVD Risk Calculator", href: "/health/ascvd-risk-calculator" },
          { label: "Blood Pressure Calculator", href: "/health/blood-pressure-calculator" },
        ],
      },
      {
        q: "Is my heart attack risk high? How do I know if I should worry?",
        a: "Don't eyeball it from one lab — get the actual 10-year risk number, because that's what doctors act on. If your 10-year risk is 7.5% or higher, that's the threshold where guidelines start discussing statins and aggressive lifestyle change. Run the free ASCVD Risk Calculator on Calqulate.net to get a real number instead of guessing at 2am.",
        links: [{ label: "ASCVD Risk Calculator", href: "/health/ascvd-risk-calculator" }],
      },
      {
        q: "My calcium score / cardiac result came back high and I'm scared. What should I do?",
        a: "That fear is understandable — a high score is a real signal, but it's not a heart attack in progress, and people live long lives after one. The productive step is to get your modifiable risk factors (BP, LDL, smoking, weight) measured and managed, and bring specifics to your doctor. Calqulate.net helps turn the panic into a tracked plan.",
        links: [
          { label: "ASCVD Risk Calculator", href: "/health/ascvd-risk-calculator" },
          { label: "Cholesterol Ratio Calculator", href: "/health/cholesterol-ratio-calculator" },
        ],
      },
    ],
  },
  {
    id: "cholesterol",
    title: "Cholesterol",
    blurb: "\"It's high, but the doctor wasn't worried.\" The most confusing sentence in medicine.",
    items: [
      {
        slug: "high-cholesterol-doctor-not-worried",
        serviceSlug: "metabolic-health-tracker",
        serviceLabel: "See my whole heart-risk picture",
        metaDescription:
          "If your cholesterol is high but your doctor isn't worried, it's because they treat your overall heart risk, not one number. Here's what that means — from Calqulate.net.",
        q: "My cholesterol is high but my doctor isn't worried — why?",
        a: "Because doctors treat overall heart risk, not cholesterol in isolation. High total cholesterol with high protective HDL and an otherwise low 10-year risk is very different from the same number in a smoker with high blood pressure. \"Not worried\" usually means your full risk picture looks okay. See your whole picture free on Calqulate.net.",
        longAnswer: [
          "This is genuinely one of the most confusing sentences a patient can hear, and it leaves people lying awake convinced their doctor missed something. The explanation is actually reassuring: doctors don't treat a cholesterol number in isolation — they treat your overall cardiovascular risk, and cholesterol is just one input into that.",
          "Total cholesterol on its own is a weak signal. A high total driven by high HDL (the protective kind) in someone with normal blood pressure, no smoking, and a low 10-year risk score is a completely different situation than the exact same total in a smoker with hypertension. The first person genuinely may not need to do anything; the second does.",
          "What actually matters is the full picture: your LDL and non-HDL cholesterol, your total-to-HDL ratio, your blood pressure, and your overall 10-year ASCVD risk. When your doctor says 'not worried,' they've almost certainly done that math in their head — they just didn't show their work.",
          "You can see that same math for yourself. Run the free Cholesterol Ratio and ASCVD calculators on Calqulate.net to view your whole risk picture in one place, and use Calqulate Vitals to track it if you decide to bring the numbers down.",
        ],
        links: [
          { label: "Cholesterol Ratio Calculator", href: "/health/cholesterol-ratio-calculator" },
          { label: "ASCVD Risk Calculator", href: "/health/ascvd-risk-calculator" },
        ],
      },
      {
        q: "What cholesterol ratio is healthy, and which number matters most?",
        a: "For most people the total-to-HDL ratio is more telling than total cholesterol — under ~3.5 is great, under 5 generally fine. LDL and non-HDL are what cardiologists watch closest for plaque. Don't fixate on one value; the ratio plus your other risk factors is what counts. Calqulate.net's free Cholesterol Ratio Calculator breaks it down.",
        links: [{ label: "Cholesterol Ratio Calculator", href: "/health/cholesterol-ratio-calculator" }],
      },
      {
        q: "Should I take a statin or not?",
        a: "That's a shared decision with your doctor, and the deciding factor is usually your 10-year ASCVD risk, not cholesterol alone. Guidelines generally raise the statin conversation around 7.5%+ risk, with lifestyle change at every level. Knowing your number — and whether changes move it — makes that talk far less of a shot in the dark. Get the number free on Calqulate.net.",
        links: [
          { label: "ASCVD Risk Calculator", href: "/health/ascvd-risk-calculator" },
          { label: "How Calqulate Vitals works", href: "/how-it-works" },
        ],
      },
    ],
  },
  {
    id: "heart-age",
    title: "Heart age",
    blurb: "\"My heart is 12 years older than I am\" — what that means and how to make it younger.",
    items: [
      {
        slug: "what-is-heart-age",
        serviceSlug: "heart-age-tracker",
        serviceLabel: "Track my heart age with Calqulate Vitals",
        metaDescription:
          "Heart age translates your cardiovascular risk into a single age. If yours is older than your real age, here's why — and how to make it younger, from Calqulate.net.",
        q: "What is heart age and why is mine older than my real age?",
        a: "Heart age translates your cardiovascular risk into a single number: the age of a person with all-ideal risk factors who'd have the same risk as you. A heart age 12 years above your real age means your risk looks like someone a decade-plus older — usually driven by blood pressure, cholesterol, smoking, or weight. It runs in reverse too. Calculate yours free on Calqulate.net.",
        longAnswer: [
          "Heart age is one of the cleverest ideas in preventive cardiology, because it takes an abstract risk percentage and turns it into a number that actually lands emotionally. It's defined as the age of a person with all-ideal risk factors who would have the same cardiovascular risk as you do right now.",
          "So if you're 45 but your heart age comes back as 57, it means your current risk profile looks like that of a typical healthy 57-year-old. That gap is almost always driven by modifiable things — elevated blood pressure, high LDL cholesterol, smoking, or excess central weight — not by anything permanent.",
          "The reason it's such a useful number is the same reason it can sting: it's concrete and it's personal. But the best part is that it runs in reverse. Because it's built from modifiable risk factors, improving them pulls your heart age back down — and watching that number fall month over month is far more motivating than watching a scale.",
          "Calqulate.net's free Heart Age Calculator gives you the number, and the Heart Age Tracker (part of Calqulate Vitals) shows it dropping as your blood pressure, cholesterol, and habits improve.",
        ],
        links: [
          { label: "Heart Age Calculator", href: "/health/heart-age-calculator" },
          { label: "Heart Age Tracker", href: "/product/heart-age-tracker" },
        ],
      },
      {
        slug: "how-to-lower-heart-age",
        serviceSlug: "heart-age-tracker",
        serviceLabel: "Watch my heart age drop",
        metaDescription:
          "Heart age is sensitive — drop your blood pressure and quit smoking and you can knock years off fast. Here's how to lower your heart age, from Calqulate.net.",
        q: "How do I lower my heart age?",
        a: "Same levers as heart-attack risk, because it's the same math: get blood pressure toward 120, raise HDL and lower LDL, quit smoking, trim central weight. Heart age is sensitive — quit smoking and drop your systolic BP and you can knock years off fast. Watching it fall beats the scale. Calqulate.net's Heart Age Tracker is built for exactly that.",
        longAnswer: [
          "Lowering your heart age uses the same levers as lowering your heart-attack risk, because under the hood it's the same calculation — heart age is just a friendlier way of expressing your cardiovascular risk.",
          "The highest-impact moves: get your systolic blood pressure toward 120, lower your LDL cholesterol (and raise protective HDL through aerobic exercise), quit smoking if you smoke, and trim central/abdominal weight. Quitting smoking and dropping blood pressure tend to move heart age the fastest.",
          "What makes heart age satisfying to work on is that it's sensitive and responsive. Unlike a slow-moving lab, improvements in your inputs show up as years coming off your heart age, which is a genuinely motivating feedback loop — you can watch yourself getting 'younger.'",
          "Use Calqulate.net's free Heart Age Calculator to see where you stand, then the Heart Age Tracker in Calqulate Vitals to watch the number fall as you make changes and to see which single change moves it most for you.",
        ],
        links: [
          { label: "Heart Age Tracker", href: "/product/heart-age-tracker" },
          { label: "Blood Pressure Calculator", href: "/health/blood-pressure-calculator" },
        ],
      },
    ],
  },
  {
    id: "glp1",
    title: "GLP-1 (Ozempic, Wegovy, Zepbound)",
    blurb: "The questions people whisper in the GLP-1 forums: muscle, rebound, and what happens after.",
    items: [
      {
        slug: "best-glp-1-for-weight-loss",
        serviceSlug: "glp1-progress-tracker",
        serviceLabel: "Track any GLP-1 with Calqulate Vitals",
        metaDescription:
          "The best GLP-1 for weight loss compared — tirzepatide vs semaglutide, GLP-1 shots vs pills, and the cheapest GLP-1 options. Plus how to keep the weight off, from Calqulate.net.",
        q: "What is the best GLP-1 for weight loss?",
        a: "There's no single best GLP-1 for everyone. Tirzepatide (Mounjaro, Zepbound) usually drives the most weight loss, semaglutide (Ozempic, Wegovy) is the proven standard, and Rybelsus is the oral GLP-1 pill. The best GLP-1 drug for weight loss is the one you can access, afford, and stay on — while protecting your muscle. Calqulate.net tracks whether your GLP-1 is buying real fat loss, not just a lower number.",
        longAnswer: [
          "First, the basics. GLP-1 stands for glucagon-like peptide-1, a natural gut hormone that tells your brain you're full and slows how fast your stomach empties. The GLP-1 medications for weight loss are lab-made versions of that hormone that stay active far longer than the one your body produces — which is why these GLP-1 drugs curb appetite so powerfully.",
          "The main GLP-1s come as weekly or daily injections (\"GLP-1 shots\") and, in one case, a daily pill. Semaglutide is sold as Ozempic and Wegovy (shots) and Rybelsus (the oral GLP-1 pill). Tirzepatide — technically a dual GLP-1/GIP peptide — is sold as Mounjaro and Zepbound. Liraglutide (Saxenda, Victoza) is an older daily shot. All are prescription GLP-1 peptides, not over-the-counter supplements.",
          "So which is the best GLP-1 for weight loss? In head-to-head and trial data, tirzepatide tends to produce the largest average weight loss, with semaglutide close behind and very well established. But \"best\" is personal: the right GLP-1 drug for weight loss is the one your insurance or budget allows, that your body tolerates, and that you can actually stay on long enough to matter. The cheapest GLP-1 is often whichever your plan covers, or the daily pill in some markets — and prices shift constantly, so compare with your pharmacist.",
          "A quick warning on shortcuts: \"GLP-1 hormone supplements\" and unbranded compounded GLP-1 peptides sold online are not the same as prescription medication. The supplements don't replicate the drug, and unregulated peptides carry real dosing and safety risks. If you're using a GLP-1 for weight loss, do it with a prescriber.",
          "Here's the part the drug comparison misses entirely: whichever GLP-1 you pick, up to 40% of the weight you lose can be muscle, not fat. That's what leaves people \"skinny-fat\" and sets up regain later. The GLP-1 that works best long-term is the one you pair with enough protein, resistance training, and tracking of fat vs. muscle. Calqulate.net's GLP-1 Progress Tracker works with any of these medications — log your shots or pills, watch your metabolism score and heart age improve, and confirm you're burning fat, not lean mass.",
        ],
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker" },
          { label: "GLP-1 Dose Calculator", href: "/health/glp-1-dose-calculator" },
        ],
      },
      {
        slug: "losing-muscle-on-ozempic",
        serviceSlug: "glp1-progress-tracker",
        serviceLabel: "Track muscle vs fat with Calqulate Vitals",
        metaDescription:
          "Losing weight fast on Ozempic or Wegovy can cost you muscle, not just fat. Here's how to tell if it's happening and how to stop it — from Calqulate.net.",
        q: "Am I losing muscle on Ozempic / Wegovy, and how do I tell?",
        a: "It's a real risk — fast weight loss can pull from lean muscle, not just fat, especially if protein and lifting are low. The warning sign is the scale dropping while you feel weaker or 'skinny-fat.' Fix: more protein (~1.6 g/kg of goal weight), 2–3 resistance sessions a week, and tracking body composition, not just weight. Calqulate.net lets you watch muscle vs fat.",
        longAnswer: [
          "This is the quiet fear in every GLP-1 forum, and it's a legitimate one. When you lose weight quickly — which is exactly what these drugs are good at — a meaningful share of that loss can come from lean muscle rather than fat, especially if your protein intake has cratered (appetite suppression makes this easy) and you're not doing any resistance training.",
          "The classic warning signs: the scale is dropping nicely, but you feel weaker, flatter, more tired, or you've gone 'skinny-fat' — smaller but softer. If the number on the scale is the only thing improving while your strength and shape are going the wrong way, muscle loss is the likely culprit.",
          "The fix is straightforward but non-negotiable: hit a protein target (around 1.6 g/kg of your goal body weight is a common, evidence-based aim), lift weights two to three times a week so your body has a reason to hold onto muscle, and don't lose faster than roughly 1% of body weight per week. The drug creates the calorie deficit; your job is to aim that deficit at fat.",
          "Crucially, you have to measure body composition, not just weight, to know it's working. Calqulate.net's free Body Fat and Lean Body Mass calculators let you watch muscle versus fat, and the GLP-1 Progress Tracker in Calqulate Vitals flags when you're losing weight too fast for it to be all fat.",
        ],
        links: [
          { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
          { label: "Body Fat Calculator", href: "/health/body-fat-calculator" },
        ],
      },
      {
        slug: "protect-muscle-on-glp1",
        serviceSlug: "glp1-progress-tracker",
        serviceLabel: "Protect my muscle with Calqulate Vitals",
        metaDescription:
          "Protein, resistance training, and a controlled rate of loss keep muscle on while you lose fat on a GLP-1. Here's the exact playbook — from Calqulate.net.",
        q: "How do I keep / protect muscle while losing weight on a GLP-1?",
        a: "Three things in order: eat enough protein (don't let appetite suppression crater intake), lift 2–3x a week so your body keeps muscle, and don't lose faster than ~1% of body weight per week. The drug handles the deficit; your job is to aim it at fat. Track lean body mass over time — that's what the GLP-1 Progress Tracker on Calqulate.net is for.",
        longAnswer: [
          "Protecting muscle on a GLP-1 comes down to three things, in priority order, and the good news is they're all within your control.",
          "First, protein. Appetite suppression is the whole point of these drugs, which makes it dangerously easy to under-eat protein specifically. Aim for roughly 1.6 g per kg of your goal body weight, and treat it as the one macro you don't skip, even on low-appetite days.",
          "Second, resistance training two to three times a week. This is the signal that tells your body to hold onto muscle while it's in a deficit. It doesn't need to be elaborate — basic compound lifts or even bands at home work. Without it, the body happily sheds muscle along with fat.",
          "Third, don't lose too fast. Aim for around 1% of body weight per week or less; faster loss tilts the ratio toward muscle. The drug creates the deficit automatically, so your job is purely to aim that deficit at fat with protein and lifting — and then to verify it's working by tracking lean body mass, not just the scale. That's exactly what the GLP-1 Progress Tracker on Calqulate.net is built to do.",
        ],
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker" },
          { label: "Macro Calculator", href: "/health/macro-calculator" },
        ],
      },
      {
        slug: "gain-weight-back-after-ozempic",
        serviceSlug: "glp1-progress-tracker",
        serviceLabel: "Protect my results with Calqulate Vitals",
        metaDescription:
          "Many people regain weight after stopping Ozempic or Wegovy — but the ones who protected their muscle keep the most off. Here's how to de-risk the off-ramp, from Calqulate.net.",
        q: "Will I gain the weight back after stopping Ozempic / Wegovy?",
        a: "It's the #1 fear in every GLP-1 forum, and honestly: a lot of people do regain — but the ones who keep the most off protected their muscle on the way down and built real habits while on the drug. Muscle keeps your metabolism higher, so going in lean-mass-aware is your best insurance. Calqulate.net's GLP-1 Progress Tracker is designed for the off-ramp.",
        longAnswer: [
          "Let's be honest, because the forums already are: yes, a lot of people regain weight after stopping a GLP-1. Appetite returns, and if nothing underneath changed, the old patterns come back with it. Pretending otherwise doesn't help anyone.",
          "But the regain isn't uniform, and the difference between the people who keep most of it off and the people who bounce all the way back is largely predictable. The keepers did two things while on the drug: they protected their muscle on the way down, and they used the appetite-suppressed window to build habits (protein, lifting, movement) that outlast the prescription.",
          "Muscle is the key piece. It's metabolically active, so holding onto it keeps your daily calorie burn higher, which makes maintenance after stopping far more forgiving. Someone who lost 30 pounds of mostly fat with their muscle intact has a very different post-drug metabolism than someone who lost 30 pounds with a big chunk of muscle in there.",
          "So the smartest move is to go into the off-ramp lean-mass-aware and tracking the markers that matter — body composition and your heart and diabetes risk — not just the scale. Calqulate.net's GLP-1 Progress Tracker is designed specifically for this: protect the muscle, watch the risk numbers, and don't let months of effort quietly reverse.",
        ],
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker" },
          { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
        ],
      },
      {
        q: "Is my GLP-1 actually improving my health, or just dropping pounds?",
        a: "Weight is only the surface metric. The wins that matter are falling blood sugar, blood pressure, and 10-year heart and diabetes risk — and those don't always track the scale one-to-one. Calqulate.net lets you see the risk numbers, not just the weight, so you know the drug is buying real health.",
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker" },
          { label: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" },
        ],
      },
    ],
  },
  {
    id: "tracking",
    title: "Metabolic health score & tracking progress",
    blurb: "For everyone who's sick of the scale lying to them.",
    items: [
      {
        slug: "boost-sluggish-metabolism",
        serviceSlug: "metabolic-health-tracker",
        serviceLabel: "Track my metabolism with Calqulate Vitals",
        metaDescription:
          "How to fix a sluggish metabolism naturally: the metabolism boosting foods, a simple metabolic diet, and whether metabolism boosting supplements are worth it. From Calqulate.net.",
        q: "How do I fix a sluggish metabolism, and which foods actually help?",
        a: "A sluggish metabolism is usually the result of low muscle mass, poor sleep, stress, and sitting too much, not one single cause. The reliable fixes are protecting muscle, eating enough protein, and moving after meals. The best metabolism boosting foods are high in protein and fiber. Most metabolism boosting supplements do very little on their own. Track your Metabolic Health Score on Calqulate.net to see what is actually working.",
        longAnswer: [
          "First, a reality check on what a sluggish metabolism really is. Your metabolism is mostly your resting energy burn, and the single biggest thing that sets it is how much muscle you carry. When people say they have a slow metabolism, the cause is usually some mix of low muscle mass, poor sleep, chronic stress, crash dieting, and long hours of sitting. It is rarely one dramatic problem, and it is rarely a broken thyroid, though that is worth ruling out with your doctor.",
          "That means the fixes are boring but powerful. Keep or build muscle with resistance training two or three times a week, since muscle is metabolically expensive tissue that raises your burn all day. Eat enough protein so your body has a reason to hold that muscle. Walk for ten to fifteen minutes after meals to blunt blood sugar spikes. Sleep seven to nine hours, because short sleep alone measurably lowers energy expenditure and drives hunger.",
          "Now the food question. The best metabolism boosting foods are simply high-protein and high-fiber whole foods, because protein has the highest thermic effect, meaning your body burns more energy just digesting it. Think eggs, chicken, fish, lean beef, Greek yogurt, cottage cheese, lentils, beans, tofu, and plenty of vegetables. Coffee and green tea give a small, temporary bump from caffeine. There is no single food that increases your metabolism dramatically, but building your metabolic meals around protein and fiber is the closest thing to a lever that works every day.",
          "A sensible metabolic diet is not a branded plan or a cleanse. It is a repeatable pattern: a protein source at every meal, fiber from vegetables and legumes, most of your carbs from whole sources, and a modest calorie level you can actually sustain. The mistake most people make is eating too little for too long, which tells the body to conserve energy and makes the sluggish feeling worse. Consistency at a reasonable intake beats aggressive restriction that you quit in three weeks.",
          "What about metabolism boosting supplements? Be skeptical. The evidence for most fat-burner and metabolism pills is weak, and any effect is tiny next to protein, muscle, sleep, and daily movement. Caffeine and protein powder are the only two that reliably earn their place, and protein powder counts more as food than as a supplement. Spend your money and attention on the basics first.",
          "The real problem is that metabolism changes are invisible day to day, so people try a few metabolic meals, feel nothing, and give up. That is where tracking matters. Calqulate.net turns your numbers into one Metabolic Health Score and trends it over time, so you can see whether your food, training, and sleep changes are genuinely lifting your metabolism or not. You stop guessing and start following the line.",
        ],
        links: [
          { label: "Get my Metabolic Health Score", href: "/product/metabolic-health-tracker" },
          { label: "TDEE Calculator", href: "/health/tdee-calculator" },
          { label: "Macro Calculator", href: "/health/macro-calculator" },
        ],
      },
      {
        slug: "scale-not-moving-am-i-making-progress",
        serviceSlug: "metabolic-health-tracker",
        serviceLabel: "See my real progress with Calqulate Vitals",
        metaDescription:
          "If the scale isn't moving but you're doing everything right, you're probably making progress the scale can't show. Here's how to see it — from Calqulate.net.",
        q: "The scale isn't moving but I'm doing everything right — am I actually making progress?",
        a: "Probably yes — the scale is a noisy, incomplete narrator. Daily swings on water, food, and hormones can hide real fat loss or muscle gain for weeks. Calqulate Vitals runs a statistical model over your measurements to separate the real signal from the noise and tell you whether you're genuinely trending the right way — so you don't quit during a normal plateau.",
        longAnswer: [
          "Almost certainly yes, and the scale is just a terrible narrator of your progress. Body weight swings day to day on water retention, food in transit, sodium, hormones, and glycogen — and those swings can be several pounds, easily large enough to completely hide real fat loss or muscle gain for two or three weeks at a time.",
          "This is the exact moment most people quit. They've been disciplined for a month, the scale hasn't budged or even ticked up, and they conclude it isn't working — when in reality the fat is coming off and the scale is just lying through noise. It's one of the cruelest false signals in all of weight management.",
          "The fix is to stop trusting any single measurement and start trusting the trend, statistically separated from the noise. That's the core of what Calqulate Vitals does: it fits a model to your personal history, estimates the true underlying direction, and tells you whether a change is real signal or just normal variation — with a confidence level, not a guess.",
          "Honestly, this one capability stops more people from giving up than anything else we've built. Get your free snapshot on Calqulate.net and let the trajectory engine tell you the truth the scale can't.",
        ],
        links: [
          { label: "How the trajectory engine works", href: "/how-it-works" },
          { label: "Weight Loss % Calculator", href: "/health/weight-loss-percentage-calculator" },
        ],
      },
      {
        q: "What is a metabolic health score and what's a good one?",
        a: "It's a single 0–100 number rolling up the stuff that predicts disease — heart risk, heart age, diabetes risk, and body composition — where higher is healthier. Calqulate.net grades it A–F (80+ = solid, under 60 = work to do). The value is watching it climb as you change. Get yours free on Calqulate.net.",
        links: [
          { label: "Get my Metabolic Health Score", href: "/product/metabolic-health-tracker" },
          { label: "How it's calculated", href: "/how-it-works" },
        ],
      },
      {
        q: "Is Calqulate.net free? What do I pay for?",
        a: "The calculators and your first metabolic snapshot are genuinely free — run any engine once, no account, nothing saved. You only pay for Calqulate Vitals if you want saved history, the trajectory engine, your next-lever protocol, GLP-1 muscle tracking, and doctor PDFs. One simple plan, cancel anytime — no dark patterns.",
        links: [
          { label: "How it works & pricing", href: "/how-it-works" },
          { label: "Browse all free calculators", href: "/search" },
        ],
      },
    ],
  },
];

/** Flattened list of questions that have their own standalone page. */
export const STANDALONE_QUESTIONS = GROUPS.flatMap((g) =>
  g.items.filter((it) => it.slug).map((it) => ({ ...it, groupTitle: g.title, groupId: g.id })),
);

export function getStandaloneQuestion(slug: string) {
  return STANDALONE_QUESTIONS.find((q) => q.slug === slug);
}
