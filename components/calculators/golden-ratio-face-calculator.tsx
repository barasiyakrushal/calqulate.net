"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  X,
  Camera,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Ruler,
  Eye,
  Star,
  Info,
  Lightbulb,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Percent,
  ScanFace,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { parseNumber } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ─────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────

interface FaceLandmarks {
  faceLength: number;
  faceWidth: number;
  foreheadWidth: number;
  noseWidth: number;
  lipWidth: number;
  eyeSpacing: number;
  jawWidth: number;
}

interface GoldenRatioResult {
  overallScore: number;
  symmetryScore: number;
  proportionScore: number;
  featureHarmonyScore: number;
  faceShape: string;
  label: string;
  labelColor: string;
  explanation: string;
  tips: string[];
  whatThisMeans: string;
  ratioBreakdown: {
    faceRatio: number;
    nasalRatio: number;
    orbitalRatio: number;
    mandibularRatio: number;
  };
}

type CalculatorMode = "upload" | "manual";
type AppState = "idle" | "uploading" | "calculating" | "result" | "error";

// ─────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────

const GOLDEN_RATIO = 1.618;

const manualSchema = z.object({
  faceLength: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(parseNumber(v)) && parseNumber(v) > 0, "Enter a valid measurement"),
  faceWidth: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(parseNumber(v)) && parseNumber(v) > 0, "Enter a valid measurement"),
  foreheadWidth: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(parseNumber(v)) && parseNumber(v) > 0, "Enter a valid measurement"),
  noseWidth: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(parseNumber(v)) && parseNumber(v) > 0, "Enter a valid measurement"),
  lipWidth: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(parseNumber(v)) && parseNumber(v) > 0, "Enter a valid measurement"),
  eyeSpacing: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(parseNumber(v)) && parseNumber(v) > 0, "Enter a valid measurement"),
  jawWidth: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(parseNumber(v)) && parseNumber(v) > 0, "Enter a valid measurement"),
});

type ManualFormValues = z.infer<typeof manualSchema>;

// ─────────────────────────────────────────────
// HELPER: SCORE FROM RATIO DEVIATION
// How close is a ratio to the golden ratio 1.618?
// ─────────────────────────────────────────────
function ratioScore(actual: number, ideal: number = GOLDEN_RATIO): number {
  const deviation = Math.abs(actual - ideal) / ideal;
  const score = Math.max(0, 100 - deviation * 200);
  return Math.round(score);
}

// ─────────────────────────────────────────────
// HELPER: DETERMINE FACE SHAPE
// Based on width-to-length ratio and jaw vs forehead proportion
// ─────────────────────────────────────────────
function detectFaceShape(m: FaceLandmarks): string {
  const wlRatio = m.faceWidth / m.faceLength;
  const jawForeheadRatio = m.jawWidth / m.foreheadWidth;

  if (wlRatio > 0.85) return "Round";
  if (wlRatio < 0.65) return "Oblong";
  if (jawForeheadRatio < 0.75) return "Heart";
  if (jawForeheadRatio > 1.1) return "Pear";
  if (wlRatio >= 0.75 && wlRatio <= 0.85) return "Square";
  return "Oval";
}

// ─────────────────────────────────────────────
// HELPER: SHORT DESCRIPTION FOR A DETECTED FACE SHAPE
// Used in the combined harmony + face-shape report
// ─────────────────────────────────────────────
function faceShapeDescription(shape: string): string {
  const map: Record<string, string> = {
    Oval: "Balanced length-to-width with a gently rounded jaw — the proportion most associated with golden ratio harmony.",
    Round: "Width and length are close to equal with soft curves, giving a youthful, full appearance.",
    Oblong: "Noticeably longer than it is wide, with a straighter cheek line for an elegant, elongated look.",
    Heart: "A wider forehead tapering to a narrower chin, drawing focus toward the eyes.",
    Pear: "A narrower forehead with a fuller jaw, grounding the proportions toward the lower face.",
    Square: "Forehead, cheeks and jaw are similar in width with a strong, defined jawline.",
  };
  return map[shape] || "A distinctive proportion blend that gives your face its own character.";
}

// ─────────────────────────────────────────────
// CORE SCORING FUNCTION
// Golden ratio reference: 1.618
// Each sub-score is weighted into the overall
// ─────────────────────────────────────────────
function calculateGoldenRatioScore(m: FaceLandmarks): GoldenRatioResult {
  // --- Ratio calculations ---
  // 1. Face length to width (ideal ≈ 1.618)
  const faceRatio = m.faceLength / m.faceWidth;

  // 2. Nasal width to eye spacing (ideal ≈ 1 : 1.618)
  const nasalRatio = m.eyeSpacing / m.noseWidth;

  // 3. Eye spacing to forehead width
  const orbitalRatio = m.foreheadWidth / m.eyeSpacing;

  // 4. Jaw to face width (ideal ≈ 0.618 — the golden complement)
  const mandibularRatio = m.jawWidth / m.faceWidth;

  // --- Sub-scores ---
  const faceRatioScore = ratioScore(faceRatio, GOLDEN_RATIO);
  const nasalScore = ratioScore(nasalRatio, GOLDEN_RATIO);
  const orbitalScore = ratioScore(orbitalRatio, GOLDEN_RATIO);
  const mandibularScore = ratioScore(mandibularRatio, 1 / GOLDEN_RATIO);

  // Proportion score = average of ratios
  const proportionScore = Math.round(
    (faceRatioScore + nasalScore + orbitalScore + mandibularScore) / 4
  );

  // Symmetry score — simulated from forehead/jaw balance + lip/nose alignment
  // NOTE: When MediaPipe or face-api.js is integrated, replace this with
  // actual landmark symmetry calculation (left vs right side distances)
  const symmetryRaw =
    100 -
    Math.abs(m.foreheadWidth - m.jawWidth) / Math.max(m.foreheadWidth, m.jawWidth) * 60 -
    Math.abs(m.noseWidth - m.lipWidth * 0.8) / m.lipWidth * 40;
  const symmetryScore = Math.round(Math.max(30, Math.min(100, symmetryRaw)));

  // Feature harmony: lip width to nose width + eye spacing to face width
  const lipNoseScore = ratioScore(m.lipWidth / m.noseWidth, 1.4);
  const eyeFaceScore = ratioScore((m.eyeSpacing * 2) / m.faceWidth, 0.618);
  const featureHarmonyScore = Math.round((lipNoseScore + eyeFaceScore) / 2);

  // Overall score (weighted)
  const overallScore = Math.round(
    proportionScore * 0.4 +
    symmetryScore * 0.3 +
    featureHarmonyScore * 0.3
  );

  // --- Label & explanation ---
  let label = "Low Ratio Match";
  let labelColor = "bg-amber-100 text-amber-800";
  let explanation =
    "Your facial proportions show a unique character. Every face has its own natural beauty beyond any mathematical formula.";

  if (overallScore >= 85) {
    label = "Excellent Harmony";
    labelColor = "bg-emerald-100 text-emerald-800";
    explanation =
      "Your facial proportions align closely with golden ratio principles. Your face displays a naturally harmonious balance that many find visually appealing.";
  } else if (overallScore >= 70) {
    label = "Well Balanced";
    labelColor = "bg-sky-100 text-sky-800";
    explanation =
      "Your facial features show strong proportion balance. Your face has a pleasing symmetry that sits comfortably within the golden ratio range.";
  } else if (overallScore >= 55) {
    label = "Moderately Balanced";
    labelColor = "bg-violet-100 text-violet-800";
    explanation =
      "Your face shows good proportional harmony in several areas. Like most people, there's a natural variation that gives your face its distinctive character.";
  }

  const faceShape = detectFaceShape(m);

  // --- Personalized tips ---
  const tips = buildPersonalizedTips(faceShape, symmetryScore, overallScore);

  const whatThisMeans = `Your score of ${overallScore}/100 reflects how closely your facial proportions align with the golden ratio (1.618), a pattern found in many naturally pleasing faces. This is an aesthetic analysis tool — not a measure of beauty or worth. Every face is uniquely beautiful in ways numbers cannot capture.`;

  return {
    overallScore,
    symmetryScore,
    proportionScore,
    featureHarmonyScore,
    faceShape,
    label,
    labelColor,
    explanation,
    tips,
    whatThisMeans,
    ratioBreakdown: { faceRatio, nasalRatio, orbitalRatio, mandibularRatio },
  };
}

// ─────────────────────────────────────────────
// HELPER: PERSONALIZED TIPS BY FACE SHAPE
// ─────────────────────────────────────────────
function buildPersonalizedTips(
  faceShape: string,
  symmetryScore: number,
  overallScore: number
): string[] {
  const tips: string[] = [];

  const shapeTips: Record<string, string> = {
    Oval: "Oval faces suit most hairstyles — try soft layered cuts or center-parted styles to highlight your balanced proportions.",
    Round: "Add vertical definition with longer hairstyles or slight height at the crown. Angular cuts can help elongate your look.",
    Oblong: "Add width with side-swept bangs or voluminous sides to visually shorten face length.",
    Heart: "Balance a wider forehead with fuller hairstyles at the jaw area. Side-swept styles work beautifully.",
    Pear: "Draw attention upward with volume at the crown or temples. Bold earrings near the eye level can help balance proportions.",
    Square: "Soften strong jaw angles with rounded, layered haircuts or side parts. Avoid blunt straight cuts that emphasize angles.",
  };

  tips.push(shapeTips[faceShape] || "Experiment with different hairstyle lengths to discover what feels most balanced for your features.");

  if (symmetryScore < 70) {
    tips.push("Shooting photos at a slight 3/4 angle (not fully straight-on) tends to minimize natural asymmetry and looks great in portraits.");
  } else {
    tips.push("Your symmetry score is strong — straight-on photos and centered compositions tend to work well for you.");
  }

  tips.push("Good skincare creates a smooth, even skin tone that enhances the visual impression of facial harmony.");
  tips.push("Chin posture matters — a slight forward tilt of the chin in photos elongates the neck and improves the perceived face-to-neck ratio.");

  if (overallScore >= 70) {
    tips.push("Natural lighting (soft, from the side) will complement your facial proportions best in photos.");
  } else {
    tips.push("Front-facing soft light (like a ring light slightly above eye level) tends to flatter a wide range of facial structures.");
  }

  return tips;
}

// ─────────────────────────────────────────────
// MOCK CALCULATION (used when no landmark API is wired)
// Replace this block when integrating MediaPipe or face-api.js
// ─────────────────────────────────────────────
function mockFaceLandmarksFromImage(): FaceLandmarks {
  // INTEGRATION POINT: Replace this function with actual MediaPipe Face Landmarker
  // or face-api.js landmark extraction once the library is available.
  //
  // Example MediaPipe integration:
  //   const faceLandmarker = await FaceLandmarker.createFromOptions(vision, options);
  //   const result = faceLandmarker.detect(imageElement);
  //   const landmarks = result.faceLandmarks[0];
  //   return extractMeasurementsFromLandmarks(landmarks);
  //
  // Example face-api.js integration:
  //   const detection = await faceapi.detectSingleFace(img).withFaceLandmarks();
  //   return extractMeasurementsFromFaceApiLandmarks(detection.landmarks);

  // Randomize slightly for demo variety
  const base = {
    faceLength: 180 + (Math.random() - 0.5) * 30,
    faceWidth: 130 + (Math.random() - 0.5) * 20,
    foreheadWidth: 115 + (Math.random() - 0.5) * 15,
    noseWidth: 38 + (Math.random() - 0.5) * 8,
    lipWidth: 54 + (Math.random() - 0.5) * 10,
    eyeSpacing: 62 + (Math.random() - 0.5) * 10,
    jawWidth: 105 + (Math.random() - 0.5) * 15,
  };
  return base;
}

// ─────────────────────────────────────────────
// SCORE LABEL COLOR UTILITY
// ─────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-sky-600";
  if (score >= 55) return "text-violet-600";
  return "text-amber-600";
}

function progressColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-sky-500";
  if (score >= 55) return "bg-violet-500";
  return "bg-amber-500";
}


// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

interface CircularScoreProps {
  score: number;
  size?: number;
}

function CircularScore({ score, size = 140 }: CircularScoreProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const strokeColor =
    score >= 85
      ? "#10b981"
      : score >= 70
      ? "#0ea5e9"
      : score >= 55
      ? "#8b5cf6"
      : "#f59e0b";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${scoreColor(score)}`}>{score}</span>
        <span className="text-xs text-slate-500 font-medium mt-0.5">out of 100</span>
      </div>
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
}

function ScoreCard({ title, score, icon, description }: ScoreCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
              {icon}
            </div>
            <span className="text-sm font-semibold text-slate-700">{title}</span>
          </div>
          <span className={`text-lg font-bold ${scoreColor(score)}`}>{score}</span>
        </div>
        <div className="mb-2">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${progressColor(score)} transition-all duration-1000`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}


// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function GoldenRatioFaceCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("upload");
  const [appState, setAppState] = useState<AppState>("idle");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [result, setResult] = useState<GoldenRatioResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const form = useForm<ManualFormValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: {
      faceLength: "",
      faceWidth: "",
      foreheadWidth: "",
      noseWidth: "",
      lipWidth: "",
      eyeSpacing: "",
      jawWidth: "",
    },
  });

  // Scroll to results after calculation
  useEffect(() => {
    if (appState === "result" && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [appState]);

  // ─── File handling ───
  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setErrorMessage("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size should be under 10MB.");
      return;
    }
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setAppState("idle");
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ─── Calculation: Image mode ───
  const handleImageCalculate = async () => {
    if (!uploadedImage) return;
    setAppState("calculating");
    setErrorMessage(null);

    try {
      // INTEGRATION POINT: Replace this timeout + mock with real face detection.
      // When using MediaPipe Face Landmarker:
      //   1. Load the model: await FaceLandmarker.createFromOptions(...)
      //   2. Detect on the image element: faceLandmarker.detect(imgElement)
      //   3. Extract measurements from result.faceLandmarks[0]
      //   4. Pass real FaceLandmarks to calculateGoldenRatioScore()
      //
      // When using face-api.js:
      //   1. Load models: await faceapi.loadFaceLandmarkModel(modelPath)
      //   2. Detect: const d = await faceapi.detectSingleFace(img).withFaceLandmarks()
      //   3. Extract and pass measurements

      await new Promise((r) => setTimeout(r, 2200)); // Simulated processing time

      // Check if face was detected (replace with real detection check)
      const faceDetected = true; // REPLACE: check if landmarks were found

      if (!faceDetected) {
        setErrorMessage(
          "No face detected in this image. Please try a clearer, well-lit frontal photo."
        );
        setAppState("error");
        return;
      }

      const landmarks = mockFaceLandmarksFromImage();
      const calcResult = calculateGoldenRatioScore(landmarks);
      setResult(calcResult);
      setAppState("result");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setAppState("error");
    }
  };

  // ─── Calculation: Manual mode ───
  const onManualSubmit = (values: ManualFormValues) => {
    setAppState("calculating");
    setErrorMessage(null);

    const landmarks: FaceLandmarks = {
      faceLength: parseNumber(values.faceLength),
      faceWidth: parseNumber(values.faceWidth),
      foreheadWidth: parseNumber(values.foreheadWidth),
      noseWidth: parseNumber(values.noseWidth),
      lipWidth: parseNumber(values.lipWidth),
      eyeSpacing: parseNumber(values.eyeSpacing),
      jawWidth: parseNumber(values.jawWidth),
    };

    setTimeout(() => {
      const calcResult = calculateGoldenRatioScore(landmarks);
      setResult(calcResult);
      setAppState("result");
    }, 1200);
  };

  // ─── Reset ───
  const handleReset = () => {
    setUploadedImage(null);
    setResult(null);
    setAppState("idle");
    setErrorMessage(null);
    form.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCalculating = appState === "calculating";

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">

        {/* ── PAGE HEADER ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Golden Ratio Face Detector
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-3">
            Golden Ratio Face Calculator
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Upload your photo and explore how balanced your facial proportions
            appear with our Golden Ratio Face Detector.
          </p>
        </div>

        {/* ── INPUT CARD ── */}
        <Card className="rounded-2xl shadow-lg border border-slate-100 bg-white mb-8">
          <CardHeader className="pb-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-lg text-slate-800">
                Analyze Your Facial Harmony
              </CardTitle>
            </div>
            <CardDescription className="text-slate-500 mt-1">
              Choose how you&apos;d like to enter your measurements.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as CalculatorMode);
                setResult(null);
                setAppState("idle");
                setErrorMessage(null);
              }}
            >
              <TabsList className="grid w-full grid-cols-2 h-auto rounded-xl bg-slate-100 p-1 mb-6 gap-1">
                <TabsTrigger
                  value="upload"
                  className="rounded-lg text-xs sm:text-sm font-medium whitespace-normal text-center px-1.5 py-2 h-auto min-w-0 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-700"
                >
                  <Upload className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  Upload Photo
                </TabsTrigger>
                <TabsTrigger
                  value="manual"
                  className="rounded-lg text-xs sm:text-sm font-medium whitespace-normal text-center px-1.5 py-2 h-auto min-w-0 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-700"
                >
                  <Ruler className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  Manual Measurements
                </TabsTrigger>
              </TabsList>

              {/* ── TAB: UPLOAD ── */}
              <TabsContent value="upload" className="space-y-5">
                {!uploadedImage ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    aria-label="Upload face image"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    className={`
                      relative flex flex-col items-center justify-center
                      min-h-[220px] rounded-xl border-2 border-dashed
                      cursor-pointer transition-all duration-200 select-none
                      ${isDragOver
                        ? "border-amber-400 bg-amber-50/70"
                        : "border-slate-200 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/40"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-3 text-center px-6 py-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? "bg-amber-100" : "bg-slate-100"}`}>
                        <Upload className={`w-6 h-6 ${isDragOver ? "text-amber-600" : "text-slate-400"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 text-sm mb-1">
                          {isDragOver ? "Drop your photo here" : "Drag & drop your photo"}
                        </p>
                        <p className="text-xs text-slate-400">
                          or{" "}
                          <span className="text-amber-600 font-semibold underline underline-offset-2">
                            browse files
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        JPG, PNG, WEBP — up to 10MB
                      </p>
                      <p className="text-xs text-slate-400 bg-slate-100 rounded-lg px-3 py-1.5">
                        💡 Best results: clear, well-lit frontal photo
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleFileInput}
                      aria-label="Select face image"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                    {/* Preview */}
                    <div className="relative w-full flex items-center justify-center bg-slate-100" style={{ minHeight: 240 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadedImage}
                        alt="Uploaded face preview"
                        className="object-contain max-h-72 w-full"
                      />
                      {/* Overlay grid — aesthetic touch */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(180,150,80,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(180,150,80,0.5) 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedImage(null);
                        setResult(null);
                        setAppState("idle");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      aria-label="Remove uploaded image"
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-medium text-slate-600">Photo ready for analysis</span>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-amber-600 font-semibold hover:underline"
                      >
                        Change photo
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleFileInput}
                    />
                  </div>
                )}

                {errorMessage && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <Button
                  onClick={handleImageCalculate}
                  disabled={!uploadedImage || isCalculating}
                  className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50 transition-all"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing facial proportions…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Calculate My Golden Ratio Score
                    </>
                  )}
                </Button>

                {isCalculating && (
                  <div className="space-y-2">
                    <div className="text-xs text-center text-slate-400 font-medium">
                      Detecting facial landmarks and calculating proportions…
                    </div>
                    <Progress value={undefined} className="h-1.5 rounded-full bg-slate-100" />
                  </div>
                )}
              </TabsContent>

              {/* ── TAB: MANUAL ── */}
              <TabsContent value="manual">
                <div className="mb-4 flex items-start gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your facial measurements in <strong>millimeters</strong>. Use a flexible tape measure or photograph with scale for best results.
                  </p>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onManualSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(
                        [
                          { name: "faceLength", label: "Face Length (hairline to chin)" },
                          { name: "faceWidth", label: "Face Width (cheek to cheek)" },
                          { name: "foreheadWidth", label: "Forehead Width" },
                          { name: "noseWidth", label: "Nose Width (nostril to nostril)" },
                          { name: "lipWidth", label: "Lip Width (corner to corner)" },
                          { name: "eyeSpacing", label: "Eye Spacing (inner corner to inner corner)" },
                          { name: "jawWidth", label: "Jaw Width (jaw to jaw)" },
                        ] as { name: keyof ManualFormValues; label: string }[]
                      ).map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-slate-600">
                                {label} <span className="text-slate-400 font-normal">(mm)</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g. 120"
                                  type="number"
                                  inputMode="decimal"
                                  min="1"
                                  className="rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400/20 text-base h-11"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    {errorMessage && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errorMessage}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isCalculating}
                      className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50 transition-all"
                    >
                      {isCalculating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Calculating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Calculate My Golden Ratio Score
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ── RESULT SECTION ── */}
        {appState === "result" && result && (
          <div ref={resultRef} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Scroll cue */}
            <div className="flex justify-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ArrowDown className="w-3 h-3" />
                Your results are ready
              </div>
            </div>

            {/* ── HERO RESULT CARD ── */}
            <Card className="rounded-2xl border border-amber-100 shadow-lg bg-gradient-to-br from-white via-amber-50/40 to-white overflow-hidden">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  {/* Circular score */}
                  <div className="flex-shrink-0">
                    <CircularScore score={result.overallScore} size={148} />
                  </div>
                  {/* Text */}
                  <div className="flex-1 text-center sm:text-left">
                    <Badge className={`${result.labelColor} border-0 text-xs font-bold px-3 py-1 rounded-full mb-3`}>
                      {result.label}
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 leading-tight">
                      Discover Your Facial Harmony
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                      {result.explanation}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                      <Badge variant="outline" className="text-xs border-slate-200 text-slate-600 rounded-full">
                        Face Shape: <span className="font-semibold ml-1 text-slate-800">{result.faceShape}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 rounded-full">
                        φ = 1.618 reference
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── SCORE BREAKDOWN CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ScoreCard
                title="Symmetry Score"
                score={result.symmetryScore}
                icon={<Eye className="w-4 h-4" />}
                description="How evenly balanced your facial features appear across both sides."
              />
              <ScoreCard
                title="Proportion Balance"
                score={result.proportionScore}
                icon={<Ruler className="w-4 h-4" />}
                description="How closely key facial ratios align with the golden ratio (1.618)."
              />
              <ScoreCard
                title="Feature Harmony"
                score={result.featureHarmonyScore}
                icon={<Star className="w-4 h-4" />}
                description="How well individual features relate to each other in scale and spacing."
              />
            </div>

            {/* ── WHAT THIS MEANS ── */}
            <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5 px-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Info className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">What This Means</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{result.whatThisMeans}</p>

                {/* Mini ratio breakdown */}
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: "Face L/W Ratio", value: result.ratioBreakdown.faceRatio.toFixed(3), ideal: "1.618" },
                    { label: "Eye/Nose Ratio", value: result.ratioBreakdown.nasalRatio.toFixed(3), ideal: "1.618" },
                    { label: "Forehead/Eye", value: result.ratioBreakdown.orbitalRatio.toFixed(3), ideal: "1.618" },
                    { label: "Jaw/Face Ratio", value: result.ratioBreakdown.mandibularRatio.toFixed(3), ideal: "0.618" },
                  ].map(({ label, value, ideal }) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-xs text-slate-400 font-medium">{label}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm font-bold text-slate-800">{value}</span>
                        <span className="text-xs text-slate-400">/ {ideal} ideal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── FEATURE 1: GOLDEN RATIO MATCH (%) WITH MEASURED DISTANCES ── */}
            <Card className="rounded-2xl border border-emerald-100 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5 px-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Golden Ratio Match
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your facial harmony is a{" "}
                  <span className="font-bold text-emerald-700">{result.overallScore}% match</span>{" "}
                  to the 1.618 Golden Ratio. Below are the exact ratios measured between your
                  eyes, nose, lips and face that drive this score.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      label: "Eye spacing ÷ nose width",
                      value: result.ratioBreakdown.nasalRatio,
                      ideal: GOLDEN_RATIO,
                      idealLabel: "1.618",
                    },
                    {
                      label: "Forehead width ÷ eye spacing",
                      value: result.ratioBreakdown.orbitalRatio,
                      ideal: GOLDEN_RATIO,
                      idealLabel: "1.618",
                    },
                    {
                      label: "Face length ÷ face width",
                      value: result.ratioBreakdown.faceRatio,
                      ideal: GOLDEN_RATIO,
                      idealLabel: "1.618",
                    },
                    {
                      label: "Jaw width ÷ face width",
                      value: result.ratioBreakdown.mandibularRatio,
                      ideal: 1 / GOLDEN_RATIO,
                      idealLabel: "0.618",
                    },
                  ].map(({ label, value, ideal, idealLabel }) => {
                    const match = ratioScore(value, ideal);
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600">{label}</span>
                          <span className="text-slate-500">
                            <span className="font-bold text-slate-800">{value.toFixed(3)}</span>{" "}
                            / {idealLabel} ideal ·{" "}
                            <span className={`font-bold ${scoreColor(match)}`}>{match}%</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${progressColor(match)} transition-all duration-1000`}
                            style={{ width: `${match}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-4">
                  Each ratio compares two measured facial distances. The closer a ratio sits to its
                  golden ideal, the higher its individual match — together they form your overall harmony score.
                </p>
              </CardContent>
            </Card>

            {/* ── FEATURE 2: COMBINED HARMONY + FACE SHAPE REPORT ── */}
            <Card className="rounded-2xl border border-emerald-100 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5 px-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <ScanFace className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Your Complete Proportion Read
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  One report combining your symmetry and harmony scores with your detected
                  face shape, so you get the full picture of your proportions.
                </p>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Harmony Match", value: `${result.overallScore}%` },
                    { label: "Symmetry", value: `${result.symmetryScore}%` },
                    { label: "Proportion", value: `${result.proportionScore}%` },
                    { label: "Face Shape", value: result.faceShape },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 text-center"
                    >
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        {label}
                      </p>
                      <p className="text-base font-bold text-emerald-700 mt-1 leading-tight">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">{result.faceShape} face:</strong>{" "}
                    {faceShapeDescription(result.faceShape)}
                  </p>
                </div>

                <Link
                  href="/health/face-shape-calculator"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Confirm your face shape with the Face Shape Calculator
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            {/* ── PERSONALIZED TIPS ── */}
            <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5 px-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">Personalized Tips</h3>
                </div>
                <ul className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* ── DISCLAIMER ── */}
            <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-600">Disclaimer:</strong> This tool provides a visual facial proportion estimate based on golden ratio concepts and is not a medical or scientific diagnosis. Results are for informational and entertainment purposes only.
              </p>
            </div>

            {/* ── TRY ANOTHER ── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Another Image
              </Button>
              <Button
                onClick={() => {
                  if (mode === "upload") {
                    setUploadedImage(null);
                    setResult(null);
                    setAppState("idle");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    form.reset();
                    setResult(null);
                    setAppState("idle");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="flex-1 h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {appState === "error" && (
          <Card className="rounded-2xl border border-red-100 bg-red-50/50 shadow-sm">
            <CardContent className="py-8 px-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Analysis Unsuccessful</p>
                <p className="text-sm text-slate-500">
                  {errorMessage || "We couldn't detect a face clearly. Please try a well-lit, front-facing photo."}
                </p>
              </div>
              <Button
                onClick={handleReset}
                variant="outline"
                className="rounded-xl border-red-200 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}
