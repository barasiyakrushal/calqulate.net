import type { Metadata } from "next"
import { ClickableImage } from "@/components/ui/image-lightbox"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import AgeCalculator from "@/components/calculators/age-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import {
  CalendarDays,
  Clock,
  Cake,
  CalendarClock,
  CalendarPlus,
  Scale,
  ShieldCheck,
  FileText,
  GraduationCap,
  Briefcase,
  Stethoscope,
  ShieldPlus,
  PartyPopper,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "Age Calculator: Calculate Your Exact Age From Date of Birth",
  description:
    "Free online age calculator. Calculate your exact age from your date of birth in years, months, weeks, days, and hours. Find your next birthday and total days lived instantly.",
  keywords:
    "age calculator, calculate age, age calculator by date of birth, exact age calculator, age in years months days, date of birth calculator, online age calculator, how old am i",
  alternates: {
    canonical: "https://calqulate.net/health/age-calculator",
  },
  openGraph: {
    title: "Age Calculator: Calculate Your Exact Age From Date of Birth",
    description:
      "Calculate your exact age from your date of birth in years, months, weeks, days, and hours. Find your next birthday and total days lived instantly.",
    url: "https://calqulate.net/health/age-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Age Calculator: Calculate Your Exact Age From Date of Birth",
    description:
      "Calculate your exact age from your date of birth in years, months, weeks, days, and hours, plus your next birthday and total days lived.",
  },
}

const faqs = [
  {
    question: "How do I calculate my age?",
    answer:
      "Enter your date of birth in the calculator above and it counts the full years, months, and days between that date and today to give your exact age.",
  },
  {
    question: "How do you calculate age from date of birth?",
    answer:
      "Your age is found by subtracting your date of birth from the selected date, then adjusting for leap years and different month lengths so the result is exact.",
  },
  {
    question: "How many days old am I?",
    answer:
      "Your total days lived is the number of days between your date of birth and today, including every leap day. Enter your birth date above to see the exact count.",
  },
  {
    question: "How many hours have I lived?",
    answer:
      "Your total hours lived is your total days lived multiplied by 24. The calculator works this out automatically once you enter your date of birth.",
  },
  {
    question: "How is age calculated during leap years?",
    answer:
      "Every leap year adds an extra day, February 29, to your day count. The calculator includes each leap day you have lived through so your total is accurate.",
  },
  {
    question: "Can I calculate age for a future date?",
    answer:
      "Yes. Set the target date to any date in the future and the calculator shows how old you will be on that day.",
  },
  {
    question: "Can I calculate age between two dates?",
    answer:
      "Yes. Change the target date from today to any other date and the calculator returns the exact time between the two dates.",
  },
  {
    question: "Can I calculate someone else's age?",
    answer:
      "Yes. Enter their date of birth instead of yours to find their exact age in years, months, and days.",
  },
  {
    question: "What is an exact age calculator?",
    answer:
      "An exact age calculator shows your age broken down into years, months, weeks, days, and hours, rather than only your age in whole years.",
  },
  {
    question: "Why does my age change tomorrow instead of today?",
    answer:
      "Your age in days and hours increases every day at midnight, so those numbers update daily even though your age in years only changes on your birthday.",
  },
]

/** What the calculator can work out, shown as scannable cards. */
const capabilities = [
  { icon: CalendarDays, title: "Exact age", body: "Your age in years, months, and days from your date of birth." },
  { icon: Scale, title: "Age difference", body: "The exact gap in time between any two dates you enter." },
  { icon: Clock, title: "Days lived", body: "The total number of days and hours you have been alive." },
  { icon: PartyPopper, title: "Next birthday", body: "How many days until your next birthday and the weekday it lands on." },
  { icon: CalendarClock, title: "Leap year adjustment", body: "Every leap day is counted, so your totals stay accurate." },
  { icon: CalendarPlus, title: "Future age", body: "How old you will be on any date in the future." },
]

/** Everyday reasons people look up an exact age. */
const commonUses = [
  { icon: FileText, title: "Government documents", body: "Passports, licences, and official forms that require an exact date." },
  { icon: GraduationCap, title: "School admissions", body: "Confirm age eligibility for school years and entrance cut-off dates." },
  { icon: Briefcase, title: "Job applications", body: "Check minimum age requirements for roles and work permits." },
  { icon: Stethoscope, title: "Medical records", body: "Record precise age for appointments, screening, and dosing." },
  { icon: ShieldPlus, title: "Insurance", body: "Age to the day can affect quotes and policy eligibility." },
  { icon: Cake, title: "Birthday milestones", body: "Count down to birthdays and celebrate days-lived milestones." },
]

/** Why the results can be trusted, one signal per card. */
const accuracyPoints = [
  { title: "Real Gregorian calendar", body: "Calculations follow the standard Gregorian calendar used worldwide." },
  { title: "Every leap year included", body: "Each February 29 you have lived through is counted in your totals." },
  { title: "True month lengths", body: "We use the real length of every month instead of a 30-day average." },
  { title: "No approximations", body: "You get your exact age, not a rounded estimate." },
]

const trustSignals = [
  "Leap year accurate",
  "Runs locally in your browser",
  "No data stored or shared",
  "Uses real calendar math",
]

function Answer({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed text-slate-700 sm:text-lg">{children}</p>
}

export default function AgeCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Age Calculator"
        description="Calculate your exact age from your date of birth in years, months, weeks, days, and hours. Find your next birthday and total days lived instantly."
        url="https://calqulate.net/health/age-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 md:py-16">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Age Calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Calculate your exact age from your date of birth in years, months, weeks, days, hours, and minutes.
              Also find your next birthday, total days lived, and the age difference between any two dates, instantly.
            </p>

            <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Exact Age", "Date of Birth Calculator", "Years • Months • Days", "Free & Instant", "Private"].map(
                (chip) => (
                  <li
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {chip}
                  </li>
                ),
              )}
            </ul>

            <div className="mt-8">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Calculate my age
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* CALCULATOR (and dynamic results) */}
        <section id="calculator" className="scroll-mt-20">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
            <AgeCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 pb-8">
          <div className="mx-auto max-w-3xl space-y-14">
            {/* WHAT CAN THIS CALCULATOR CALCULATE */}
            <section id="what-it-calculates" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                What can this age calculator calculate?
              </h2>
              <Answer>
                This age calculator works out your exact age, your total days and hours lived, your next birthday, and
                the age difference between any two dates.
              </Answer>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {capabilities.map((c) => (
                  <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <c.icon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                    <h3 className="mt-3 font-bold text-slate-900">{c.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* HOW IS AGE CALCULATED */}
            <section id="how-age-is-calculated" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How is age calculated?</h2>
              <Answer>
                Age is calculated by comparing your date of birth with a selected date while accounting for leap years,
                varying month lengths, and the Gregorian calendar.
              </Answer>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                The calculator counts the number of full years since your birth, then the extra whole months, then the
                remaining days. Because it uses the true length of each month and every leap day, the result is your
                exact age rather than a rounded estimate.
              </p>
            </section>

            {/* HOW TO USE (moved below the result) */}
            <section id="how-to-use" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How to use the age calculator</h2>
              <Answer>Enter two dates and read your result. It takes about ten seconds.</Answer>
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <div className="flex justify-center bg-slate-50 p-4">
                  <ClickableImage
                    src="/age-calculator.webp"
                    alt="Age calculator showing a date of birth field, a target date field, and the calculate button"
                    width={700}
                    height={400}
                    className="rounded-xl border border-slate-200 shadow-sm"
                  />
                </div>
                <ol className="divide-y divide-slate-100">
                  {[
                    "Select your date of birth as the first date.",
                    "Leave the second date on today, or pick any past or future date.",
                    "Press calculate to see your exact age and full breakdown.",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* COMMON USES */}
            <section id="common-uses" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Common uses for an age calculator</h2>
              <Answer>
                People use an age calculator to confirm an exact age for official documents, school and job
                applications, medical records, insurance, and birthday milestones.
              </Answer>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {commonUses.map((u) => (
                  <div key={u.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <u.icon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                    <h3 className="mt-3 font-bold text-slate-900">{u.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{u.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AGE DIFFERENCE (internal link opportunity) */}
            <section id="age-difference" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Calculate the age difference between two dates</h2>
              <Answer>
                To find the age difference between two people, change the second date from today to the other person's
                date of birth, and the calculator returns the exact gap in years, months, and days.
              </Answer>
              <Link
                href="#calculator"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Try it in the calculator above
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>

            {/* WHY ACCURATE (EEAT) */}
            <section id="why-accurate" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Why this age calculator is accurate</h2>
              <Answer>
                This calculator uses the real Gregorian calendar with true month lengths and every leap year, so it
                returns your exact age with no approximations.
              </Answer>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {accuracyPoints.map((p) => (
                  <div key={p.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold text-slate-900">{p.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {trustSignals.map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            {/* FAQ */}
            <section id="faqs" className="scroll-mt-20">
              <h2 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">Frequently asked questions</h2>
              <FAQSection faqs={faqs} />
            </section>
          </div>

          <div className="mx-auto max-w-3xl">
            <RelatedCalculators slug="age-calculator" />
            <MedicalReviewerSection />
            <AuthorSection />
          </div>
        </div>
      </main>

      <AuthorSchema />

      <Footer />
    </div>
  )
}
