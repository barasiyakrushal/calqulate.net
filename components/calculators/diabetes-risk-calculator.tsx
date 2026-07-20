"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  ActivitySquare,
  Scale,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Dumbbell,
  Apple,
  Info,
  ChevronDown,
  TestTube2,
  TrendingDown,
  Target
} from "lucide-react";
import { parseNumber } from "@/lib/utils"

// --- TYPES & INTERFACES ---
type UnitSystem = "metric" | "imperial";

interface FormData {
  ageGroup: string;
  gender: string;
  gestational: string;
  familyHistory: string;
  bloodPressure: string;
  activity: string;
  units: UnitSystem;
  heightCm: string;
  weightKg: string;
  heightFt: string;
  heightIn: string;
  weightLbs: string;
}

interface BreakdownItem {
  factor: string;
  points: number;
  type: "modifiable" | "non-modifiable";
}

// FEATURE 1 — clearer screening band derived from the existing score
type RiskBand = "Low" | "Increased" | "High" | "Very High";
interface RiskBandInfo {
  band: RiskBand;
  testAdvice: string;
  worthTesting: boolean;
}

// FEATURE 2 — the changeable factors that most move the score
interface TopFactor {
  factor: string;
  points: number;
  advice: string; // how much improving this would help
}

interface RiskResult {
  score: number;
  riskLevel: "Low Risk" | "Moderate Risk" | "High Risk";
  bmi: number;
  bmiCategory: string;
  breakdown: BreakdownItem[];
  modifiablePoints: number;
  weightLossGoal?: { min: number; max: number; unit: string };
  actionPlan: { icon: any; title: string; desc: string }[];
  // FEATURE 1 — screening band + whether an HbA1c test is worthwhile
  riskBand: RiskBandInfo;
  // FEATURE 2 — top two changeable factors and the points each could remove
  topFactors: TopFactor[];
}

// FEATURE 1 — map the existing 0-10+ score onto a 4-level screening band and
// explain whether getting an HbA1c blood test is worthwhile at that band.
function getRiskBand(score: number): RiskBandInfo {
  if (score >= 7) {
    return {
      band: "Very High",
      worthTesting: true,
      testAdvice:
        "An HbA1c (or fasting glucose) test is strongly worthwhile now. At this level there is a meaningful chance you already have prediabetes or undiagnosed diabetes — a quick blood test confirms it and lets you act early.",
    };
  }
  if (score >= 5) {
    return {
      band: "High",
      worthTesting: true,
      testAdvice:
        "Getting an HbA1c test is worthwhile. A score of 5+ signals elevated risk, and a single blood test will tell you whether your blood sugar is already creeping up so you can reverse it.",
    };
  }
  if (score === 4) {
    return {
      band: "Increased",
      worthTesting: true,
      testAdvice:
        "An HbA1c test is reasonable to consider, especially if you have changeable factors below. You are on the borderline, so a baseline reading is useful to track against over time.",
    };
  }
  return {
    band: "Low",
    worthTesting: false,
    testAdvice:
      "A blood test is not urgent at this risk level. Keep up your healthy habits and re-screen once a year, or sooner if your weight, activity, or health changes.",
  };
}

// FEATURE 2 — pick the two changeable (modifiable) factors carrying the most
// points and quantify how much fixing each one would lower the score.
function getTopFactors(breakdown: BreakdownItem[], score: number): TopFactor[] {
  const adviceFor = (factor: string, points: number): string => {
    const newScore = Math.max(0, score - points);
    const dropsBand = newScore < 5 && score >= 5;
    const pointWord = points === 1 ? "point" : "points";
    if (factor.startsWith("BMI")) {
      return `Reaching a healthy weight removes ${points} ${pointWord} from your score${
        dropsBand ? ", which would move you out of the high-risk band" : ""
      }. Losing 5-7% of your body weight can cut diabetes risk by up to 58%.`;
    }
    if (factor === "Sedentary Lifestyle") {
      return `Becoming active (150 min/week) removes ${points} ${pointWord} from your score${
        dropsBand ? ", enough to drop you below the high-risk threshold" : ""
      } and sharply improves insulin sensitivity.`;
    }
    if (factor === "High Blood Pressure") {
      return `Bringing blood pressure under control removes ${points} ${pointWord} from your score${
        dropsBand ? ", which would move you out of the high-risk band" : ""
      } and protects your heart at the same time.`;
    }
    return `Improving this removes ${points} ${pointWord} from your score.`;
  };

  return breakdown
    .filter((i) => i.type === "modifiable")
    .sort((a, b) => b.points - a.points)
    .slice(0, 2)
    .map((i) => ({ factor: i.factor, points: i.points, advice: adviceFor(i.factor, i.points) }));
}

// --- VISUAL COMPONENTS ---
const RiskGauge = ({ score }: { score: number }) => {
  const maxScore = 10;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  let riskColor = "bg-green-500";
  if (score === 4) riskColor = "bg-yellow-500";
  if (score >= 5) riskColor = "bg-red-500";
  
  return (
    <div className="flex flex-col items-center justify-center my-8 w-full">
      <div className="relative w-full max-w-md h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
        {/* Color Zones Background */}
        <div className="absolute top-0 left-0 h-full w-[40%] bg-green-100 dark:bg-green-900/30 border-r border-white/50" />
        <div className="absolute top-0 left-[40%] h-full w-[10%] bg-yellow-100 dark:bg-yellow-900/30 border-r border-white/50" />
        <div className="absolute top-0 left-[50%] h-full w-[50%] bg-red-100 dark:bg-red-900/30" />
        
        {/* Actual Score Bar */}
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out shadow-md ${riskColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between w-full max-w-md text-xs font-semibold text-muted-foreground mt-3">
        <span className="text-green-600 dark:text-green-500 w-[40%] text-left">Low (0-3)</span>
        <span className="text-yellow-600 dark:text-yellow-500 w-[10%] text-center">Mod. (4)</span>
        <span className="text-red-600 dark:text-red-500 w-[50%] text-right">High (5+)</span>
      </div>
    </div>
  );
};

export default function DiabetesRiskCalculator() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<RiskResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState<FormData>({
    ageGroup: "", gender: "", gestational: "", familyHistory: "",
    bloodPressure: "", activity: "", units: "imperial",
    heightCm: "", weightKg: "", heightFt: "", heightIn: "", weightLbs: "",
  });

  const totalSteps = 6;

  const handleUpdate = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(totalSteps, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // Validation
  const isStepValid = () => {
    switch (step) {
      case 1: return formData.ageGroup !== "" && formData.gender !== "";
      case 2: return formData.gender === "female" ? formData.gestational !== "" : true;
      case 3: return formData.familyHistory !== "";
      case 4: return formData.bloodPressure !== "";
      case 5: return formData.activity !== "";
      case 6: 
        if (formData.units === "metric") return formData.heightCm !== "" && formData.weightKg !== "";
        return formData.heightFt !== "" && formData.weightLbs !== "";
      default: return true;
    }
  };

  const handleNext = () => {
    if (step === 1 && formData.gender === "male") setStep(3); // Skip gestational
    else nextStep();
  };

  const handlePrev = () => {
    if (step === 3 && formData.gender === "male") setStep(1);
    else prevStep();
  };

  const calculateRisk = () => {
    let score = 0;
    let modifiableScore = 0;
    const breakdown: BreakdownItem[] = [];
    const actionPlan = [];

    // --- NON-MODIFIABLE ---
    if (formData.ageGroup === "40-49") { score += 1; breakdown.push({ factor: "Age (40-49)", points: 1, type: "non-modifiable" }); }
    else if (formData.ageGroup === "50-59") { score += 2; breakdown.push({ factor: "Age (50-59)", points: 2, type: "non-modifiable" }); }
    else if (formData.ageGroup === "60+") { score += 3; breakdown.push({ factor: "Age (60+)", points: 3, type: "non-modifiable" }); }

    if (formData.gender === "male") { score += 1; breakdown.push({ factor: "Gender (Male)", points: 1, type: "non-modifiable" }); }
    if (formData.gender === "female" && formData.gestational === "yes") { score += 1; breakdown.push({ factor: "Gestational Diabetes History", points: 1, type: "non-modifiable" }); }
    if (formData.familyHistory === "yes") { score += 1; breakdown.push({ factor: "Family History", points: 1, type: "non-modifiable" }); }

    // --- MODIFIABLE ---
    if (formData.bloodPressure === "yes") { 
      score += 1; modifiableScore += 1; 
      breakdown.push({ factor: "High Blood Pressure", points: 1, type: "modifiable" });
      actionPlan.push({ icon: Stethoscope, title: "Manage Blood Pressure", desc: "Work with your doctor to keep your blood pressure under 130/80 mmHg through diet, exercise, or medication."});
    }

    if (formData.activity === "no") { 
      score += 1; modifiableScore += 1; 
      breakdown.push({ factor: "Sedentary Lifestyle", points: 1, type: "modifiable" }); 
      actionPlan.push({ icon: Dumbbell, title: "Start Moving Daily", desc: "Aim for 150 minutes of moderate activity (like brisk walking) per week. Even 20 mins a day significantly boosts insulin sensitivity."});
    }

    // --- BMI & WEIGHT (MODIFIABLE) ---
    let heightM = 0;
    let weightCurrent = 0;
    
    if (formData.units === "metric") {
      heightM = parseNumber(formData.heightCm) / 100;
      weightCurrent = parseNumber(formData.weightKg);
    } else {
      const heightInches = (parseNumber(formData.heightFt) * 12) + (parseNumber(formData.heightIn) || 0);
      heightM = heightInches * 0.0254;
      weightCurrent = parseNumber(formData.weightLbs);
    }

    const bmiWeightKg = formData.units === "imperial" ? weightCurrent * 0.453592 : weightCurrent;
    const bmi = bmiWeightKg / (heightM * heightM);
    let bmiCategory = "Normal Weight";
    let weightLossGoal = undefined;
    
    if (bmi >= 25) {
      // 5-7% weight loss goal
      const minLoss = (weightCurrent * 0.05).toFixed(1);
      const maxLoss = (weightCurrent * 0.07).toFixed(1);
      weightLossGoal = { min: parseNumber(minLoss), max: parseNumber(maxLoss), unit: formData.units === "metric" ? "kg" : "lbs" };

      actionPlan.push({ icon: Apple, title: "Targeted Weight Loss", desc: `Losing just 5-7% of your body weight (${minLoss} - ${maxLoss} ${weightLossGoal.unit}) can reduce your diabetes risk by up to 58%.`});

      if (bmi >= 25 && bmi < 30) { score += 1; modifiableScore += 1; bmiCategory = "Overweight"; breakdown.push({ factor: "BMI (Overweight)", points: 1, type: "modifiable" }); }
      else if (bmi >= 30 && bmi < 40) { score += 2; modifiableScore += 2; bmiCategory = "Obese"; breakdown.push({ factor: "BMI (Obese)", points: 2, type: "modifiable" }); }
      else if (bmi >= 40) { score += 3; modifiableScore += 3; bmiCategory = "Morbidly Obese"; breakdown.push({ factor: "BMI (Morbidly Obese)", points: 3, type: "modifiable" }); }
    }

    // Default Action Plan if they scored perfect on lifestyle but still high risk due to age/genetics
    if (actionPlan.length === 0 && score >= 5) {
      actionPlan.push({ icon: Stethoscope, title: "Schedule a Blood Test", desc: "Because of your age and genetics, lifestyle alone isn't your only factor. Ask your doctor for an A1C or Fasting Glucose test this year."});
    }

    let riskLevel: "Low Risk" | "Moderate Risk" | "High Risk" = "Low Risk";
    if (score === 4) riskLevel = "Moderate Risk";
    if (score >= 5) riskLevel = "High Risk";

    const riskBand = getRiskBand(score);
    const topFactors = getTopFactors(breakdown, score);

    setResult({ score, riskLevel, bmi, bmiCategory, breakdown, modifiablePoints: modifiableScore, weightLossGoal, actionPlan, riskBand, topFactors });
    setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  const resetForm = () => {
    setResult(null);
    setStep(1);
    setFormData({ ageGroup: "", gender: "", gestational: "", familyHistory: "", bloodPressure: "", activity: "", units: "imperial", heightCm: "", weightKg: "", heightFt: "", heightIn: "", weightLbs: "" });
  };

  const SelectionCard = ({ label, value, selected, onClick }: { label: string, value: string, selected: boolean, onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-gray-200 hover:border-primary/40 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
          {selected && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
        </div>
        {label}
      </div>
    </div>
  );

  return (
    <>
      {/* WIZARD FORM */}
      <Card className={`max-w-3xl mx-auto shadow-lg border-t-4 border-t-primary transition-all duration-500 ${result ? 'hidden' : 'block'}`} id="calculator">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-8 border-b dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ActivitySquare className="w-6 h-6 text-primary" /> Risk Assessment
            </CardTitle>
            <span className="text-sm font-medium text-muted-foreground">Step {step} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 p-6 md:p-8 min-h-[350px] flex flex-col justify-between">
          <div className="space-y-6">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. How old are you?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectionCard label="Under 40" value="<40" selected={formData.ageGroup === "<40"} onClick={() => handleUpdate("ageGroup", "<40")} />
                    <SelectionCard label="40 - 49" value="40-49" selected={formData.ageGroup === "40-49"} onClick={() => handleUpdate("ageGroup", "40-49")} />
                    <SelectionCard label="50 - 59" value="50-59" selected={formData.ageGroup === "50-59"} onClick={() => handleUpdate("ageGroup", "50-59")} />
                    <SelectionCard label="60 or older" value="60+" selected={formData.ageGroup === "60+"} onClick={() => handleUpdate("ageGroup", "60+")} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">2. What is your gender?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectionCard label="Male" value="male" selected={formData.gender === "male"} onClick={() => handleUpdate("gender", "male")} />
                    <SelectionCard label="Female" value="female" selected={formData.gender === "female"} onClick={() => handleUpdate("gender", "female")} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-semibold mb-3">3. Have you ever been diagnosed with gestational diabetes?</h3>
                <p className="text-sm text-muted-foreground mb-4">(Diabetes that developed during pregnancy)</p>
                <div className="grid grid-cols-2 gap-3">
                  <SelectionCard label="Yes" value="yes" selected={formData.gestational === "yes"} onClick={() => handleUpdate("gestational", "yes")} />
                  <SelectionCard label="No" value="no" selected={formData.gestational === "no"} onClick={() => handleUpdate("gestational", "no")} />
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-semibold mb-3">Do you have a family history of diabetes?</h3>
                <p className="text-sm text-muted-foreground mb-4">(Do you have a mother, father, sister, or brother with diabetes?)</p>
                <div className="grid grid-cols-2 gap-3">
                  <SelectionCard label="Yes" value="yes" selected={formData.familyHistory === "yes"} onClick={() => handleUpdate("familyHistory", "yes")} />
                  <SelectionCard label="No" value="no" selected={formData.familyHistory === "no"} onClick={() => handleUpdate("familyHistory", "no")} />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-semibold mb-3">Have you ever been diagnosed with high blood pressure?</h3>
                <p className="text-sm text-muted-foreground mb-4">Select 'Yes' if you are on medication for high blood pressure.</p>
                <div className="grid grid-cols-2 gap-3">
                  <SelectionCard label="Yes" value="yes" selected={formData.bloodPressure === "yes"} onClick={() => handleUpdate("bloodPressure", "yes")} />
                  <SelectionCard label="No" value="no" selected={formData.bloodPressure === "no"} onClick={() => handleUpdate("bloodPressure", "no")} />
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-semibold mb-3">Are you physically active?</h3>
                <p className="text-sm text-muted-foreground mb-4">(Do you exercise or do physical work for at least 30 minutes, most days of the week?)</p>
                <div className="grid grid-cols-2 gap-3">
                  <SelectionCard label="Yes" value="yes" selected={formData.activity === "yes"} onClick={() => handleUpdate("activity", "yes")} />
                  <SelectionCard label="No" value="no" selected={formData.activity === "no"} onClick={() => handleUpdate("activity", "no")} />
                </div>
              </div>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Body Measurements (BMI)</h3>
                  <RadioGroup onValueChange={(val) => handleUpdate("units", val as UnitSystem)} value={formData.units} className="flex space-x-2">
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="imperial" id="imperial" />
                      <Label htmlFor="imperial" className="text-xs cursor-pointer">Imperial</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="metric" id="metric" />
                      <Label htmlFor="metric" className="text-xs cursor-pointer">Metric</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {formData.units === "imperial" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input type="number" placeholder="Ft" value={formData.heightFt} onChange={(e) => handleUpdate("heightFt", e.target.value)} />
                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">ft</span>
                          </div>
                          <div className="relative flex-1">
                            <Input type="number" placeholder="In" value={formData.heightIn} onChange={(e) => handleUpdate("heightIn", e.target.value)} />
                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">in</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <div className="relative">
                          <Input type="number" placeholder="e.g. 165" value={formData.weightLbs} onChange={(e) => handleUpdate("weightLbs", e.target.value)} />
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">lbs</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <div className="relative">
                          <Input type="number" placeholder="e.g. 175" value={formData.heightCm} onChange={(e) => handleUpdate("heightCm", e.target.value)} />
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">cm</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <div className="relative">
                          <Input type="number" placeholder="e.g. 75" value={formData.weightKg} onChange={(e) => handleUpdate("weightKg", e.target.value)} />
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">kg</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-10 pt-4 border-t border-gray-100 dark:border-gray-800">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrev} className="flex-1 md:flex-none">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!isStepValid()} className="flex-1 ml-auto">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={calculateRisk} disabled={!isStepValid()} className="flex-1 ml-auto bg-green-600 hover:bg-green-700 text-white">
                <HeartPulse className="w-4 h-4 mr-2" /> Calculate Risk
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* EXTENDED RESULTS SECTION */}
      <div ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        {result && (
          <div className="max-w-4xl mx-auto space-y-6 mt-8">
            
            {/* Top Overview Card */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-full h-2 ${result.score >= 5 ? 'bg-red-500' : result.score === 4 ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <CardContent className="p-8 md:p-10">
                <div className="text-center space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Clinical Risk Assessment</p>
                  
                  <div className="flex justify-center items-baseline gap-2">
                    <h2 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white">{result.score}</h2>
                    <span className="text-xl text-muted-foreground font-medium">/ 10+</span>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-lg font-bold
                    ${result.riskLevel === 'High Risk' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                      result.riskLevel === 'Moderate Risk' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
                  >
                    {result.score >= 5 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    {result.riskLevel}
                  </div>
                  
                  <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mt-4">
                    {result.score >= 5 
                      ? "A score of 5 or higher indicates an elevated risk for developing Type 2 diabetes. The good news? Prediabetes is highly reversible when caught early through targeted lifestyle changes."
                      : result.score === 4 
                      ? "You are at a moderate risk. You are right on the borderline, making this the perfect time to optimize your lifestyle before your risk increases further."
                      : "Great news! Your score places you in a low-risk category. Continue your current healthy habits to maintain this protective baseline over time."}
                  </p>
                </div>

                <RiskGauge score={result.score} />

                {/* Modifiable vs Non Modifiable Highlights */}
                {result.score > 0 && (
                  <div className="flex justify-center items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 py-3 px-6 rounded-lg max-w-fit mx-auto">
                    <Info className="w-4 h-4" />
                    <span>Out of your {result.score} points, <strong>{result.modifiablePoints} are modifiable</strong> (you can change them!).</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FEATURE 1 — SCREENING BAND & HbA1c TEST GUIDANCE */}
            <Card className="shadow-md border-t-4 border-t-emerald-600 rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                  <TestTube2 className="w-5 h-5" /> Your Screening Band &amp; Should You Get an HbA1c Test?
                </CardTitle>
                <CardDescription>A clearer band than a single number — and whether a blood test is worth it for you.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-5">
                {/* Band scale */}
                <div className="flex flex-wrap gap-2">
                  {(["Low", "Increased", "High", "Very High"] as const).map((b) => {
                    const active = result.riskBand.band === b;
                    const tone =
                      b === "Low"
                        ? "bg-emerald-600"
                        : b === "Increased"
                        ? "bg-yellow-500"
                        : b === "High"
                        ? "bg-orange-500"
                        : "bg-red-500";
                    return (
                      <span
                        key={b}
                        className={`flex-1 min-w-[90px] text-center text-xs font-bold px-3 py-2 rounded-lg transition-all ${
                          active
                            ? `${tone} text-white shadow-sm`
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        {b}
                        {active && " ✓"}
                      </span>
                    );
                  })}
                </div>

                <div
                  className={`rounded-xl p-4 border text-sm leading-relaxed flex items-start gap-3 ${
                    result.riskBand.worthTesting
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {result.riskBand.worthTesting ? (
                    <TestTube2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                  )}
                  <span>
                    Your <strong>{result.riskBand.band}</strong> band: {result.riskBand.testAdvice}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is a screening estimate, not a diagnosis. Only a clinician and a blood test can diagnose diabetes or prediabetes.
                </p>
              </CardContent>
            </Card>

            {/* FEATURE 2 — TOP TWO CHANGEABLE FACTORS */}
            {result.topFactors.length > 0 && (
              <Card className="shadow-md rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                    <Target className="w-5 h-5" /> Your Top {result.topFactors.length === 1 ? "Factor" : "2 Factors"} to Change
                  </CardTitle>
                  <CardDescription>The changeable factors that affect your score the most — and how much fixing each would help.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.topFactors.map((f, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-emerald-100 dark:border-slate-700 bg-emerald-50/50 dark:bg-slate-800/50 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                            <TrendingDown className="w-3.5 h-3.5" /> #{i + 1} Biggest Lever
                          </span>
                          <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                            −{f.points} pt{f.points === 1 ? "" : "s"} possible
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{f.factor}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.advice}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Detailed Breakdown Card */}
              <Card className="shadow-md">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ActivitySquare className="w-5 h-5 text-primary" /> Risk Factors Breakdown
                  </CardTitle>
                  <CardDescription>Exactly where your points came from.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {result.breakdown.length > 0 ? (
                    <div className="space-y-6">
                      {/* Modifiable List */}
                      {result.breakdown.filter(i => i.type === 'modifiable').length > 0 && (
                         <div>
                           <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 border-b pb-1">
                             Factors You Can Change 
                             <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{result.modifiablePoints} pts</span>
                           </h4>
                           <ul className="space-y-3">
                             {result.breakdown.filter(i => i.type === 'modifiable').map((item, i) => (
                               <li key={i} className="flex justify-between items-center text-sm">
                                 <span className="text-gray-600 dark:text-gray-400">{item.factor}</span>
                                 <span className="font-semibold text-red-500">+{item.points}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                      )}

                      {/* Non-Modifiable List */}
                      {result.breakdown.filter(i => i.type === 'non-modifiable').length > 0 && (
                         <div>
                           <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 border-b pb-1">
                             Factors You Cannot Change
                           </h4>
                           <ul className="space-y-3">
                             {result.breakdown.filter(i => i.type === 'non-modifiable').map((item, i) => (
                               <li key={i} className="flex justify-between items-center text-sm">
                                 <span className="text-gray-600 dark:text-gray-400">{item.factor}</span>
                                 <span className="font-semibold text-gray-900 dark:text-gray-100">+{item.points}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 italic">
                      No risk factor points added. Perfect score!
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* BMI & Context Card */}
              <Card className="shadow-md">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Scale className="w-5 h-5 text-blue-500" /> Weight & BMI Context
                  </CardTitle>
                  <CardDescription>How your weight impacts your risk.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col justify-center">
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">{result.bmi.toFixed(1)}</span>
                    <span className="text-lg font-medium text-muted-foreground mb-1">BMI</span>
                  </div>
                  
                  <div className="inline-block px-3 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-sm w-max mb-6">
                    Category: {result.bmiCategory}
                  </div>

                  {result.weightLossGoal ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                        <ChevronDown className="w-4 h-4" /> Target Weight Loss Goal
                      </h4>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-500 mb-1">
                        {result.weightLossGoal.min} - {result.weightLossGoal.max} <span className="text-lg">{result.weightLossGoal.unit}</span>
                      </p>
                      <p className="text-sm text-green-700/80 dark:text-green-400/80">
                        Losing just 5% to 7% of your current body weight can dramatically improve insulin resistance and cut your diabetes risk by more than half.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your weight falls within the normal category. Maintaining this weight is one of the best ways to protect yourself against Type 2 diabetes.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Personalized Action Plan */}
            {result.actionPlan.length > 0 && (
              <Card className="shadow-md border-t-4 border-t-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Stethoscope className="w-6 h-6 text-blue-500" /> Your Personalized Action Plan
                  </CardTitle>
                  <CardDescription>Based on your specific answers, focus on these steps immediately:</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.actionPlan.map((action, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700">
                        <div className="mt-1 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm h-min">
                          <action.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">{action.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{action.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="pt-6 pb-12 flex justify-center">
              <Button variant="outline" size="lg" onClick={resetForm} className="px-8 shadow-sm">
                <RefreshCw className="w-4 h-4 mr-2" /> Start New Assessment
              </Button>
            </div>

          </div>
        )}
      </div>
    </>
  );
}