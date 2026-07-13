export interface Calculator {
  id: string
  title: string
  description: string
  href: string
  category: string
  tags: string[]
  keywords: string[]
}

export const calculators: Calculator[] = [
  {
    id: "absi",
    title: "ABSI Calculator",
    description: "Calculate your A Body Shape Index (ABSI) score",
    href: "/health/absi-calculator",
    category: "Health",
    tags: ["absi", "body shape", "index", "health", "fitness"],
    keywords: ["a body shape index", "absi calculator", "health risk", "body shape", "waist circumference"],
  },
  {
    id: "lean-body-mass",
    title: "Lean Body Mass Calculator",
    description: "Estimate your lean body mass using weight, height, and sex",
    href: "/health/lean-body-mass-calculator",
    category: "Health",
    tags: ["lean body mass", "lbm", "muscle", "weight", "composition"],
    keywords: ["lean body mass", "lbm calculator", "muscle mass", "body composition", "fitness"],
  },
  {
    id: "rfm",
    title: "RFM Calculator",
    description: "Estimate your body fat percentage with the Relative Fat Mass formula",
    href: "/health/rfm-calculator",
    category: "Health",
    tags: ["rfm", "relative fat mass", "body fat", "waist", "height"],
    keywords: ["rfm calculator", "relative fat mass", "body fat percentage", "body composition", "fitness"],
  },
  {
    id: "ponderal-index",
    title: "Ponderal Index Calculator",
    description: "Calculate your body proportion using the Ponderal Index",
    href: "/health/ponderal-index-calculator",
    category: "Health",
    tags: ["ponderal index", "pi", "bmi", "body proportion", "health"],
    keywords: ["ponderal index", "pi calculator", "body proportion", "bmi alternative", "health"],
  },
  {
    id: "body-shape",
    title: "Body Shape Calculator",
    description: "Identify your body type by comparing your bust, waist, and hip measurements",
    href: "/health/body-shape-calculator",
    category: "Health",
    tags: ["body shape", "body type", "measurements", "bust", "waist", "hips"],
    keywords: ["body shape calculator", "body type identification", "bust waist hip measurements", "hourglass pear apple rectangle inverted triangle"],
  },
  {
    id: "waist-to-hight-ratio",
    title: "Waist-to-Height Ratio Calculator",
    description: "Calculate your waist-to-height ratio to assess health risks",
    href: "/health/waist-to-height-ratio-calculator",
    category: "Health",
    tags: ["waist-to-height ratio", "health risk", "obesity", "cardiovascular", "fitness"],
    keywords: ["waist-to-height ratio calculator", "health risk assessment", "obesity indicator", "cardiovascular health", "fitness"],
  },
  {
    id: "facial-harmony",
    title: "Facial Harmony Calculator",
    description: "Assess your facial proportions and symmetry to determine your facial harmony",
    href: "/health/facial-harmony-calculator",
    category: "Health",
    tags: ["facial harmony", "facial proportions", "symmetry", "beauty", "aesthetics"],
    keywords: ["facial harmony calculator", "facial proportions assessment", "symmetry analysis", "beauty evaluation", "aesthetic balance"],
  },
  {
    id: "ai-attractiveness-test",
    title: "AI Attractiveness Test",
    description: "Get an AI-generated attractiveness score based on your facial features",
    href: "/health/ai-attractiveness-test",
    category: "Health",
    tags: ["ai attractiveness", "facial features", "beauty score", "machine learning", "image analysis"],
    keywords: ["ai attractiveness test", "facial features analysis", "beauty score prediction", "machine learning model", "image processing"],
  },
  {
    id: "face-shape",
    title: "Face Shape Calculator",
    description: "Determine your face shape based on your facial measurements",
    href: "/health/face-shape-calculator",
    category: "Health",
    tags: ["face shape", "facial measurements", "beauty", "aesthetics", "symmetry"],
    keywords: ["face shape calculator", "facial measurements analysis", "beauty assessment", "aesthetic evaluation", "symmetry determination"],
  },
  {
    id: "body-fat",
    title: "Body Fat Calculator",
    description: "Estimate your body fat using various methods",
    href: "/health/body-fat-calculator",
    category: "Health",
    tags: ["body fat percentage", "body composition", "health", "fitness", "weight management"],
    keywords: ["body fat percentage calculator", "body composition analysis", "health assessment", "fitness evaluation", "weight management tool"],
  },
  {
    id: "bmi",
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index (BMI) to assess your weight category",
    href: "/health/bmi-calculator",
    category: "Health",
    tags: ["bmi", "body mass index", "weight category", "health", "fitness"],
    keywords: ["bmi calculator", "body mass index assessment", "weight category determination", "health evaluation", "fitness analysis"],
  },
  {
    id: "marco",
    title: "Marco Calculator",
    description: "Calculate your Marco score",
    href: "/health/marco-calculator",
    category: "Health",
    tags: ["marco", "health", "fitness"],
    keywords: ["marco calculator", "health assessment", "fitness evaluation"],
  },
  {
    id: "ideal-body-weight",
    title: "Ideal Body Weight Calculator",
    description: "Calculate your ideal body weight based on your height and gender",
    href: "/health/ideal-body-weight-calculator",
    category: "Health",
    tags: ["ideal body weight", "height", "gender", "health", "fitness"],
    keywords: ["ideal body weight calculator", "height and gender assessment", "health evaluation", "fitness analysis", "weight management"],
  },
  {
    id: "adjusted-body-weight",
    title: "Adjusted Body Weight Calculator",
    description: "Calculate your adjusted body weight based on your actual weight and height",
    href: "/health/adjusted-body-weight-calculator",
    category: "Health",
    tags: ["adjusted body weight", "actual weight", "height", "health", "fitness"],
    keywords: ["adjusted body weight calculator", "actual weight and height assessment", "health evaluation", "fitness analysis", "weight management"],
  },
  {
    id: "Heart-rate-calculator",
    title: "Heart Rate Calculator",
    description: "Calculate your target heart rate for exercise based on your age and fitness level",
    href: "/health/heart-rate-calculator",
    category: "Health",
    tags: ["heart rate", "target heart rate", "exercise", "age", "fitness level"],
    keywords: ["heart rate calculator", "target heart rate assessment", "exercise evaluation", "age and fitness level analysis", "cardiovascular health"],
  },
  {
    id: "blood-pressure-calculator",
    title: "Blood Pressure Calculator",
    description: "Calculate your blood pressure based on your age and gender",
    href: "/health/blood-pressure-calculator",
    category: "Health",
    tags: ["blood pressure", "bp", "age", "gender", "health"],
    keywords: ["blood pressure calculator", "bp assessment", "age and gender analysis", "health evaluation"],
  },
  {
    id: "cholesterol-ratio-calculator",
    title: "Cholesterol Ratio Calculator",
    description: "Calculate your cholesterol ratio based on your age, gender, and lifestyle factors",
    href: "/health/cholesterol-ratio-calculator",
    category: "Health",
    tags: ["cholesterol", "ratio", "age", "gender", "lifestyle"],
    keywords: ["cholesterol ratio calculator", "cholesterol assessment", "age and gender analysis", "lifestyle factors evaluation"]
  },
  {
    id: "Heart-age-calculator",
    title: "Heart Age Calculator",
    description: "Calculate your heart age based on your age, gender, and lifestyle factors",
    href: "/health/heart-age-calculator",
    category: "Health",
    tags: ["heart age", "age", "gender", "lifestyle", "health"],
    keywords: ["heart age calculator", "heart age assessment", "age and gender analysis", "lifestyle factors evaluation", "cardiovascular health"]
  },
  {
    id: "karvonen-formula-calculator",
    title: "Karvonen Formula Calculator",
    description: "Calculate your target heart rate using the Karvonen formula based on your age, resting heart rate, and desired intensity",
    href: "/health/karvonen-formula-calculator",
    category: "Health",
    tags: ["karvonen", "formula", "target heart rate", "age", "resting heart rate", "desired intensity"],
    keywords: ["karvonen formula calculator", "target heart rate assessment", "age and heart rate analysis", "exercise intensity evaluation", "cardiovascular health"]
  },
  {
    id: "vo2-max-calculator",
    title: "VO2 Max Calculator",
    description: "Estimate your VO2 max based on your age, gender, and exercise performance",
    href: "/health/vo2-max-calculator",
    category: "Health",
    tags: ["vo2 max", "oxygen consumption", "age", "gender", "exercise performance"],
    keywords: ["vo2 max calculator", "oxygen consumption assessment", "age and gender analysis", "exercise performance evaluation", "cardiovascular health"]
  },
  {
    id: "bmr-calculator",
    title: "BMR Calculator",
    description: "Calculate your Basal Metabolic Rate (BMR) based on your age, gender, and weight",
    href: "/health/bmr-calculator",
    category: "Health",
    tags: ["bmr", "basal metabolic rate", "age", "gender", "weight"],
    keywords: ["bmr calculator", "basal metabolic rate assessment", "age and gender analysis", "weight evaluation", "metabolic health"]
  },
  {
    id: "body-mass-index-calculator",
    title: "Body Mass Index Calculator",
    description: "Calculate your Body Mass Index (BMI) based on your height and weight",
    href: "/health/body-mass-index-calculator",
    category: "Health",
    tags: ["bmi", "body mass index", "height", "weight"],
    keywords: ["bmi calculator", "body mass index assessment", "height and weight analysis", "obesity evaluation", "health metrics"]
  },
  {
    id: "mean-arterial-pressure-calculator",
    title: "Mean Arterial Pressure Calculator",
    description: "Calculate your Mean Arterial Pressure (MAP) based on your systolic and diastolic blood pressure",
    href: "/health/mean-arterial-pressure-calculator",
    category: "Health",
    tags: ["mean arterial pressure", "map", "systolic blood pressure", "diastolic blood pressure"],
    keywords: ["mean arterial pressure calculator", "map assessment", "systolic and diastolic blood pressure analysis", "cardiovascular health evaluation"]
  },
  {
    id: "pulse-pressure-calculator",
    title: "Pulse Pressure Calculator",
    description: "Calculate your Pulse Pressure based on your systolic and diastolic blood pressure",
    href: "/health/pulse-pressure-calculator",
    category: "Health",
    tags: ["pulse pressure", "systolic blood pressure", "diastolic blood pressure"],
    keywords: ["pulse pressure calculator", "systolic and diastolic blood pressure analysis", "cardiovascular health evaluation"]
  },
  {
    id: "resting-heart-rate-calculator",
    title: "Resting Heart Rate Calculator",
    description: "Calculate your Resting Heart Rate (RHR) based on your pulse measurements",
    href: "/health/resting-heart-rate-calculator",
    category: "Health",
    tags: ["resting heart rate", "rhr", "pulse measurements"],
    keywords: ["resting heart rate calculator", "rhr assessment", "pulse measurement analysis", "cardiovascular health evaluation"]
  },
  {
    id: "tdee-calculator",
    title: "TDEE Calculator",
    description: "Calculate your Total Daily Energy Expenditure (TDEE) based on your activity level and basal metabolic rate",
    href: "/health/tdee-calculator",
    category: "Health",
    tags: ["tdee", "total daily energy expenditure", "activity level", "basal metabolic rate"],
    keywords: ["tdee calculator", "total daily energy expenditure assessment", "activity level analysis", "basal metabolic rate evaluation", "caloric needs"]
  },
  {
    id: "calorie-deficit-calculator",
    title: "Calorie Deficit Calculator",
    description: "Calculate your Calorie Deficit based on your TDEE and desired weight loss goals",
    href: "/health/calorie-deficit-calculator",
    category: "Health",
    tags: ["calorie deficit", "tdee", "weight loss goals"],
    keywords: ["calorie deficit calculator", "tdee assessment", "weight loss goal analysis", "caloric needs evaluation"]
  },
  {
    id: "fat-intake-calculator",
    title: "Fat Intake Calculator",
    description: "Calculate your recommended daily fat intake based on your TDEE and macronutrient distribution",
    href: "/health/fat-intake-calculator",
    category: "Health",
    tags: ["fat intake", "tdee", "macronutrient distribution"],
    keywords: ["fat intake calculator", "tdee assessment", "macronutrient distribution analysis", "caloric needs evaluation"]
  },
  {
    id: "daily-intake-calculator",
    title: "Daily Intake Calculator",
    description: "Calculate your recommended daily intake of calories, protein, fat, and carbohydrates based on your TDEE and macronutrient distribution",
    href: "/health/daily-intake-calculator",
    category: "Health",
    tags: ["daily intake", "tdee", "macronutrient distribution", "calories", "protein", "fat", "carbohydrates"],
    keywords: ["daily intake calculator", "tdee assessment", "macronutrient distribution analysis", "caloric needs evaluation"]
  },
  {
    id: "sleep-cycle-calculator",
    title: "Sleep Cycle Calculator",
    description: "Calculate your optimal sleep cycles based on your desired wake-up time and sleep duration",
    href: "/health/sleep-cycle-calculator",
    category: "Health",
    tags: ["sleep cycle", "optimal sleep", "wake-up time", "sleep duration"],
    keywords: ["sleep cycle calculator", "optimal sleep assessment", "wake-up time analysis", "sleep duration evaluation"]
  },
  {
    id: "sleep-debt-calculator",
    title: "Sleep Debt Calculator",
    description: "Calculate your sleep debt based on your actual sleep duration and recommended sleep duration",
    href: "/health/sleep-debt-calculator",
    category: "Health",
    tags: ["sleep debt", "actual sleep duration", "recommended sleep duration"],
    keywords: ["sleep debt calculator", "actual sleep duration assessment", "recommended sleep duration analysis", "sleep health evaluation"]
  },
  {
    id: "sleep-level-calculator",
    title: "Sleep Level Calculator",
    description: "Calculate your sleep level based on your sleep duration and quality",
    href: "/health/sleep-level-calculator",
    category: "Health",
    tags: ["sleep level", "sleep duration", "sleep quality"],
    keywords: ["sleep level calculator", "sleep duration assessment", "sleep quality analysis", "sleep health evaluation"]
  },
  {
    id: "ivf-pregnancy-due-date-calculator",
    title: "IVF Pregnancy Due Date Calculator",
    description: "Calculate your estimated due date for IVF pregnancy based on your embryo transfer date and embryo age",
    href: "/health/ivf-pregnancy-due-date-calculator",
    category: "Health",
    tags: ["ivf pregnancy", "due date", "embryo transfer", "embryo age"],
    keywords: ["ivf pregnancy due date calculator", "embryo transfer date assessment", "embryo age analysis", "pregnancy due date estimation"]
  },
  {
    id: "ovulation-calculator",
    title: "Ovulation Calculator",
    description: "Calculate your ovulation date based on your menstrual cycle length and last menstrual period",
    href: "/health/ovulation-calculator",
    category: "Health",
    tags: ["ovulation", "menstrual cycle", "last menstrual period"],
    keywords: ["ovulation calculator", "menstrual cycle length assessment", "last menstrual period analysis", "fertility tracking"]
  },
  {
    id: "period-cycle-calculator",
    title: "Period Cycle Calculator",
    description: "Calculate your menstrual cycle length and predict your next period based on your last menstrual period",
    href: "/health/period-cycle-calculator",
    category: "Health",
    tags: ["period cycle", "menstrual cycle", "last menstrual period"],
    keywords: ["period cycle calculator", "menstrual cycle length assessment", "next period prediction", "fertility tracking"]
  },
  {
    id: "preganancy-weight-gain-calculator",
    title: "Pregnancy Weight Gain Calculator",
    description: "Calculate your recommended weight gain during pregnancy based on your pre-pregnancy BMI and healthcare provider's guidance",
    href: "/health/pregnancy-weight-gain-calculator",
    category: "Health",
    tags: ["pregnancy", "weight gain", "bmi", "healthcare"],
    keywords: ["pregnancy weight gain calculator", "pre-pregnancy bmi assessment", "healthcare provider guidance", "maternal health evaluation"]
  },
  {
    id: "golden-ratio-calculator",
    title: "Golden Ratio Calculator",
    description: "Calculate your facial proportions and symmetry to determine your adherence to the Golden Ratio",
    href: "/health/golden-ratio-calculator",
    category: "Health",
    tags: ["golden ratio", "facial proportions", "symmetry"],
    keywords: ["golden ratio calculator", "facial proportions assessment", "symmetry analysis", "beauty evaluation", "aesthetic balance"]
  },
  
  // ---> NEW DISEASE RISK & FITNESS CALCULATORS START HERE <---

  {
    id: "diabetes-risk",
    title: "Diabetes Risk Calculator",
    description: "Assess your risk of developing type 2 diabetes based on lifestyle and health factors",
    href: "/health/diabetes-risk-calculator",
    category: "Health",
    tags: ["diabetes", "disease risk", "blood sugar", "health"],
    keywords: ["diabetes risk calculator", "type 2 diabetes assessment", "disease risk", "blood sugar evaluation"],
  },
  {
    id: "ascvd-risk",
    title: "ASCVD Risk Calculator",
    description: "Estimate your 10-year risk of atherosclerotic cardiovascular disease (ASCVD)",
    href: "/health/ascvd-risk-calculator",
    category: "Health",
    tags: ["ascvd", "cardiovascular", "heart disease", "risk"],
    keywords: ["ascvd risk calculator", "cardiovascular risk", "heart disease assessment", "10-year ascvd"],
  },
  {
    id: "framingham-risk",
    title: "Framingham Risk Score",
    description: "Calculate your 10-year cardiovascular risk using the Framingham Risk Score",
    href: "/health/framingham-risk-score",
    category: "Health",
    tags: ["framingham", "heart disease", "cardiovascular", "risk score"],
    keywords: ["framingham risk score", "cardiovascular risk calculator", "heart disease risk", "framingham calculator"],
  },
  {
    id: "qrisk3",
    title: "QRISK3 Calculator",
    description: "Calculate your risk of developing a heart attack or stroke over the next 10 years using QRISK3",
    href: "/health/qrisk3-calculator",
    category: "Health",
    tags: ["qrisk3", "heart attack", "stroke", "cardiovascular", "risk"],
    keywords: ["qrisk3 calculator", "cardiovascular risk assessment", "heart attack risk", "stroke risk"],
  },
  {
    id: "breast-cancer-risk",
    title: "Breast Cancer Risk Calculator",
    description: "Estimate your risk of developing breast cancer using validated assessment models",
    href: "/health/breast-cancer-risk-calculator",
    category: "Health",
    tags: ["breast cancer", "cancer risk", "oncology", "health"],
    keywords: ["breast cancer risk calculator", "cancer screening", "gail model", "breast cancer assessment"],
  },
  {
    id: "obesity-risk",
    title: "Obesity Risk Calculator",
    description: "Assess your risk of obesity-related health complications",
    href: "/health/obesity-risk-calculator",
    category: "Health",
    tags: ["obesity", "weight", "bmi", "health risk"],
    keywords: ["obesity risk calculator", "weight related risk", "obesity assessment", "health complications"],
  },
  {
    id: "creatinine-clearance",
    title: "Creatinine Clearance Calculator",
    description: "Estimate kidney function by calculating creatinine clearance using the Cockcroft-Gault equation",
    href: "/health/creatinine-clearance-calculator",
    category: "Health",
    tags: ["creatinine", "kidney function", "renal", "cockcroft-gault"],
    keywords: ["creatinine clearance calculator", "kidney function assessment", "crcl calculator", "renal health"],
  },
  {
    id: "eag",
    title: "eAG Calculator",
    description: "Convert your A1C percentage to estimated Average Glucose (eAG)",
    href: "/health/eag-calculator",
    category: "Health",
    tags: ["eag", "estimated average glucose", "a1c", "diabetes", "blood sugar"],
    keywords: ["eag calculator", "a1c to eag conversion", "estimated average glucose", "diabetes management"],
  },
  {
    id: "glp-1-dose",
    title: "GLP-1 Dose Calculator",
    description: "Calculate and manage your GLP-1 medication titration and dosing schedule",
    href: "/health/glp-1-dose-calculator",
    category: "Health",
    tags: ["glp-1", "dosing", "medication", "weight loss", "diabetes"],
    keywords: ["glp-1 dose calculator", "semaglutide dosing", "tirzepatide schedule", "medication titration"],
  },
  {
    id: "semaglutide-dose",
    title: "Semaglutide Dose Calculator",
    description:
      "Check your treatment stage, FDA dose schedule (Wegovy & Ozempic) and estimated drug activity",
    href: "/health/semaglutide-dose-calculator",
    category: "Health",
    tags: ["semaglutide", "wegovy", "ozempic", "dosing", "titration", "weight loss"],
    keywords: [
      "semaglutide dose calculator",
      "semaglutide dosage calculator",
      "wegovy dose schedule",
      "ozempic dose schedule",
      "semaglutide titration",
    ],
  },
  {
    id: "tirzepatide-dose",
    title: "Tirzepatide Dose Calculator",
    description:
      "Check your treatment stage, FDA weekly dose schedule (Mounjaro & Zepbound) and estimated drug activity",
    href: "/health/tirzepatide-dose-calculator",
    category: "Health",
    tags: ["tirzepatide", "mounjaro", "zepbound", "dosing", "titration", "weight loss"],
    keywords: [
      "tirzepatide dose calculator",
      "tirzepatide dosage calculator",
      "mounjaro dose calculator",
      "zepbound dose calculator",
      "tirzepatide weekly dose",
      "tirzepatide dose chart",
    ],
  },
  {
    id: "glp-1-half-life",
    title: "GLP-1 Half-Life Calculator",
    description:
      "See how much of your GLP-1 medication is still active today, and when your next injection is due",
    href: "/health/glp-1-half-life-calculator",
    category: "Health",
    tags: ["glp-1", "half life", "drug level", "semaglutide", "tirzepatide", "injection timing"],
    keywords: [
      "glp-1 half-life calculator",
      "semaglutide half-life calculator",
      "ozempic half-life calculator",
      "tirzepatide half-life calculator",
      "glp-1 drug level calculator",
      "how long does semaglutide stay in your system",
    ],
  },
  {
    id: "glp-1-unit-converter",
    title: "GLP-1 Unit Converter",
    description:
      "Convert mg, mL and syringe units with your own concentration, and check the dose before you draw it",
    href: "/health/glp-1-unit-converter",
    category: "Health",
    tags: ["glp-1", "unit converter", "syringe", "semaglutide", "tirzepatide", "compounded", "dosing"],
    keywords: [
      "glp-1 unit converter",
      "semaglutide unit converter",
      "tirzepatide unit converter",
      "mg to units calculator",
      "units to mg converter",
      "glp-1 syringe calculator",
      "how many units is 0.5 mg",
    ],
  },
  {
    id: "glp-1-injection-day",
    title: "GLP-1 Injection Day Calculator",
    description:
      "See when your next dose is due, whether you can move your injection day, and what to do about a missed dose",
    href: "/health/glp-1-injection-day-calculator",
    category: "Health",
    tags: ["glp-1", "injection day", "schedule", "missed dose", "semaglutide", "tirzepatide"],
    keywords: [
      "glp-1 injection day calculator",
      "when is my next glp-1 injection",
      "can i change my injection day",
      "missed glp-1 dose",
      "best day to inject glp-1",
      "glp-1 injection schedule calculator",
    ],
  },
  {
    id: "one-rep-max",
    title: "One-Rep Max Calculator",
    description: "Calculate your one-rep max (1RM) to determine your maximum lifting strength",
    href: "/health/one-rep-max-calculator",
    category: "Health",
    tags: ["one-rep max", "1rm", "lifting", "strength", "fitness"],
    keywords: ["one-rep max calculator", "1rm calculator", "weightlifting maximum", "strength training"],
  },
  {
    id: "running-pace",
    title: "Running Pace Calculator",
    description: "Calculate your running pace, time, or distance for your training and races",
    href: "/health/running-pace-calculator",
    category: "Health",
    tags: ["running", "pace", "speed", "endurance", "fitness"],
    keywords: ["running pace calculator", "marathon pace", "running speed", "race time predictor"],
  },
  {
    id: "calories-burned",
    title: "Calories Burned Calculator",
    description: "Estimate the number of calories burned during various exercises and activities",
    href: "/health/calories-burned-calculator",
    category: "Health",
    tags: ["calories burned", "energy expenditure", "exercise", "weight loss", "fitness"],
    keywords: ["calories burned calculator", "exercise calorie counter", "activity energy expenditure", "fitness tracking"],
  },
  {
    id: "wilks",
    title: "Wilks Calculator",
    description: "Calculate your Wilks Score to measure your relative powerlifting strength",
    href: "/health/wilks-calculator",
    category: "Health",
    tags: ["wilks", "powerlifting", "strength", "score", "fitness"],
    keywords: ["wilks calculator", "wilks score", "powerlifting coefficient", "relative strength"],
  },
  {
    id: "draw-length",
    title: "Draw Length Calculator",
    description: "Calculate your ideal archery draw length based on your arm span",
    href: "/health/draw-length-calculator",
    category: "Health",
    tags: ["draw length", "archery", "arm span", "sports"],
    keywords: ["draw length calculator", "archery draw length", "bow sizing", "arm span measurement"],
  }
]

export function searchCalculators(query: string): Calculator[] {
  if (!query.trim()) return calculators

  const searchTerm = query.toLowerCase().trim()

  return calculators.filter((calc) => {
    // Search in title
    if (calc.title.toLowerCase().includes(searchTerm)) return true

    // Search in description
    if (calc.description.toLowerCase().includes(searchTerm)) return true

    // Search in category
    if (calc.category.toLowerCase().includes(searchTerm)) return true

    // Search in tags
    if (calc.tags.some((tag) => tag.toLowerCase().includes(searchTerm))) return true

    // Search in keywords
    if (calc.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm))) return true

    return false
  })
}

export function getCalculatorsByCategory(category: string): Calculator[] {
  return calculators.filter((calc) => calc.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(calculators.map((calc) => calc.category)))
}