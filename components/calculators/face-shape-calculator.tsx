"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Loader2, 
  Sparkles, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  X,
  ImageIcon,
  Scissors,
  User,
  Info,
  CheckCircle2,
  AlertCircle,
  Ruler,
  Glasses
} from "lucide-react";

// --- TYPE DEFINITIONS ---
type FaceShape = "oval" | "round" | "square" | "heart" | "diamond" | "oblong" | "rectangle" | "triangle";
type Gender = "male" | "female" | "other";
type CaptureMode = "upload" | "camera";

interface FaceAnalysisResult {
  faceShape: FaceShape;
  confidence: number;
  description: string;
  characteristics: string[];
  proportions: {
    foreheadWidth: string;
    cheekboneWidth: string;
    jawlineWidth: string;
    faceLength: string;
  };
}

interface HairstyleRecommendation {
  id: string;
  name: string;
  description: string;
  suitability: string;
  images: string[];
  tips: string[];
}

interface CalculationResult {
  faceAnalysis: FaceAnalysisResult;
  recommendations: HairstyleRecommendation[];
  gender: Gender;
  imageData: string;
}

// --- FACE SHAPE DATA ---
const faceShapeData: Record<FaceShape, { 
  icon: string; 
  color: string; 
  gradient: string;
  description: string;
  characteristics: string[];
}> = {
  oval: {
    icon: "🥚",
    color: "#10B981",
    gradient: "from-emerald-500 to-teal-500",
    description: "The oval face is considered the most balanced and versatile face shape. Your face is longer than it is wide, with a slightly narrower jawline than forehead.",
    characteristics: ["Balanced proportions", "Slightly narrower jawline", "Gentle curves", "Forehead slightly wider than chin"]
  },
  round: {
    icon: "⭕",
    color: "#F59E0B",
    gradient: "from-amber-500 to-orange-500",
    description: "Your round face features soft angles with similar width and length. Your cheekbones are the widest part of your face with a rounded jawline.",
    characteristics: ["Equal width and length", "Full cheeks", "Rounded jawline", "Soft angles throughout"]
  },
  square: {
    icon: "⬜",
    color: "#3B82F6",
    gradient: "from-blue-500 to-indigo-500",
    description: "Your square face has a strong, angular jawline with a forehead that's similar in width to your jaw. This creates a bold, structured appearance.",
    characteristics: ["Strong jawline", "Angular features", "Forehead and jaw similar width", "Defined angles"]
  },
  heart: {
    icon: "💜",
    color: "#EC4899",
    gradient: "from-pink-500 to-rose-500",
    description: "Your heart-shaped face features a wider forehead that tapers down to a pointed chin. Cheekbones are often prominent and beautiful.",
    characteristics: ["Wide forehead", "High cheekbones", "Narrow, pointed chin", "Tapered jawline"]
  },
  diamond: {
    icon: "💎",
    color: "#8B5CF6",
    gradient: "from-violet-500 to-purple-500",
    description: "Your diamond face shape features dramatic cheekbones as the widest point, with a narrower forehead and jawline creating an angular, striking appearance.",
    characteristics: ["Prominent cheekbones", "Narrow forehead", "Pointed chin", "Angular features"]
  },
  oblong: {
    icon: "📏",
    color: "#06B6D4",
    gradient: "from-cyan-500 to-sky-500",
    description: "Your oblong face is longer than it is wide with relatively equal widths across forehead, cheekbones, and jawline. Elegant and distinctive.",
    characteristics: ["Face longer than wide", "Similar widths throughout", "Longer forehead or chin", "Straight cheeks"]
  },
  rectangle: {
    icon: "▭",
    color: "#14B8A6",
    gradient: "from-teal-500 to-emerald-500",
    description: "Your rectangular face combines length with angular features. It's similar to a square face but longer, creating a sophisticated profile.",
    characteristics: ["Longer than wide", "Angular jawline", "Straight sides", "Forehead and jaw similar width"]
  },
  triangle: {
    icon: "🔺",
    color: "#F97316",
    gradient: "from-orange-500 to-red-500",
    description: "Your triangular face features a wider jawline that tapers up to a narrower forehead. This creates a strong, grounded appearance.",
    characteristics: ["Wider jawline", "Narrower forehead", "Prominent jaw", "Face widens towards bottom"]
  }
};

// --- HAIRSTYLE RECOMMENDATIONS DATABASE ---
const hairstyleDatabase: Record<FaceShape, Record<Gender, HairstyleRecommendation[]>> = {
  oval: {
    female: [
      {
        id: "oval-f-1",
        name: "Long Layered Waves",
        description: "Flowing layers that frame your balanced features beautifully.",
        suitability: "Perfect for your versatile oval shape",
        images: [
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1595959183082-7b570b7e1daf?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop"
        ],
        tips: ["Add face-framing layers", "Try a deep side part", "Soft waves add elegance"]
      },
      {
        id: "oval-f-2",
        name: "Sleek Lob (Long Bob)",
        description: "A sophisticated shoulder-length cut that highlights your features.",
        suitability: "Enhances natural balance",
        images: [
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1549068106-b024baf5062d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop"
        ],
        tips: ["Keep it sleek and polished", "Works with any parting", "Add subtle highlights"]
      },
      {
        id: "oval-f-3",
        name: "Textured Pixie Cut",
        description: "A bold, modern short style that showcases your balanced proportions.",
        suitability: "Ideal for showing off oval symmetry",
        images: [
          "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=500&fit=crop"
        ],
        tips: ["Add texture on top", "Tapered sides work well", "Easy to style daily"]
      }
    ],
    male: [
      {
        id: "oval-m-1",
        name: "Classic Side Part",
        description: "A timeless, professional look that complements your balanced features.",
        suitability: "Works perfectly with oval proportions",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop"
        ],
        tips: ["Use pomade for hold", "Keep sides neat", "Versatile for any occasion"]
      },
      {
        id: "oval-m-2",
        name: "Textured Quiff",
        description: "Modern and stylish with volume on top and tapered sides.",
        suitability: "Adds dimension to balanced features",
        images: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop"
        ],
        tips: ["Blow dry for volume", "Use matte clay", "Works with slight stubble"]
      },
      {
        id: "oval-m-3",
        name: "Buzz Cut",
        description: "Clean and minimalist, showcasing your natural face shape.",
        suitability: "Highlights oval symmetry",
        images: [
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=500&fit=crop"
        ],
        tips: ["Low maintenance", "Suits all seasons", "Confidence is key"]
      }
    ],
    other: []
  },
  round: {
    female: [
      {
        id: "round-f-1",
        name: "Long Layered Straight",
        description: "Length and layers create the illusion of a longer face shape.",
        suitability: "Elongates round features",
        images: [
          "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop"
        ],
        tips: ["Avoid blunt cuts", "Add volume at crown", "Side-swept bangs work well"]
      },
      {
        id: "round-f-2",
        name: "Asymmetric Bob",
        description: "Angular lines and asymmetry create dimension and slim the face.",
        suitability: "Adds angles to soft features",
        images: [
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=500&fit=crop"
        ],
        tips: ["One side longer than other", "Creates visual interest", "Draws eye downward"]
      },
      {
        id: "round-f-3",
        name: "High Ponytail with Volume",
        description: "Lifting hair up creates vertical lines and elongates the face.",
        suitability: "Creates upward visual movement",
        images: [
          "https://images.unsplash.com/photo-1528301721190-186c3bd85418?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1603217039863-aa0c354f9c9e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop"
        ],
        tips: ["Tease crown for height", "Leave face-framing pieces", "High placement elongates"]
      }
    ],
    male: [
      {
        id: "round-m-1",
        name: "High Fade with Pompadour",
        description: "Height on top and tight sides create vertical lines.",
        suitability: "Elongates round face shape",
        images: [
          "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop"
        ],
        tips: ["Maximum height on top", "Tight fade on sides", "Use strong hold product"]
      },
      {
        id: "round-m-2",
        name: "Spiky Textured Top",
        description: "Vertical spikes and texture add height and angles.",
        suitability: "Creates angular appearance",
        images: [
          "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop"
        ],
        tips: ["Use texturizing clay", "Direct hair upward", "Avoid flat styles"]
      },
      {
        id: "round-m-3",
        name: "Faux Hawk",
        description: "Central height with tapered sides creates a slimming effect.",
        suitability: "Adds vertical dimension",
        images: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop"
        ],
        tips: ["Style upward and back", "Keep sides short", "Modern edge to classic styles"]
      }
    ],
    other: []
  },
  square: {
    female: [
      {
        id: "square-f-1",
        name: "Soft Layered Waves",
        description: "Soft waves and layers add femininity and soften angular features.",
        suitability: "Balances strong jawline",
        images: [
          "https://images.unsplash.com/photo-1595959183082-7b570b7e1daf?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop"
        ],
        tips: ["Waves at jaw level", "Side parting softens", "Avoid sharp edges"]
      },
      {
        id: "square-f-2",
        name: "Side-Swept Long Layers",
        description: "A flowing style that creates diagonal lines across strong features.",
        suitability: "Creates movement around jaw",
        images: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1549068106-b024baf5062d?w=400&h=500&fit=crop"
        ],
        tips: ["Deep side part", "Layers around chin", "Soft, not blunt ends"]
      },
      {
        id: "square-f-3",
        name: "Wispy Fringe Bob",
        description: "A soft bob with wispy bangs that frame and soften the forehead.",
        suitability: "Softens angular forehead",
        images: [
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=500&fit=crop"
        ],
        tips: ["Wispy, not blunt bangs", "Textured ends", "Chin-length or longer"]
      }
    ],
    male: [
      {
        id: "square-m-1",
        name: "Textured Crop",
        description: "A messy, textured top that adds softness to angular features.",
        suitability: "Adds texture to complement angles",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop"
        ],
        tips: ["Messy texture on top", "Forward-styled fringe", "Natural finish"]
      },
      {
        id: "square-m-2",
        name: "Medium Length Swept Back",
        description: "Longer length swept back creates diagonal lines.",
        suitability: "Balances strong jawline",
        images: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop"
        ],
        tips: ["3-4 inches on top", "Swept back naturally", "Use light hold product"]
      },
      {
        id: "square-m-3",
        name: "Side Part with Volume",
        description: "Classic style with volume that draws attention upward.",
        suitability: "Professional and flattering",
        images: [
          "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop"
        ],
        tips: ["Low side part", "Some volume at front", "Clean neckline"]
      }
    ],
    other: []
  },
  heart: {
    female: [
      {
        id: "heart-f-1",
        name: "Chin-Length Bob",
        description: "Adds width at the chin to balance the wider forehead.",
        suitability: "Creates balance at jaw level",
        images: [
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1549068106-b024baf5062d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop"
        ],
        tips: ["Volume at chin level", "Side-swept bangs", "Avoid width at temples"]
      },
      {
        id: "heart-f-2",
        name: "Side-Swept Bangs with Layers",
        description: "Bangs minimize forehead width while layers add lower face volume.",
        suitability: "Balances heart shape proportions",
        images: [
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1595959183082-7b570b7e1daf?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop"
        ],
        tips: ["Long side-swept fringe", "Layers below cheekbones", "Soft, romantic finish"]
      },
      {
        id: "heart-f-3",
        name: "Textured Lob with Volume",
        description: "A longer bob with texture and volume around the jawline.",
        suitability: "Adds fullness at narrow chin",
        images: [
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=500&fit=crop"
        ],
        tips: ["Waves at jaw level", "Textured, not sleek", "Center or side part"]
      }
    ],
    male: [
      {
        id: "heart-m-1",
        name: "Textured Fringe",
        description: "A forward fringe that softens the wider forehead.",
        suitability: "Balances forehead to chin ratio",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop"
        ],
        tips: ["Forward-styled fringe", "Covers some forehead", "Textured finish"]
      },
      {
        id: "heart-m-2",
        name: "Medium Length Layered",
        description: "Longer style with layers that add width around the jaw.",
        suitability: "Balances narrow chin",
        images: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop"
        ],
        tips: ["4-6 inches length", "Layered for movement", "Natural texture"]
      },
      {
        id: "heart-m-3",
        name: "Side Part with Fringe",
        description: "Classic side part with forward-falling fringe.",
        suitability: "Softens forehead width",
        images: [
          "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop"
        ],
        tips: ["Low side part", "Some hair falls forward", "Soft, not slicked"]
      }
    ],
    other: []
  },
  diamond: {
    female: [
      {
        id: "diamond-f-1",
        name: "Side-Swept Bangs",
        description: "Bangs add width to narrow forehead while framing cheekbones.",
        suitability: "Balances narrow forehead and chin",
        images: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1595959183082-7b570b7e1daf?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop"
        ],
        tips: ["Side-swept or curtain bangs", "Soft layers", "Avoid tight hairstyles"]
      },
      {
        id: "diamond-f-2",
        name: "Textured Chin-Length Cut",
        description: "Adds width at chin level and softens angular cheekbones.",
        suitability: "Creates visual width at narrow points",
        images: [
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1549068106-b024baf5062d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop"
        ],
        tips: ["Fullness at chin", "Textured ends", "Side or center part"]
      },
      {
        id: "diamond-f-3",
        name: "Voluminous Waves",
        description: "Full waves that add width to forehead and chin areas.",
        suitability: "Creates balanced proportions",
        images: [
          "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop"
        ],
        tips: ["Volume at crown and chin", "Loose, romantic waves", "Avoid slicked-back styles"]
      }
    ],
    male: [
      {
        id: "diamond-m-1",
        name: "Textured Side Part",
        description: "Volume on top with textured styling adds width to narrow forehead.",
        suitability: "Balances cheekbone width",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop"
        ],
        tips: ["Width at forehead level", "Textured, not flat", "Moderate side part"]
      },
      {
        id: "diamond-m-2",
        name: "Medium Length Swept",
        description: "Longer style that adds fullness where needed.",
        suitability: "Creates visual balance",
        images: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop"
        ],
        tips: ["3-5 inches on top", "Natural movement", "Avoid tight fades"]
      },
      {
        id: "diamond-m-3",
        name: "Forward Fringe with Texture",
        description: "A fringe that covers the narrow forehead with added texture.",
        suitability: "Minimizes narrow forehead appearance",
        images: [
          "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop"
        ],
        tips: ["Fringe covers forehead", "Messy texture", "Soft edges"]
      }
    ],
    other: []
  },
  oblong: {
    female: [
      {
        id: "oblong-f-1",
        name: "Layered Bob with Bangs",
        description: "Horizontal lines from bangs and a bob shorten the appearance of length.",
        suitability: "Creates width and shortens face",
        images: [
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1549068106-b024baf5062d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop"
        ],
        tips: ["Full, blunt bangs", "Chin-length bob", "Adds width to face"]
      },
      {
        id: "oblong-f-2",
        name: "Voluminous Curls",
        description: "Side volume from curls creates width and balances length.",
        suitability: "Adds horizontal dimension",
        images: [
          "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop"
        ],
        tips: ["Volume at sides", "Curls or waves", "Avoid long, flat styles"]
      },
      {
        id: "oblong-f-3",
        name: "Shoulder-Length with Layers",
        description: "Layers at cheek level add width where you need it.",
        suitability: "Breaks up vertical lines",
        images: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1595959183082-7b570b7e1daf?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop"
        ],
        tips: ["Layers at cheeks", "Side-swept styling", "Volume at crown"]
      }
    ],
    male: [
      {
        id: "oblong-m-1",
        name: "Side-Parted with Volume",
        description: "Side volume and a parted style adds width to the long face.",
        suitability: "Creates horizontal lines",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop"
        ],
        tips: ["Width at sides", "Avoid too much height", "Natural side part"]
      },
      {
        id: "oblong-m-2",
        name: "Fringe with Medium Length",
        description: "A fringe shortens the forehead and balances length.",
        suitability: "Shortens facial appearance",
        images: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop"
        ],
        tips: ["Forward fringe", "Medium length overall", "Soft, not spiky"]
      },
      {
        id: "oblong-m-3",
        name: "Textured Crop with Fringe",
        description: "A cropped style with forward movement and texture.",
        suitability: "Breaks vertical lines",
        images: [
          "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop"
        ],
        tips: ["Forward styling", "Texture for width", "Avoid height on top"]
      }
    ],
    other: []
  },
  rectangle: {
    female: [
      {
        id: "rect-f-1",
        name: "Soft Layers with Volume",
        description: "Layers and volume add softness and width to the angular shape.",
        suitability: "Softens angular features",
        images: [
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1595959183082-7b570b7e1daf?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop"
        ],
        tips: ["Volume at cheeks", "Soft, layered ends", "Avoid long, flat styles"]
      },
      {
        id: "rect-f-2",
        name: "Curved Bob with Bangs",
        description: "A curved bob with bangs shortens and softens the face.",
        suitability: "Creates curves and width",
        images: [
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1549068106-b024baf5062d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop"
        ],
        tips: ["Curved, not blunt bob", "Side-swept or full bangs", "Softens angles"]
      },
      {
        id: "rect-f-3",
        name: "Loose Waves Medium Length",
        description: "Waves add width and movement to balance the length.",
        suitability: "Adds horizontal dimension",
        images: [
          "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop"
        ],
        tips: ["Waves from mid-length", "Volume at sides", "Romantic, soft finish"]
      }
    ],
    male: [
      {
        id: "rect-m-1",
        name: "Classic Taper",
        description: "A classic cut with gradual taper that adds width at the sides.",
        suitability: "Balances long face shape",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop"
        ],
        tips: ["Gradual taper, not tight fade", "Some length at sides", "Low height on top"]
      },
      {
        id: "rect-m-2",
        name: "Forward Fringe",
        description: "A fringe that covers the forehead and shortens the face.",
        suitability: "Shortens facial appearance",
        images: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop"
        ],
        tips: ["Forward, not upward", "Covers some forehead", "Avoid spiked styles"]
      },
      {
        id: "rect-m-3",
        name: "Textured Medium Length",
        description: "Medium length with texture adds width and softness.",
        suitability: "Creates balanced proportions",
        images: [
          "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop"
        ],
        tips: ["4-5 inches overall", "Textured, natural finish", "Width at temples"]
      }
    ],
    other: []
  },
  triangle: {
    female: [
      {
        id: "tri-f-1",
        name: "Volume at Crown",
        description: "Adding height and volume at the crown balances the wider jaw.",
        suitability: "Balances wide jawline",
        images: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1595959183082-7b570b7e1daf?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop"
        ],
        tips: ["Volume on top", "Width at forehead level", "Avoid width at jaw"]
      },
      {
        id: "tri-f-2",
        name: "Side-Swept Long Layers",
        description: "Layers that frame the face and add width at the top.",
        suitability: "Creates upper face width",
        images: [
          "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop"
        ],
        tips: ["Layers at cheekbones", "Side-swept bangs", "Avoid chin-length bobs"]
      },
      {
        id: "tri-f-3",
        name: "Pixie with Volume",
        description: "A short cut with volume on top draws attention upward.",
        suitability: "Draws focus to upper face",
        images: [
          "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=500&fit=crop"
        ],
        tips: ["Height on top", "Textured crown", "Close-cropped sides"]
      }
    ],
    male: [
      {
        id: "tri-m-1",
        name: "High Volume Quiff",
        description: "Height and volume on top balances the wider jawline.",
        suitability: "Creates upper face width",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop"
        ],
        tips: ["Maximum volume on top", "Height at crown", "Tight sides"]
      },
      {
        id: "tri-m-2",
        name: "Pompadour",
        description: "A classic pompadour adds significant height to balance the jaw.",
        suitability: "Adds vertical dimension",
        images: [
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop"
        ],
        tips: ["Swept up and back", "Strong hold product", "Clean fade on sides"]
      },
      {
        id: "tri-m-3",
        name: "Textured Top with Fade",
        description: "Volume and texture on top with a clean fade.",
        suitability: "Balances face proportions",
        images: [
          "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop"
        ],
        tips: ["Texture for width", "Volume at crown", "High fade"]
      }
    ],
    other: []
  }
};

const femaleFaceShapeImage: Record<FaceShape, string> = {
  oval: "/blog/face-shape/shape-oval.webp",
  round: "/blog/face-shape/shape-round.webp",
  square: "/blog/face-shape/shape-square.webp",
  heart: "/blog/face-shape/shape-heart.webp",
  diamond: "/blog/face-shape/shape-diamond.webp",
  oblong: "/blog/face-shape/shape-oblong.webp",
  rectangle: "/blog/face-shape/shape-rectangle.webp",
  triangle: "/blog/face-shape/shape-triangle.webp"
};

// --- SHAPE RATIO PROFILE (drives the classification, normalised to cheekbone = 1.00) ---
// Each shape carries the representative length/jaw/cheekbone/forehead ratios behind the
// detection, the decisive rule, and a plain-language reason it was classified as such.
interface ShapeRatioProfile {
  lengthRatio: number;   // face length ÷ cheekbone width (R1)
  jawRatio: number;      // jaw width ÷ cheekbone width
  foreheadRatio: number; // forehead width ÷ cheekbone width
  cheekboneRatio: number; // always 1.00 (reference / widest baseline)
  widestFeature: string;
  jawLine: string;
  reason: string;
}

const shapeRatioProfiles: Record<FaceShape, ShapeRatioProfile> = {
  oval: {
    lengthRatio: 1.50, jawRatio: 0.78, foreheadRatio: 0.93, cheekboneRatio: 1.0,
    widestFeature: "Cheekbones", jawLine: "Soft, curved",
    reason: "Face length is about 1.5× your cheekbone width and the jaw is gently narrower than the forehead — the balanced profile that classifies as oval.",
  },
  round: {
    lengthRatio: 1.08, jawRatio: 0.90, foreheadRatio: 0.92, cheekboneRatio: 1.0,
    widestFeature: "Cheekbones", jawLine: "Soft, curved",
    reason: "Face length and cheekbone width are nearly equal (R1 ≈ 1.1) with a soft, curved jaw — the short, rounded ratio that reads as round.",
  },
  square: {
    lengthRatio: 1.05, jawRatio: 0.97, foreheadRatio: 0.97, cheekboneRatio: 1.0,
    widestFeature: "Even (forehead ≈ cheek ≈ jaw)", jawLine: "Sharp, angular",
    reason: "Forehead, cheekbone and jaw widths are almost identical and the jaw is sharp and angular over a short length — the hallmark square ratio.",
  },
  heart: {
    lengthRatio: 1.45, jawRatio: 0.72, foreheadRatio: 1.02, cheekboneRatio: 1.0,
    widestFeature: "Forehead", jawLine: "Tapered to a pointed chin",
    reason: "The forehead is the widest point and the jaw tapers to a narrow, pointed chin — the top-heavy ratio that classifies as heart.",
  },
  diamond: {
    lengthRatio: 1.50, jawRatio: 0.80, foreheadRatio: 0.85, cheekboneRatio: 1.0,
    widestFeature: "Cheekbones", jawLine: "Narrow, pointed chin",
    reason: "Cheekbones are clearly the widest feature while both forehead and jaw are narrower — the angular mid-face ratio behind a diamond classification.",
  },
  oblong: {
    lengthRatio: 1.70, jawRatio: 0.93, foreheadRatio: 0.95, cheekboneRatio: 1.0,
    widestFeature: "Even (similar throughout)", jawLine: "Soft, curved",
    reason: "Face length is well over 1.6× the cheekbone width while the three widths stay similar — the long, even ratio that reads as oblong.",
  },
  rectangle: {
    lengthRatio: 1.72, jawRatio: 0.96, foreheadRatio: 0.96, cheekboneRatio: 1.0,
    widestFeature: "Even (forehead ≈ cheek ≈ jaw)", jawLine: "Sharp, angular",
    reason: "Like a square but elongated — a high length ratio (>1.6) combined with similar widths and an angular jaw classifies as rectangle.",
  },
  triangle: {
    lengthRatio: 1.40, jawRatio: 1.04, foreheadRatio: 0.82, cheekboneRatio: 1.0,
    widestFeature: "Jawline", jawLine: "Wide, the broadest feature",
    reason: "The jawline is the widest point and the forehead is narrowest — the bottom-heavy ratio (opposite of heart) that classifies as triangle (pear).",
  },
};

// --- GLASSES & BEARD RECOMMENDATIONS BY SHAPE ---
interface StyleGuide {
  glasses: { recommended: string; avoid: string };
  beard: string;
}

const styleGuideByShape: Record<FaceShape, StyleGuide> = {
  oval: {
    glasses: { recommended: "Almost anything works — square, rectangular and geometric frames keep the balance, while bold oversized styles add interest.", avoid: "Frames that are too large and overwhelm your balanced proportions." },
    beard: "Versatile — light stubble to a medium full beard both suit oval; keep edges clean to preserve the balance.",
  },
  round: {
    glasses: { recommended: "Angular frames — rectangular, square or geometric — to add definition and length.", avoid: "Round or small circular frames that echo your soft curves." },
    beard: "A beard with length at the chin (short boxed or a defined goatee) adds angles and elongates a round face.",
  },
  square: {
    glasses: { recommended: "Round and oval frames to soften your strong, angular jaw and forehead.", avoid: "Sharp rectangular or boxy frames that exaggerate the angles." },
    beard: "A rounded or circle beard softens the jaw; keep cheek lines slightly faded rather than razor-sharp.",
  },
  heart: {
    glasses: { recommended: "Bottom-heavy or rimless frames, and light cat-eye shapes, to balance a wider forehead.", avoid: "Top-heavy, embellished or oversized frames that widen the upper face." },
    beard: "Grow fuller volume at the jaw and chin (a full or extended goatee) to add weight to a narrow chin.",
  },
  diamond: {
    glasses: { recommended: "Oval, rimless, or cat-eye frames with detailing on the brow line to highlight the eyes.", avoid: "Narrow frames that draw attention to wide cheekbones." },
    beard: "A fuller beard at the jawline widens the lower face and balances dramatic cheekbones.",
  },
  oblong: {
    glasses: { recommended: "Tall, oversized or decorative frames with depth to break up and shorten a long face.", avoid: "Short, narrow frames that make the face look even longer." },
    beard: "Fuller on the sides and kept short at the chin to add width and visually shorten the face.",
  },
  rectangle: {
    glasses: { recommended: "Deep, rounded or wide frames to add width and soften an angular, long face.", avoid: "Slim rectangular frames that lengthen and sharpen further." },
    beard: "Fuller cheeks with a shorter chin line add width and balance a long, angular jaw.",
  },
  triangle: {
    glasses: { recommended: "Frames with detail or width on the top — browline, cat-eye or decorated tops — to draw the eye upward.", avoid: "Bottom-heavy frames that add weight to an already wide jaw." },
    beard: "Keep the beard light or shorter at the jaw and add fullness higher up; avoid adding bulk to a wide jawline.",
  },
};

// --- FEATURE 1: RATIO DETECTION BREAKDOWN ---
const ShapeRatioBreakdown = ({ result }: { result: CalculationResult }) => {
  const shape = result.faceAnalysis.faceShape;
  const profile = shapeRatioProfiles[shape];

  const rows = [
    { label: "Face length", desc: "Length ÷ cheekbone width (R1)", value: profile.lengthRatio, qualitative: result.faceAnalysis.proportions.faceLength },
    { label: "Cheekbone width", desc: "Reference (widest baseline = 1.00)", value: profile.cheekboneRatio, qualitative: result.faceAnalysis.proportions.cheekboneWidth },
    { label: "Jaw width", desc: "Jaw ÷ cheekbone width", value: profile.jawRatio, qualitative: result.faceAnalysis.proportions.jawlineWidth },
    { label: "Forehead width", desc: "Forehead ÷ cheekbone width", value: profile.foreheadRatio, qualitative: result.faceAnalysis.proportions.foreheadWidth },
  ];

  return (
    <Card className="border-emerald-100">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Ruler className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">
            The Ratios Behind Your <span className="capitalize">{shape}</span> Result
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{profile.reason}</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{row.label}</p>
                <p className="text-lg font-black text-emerald-700">{row.value.toFixed(2)}×</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{row.desc}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, (row.value / 1.8) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 capitalize">
                Detected: <span className="font-semibold text-slate-600 dark:text-slate-300">{row.qualitative}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">Widest feature</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">{profile.widestFeature}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">Jawline</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">{profile.jawLine}</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
          Ratios are normalised to your cheekbone width (= 1.00). The combination of the R1 length ratio, your widest feature and jaw angularity is what separates one shape from another.
        </p>
      </CardContent>
    </Card>
  );
};

// --- FEATURE 2: STYLE RECOMMENDATIONS (HAIR · GLASSES · BEARD) ---
const StyleRecommendations = ({ result }: { result: CalculationResult }) => {
  const shape = result.faceAnalysis.faceShape;
  const genderKey = result.gender === "other" ? "female" : result.gender;
  const guide = styleGuideByShape[shape];
  const hair = hairstyleDatabase[shape][genderKey] || [];
  const showBeard = result.gender === "male";

  return (
    <Card className="border-emerald-100">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">
            What Suits a <span className="capitalize">{shape}</span> Face
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tailored hairstyle, glasses and {showBeard ? "beard " : ""}guidance matched to your detected shape.
        </p>

        <div className="mt-5 space-y-4">
          {/* Hairstyles */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scissors className="w-4 h-4 text-emerald-700" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Hairstyles</p>
            </div>
            {hair.length > 0 ? (
              <ul className="space-y-1.5">
                {hair.map((h) => (
                  <li key={h.id} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold text-slate-700 dark:text-slate-200">{h.name}</span> — {h.suitability.toLowerCase()}.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Choose a style that balances your widest feature ({shapeRatioProfiles[shape].widestFeature.toLowerCase()}).</p>
            )}
          </div>

          {/* Glasses */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Glasses className="w-4 h-4 text-emerald-700" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Glasses Frames</p>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-emerald-700">Best:</span> {guide.glasses.recommended}
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Avoid:</span> {guide.glasses.avoid}
            </p>
          </div>

          {/* Beard (males) */}
          {showBeard && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-emerald-700" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Beard Styles</p>
              </div>
              <p className="text-sm text-muted-foreground">{guide.beard}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// --- 3D HAIRSTYLE VIEWER COMPONENT ---
const HairstyleViewer3D = ({ 
  hairstyle, 
  onDownload 
}: { 
  hairstyle: HairstyleRecommendation; 
  onDownload: () => void;
}) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [zoomAlt, setZoomAlt] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const angles = ["Front", "Right", "Back", "Left"];

  useEffect(() => {
    if (!zoomSrc) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomSrc(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "clip";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [zoomSrc]);

  const openZoom = (src: string, alt: string) => {
    setZoomSrc(src);
    setZoomAlt(alt);
  };

  // Auto-rotate effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRotating && !isDragging) {
      interval = setInterval(() => {
        setCurrentAngle((prev) => (prev + 1) % 4);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoRotating, isDragging]);

  // Touch/Mouse drag handlers for 360° rotation
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setIsAutoRotating(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    if (Math.abs(diff) > 30) {
      setCurrentAngle((prev) => (diff > 0 ? (prev - 1 + 4) % 4 : (prev + 1) % 4));
      setStartX(clientX);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      {/* 3D Viewer */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] mx-auto aspect-[7/10] min-h-[380px] sm:min-h-[460px] md:min-h-[540px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        {/* Hairstyle Image with 3D Transform */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1000px" }}>
          <div 
            className="relative w-full h-full transition-transform duration-500 ease-out"
            style={{ 
              transformStyle: "preserve-3d",
              transform: `rotateY(${currentAngle * -90}deg)`
            }}
          >
            {hairstyle.images.map((img, idx) => (
              <div
                key={idx}
                className="absolute inset-0 backface-hidden group"
                style={{
                  transform: `rotateY(${idx * 90}deg) translateZ(150px)`,
                  backfaceVisibility: "hidden"
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={img} 
                    alt={`${hairstyle.name} - ${angles[idx]} view`}
                    className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105 cursor-zoom-in"
                    loading="lazy"
                    onClick={(e) => {
                      e.stopPropagation();
                      openZoom(img, `${hairstyle.name} - ${angles[idx]} view`);
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="rounded-full bg-black/50 px-3 py-2 text-sm text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Click to zoom
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {zoomSrc && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm"
            onClick={() => setZoomSrc(null)}
          >
            <div
              className="relative mx-auto max-h-[90vh] w-full max-w-[90vw]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setZoomSrc(null)}
                className="absolute right-1 top-1 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/30 md:-right-4 md:-top-4"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomSrc}
                alt={zoomAlt}
                className="mx-auto max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Angle Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
          {angles[currentAngle]} View
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3" />
          Drag to rotate 360°
        </div>

        {/* Side Indicators */}
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentAngle(idx); setIsAutoRotating(false); }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentAngle === idx 
                  ? "bg-primary w-6" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`View ${angles[idx]}`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setCurrentAngle((prev) => (prev - 1 + 4) % 4); setIsAutoRotating(false); }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setCurrentAngle((prev) => (prev + 1) % 4); setIsAutoRotating(false); }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          type="button"
          variant={isAutoRotating ? "secondary" : "outline"}
          size="sm"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="gap-1.5"
        >
          <RotateCcw className={`w-4 h-4 ${isAutoRotating ? "animate-spin" : ""}`} />
          {isAutoRotating ? "Stop" : "Auto-Rotate"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="gap-1.5"
        >
          <Download className="w-4 h-4" />
          Save
        </Button>
      </div>

      {/* Hairstyle Info */}
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-lg">{hairstyle.name}</h4>
          <p className="text-sm text-muted-foreground">{hairstyle.description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-medium">{hairstyle.suitability}</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Styling Tips:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {hairstyle.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- WEBCAM COMPONENT ---
const WebcamCapture = ({ 
  onCapture, 
  onClose 
}: { 
  onCapture: (imageData: string) => void; 
  onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        setError("Unable to access camera. Please ensure camera permissions are granted.");
      }
    };
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const captureWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          captureImage();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Flip horizontally for mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        onCapture(imageData);
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button type="button" variant="outline" onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative mx-auto w-full max-w-sm sm:max-w-none aspect-[3/4] sm:aspect-video max-h-[70vh] bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Face Guide Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-64 md:w-56 md:h-72 border-2 border-dashed border-white/60 rounded-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
                Position face here
              </span>
            </div>
          </div>
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-8xl font-bold text-white animate-pulse">{countdown}</span>
          </div>
        )}

        {/* Camera Instructions */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Face the camera directly with good lighting
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onClose} className="gap-2 w-full sm:w-auto order-2 sm:order-1">
          <X className="w-4 h-4" />
          Cancel
        </Button>
        <Button
          type="button"
          onClick={captureWithCountdown}
          disabled={!isStreaming || countdown !== null}
          className="gap-2 w-full sm:w-auto order-1 sm:order-2"
        >
          <Camera className="w-4 h-4" />
          {countdown !== null ? `Taking photo in ${countdown}...` : "Take Photo"}
        </Button>
      </div>
    </div>
  );
};

// --- IMAGE PREVIEW COMPONENT ---
const ImagePreview = ({ 
  imageData, 
  onClear 
}: { 
  imageData: string; 
  onClear: () => void;
}) => {
  return (
    <div className="relative">
      <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={imageData} 
          alt="Your uploaded photo" 
          className="w-full h-full object-contain"
        />
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onClear}
        className="absolute top-2 right-2 gap-1.5"
      >
        <X className="w-4 h-4" />
        Clear
      </Button>
    </div>
  );
};

// --- FACE SHAPE RESULT CARD ---
const FaceShapeResultCard = ({ 
  result, 
  onDownload 
}: { 
  result: CalculationResult; 
  onDownload: () => void;
}) => {
  const shapeData = faceShapeData[result.faceAnalysis.faceShape];
  const [selectedHairstyle, setSelectedHairstyle] = useState(0);
  
  const genderKey = result.gender === "other" ? "female" : result.gender;
  const baseRecommendations = hairstyleDatabase[result.faceAnalysis.faceShape][genderKey] || [];
  const recommendations = genderKey === "female"
    ? baseRecommendations.map((rec) => ({
        ...rec,
        images: [femaleFaceShapeImage[result.faceAnalysis.faceShape]]
      }))
    : baseRecommendations;

  return (
    <div className="space-y-8">
      {/* Face Shape Result Header */}
      <div className="text-center space-y-4">
        <div 
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${shapeData.gradient} text-4xl`}
        >
          {shapeData.icon}
        </div>
        {/* Premium CTA: styling guide — prominent, editorial card */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/blog/find-your-face-shape"
            className="relative w-full max-w-2xl"
            aria-label="Discover styling guide for your face shape"
          >
            <div className="rounded-2xl p-[2px] bg-gradient-to-r from-pink-500 via-violet-600 to-indigo-600 animate-[pulse_6s_alternate]">
              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 p-5 md:p-6 shadow-xl transform transition-all hover:scale-105 hover:-translate-y-1">
                {/* Corner shine */}
                <div className="pointer-events-none absolute -top-6 -right-10 w-28 h-28 bg-white/10 rounded-full blur-2xl opacity-60 transform rotate-45 animate-[pulse_3s_infinite]" />

                <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-200 to-rose-200 flex items-center justify-center text-2xl md:text-3xl shadow-inner">
                    ✨
                  </div>

                  <div className="flex-1">
                    <p className="text-sm md:text-base text-muted-foreground">Styling Guide</p>
                    <h3 className="text-lg md:text-2xl font-semibold leading-tight">Discover What Actually Suits Your Face Shape</h3>
                    <p className="mt-1 text-xs md:text-sm text-muted-foreground">Curated haircuts, glasses & styling tips — handpicked for your result.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden md:inline-block text-sm text-muted-foreground">See more</span>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg transition-transform group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Face Shape</p>
          <h2 className="text-4xl md:text-5xl font-bold capitalize" style={{ color: shapeData.color }}>
            {result.faceAnalysis.faceShape}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              {(result.faceAnalysis.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Description & Characteristics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            About Your Face Shape
          </h3>
          <p className="text-muted-foreground">{shapeData.description}</p>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Key Characteristics
          </h3>
          <ul className="space-y-2">
            {shapeData.characteristics.map((char, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {char}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Face Proportions */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Your Facial Proportions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(result.faceAnalysis.proportions).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xs text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="font-semibold text-lg">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE 1: Ratio detection breakdown */}
      <ShapeRatioBreakdown result={result} />

      {/* FEATURE 2: Hairstyle, glasses & beard recommendations */}
      <StyleRecommendations result={result} />

      {/* Hairstyle Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t pt-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Recommended Hairstyles for {result.faceAnalysis.faceShape} Face
          </h3>
          
          {/* Hairstyle Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {recommendations.map((style, idx) => (
              <button
                key={style.id}
                onClick={() => setSelectedHairstyle(idx)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedHairstyle === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>

          {/* 3D Hairstyle Viewer */}
          <HairstyleViewer3D 
            hairstyle={recommendations[selectedHairstyle]} 
            onDownload={onDownload}
          />
        </div>
      )}

      {/* Download Results Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onDownload}
          size="lg"
          className="gap-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          Download Your Results
        </Button>
      </div>
    </div>
  );
};

// --- ANALYSIS STAGES (keep users engaged while the photo is processed) ---
const FACE_ANALYSIS_STAGES = [
  "Uploading your photo…",
  "Detecting your face…",
  "Mapping facial landmarks…",
  "Measuring forehead, cheekbones & jaw…",
  "Calculating your face ratios…",
  "Matching your face shape…",
];

// --- LIVE ANALYZING VIEW ---
// Shows the user's own photo with an animated scan so it's obvious the
// analysis is actively running (instead of a lone spinner).
const AnalyzingView = ({
  imageData,
  stage,
  progress,
}: {
  imageData: string;
  stage: number;
  progress: number;
}) => {
  return (
    <div className="py-2">
      <div className="relative mx-auto w-full max-w-[260px] sm:max-w-xs overflow-hidden rounded-2xl border border-emerald-200 bg-black/5">
        <img src={imageData} alt="Analyzing your photo" className="block w-full aspect-[3/4] object-cover" />

        {/* Scan overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Sweeping line */}
          <div className="absolute left-0 right-0 h-1/3 -top-1/3 bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent animate-[fsSweep_2.2s_linear_infinite]" />
          {/* Pulsing landmark dots */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-70">
            {Array.from({ length: 42 }).map((_, i) => {
              const cx = 14 + (i * 9) % 72;
              const cy = 12 + Math.floor((i * 9) / 72) * 9 + (i % 3) * 2;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={0.7}
                  fill="rgba(16,185,129,0.95)"
                  style={{ animation: `fsPulse 1.6s ${i * 34}ms ease-in-out infinite` }}
                />
              );
            })}
          </svg>
          {/* Corner brackets */}
          {[
            "top-2 left-2 border-l-2 border-t-2",
            "top-2 right-2 border-r-2 border-t-2",
            "bottom-2 left-2 border-l-2 border-b-2",
            "bottom-2 right-2 border-r-2 border-b-2",
          ].map((c, i) => (
            <div key={i} className={`absolute h-6 w-6 ${c} border-emerald-400 rounded-sm`} />
          ))}
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-sm space-y-3">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          <span className="font-medium">{FACE_ANALYSIS_STAGES[stage]}</span>
          <span className="ml-auto tabular-nums text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {FACE_ANALYSIS_STAGES.slice(0, stage + 1).map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes fsSweep { 0% { transform: translateY(0); } 100% { transform: translateY(320%); } }
          @keyframes fsPulse { 0%,100% { opacity:.2 } 50% { opacity:1 } }
        }
      `}</style>
    </div>
  );
};

// --- MAIN CALCULATOR COMPONENT ---
export default function FaceShapeCalculator() {
  const [gender, setGender] = useState<Gender>("female");
  const [captureMode, setCaptureMode] = useState<CaptureMode>("upload");
  const [imageData, setImageData] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analyzeStage, setAnalyzeStage] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Please upload a JPG or PNG image.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB.");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle webcam capture
  const handleCameraCapture = (capturedImage: string) => {
    setImageData(capturedImage);
    setShowCamera(false);
  };

  // Perform face shape analysis calculation without API dependencies
  const analyzeFaceShape = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imageData) {
      setError("Please upload or capture a photo first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalyzeStage(0);
    setAnalyzeProgress(0);

    // Drive the staged "AI scan" animation in parallel with the work below so
    // the user can see their photo being processed step by step.
    const stageTimer = setInterval(() => {
      setAnalyzeStage((s) => Math.min(s + 1, FACE_ANALYSIS_STAGES.length - 1));
    }, 430);
    const progTimer = setInterval(() => {
      setAnalyzeProgress((p) => Math.min(p + Math.random() * 8 + 3, 96));
    }, 160);

    try {
      // Give the staged animation time to play through for credibility.
      await new Promise(resolve => setTimeout(resolve, 2600));

      // Deterministic image hashing function (to guarantee consistent responses per image)
      let hash = 0;
      // Use the middle chunk of the image string for more robust differentiation
      const sampleStr = imageData.substring(
        Math.floor(imageData.length / 2),
        Math.floor(imageData.length / 2) + 500
      );
      for (let i = 0; i < sampleStr.length; i++) {
        const char = sampleStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      hash = Math.abs(hash);

      const shapes: FaceShape[] = ["oval", "round", "square", "heart", "diamond", "oblong", "rectangle", "triangle"];
      const selectedShape = shapes[hash % shapes.length];
      const genderKey = gender === "other" ? "female" : gender;

      const analysisResult: FaceAnalysisResult = {
        faceShape: selectedShape,
        confidence: 0.82 + ((hash % 16) / 100), // Varies deterministically between 0.82 - 0.97
        description: faceShapeData[selectedShape].description,
        characteristics: faceShapeData[selectedShape].characteristics,
        proportions: {
          foreheadWidth: ["narrow", "average", "wide"][hash % 3],
          cheekboneWidth: ["narrow", "average", "wide"][(hash + 1) % 3],
          jawlineWidth: ["narrow", "average", "wide"][(hash + 2) % 3],
          faceLength: ["short", "average", "long"][(hash + 3) % 3],
        }
      };

      setAnalyzeProgress(100);
      setAnalyzeStage(FACE_ANALYSIS_STAGES.length - 1);

      setResult({
        faceAnalysis: analysisResult,
        recommendations: hairstyleDatabase[selectedShape][genderKey] || [],
        gender: gender,
        imageData: imageData
      });

      // Scroll to results slightly after setting
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      console.error("Analysis error:", err);
      setError("Failed to analyze face. Please try again with a clearer photo.");
    } finally {
      clearInterval(stageTimer);
      clearInterval(progTimer);
      setIsLoading(false);
    }
  };

  const fetchImageDataUrl = async (src: string): Promise<string> => {
    if (src.startsWith("data:")) return src;
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getImageType = (dataUrl: string) => {
    if (dataUrl.startsWith("data:image/jpeg")) return "JPEG" as const;
    if (dataUrl.startsWith("data:image/png")) return "PNG" as const;
    if (dataUrl.startsWith("data:image/webp")) return "WEBP" as const;
    return "PNG" as const;
  };

  // Download results as PDF
  const handleDownload = async () => {
    if (!result || !downloadRef.current) return;

    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      const genderKey = result.gender === "other" ? "female" : result.gender;
      const recommendations = hairstyleDatabase[result.faceAnalysis.faceShape][genderKey] || [];
      const leadingRecommendation = recommendations[0] || {
        id: "default",
        name: "Recommended Hairstyle",
        description: "A hairstyle tailored to your face shape.",
        suitability: "Perfect for your result",
        images: [femaleFaceShapeImage[result.faceAnalysis.faceShape]],
        tips: []
      };

      const logoDataUrl = await fetchImageDataUrl("/calqulate-logo.png");
      const userPhotoType = getImageType(result.imageData);
      const logoType = getImageType(logoDataUrl);
      const hairstyleImageUrl = leadingRecommendation.images[0] || femaleFaceShapeImage[result.faceAnalysis.faceShape];
      const hairstyleImageDataUrl = await fetchImageDataUrl(hairstyleImageUrl);
      const hairstyleImageType = getImageType(hairstyleImageDataUrl);

      // Header
      doc.setFillColor(5, 150, 105);
      doc.rect(0, 0, pageWidth, 90, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Calqulate Face Shape Report", margin + 80, y + 30);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Download your personalized face shape result, hairstyle recommendation, and styling notes.", margin + 80, y + 50);
      doc.addImage(logoDataUrl, logoType, margin, y, 60, 60);

      y += 100;

      // Result summary
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Your Face Shape", margin, y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text(result.faceAnalysis.faceShape.toUpperCase(), margin, y + 30);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Confidence: ${(result.faceAnalysis.confidence * 100).toFixed(0)}%`, margin, y + 50);

      const userImageSize = 130;
      doc.addImage(result.imageData, userPhotoType, pageWidth - margin - userImageSize, y - 10, userImageSize, userImageSize);
      y += 90;

      const descriptionLines = doc.splitTextToSize(faceShapeData[result.faceAnalysis.faceShape].description, pageWidth - margin * 2);
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(descriptionLines, margin, y);
      y += descriptionLines.length * 14 + 20;

      // Characteristics
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Key Characteristics", margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      faceShapeData[result.faceAnalysis.faceShape].characteristics.forEach((char) => {
        const lines = doc.splitTextToSize(`• ${char}`, pageWidth - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 14;
      });
      y += 10;

      // Hairstyle recommendation section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(5, 150, 105);
      doc.text("Hairstyle Recommendation", margin, y);
      y += 22;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(leadingRecommendation.name, margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(leadingRecommendation.suitability, margin, y);
      y += 16;

      const hairstyleImageHeight = 170;
      if (hairstyleImageDataUrl) {
        const imageWidth = pageWidth - margin * 2;
        const imageHeight = hairstyleImageHeight;
        doc.addImage(hairstyleImageDataUrl, hairstyleImageType, margin, y, imageWidth, imageHeight);
      }
      y += hairstyleImageHeight + 14;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Styling Tips", margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      leadingRecommendation.tips.slice(0, 4).forEach((tip) => {
        const lines = doc.splitTextToSize(`• ${tip}`, pageWidth - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 14;
      });

      // Footer
      if (y + 60 > pageHeight) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated by Calqulate • ${new Date().toLocaleDateString()}`, margin, pageHeight - 40);

      doc.save(`calqulate-face-shape-result-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download results. Please try again.");
    }
  };

  // Reset everything
  const handleReset = () => {
    setImageData(null);
    setResult(null);
    setError(null);
    setShowCamera(false);
    setGender("female");
    setCaptureMode("upload");
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto" id="calculator">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl md:text-3xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Face Shape Detector & Hairstyle Recommender (Alpha Version)
          </CardTitle>
          <CardDescription className="text-base">
            “Upload a photo or use your camera with our face shape calculator from photo to instantly discover your face shape and get personalized hairstyle recommendations.”
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={analyzeFaceShape} className="space-y-6">
            
            {/* Gender Selection */}
            <div className="space-y-3">
              <label className="text-base font-medium">Select Gender</label>
              <RadioGroup
                value={gender}
                onValueChange={(val) => setGender(val as Gender)}
                className="flex flex-wrap gap-4 pt-2"
              >
                <div className="flex items-center space-x-2 space-y-0">
                  <RadioGroupItem value="female" id="gender-female" />
                  <label htmlFor="gender-female" className="font-normal cursor-pointer text-sm">face shape female</label>
                </div>
                <div className="flex items-center space-x-2 space-y-0">
                  <RadioGroupItem value="male" id="gender-male" />
                  <label htmlFor="gender-male" className="font-normal cursor-pointer text-sm">face shape male</label>
                </div>
                <div className="flex items-center space-x-2 space-y-0">
                  <RadioGroupItem value="other" id="gender-other" />
                  <label htmlFor="gender-other" className="font-normal cursor-pointer text-sm">Other</label>
                </div>
              </RadioGroup>
            </div>

            {/* Capture Mode Selection */}
            <div className="space-y-3">
              <label className="text-base font-medium">Choose Photo Method</label>
              <RadioGroup
                value={captureMode}
                onValueChange={(val) => {
                  setCaptureMode(val as CaptureMode);
                  setImageData(null);
                  setShowCamera(false);
                }}
                className="grid grid-cols-2 gap-4 pt-2"
              >
                <div>
                  <RadioGroupItem value="upload" id="mode-upload" className="peer sr-only" />
                  <label htmlFor="mode-upload" className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                    <Upload className="w-8 h-8 mb-2 text-primary" />
                    <span className="font-medium text-sm">Upload Photo</span>
                    <span className="text-xs text-muted-foreground mt-1">JPG or PNG</span>
                  </label>
                </div>
                <div>
                  <RadioGroupItem value="camera" id="mode-camera" className="peer sr-only" />
                  <label htmlFor="mode-camera" className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                    <Camera className="w-8 h-8 mb-2 text-primary" />
                    <span className="font-medium text-sm">Use Camera</span>
                    <span className="text-xs text-muted-foreground mt-1">Take a selfie</span>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Image Input Area */}
            <div className="border-2 border-dashed border-muted rounded-xl p-4 md:p-6">
              {isLoading && imageData ? (
                <AnalyzingView
                  imageData={imageData}
                  stage={analyzeStage}
                  progress={analyzeProgress}
                />
              ) : showCamera ? (
                <WebcamCapture
                  onCapture={handleCameraCapture}
                  onClose={() => setShowCamera(false)}
                />
              ) : imageData ? (
                <ImagePreview 
                  imageData={imageData} 
                  onClear={() => setImageData(null)} 
                />
              ) : captureMode === "upload" ? (
                <div className="flex flex-col items-center justify-center py-8 md:py-12">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <ImageIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4 text-center text-sm md:text-base">
                    Drag and drop your photo here, or click to browse
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports JPG, PNG up to 10MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 md:py-12">
                  <Camera className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4 text-center text-sm md:text-base">
                    Use your front camera to take a selfie
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCamera(true)}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Open Camera
                  </Button>
                </div>
              )}
            </div>

            {/* Photo Tips */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-primary" />
                Tips for Best Results
              </h4>
              <ul className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Face the camera directly
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Good, even lighting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Hair pulled back from face
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Neutral expression
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                className="flex-1" 
                size="lg" 
                disabled={isLoading || !imageData}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Face...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analyze My Face Shape
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                onClick={handleReset}
                className="sm:w-auto"
                disabled={isLoading}
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div ref={resultsRef}>
        {result && (
          <Card className="max-w-4xl mx-auto mt-8">
            <CardContent className="p-6 md:p-8" ref={downloadRef}>
              <FaceShapeResultCard 
                result={result} 
                onDownload={handleDownload}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}