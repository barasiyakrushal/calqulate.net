/**
 * Question catalog for Calqulate.net's answer hub (/answers) and the standalone
 * high-intent pages (/answers/[slug]). The hub shows the short answer; pages
 * with a `slug` get their own URL with an expanded, human-toned answer and a
 * button straight to the matching Calqulate Vitals service.
 */
export interface RelatedLink {
  label: string;
  href: string;
  /** Render as a premium gold button — used for internal links to paid product pages. */
  gold?: boolean;
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
  /**
   * Show the "Is a GLP-1 right for me?" eligibility branch on the standalone
   * page. Set on diagnosis-shaped questions (prediabetes / A1c / diabetes) so a
   * reader who just learned their number has a next step toward the GLP-1 path.
   * `conditionLabel` prefills the weight-related condition in that self-check.
   */
  glp1Branch?: { conditionLabel: string };
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
        glp1Branch: { conditionLabel: "prediabetes" },
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
        glp1Branch: { conditionLabel: "prediabetes" },
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
        slug: "glp-1-prescription-no-instructions",
        serviceSlug: "glp1-progress-tracker",
        serviceLabel: "Turn month one into an adaptive plan",
        metaDescription:
          "You got a GLP-1 prescription and no instructions. Here's exactly what to do in your first 30 days — dosing, side effects, protein, and what to expect — from Calqulate.net.",
        q: "I have a GLP-1 prescription and no instructions — what do I actually do?",
        a: "Start slow and get organised. Confirm your starting dose (nearly everyone begins at the lowest for 4 weeks), store it in the fridge, pick a consistent weekly injection day, and stock protein and water. Then work through Calqulate's free interactive First 30 Days checklist, which walks you week by week and saves your progress.",
        longAnswer: [
          "This is one of the most common — and most stressful — moments in the whole journey: the prescription is filled, the pen or vial is in your hand, and the guidance you got was essentially 'start it.' That void is exactly where people make the month-one mistakes that derail them.",
          "Here's the short version. First, confirm your exact starting dose against the pen or vial — almost everyone begins at the lowest dose for the first four weeks, and that's about building tolerance, not going slow for its own sake. Store unused medication in the fridge. Pick one weekly day you'll remember and set a recurring reminder. Capture a day-zero baseline (weight, waist, a photo) because month one on the scale is noisy. And stock up on easy protein and water, because your appetite is about to drop fast.",
          "Then it's mostly about three things for 30 days: go slow on the dose, protect your muscle with protein and a little resistance training, and stay ahead of your gut with water, fiber, and short walks. Expect mild nausea or constipation that fades, and expect at least one flat week — that's normal, not failure.",
          "Rather than hold all of that in your head, use Calqulate.net's free First 30 Days on a GLP-1 checklist. It lays out every step week by week, links to the free tools that do the math (injection day, dose, unit conversion), and saves your progress in your browser. When month one is done, Calqulate Vitals turns it into an adaptive plan for the titration ahead.",
        ],
        links: [
          { label: "Open the First 30 Days checklist", href: "/health/first-30-days-on-glp-1" },
          { label: "Plan my injection day", href: "/health/glp-1-injection-day-calculator" },
        ],
      },
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
          { label: "Tirzepatide vs Semaglutide", href: "/compare/tirzepatide-vs-semaglutide" },
          { label: "Ozempic vs Wegovy", href: "/compare/ozempic-vs-wegovy" },
          { label: "How much will I lose? (calculator)", href: "/health/glp-1-weight-loss-projection-calculator" },
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker" },
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
          { label: "Regain Risk Calculator & Tapering Planner", href: "/health/glp-1-stopping" },
          { label: "GLP-1 Maintenance & Keeping It Off", href: "/health/glp-1-maintenance" },
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker" },
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
          { label: "GLP-1 Plateau Analyzer", href: "/health/glp-1-plateau-analyzer" },
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
  {
    id: "glp1-tracker-apps",
    title: "GLP-1 tracker & app questions",
    blurb: "Whether a general app is enough, what to actually track, and whether your data is safe.",
    items: [
      {
        q: "Do I actually need a dedicated GLP-1 tracker, or can I just use Apple Health or MyFitnessPal?",
        a: "You can get by with a general app for a while, but it will not tell you the things that actually matter on a GLP-1. MyFitnessPal counts calories. Apple Health logs steps and weight. Neither one knows you moved from 0.25 mg to 0.5 mg last Tuesday, so neither can tell you whether this week's nausea is dose-related or just a bad week. And neither separates a 2 lb drop in fat from a 2 lb drop in muscle, which is the number that actually predicts whether you keep the weight off. A generic tracker tells you the scale moved. A GLP-1 tracker tells you why, and what it cost you. That gap is exactly what the GLP-1 Progress Tracker on Calqulate.net is built to close.",
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker", gold: true },
        ],
      },
      {
        q: "What's the best app to track my shots, weight, and side effects together?",
        a: "Honestly, most \"GLP-1 apps\" are just a weight log with a reminder bell bolted on. The useful ones let you see your dose, your weight, and your side effects on the same timeline, so you can actually connect the dots (like noticing the fatigue always hits two days after the shot, or the constipation started right when you bumped doses). Calqulate.net's GLP-1 Progress Tracker does that, and it goes one step further most trackers skip: it separates fat loss from muscle loss, since losing muscle is the thing that quietly wrecks people's metabolism after they stop the drug.",
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker", gold: true },
        ],
      },
      {
        q: "How do I track injection site rotation so I stop reusing the same spot?",
        a: "The simple version: pick four zones (left abdomen, right abdomen, left thigh, right thigh, or add the back of the arm if a caregiver is injecting you), and move to the next zone every single shot, not just when a spot feels sore. Reusing the same spot for weeks is what causes the lumpy, thickened tissue (lipohypertrophy) that makes the drug absorb unevenly, so your dose stops working as consistently. A basic paper rotation chart works fine. If you want it logged alongside your dose and weight instead of on a sticky note, that is one of the fields inside the GLP-1 Progress Tracker on Calqulate.net.",
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker", gold: true },
        ],
      },
      {
        q: "Is my data safe in a GLP-1 tracker app? Do these apps sell my health data?",
        a: "This is a fair thing to ask before you hand any app your weight, your dose, and your medical history. Some free health apps make their money by selling aggregated user data to advertisers or data brokers, which is worth knowing before you type in anything personal. Calqulate.net's answer is simple: we never sell your data. Full stop. If you want to check any app's policy before you use it, look for a real privacy policy (not just a line in the terms of service) and search for whether the company has ever been named in a data-selling story.",
        links: [
          { label: "Calqulate.net Privacy Policy", href: "/privacy-policy" },
        ],
      },
    ],
  },
  {
    id: "glp1-missed-dose",
    title: "Missed dose & dosing schedule",
    blurb: "The rules are different for each drug. Here's what to do when you miss one or want to switch days.",
    items: [
      {
        q: "I missed my Ozempic, Wegovy, or Mounjaro shot. What do I do now?",
        a: "The rule is different for each drug, so check which one you are on before you do anything.\n\nFor Ozempic: take it as soon as you remember, as long as it has been 5 days or less since your missed dose. Past 5 days, skip it and take your next dose on your regular scheduled day. Never take two doses within 48 hours of each other.\n\nFor Wegovy: if your next scheduled dose is more than 2 days away, take the missed one now. If it is less than 2 days away, skip it and just take your next dose as scheduled.\n\nFor Mounjaro or Zepbound: you have a 4-day (96-hour) window to take the missed dose. Past that, skip it and resume your normal schedule. Either way, doses need to stay at least 3 days apart, since tirzepatide has a long half-life and stacking doses too close together mostly just adds nausea, not extra results.\n\nIf you have missed more than 2 weeks of doses on any of these, call your prescriber before restarting. Going back in at your old dose after a long gap can hit harder than you expect. Once you are back on schedule, Calqulate.net's GLP-1 Dose Calculator can help you sanity-check your titration timeline.",
        links: [
          { label: "GLP-1 Dose Calculator", href: "/health/glp-1-dose-calculator" },
        ],
      },
      {
        q: "Can I change the day of the week I take my shot?",
        a: "Yes, as long as you respect the minimum spacing for your drug. Ozempic and Wegovy need at least 2 days between doses. Mounjaro and Zepbound need at least 3 days. So if you are on a weekly shot and want to move it from Sunday to Wednesday, just make sure you are not accidentally taking two doses closer together than that minimum. Once you land on a new day, stick with it going forward so your levels stay steady week to week.",
        links: [
          { label: "GLP-1 Dose Calculator", href: "/health/glp-1-dose-calculator" },
        ],
      },
      {
        q: "What happens if I take two doses too close together?",
        a: "Mostly, you feel it in your stomach. Doubling up early raises your drug levels faster than your body has adjusted to, and the most common result is a rough day (or few days) of nausea, vomiting, or diarrhea, not a dangerous overdose in most healthy adults. That said, it is not something to shrug off. If you accidentally took two doses close together, watch for severe vomiting, signs of dehydration, or intense abdominal pain, and call your prescriber or a poison control line if any of that shows up. Going forward, tracking your last shot date somewhere you will actually see it (not just memory) is the easiest way to stop this from happening again.",
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker", gold: true },
        ],
      },
    ],
  },
  {
    id: "glp1-plateau",
    title: "Weight-loss plateau questions",
    blurb: "Why a stall after a dose bump is usually normal, and the numbers to check yourself against.",
    items: [
      {
        q: "Why did my weight loss stop as soon as I stepped up to the next dose?",
        a: "This is a real, well-documented pattern, sometimes called the \"0.5 mg plateau\" on Wegovy forums, and it is not in your head. Here is what is actually happening: the starting doses (0.25 mg and 0.5 mg on Wegovy, similar low starting doses on Mounjaro and Zepbound) exist mainly to let your body adjust and to limit nausea, not to drive maximum fat loss. The real appetite suppression and slower digestion kick in more fully at the higher maintenance doses, generally 1.7 mg and 2.4 mg for Wegovy. So a stall right after a dose increase is often your body settling into a new normal before the higher dose's full effect shows up, not a sign the drug has stopped working. Give it 3 to 4 weeks at the new dose before you decide it has stalled for real. If it is genuinely flat past that point, that is worth a conversation with your prescriber, not something to just wait out forever.",
        links: [
          { label: "Weight Loss % Calculator", href: "/health/weight-loss-percentage-calculator" },
        ],
      },
      {
        q: "How much weight should I have lost by month 2, 3, or 6?",
        a: "These numbers are averages, so do not panic if you are a bit under them, but they are a useful gut check. On Wegovy, real-world data generally shows around 2 to 4% of body weight lost by month 2, 4 to 6% by month 3, and around 11% by month 6. On Zepbound or Mounjaro, people typically see 5 to 8% by around 3 months and 10 to 15% by 6 months, since tirzepatide tends to drive somewhat more total loss than semaglutide at comparable points in treatment. Where you land depends on your starting weight, your dose, your protein intake, and whether you are strength training, so treat these as a range to check yourself against, not a scoreboard. Calqulate.net's Weight Loss % Calculator will show you your own percentage so you can compare apples to apples instead of guessing from the scale number alone.",
        links: [
          { label: "Weight Loss % Calculator", href: "/health/weight-loss-percentage-calculator" },
        ],
      },
    ],
  },
  {
    id: "glp1-side-effects",
    title: "Side effects people track but rarely get clear answers on",
    blurb:
      "A note on this section: a Penn/Nature Health study published in 2026 used AI to analyze more than 400,000 Reddit posts from roughly 70,000 GLP-1 users, and found that chills, temperature swings, and menstrual cycle changes were discussed heavily by real users but are not fully reflected in official clinical trial data. That does not mean these symptoms are rare or dangerous by default, it means they are common enough that you deserve a straight answer instead of silence.",
    items: [
      {
        q: "Why do I feel freezing cold all the time on Ozempic or Mounjaro? (\"Ozempic chills\")",
        a: "You are not imagining this, and you are not alone in it. Temperature complaints, chills, feeling cold, hot flashes, and fever-like sensations without an actual fever, showed up often enough in that 2026 Reddit analysis that researchers flagged it as an under-reported symptom cluster, alongside nausea, fatigue, and constipation which are already well known. The most likely explanation is that rapid fat loss reduces your body's insulating layer, and losing weight fast can also slightly lower your resting metabolic rate, both of which make you run colder than before. It is usually not dangerous on its own. But if the cold comes with a real fever, chest pain, confusion, or you cannot get warm no matter what you do, that is a call-your-doctor situation, not a wait-it-out one.",
        links: [
          { label: "Metabolic Health Score", href: "/product/metabolic-health-tracker", gold: true },
        ],
      },
      {
        q: "Why is my period irregular since starting a GLP-1?",
        a: "This is genuinely common and, for a lot of women, it settles down rather than getting worse. There are two things likely happening at once. First, GLP-1 receptors sit in brain regions involved in hormone signaling, so the drug itself may nudge your cycle a bit independent of weight loss. Second, and more commonly, losing a meaningful amount of body fat changes how much estrogen your body is producing and storing, since fat tissue itself makes and holds estrogen, and that shift can shorten, lengthen, or change the flow of your cycle. In one 2026 survey of over 1,700 women on GLP-1s, about 27% noticed some cycle change, and interestingly 45% said their periods actually became more predictable, rising to 64% among women with PCOS. There is no large controlled trial on this outside of PCOS populations yet, so if your cycle stops entirely, gets unusually heavy, or you have any chance of pregnancy (GLP-1s can increase fertility by restoring ovulation, which surprises a lot of people), talk to your doctor.",
        links: [
          { label: "Metabolic Health Score", href: "/product/metabolic-health-tracker", gold: true },
        ],
      },
      {
        q: "Why am I so fatigued and exhausted on a GLP-1 even though I'm doing everything right?",
        a: "A few things are usually stacking on top of each other here. You are very likely eating fewer calories than before, since that is the entire point of the drug, and a bigger calorie deficit means less fuel for your body to run on, plain and simple. On top of that, if protein or overall food intake drops too low, you can end up short on iron, B12, or other nutrients that your energy levels depend on. Slower digestion can also mean nutrients absorb a bit more slowly. This fatigue is real, it is common enough that the 2026 Reddit analysis flagged it as discussed far more often by patients than it shows up in official trial adverse-event tables, and it is usually fixable. Check that you are hitting a reasonable protein target, that you are not accidentally under-eating overall, and ask your doctor about checking iron, B12, and vitamin D if it does not improve in a few weeks.",
        links: [
          { label: "TDEE Calculator", href: "/health/tdee-calculator" },
        ],
      },
      {
        q: "Is it normal to have zero appetite but feel exhausted? What should I actually eat?",
        a: "Yes, this combination is extremely normal on a GLP-1, and it is also the exact combination that gets people into trouble if they do not adjust for it. Appetite suppression plus slower digestion means large meals feel awful, so the fix is smaller, more frequent, nutrient-dense meals rather than forcing three big plates a day. Aim for 4 to 5 small meals or snacks, prioritize protein first on your plate since that is the easiest thing to under-eat, and keep fat moderate since heavy or fried food is more likely to trigger nausea on top of low appetite. If you genuinely cannot get enough down, protein shakes, Greek yogurt, and bone broth are easier to tolerate than a full meal and still move the needle. If you are consistently unable to eat enough for more than a few days, that is worth a call to your prescriber, not something to push through alone.",
        links: [
          { label: "Macro Calculator", href: "/health/macro-calculator" },
        ],
      },
      {
        q: "Why don't certain foods sound good anymore? Are food aversions normal on Zepbound or Mounjaro?",
        a: "Yes, and there is a real difference between \"less hungry\" and \"that food actively grosses me out now,\" which is what a lot of people on Zepbound and Mounjaro describe. Slower stomach emptying changes how food sits with you, and it can make smells, textures, and specific foods (meat and rich, fatty dishes are common culprits) suddenly unappealing in a way that feels different from normal fullness. Cold foods, plain foods, and lighter textures (smoothies, yogurt, melon, crackers) are usually easier to tolerate on days when nothing sounds good. This tends to ease as your body adjusts to a dose, though it can flare again after each increase. If it escalates into real vomiting, ongoing dizziness, or you cannot keep fluids down, stop toughing it out and call your provider.",
        links: [
          { label: "Macro Calculator", href: "/health/macro-calculator" },
        ],
      },
      {
        q: "How do I manage nausea and vomiting on a GLP-1?",
        a: "Smaller meals, eaten slower, are the single biggest lever. Skip anything fried, very fatty, spicy, or heavily sauced while nausea is active, since fat and spice are the two things most likely to make it worse. Cold or room-temperature food tends to smell less intensely than hot food, which matters more than people expect when you are nauseated. Sip fluids between meals rather than during them, and avoid lying down right after eating. If nausea clusters around the first few days after a dose increase, that is expected and usually fades within a week or two. If you are vomiting repeatedly, cannot keep fluids down, or it is not improving as you'd expect, that is a conversation with your prescriber about slowing your titration, not something to just wait out.",
        links: [
          { label: "TDEE Calculator", href: "/health/tdee-calculator" },
        ],
      },
      {
        q: "Why is my hair falling out on Ozempic?",
        a: "The drug itself is not the direct cause, the rapid weight loss is. Fast, significant weight loss is a known trigger for something called telogen effluvium, where a stress on the body pushes more hair follicles than usual into their resting phase at the same time. Instead of the normal 10 to 15% of your scalp hair resting at once, that can jump to 25% or more, which shows up as noticeably more shedding, usually starting 2 to 4 months after the weight loss began (not immediately). Low intake of protein, iron, zinc, or biotin from eating less overall can make it worse. The good news is telogen effluvium is temporary for the vast majority of people, hair growth typically resumes within a few months and looks close to normal again by 6 to 9 months, especially if you are hitting your protein target.",
        links: [
          { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
        ],
      },
      {
        q: "What is \"Ozempic face,\" and can I prevent it?",
        a: "\"Ozempic face\" describes the hollowed cheeks, sunken eyes, and generally more aged look some people notice after significant weight loss on a GLP-1. It is not caused by the drug directly, it is caused by losing facial fat and, often, facial muscle along with body fat, especially when the weight comes off fast. Since 25 to 40% of the weight lost on these drugs can come from lean muscle rather than fat if you are not actively protecting it, less muscle and less fat under the skin means less structure holding your face's shape. The most effective prevention is not a cream, it is the same advice that protects muscle everywhere else on your body: eat enough protein, do resistance training 2 to 3 times a week, stay well hydrated, and avoid losing faster than about 1% of body weight per week if you can help it. Slower, muscle-protected weight loss gives your skin time to adjust instead of being left with nothing underneath it.",
        links: [
          { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
        ],
      },
    ],
  },
  {
    id: "glp1-cost-access",
    title: "Cost & access questions",
    blurb: "What to do when insurance says no, and the truth about compounded semaglutide and tirzepatide.",
    items: [
      {
        q: "My insurance denied my Wegovy or Zepbound refill. What are my options?",
        a: "You generally have three real paths, and none of them require just giving up. First, ask your prescriber to submit a prior authorization with a letter of medical necessity, which is what actually overturns a lot of denials. Second, while that is in progress, both manufacturers have direct-pay options: Novo Nordisk's NovoCare Pharmacy sells Wegovy at a flat $499 a month with no insurance needed, and Eli Lilly's savings card brings Zepbound down to roughly $299 to $499 a month for the vial format if your insurance does not cover it, depending on dose. Third, some people switch to LillyDirect or NovoCare self-pay long-term if they would rather stop fighting insurance altogether. Prices and programs shift, so check the manufacturer's own savings page before you assume you are stuck paying full retail.",
        links: [
          { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker", gold: true },
        ],
      },
      {
        q: "Are compounded semaglutide and tirzepatide safe, and how do they compare on price?",
        a: "As of 2026, compounded semaglutide and tirzepatide are largely off the table in the US outside narrow, legally defined exceptions, since the FDA ended the shortage-based enforcement discretion that allowed broad compounding in the first place, and in April 2026 the FDA moved to remove these drugs from the compounding list entirely. That change happened because of real safety problems, not just patent protection. The FDA has logged hundreds of adverse event reports tied to compounded versions, many from patients drawing incorrect doses out of multidose vials at home, some serious enough to need hospitalization, and it sent warning letters to telehealth companies in early 2026 over misleading claims about compounded products. Compounded versions were often cheaper, which is exactly why people were drawn to them, but cheaper is not worth much if the dose in the vial is not reliable. If cost is the real issue, the manufacturer savings programs above are the safer route to a lower price.",
        links: [
          { label: "GLP-1 Dose Calculator", href: "/health/glp-1-dose-calculator" },
        ],
      },
    ],
  },
  {
    id: "glp1-off-label",
    title: "Off-label & long-term questions",
    blurb: "The alcohol-craving research, and what actually happens when you stop.",
    items: [
      {
        q: "Can Ozempic help with alcohol cravings?",
        a: "There is real, growing evidence that it can, though it is not an approved use yet, so no doctor can prescribe it specifically for that. A 2025 JAMA Psychiatry trial found adults with alcohol use disorder who took low-dose semaglutide drank less and craved it less than those on placebo. A 2026 Lancet trial out of Copenhagen found adding semaglutide to therapy further cut heavy drinking days in patients who also had obesity, and separate 2026 research out of UTEP linked GLP-1 use to lower rates of alcohol, opioid, nicotine, and cocaine use disorders. The likely mechanism is that GLP-1 receptors sit in brain regions tied to reward and craving, so the drug seems to dial down the pull toward a drink the same way it dials down the pull toward food, rather than targeting alcohol specifically. Since semaglutide is not FDA-approved for alcohol use disorder, this would currently only happen as an off-label conversation with your prescriber, not something to self-direct.",
        links: [
          { label: "Metabolic Health Score", href: "/product/metabolic-health-tracker", gold: true },
        ],
      },
      {
        q: "Do I have to stay on a GLP-1 forever?",
        a: "No, but you should go in with real expectations about what happens if you stop. These drugs are built and marketed as long-term, chronic-use medications, and manufacturers do not provide an official tapering protocol, largely because the intended use is ongoing. That said, the data on stopping is more nuanced than \"you'll gain it all back.\" At 24 months after stopping, just over half of people (52 to 56%, depending on the drug) had kept off some or all of their weight loss, while other data shows a majority of people who lose weight regain at least a quarter of it within a year if they stop cold turkey with no other plan in place. The people who keep the most weight off tend to share two things: they protected their muscle mass while on the drug (since muscle keeps your metabolism higher after you stop), and they built real nutrition and activity habits during treatment instead of relying on the drug alone. A slow taper, done with your prescriber, also appears to help more than stopping abruptly.",
        links: [
          { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
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
