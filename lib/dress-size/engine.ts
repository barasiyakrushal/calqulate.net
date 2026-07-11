/**
 * The dress size decision engine.
 *
 * A size chart answers "what size are these numbers". A shopper is asking
 * something else entirely: "will this Zara dress fit me, and should I order the
 * 8 or the 10?" So this engine takes the measurements AND the context that
 * actually decides fit (brand grading, fabric stretch, cut, occasion, fit
 * preference) and returns a recommendation it can explain.
 *
 * Everything here is pure and unit-tested. No React, no formatting.
 *
 * Sizes are handled as INDEXES into the chart, never as raw US numbers, because
 * US sizes step in twos (0, 2, 4, 6...) and "size up" means one index, not one.
 */

export type Occasion = "everyday" | "office" | "party" | "formal" | "wedding" | "vacation"
export type FitPreference = "fitted" | "true" | "relaxed"
export type Brand =
  | "zara" | "hm" | "shein" | "asos" | "mango" | "oldnavy" | "boohoo" | "uniqlo" | "unknown"
export type Fabric =
  | "stretch" | "cotton" | "linen" | "satin" | "velvet" | "denim" | "chiffon" | "unknown"
export type BodyShape = "hourglass" | "pear" | "apple" | "rectangle" | "invertedTriangle"
export type Risk = "low" | "medium" | "high"

export interface SizeRow {
  us: number; uk: number; eu: number; au: number; jp: number; india: string
  bust: [number, number]; waist: [number, number]; hips: [number, number] // inches
}

/** Standard women's apparel chart, inches. */
export const CHART: SizeRow[] = [
  { us: 0,  uk: 4,  eu: 32, au: 4,  jp: 3,  india: "XS",  bust: [31, 32], waist: [24, 25], hips: [34, 35] },
  { us: 2,  uk: 6,  eu: 34, au: 6,  jp: 5,  india: "XS",  bust: [32, 33], waist: [25, 26], hips: [35, 36] },
  { us: 4,  uk: 8,  eu: 36, au: 8,  jp: 7,  india: "S",   bust: [33, 34], waist: [26, 27], hips: [36, 37] },
  { us: 6,  uk: 10, eu: 38, au: 10, jp: 9,  india: "S",   bust: [34, 35], waist: [27, 28], hips: [37, 38] },
  { us: 8,  uk: 12, eu: 40, au: 12, jp: 11, india: "M",   bust: [35, 36], waist: [28, 29], hips: [38, 39] },
  { us: 10, uk: 14, eu: 42, au: 14, jp: 13, india: "M",   bust: [36, 38], waist: [29, 31], hips: [39, 41] },
  { us: 12, uk: 16, eu: 44, au: 16, jp: 15, india: "L",   bust: [38, 40], waist: [31, 33], hips: [41, 43] },
  { us: 14, uk: 18, eu: 46, au: 18, jp: 17, india: "L",   bust: [40, 42], waist: [33, 35], hips: [43, 45] },
  { us: 16, uk: 20, eu: 48, au: 20, jp: 19, india: "XL",  bust: [42, 44], waist: [35, 37], hips: [45, 47] },
  { us: 18, uk: 22, eu: 50, au: 22, jp: 21, india: "XXL", bust: [44, 46], waist: [37, 39], hips: [47, 49] },
]
const MAXI = CHART.length - 1

/** Brand grading, in size steps. Positive means the brand runs small, so size up. */
export const BRAND_FIT: Record<Brand, { step: number; label: string; note: string }> = {
  zara:    { step: 1,  label: "Runs small",      note: "Zara grades narrow, especially through the waist and shoulders." },
  hm:      { step: 1,  label: "Runs small",      note: "H&M uses EU grading that runs tight through the waist." },
  shein:   { step: 2,  label: "Runs very small", note: "Shein sizing is inconsistent and cut small. Always read the item measurements." },
  asos:    { step: 0,  label: "True to size",    note: "ASOS Design is consistent. Third-party brands sold on ASOS are not." },
  mango:   { step: 1,  label: "Runs small",      note: "Mango runs slim, particularly if you are busty." },
  oldnavy: { step: -1, label: "Runs large",      note: "US high street vanity sizing. You will often need a size down." },
  boohoo:  { step: 1,  label: "Runs small",      note: "Expect heavy variation between individual items." },
  uniqlo:  { step: 0,  label: "True to size",    note: "Consistent grading, though cut slightly narrow." },
  unknown: { step: 0,  label: "Unknown brand",   note: "Without brand grading we cannot adjust. Check the garment measurements on the product page." },
}

/** Fabric behaviour, in size steps. Positive means no give, so size up. */
export const FABRIC_FIT: Record<Fabric, { step: number; label: string; note: string }> = {
  stretch: { step: -1, label: "Stretch, size down",  note: "Jersey and knit give as you wear them, so the smaller size usually sits better." },
  cotton:  { step: 0,  label: "True to size",        note: "Woven cotton has a little give but will not stretch to fit." },
  linen:   { step: 1,  label: "No give, size up",    note: "Linen is stiff and unforgiving, and it will not relax across the bust." },
  satin:   { step: 1,  label: "Unforgiving, size up",note: "Satin shows every pull and has no stretch. Size up and have it taken in." },
  velvet:  { step: 0,  label: "Allow room",          note: "Velvet has weight and drape. Do not size down for it." },
  denim:   { step: 1,  label: "Rigid, size up",      note: "Non-stretch denim will not give at the waist or hip." },
  chiffon: { step: 0,  label: "True to size",        note: "Chiffon is light and floaty, so fit is driven by the lining underneath." },
  unknown: { step: 0,  label: "Unknown fabric",      note: "Check the label. Stretch content is the single biggest factor after your measurements." },
}

const FIT_STEP: Record<FitPreference, number> = { fitted: -1, true: 0, relaxed: 1 }
/** Bridal patterns run one to two sizes small. Everything else is neutral. */
const OCCASION_STEP: Record<Occasion, number> = {
  everyday: 0, office: 0, party: 0, formal: 0, vacation: 0, wedding: 1,
}

export interface AssistantInput {
  bust: number; waist: number; hips: number // inches
  occasion: Occasion
  fit: FitPreference
  brand: Brand
  fabric: Fabric
}

export interface Adjustment { source: string; step: number; note: string }

export interface Report {
  size: SizeRow
  backup: SizeRow | null
  backupDirection: "up" | "down" | null
  baseSize: SizeRow          // size from measurements alone, before context
  drivenBy: "bust" | "waist" | "hips"
  bodyShape: BodyShape
  confidence: number         // 0..100
  stars: number              // 1..5
  risk: Risk
  reasons: string[]
  adjustments: Adjustment[]
  spread: number             // how many size steps apart the three measurements are
  styles: { best: string[]; avoid: string[] }
  checklist: string[]
}

const clampIdx = (i: number) => Math.max(0, Math.min(MAXI, i))

/** Index of the smallest size that can contain this measurement. */
export function indexFor(measure: number, key: "bust" | "waist" | "hips"): number {
  for (let i = 0; i < CHART.length; i++) {
    if (measure <= CHART[i][key][1]) return i
  }
  return MAXI
}

/** Classic bust/waist/hip silhouette rules, in inches. */
export function detectShape(bust: number, waist: number, hips: number): BodyShape {
  const bustHip = Math.abs(bust - hips)
  const bustWaist = bust - waist
  const hipWaist = hips - waist

  if (bustHip <= 1 && bustWaist >= 7 && hipWaist >= 7) return "hourglass"
  if (hips - bust > 2) return "pear"
  if (bust - hips > 2) return "invertedTriangle"
  // Apple means the waist is nearly as wide as the bust, or as wide as the hips.
  // A merely undefined waist (a few inches smaller) is a rectangle, not an apple.
  if (waist >= bust - 1 || waist / hips >= 0.95) return "apple"
  return "rectangle"
}

const STYLES: Record<BodyShape, { best: string[]; avoid: string[] }> = {
  hourglass: {
    best: ["Wrap", "Fit and flare", "Bodycon", "Belted sheath"],
    avoid: ["Boxy shift", "Oversized shapeless cuts"],
  },
  pear: {
    best: ["A-line", "Fit and flare", "Off shoulder", "Statement neckline"],
    avoid: ["Tight pencil skirts", "Clingy fabric across the hip"],
  },
  apple: {
    best: ["Empire waist", "Wrap", "A-line", "Structured V neck"],
    avoid: ["Bodycon", "Tight waistbands"],
  },
  rectangle: {
    best: ["Peplum", "Belted", "Ruffles", "Sheath with waist detail"],
    avoid: ["Straight shift with no shaping"],
  },
  invertedTriangle: {
    best: ["A-line", "Full skirt", "V neck", "Volume below the waist"],
    avoid: ["Puff sleeves", "Halter necks", "Shoulder detail"],
  },
}

export const SHAPE_LABEL: Record<BodyShape, string> = {
  hourglass: "Hourglass",
  pear: "Pear",
  apple: "Apple",
  rectangle: "Rectangle",
  invertedTriangle: "Inverted triangle",
}

export function buildReport(input: AssistantInput): Report {
  const { bust, waist, hips, occasion, fit, brand, fabric } = input

  // ── 1. Size from the body alone. Buy for the largest measurement, because
  //       taking a seam in is routine and letting it out often is not.
  const iB = indexFor(bust, "bust")
  const iW = indexFor(waist, "waist")
  const iH = indexFor(hips, "hips")
  const baseIdx = Math.max(iB, iW, iH)
  const spread = baseIdx - Math.min(iB, iW, iH)

  const drivenBy: Report["drivenBy"] = baseIdx === iB ? "bust" : baseIdx === iH ? "hips" : "waist"

  // ── 2. Context adjustments, in size steps.
  const adjustments: Adjustment[] = []
  const b = BRAND_FIT[brand]
  if (b.step !== 0) adjustments.push({ source: brandLabel(brand), step: b.step, note: b.note })
  const f = FABRIC_FIT[fabric]
  if (f.step !== 0) adjustments.push({ source: fabricLabel(fabric), step: f.step, note: f.note })
  const fitStep = FIT_STEP[fit]
  if (fitStep !== 0) {
    adjustments.push({
      source: fit === "relaxed" ? "You prefer a relaxed fit" : "You prefer a fitted look",
      step: fitStep,
      note: fit === "relaxed"
        ? "We shifted up a size so it skims rather than clings."
        : "We shifted down a size for a closer cut.",
    })
  }
  const occStep = OCCASION_STEP[occasion]
  if (occStep !== 0) {
    adjustments.push({
      source: "Bridal sizing",
      step: occStep,
      note: "Wedding dresses are cut one to two sizes smaller than high street. Order up and have it taken in.",
    })
  }

  const totalStep = adjustments.reduce((s, a) => s + a.step, 0)
  const finalIdx = clampIdx(baseIdx + totalStep)

  // ── 3. Confidence. Start high, subtract for every source of doubt.
  let confidence = 95
  if (spread >= 1) confidence -= Math.min(24, spread * 9)
  if (brand === "unknown") confidence -= 10
  if (fabric === "unknown") confidence -= 6
  if (f.step > 0) confidence -= 5             // no stretch, less forgiving
  if (occasion === "wedding") confidence -= 8 // bridal grading varies wildly
  if (nearBoundary(bust, iB, "bust") || nearBoundary(waist, iW, "waist") || nearBoundary(hips, iH, "hips")) {
    confidence -= 4
  }
  confidence = Math.max(40, Math.min(98, Math.round(confidence)))

  const risk: Risk = confidence >= 85 ? "low" : confidence >= 70 ? "medium" : "high"
  const stars = Math.max(1, Math.min(5, Math.round(confidence / 20)))

  // ── 4. Backup size. Point it where the doubt actually is.
  let backupDirection: Report["backupDirection"] = null
  // An unforgiving fabric always gets an upward backup, even at high confidence:
  // the failure mode is "too tight", and you cannot let out a seam that has no
  // allowance. Spread and low confidence also warrant a second option.
  if (spread >= 1 || confidence < 85 || f.step > 0) {
    backupDirection = f.step > 0 || spread >= 1 ? "up" : "down"
  }
  const backupIdx = backupDirection === "up" ? clampIdx(finalIdx + 1)
    : backupDirection === "down" ? clampIdx(finalIdx - 1) : -1
  const backup = backupIdx >= 0 && backupIdx !== finalIdx ? CHART[backupIdx] : null

  // ── 5. Explain yourself.
  const reasons: string[] = []
  const size = CHART[finalIdx]
  reasons.push(`Your ${drivenBy} is the deciding measurement, and it maps to a US ${CHART[baseIdx].us}.`)
  if (spread >= 1) {
    reasons.push(
      `Your three measurements span ${spread + 1} sizes, so we sized to the largest and recommend having the rest taken in.`,
    )
  } else {
    reasons.push("Your bust, waist and hips all land in the same size, which is the best possible starting point.")
  }
  for (const a of adjustments) {
    reasons.push(`${a.source}: ${a.step > 0 ? "sized up" : "sized down"}. ${a.note}`)
  }
  if (adjustments.length === 0) {
    reasons.push("Nothing about the brand, fabric or cut required an adjustment, so we kept your true size.")
  }

  const bodyShape = detectShape(bust, waist, hips)

  const checklist = buildChecklist({ risk, brand, fabric, spread, occasion })

  return {
    size,
    backup,
    backupDirection: backup ? backupDirection : null,
    baseSize: CHART[baseIdx],
    drivenBy,
    bodyShape,
    confidence,
    stars,
    risk,
    reasons,
    adjustments,
    spread,
    styles: STYLES[bodyShape],
    checklist,
  }
}

/** Within half an inch of the top of its size band, so a nudge changes the size. */
function nearBoundary(measure: number, idx: number, key: "bust" | "waist" | "hips"): boolean {
  const [, hi] = CHART[idx][key]
  return hi - measure <= 0.5
}

function buildChecklist(a: {
  risk: Risk; brand: Brand; fabric: Fabric; spread: number; occasion: Occasion
}): string[] {
  const out: string[] = []
  out.push("Check the garment measurements on the product page, not just the size label.")
  if (a.brand === "unknown") out.push("Search the brand name plus 'runs small' before ordering.")
  if (a.fabric === "unknown") out.push("Read the fabric composition. Any elastane at all changes the size you need.")
  if (a.spread >= 1) out.push("Order your recommended size and budget for a small alteration at the waist.")
  if (a.risk !== "low") out.push("Order both the recommended and the backup size if returns are free.")
  if (a.occasion === "wedding") out.push("Order at least four to six months ahead and book a fitting.")
  out.push("Check the returns window before you buy, not after.")
  return out
}

function brandLabel(b: Brand): string {
  const names: Record<Brand, string> = {
    zara: "Zara", hm: "H&M", shein: "Shein", asos: "ASOS", mango: "Mango",
    oldnavy: "Old Navy", boohoo: "Boohoo", uniqlo: "Uniqlo", unknown: "Unknown brand",
  }
  return names[b]
}
function fabricLabel(f: Fabric): string {
  const names: Record<Fabric, string> = {
    stretch: "Stretch fabric", cotton: "Cotton", linen: "Linen", satin: "Satin",
    velvet: "Velvet", denim: "Denim", chiffon: "Chiffon", unknown: "Unknown fabric",
  }
  return names[f]
}

export const cmToIn = (cm: number) => cm / 2.54
