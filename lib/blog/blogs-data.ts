// lib/blog/blogs-data.ts
// Single source of truth for all blogs across the site.
// Add new blogs here — /blog page and /blog/[slug] page both read from this list.

export type BlogCategory = "Body Shape" | "Face Shape" | "Health" | "Face & Aesthetics" | "Health & Fitness";

export interface Blog {
  slug: string;
  title: string;
  description: string;          // Short SEO meta description
  category: BlogCategory;
  intent: string;               // Search intent (from content plan)
  uspFeature: string;           // The USP / interactive feature
  featuredImage: string;        // /public path
  readTime: string;
  publishedAt: string;          // ISO date
  cta: string;                  // CTA button label
  ctaHref: string;              // Where the CTA points
  tags?: string[];              // SEO keywords
}

export const blogs: Blog[] = [
  // ── Body Shape Cluster ──────────────────────────────────────────────
  {
    slug: "female-body-shapes-explained",
    title: "Female Body Shapes Explained",
    description:
      "Discover the 5 female body shapes — Pear, Apple, Hourglass, Rectangle, and Inverted Triangle. Identify yours, see best-fit dresses, and download a personalized diet plan PDF.",
    category: "Body Shape",
    intent: "Understand body type",
    uspFeature: "Interactive body visualizer + dress guide + diet PDF",
    featuredImage: "/images/blogs/female-body-shapes-cover.webp",
    readTime: "9 min read",
    publishedAt: "2026-05-08",
    cta: "Find My Body Shape",
    ctaHref: "/health/body-shape-calculator",
  },
  {
    slug: "best-dresses-for-pear-shape",
    title: "Best Dresses for Pear Shape Body",
    description:
      "A complete styling guide for pear-shaped women — A-line, fit-and-flare, and off-shoulder dresses that balance your silhouette beautifully.",
    category: "Body Shape",
    intent: "Find suitable clothes",
    uspFeature: "Outfit recommendation engine",
    featuredImage: "/images/blogs/pear-shape-dresses-cover.webp",
    readTime: "7 min read",
    publishedAt: "2026-05-08",
    cta: "Get Style Recommendations",
    ctaHref: "/health/body-shape-calculator",
  },
  {
    slug: "best-gym-plan-by-body-shape",
    title: "Best Gym Plan by Body Shape",
    description:
      "A targeted workout plan tailored to your body shape. Burn fat in the right places and build curves where you want them.",
    category: "Body Shape",
    intent: "Improve body appearance",
    uspFeature: "Workout generator",
    featuredImage: "/images/blogs/gym-plan-body-shape-cover.webp",
    readTime: "8 min read",
    publishedAt: "2026-05-08",
    cta: "Generate My Workout",
    ctaHref: "/health/body-shape-calculator",
  },
  {
    slug: "best-jeans-for-your-body-shape",
    title: "Best Jeans for Your Body Shape",
    description:
      "Skinny, bootcut, mom, straight — the right jeans for every body shape. Find your perfect fit in under a minute.",
    category: "Body Shape",
    intent: "Fashion advice",
    uspFeature: "Virtual styling suggestions",
    featuredImage: "/images/blogs/jeans-body-shape-cover.webp",
    readTime: "6 min read",
    publishedAt: "2026-05-08",
    cta: "See My Jeans Style",
    ctaHref: "/health/body-shape-calculator",
  },

  // ── Face Shape Cluster ──────────────────────────────────────────────
  {
    slug: "find-your-face-shape",
    title: "Find Your Face Shape",
    description:
      "Identify your face shape — oval, round, square, heart, or oblong — and unlock the styling rules that work for you.",
    category: "Face Shape",
    intent: "Face analysis",
    uspFeature: "AI face guide",
    featuredImage: "/images/blogs/face-shape-cover.webp",
    readTime: "6 min read",
    publishedAt: "2026-05-08",
    cta: "Analyze My Face",
    ctaHref: "/health/face-shape-calculator",
  },
  {
    slug: "best-haircut-for-your-face-shape",
    title: "Best Haircut for Your Face Shape: 2026 Trends",
    description:
      "Soft layers, side parts, and long bobs that flatter a round face. Visual previews for every cut.",
    category: "Face Shape",
    intent: "Style improvement",
    uspFeature: "Hairstyle previews",
    featuredImage: "/images/blogs/hairstyles-for-your-face.webp",
    readTime: "7 min read",
    publishedAt: "2026-05-26",
    cta: "See Hairstyle Options",
    ctaHref: "/health/face-shape-calculator",
  },
  {
    slug: "how-to-calculate-weight-loss-percentage",
    title: "How to Calculate Your Weight Loss Percentage",
    description:
      "Learn how to calculate your weight loss percentage with the exact formula, what counts as a healthy rate, and how to track real progress beyond the scale — with a free embedded weight loss percentage calculator.",
    category: "Health",
    intent: "Track progress",
    uspFeature: "Weight loss percentage calculator",
    featuredImage: "/images/blogs/weight-loss-percentage-cover.webp",
    readTime: "9 min read",
    publishedAt: "2026-06-09",
    cta: "Open Weight Loss Calculator",
    ctaHref: "/health/weight-loss-percentage-calculator",
  },
  {
    slug: "how-to-calculate-resting-metabolic-rate-rmr",
    title: "How to Calculate Your Resting Metabolic Rate",
    description:
      "Learn how to calculate your RMR with the Mifflin-St Jeor equation and other methods, and understand what it means for your health and fitness goals.",
    category: "Health",
    intent: "Health information",
    uspFeature: "RMR calculator",
    featuredImage: "/images/blogs/rmr-calculator-cover.webp",
    readTime: "8 min read",
    publishedAt: "2026-06-09",
    cta: "Open RMR Calculator",
    ctaHref: "/health/bmr-calculator",
  },
  {
    slug: "best-beard-styles-by-face-shape",
    title: "Best Beard Styles by Face Shape",
    description:
      "From boxed beard to goatee — find the beard that sharpens your jawline and complements your face shape.",
    category: "Face Shape",
    intent: "Male grooming",
    uspFeature: "Beard recommendations",
    featuredImage: "/images/blogs/beard-styles-cover.webp",
    readTime: "6 min read",
    publishedAt: "2026-05-08",
    cta: "Get Beard Suggestions",
    ctaHref: "/health/face-shape-calculator",
  },
  {
    slug: "best-sunglasses-for-your-face-shape",
    title: "Find the Best Sunglasses for Your Face Shape",
    description:
      "Aviators, wayfarers, cat-eye — pick frames that balance your features. Visual comparison for every face shape.",
    category: "Face Shape",
    intent: "Accessory matching",
    uspFeature: "Visual frame comparison",
    featuredImage: "/images/blogs/sunglasses-face-shape-cover.webp",
    readTime: "6 min read",
    publishedAt: "2026-05-28",
    cta: "Find My Frames",
    ctaHref: "/health/face-shape-calculator",
  },
  {
    slug: "celebrity-face-shape-examples",
    title: "Celebrity Face Shape Examples",
    description:
      "Curious which celebrity shares your face shape? Browse our interactive gallery — and see what styles work for them (and you).",
    category: "Face Shape",
    intent: "Curiosity + comparison",
    uspFeature: "Interactive gallery",
    featuredImage: "/images/blogs/celebrity-face-shape-cover.webp",
    readTime: "5 min read",
    publishedAt: "2026-05-08",
    cta: "Open Gallery",
    ctaHref: "/health/face-shape-calculator",
  },

  // ── Health & Fitness ─────────────────────────────────────────────
  {
    slug: "body-shape-calculator-for-men",
    title: "Body Shape Calculator for Men: How to Measure Your Body Shape",
    description:
      "Find your male body shape in two minutes. A 3D tool that morphs to your measurements, the five men's body types explained, how to measure, and a free body shape calculator.",
    category: "Body Shape",
    intent: "Understand body type",
    uspFeature: "Interactive 3D male body visualizer",
    featuredImage: "/images/blogs/male-body-shape-cover.webp",
    readTime: "9 min read",
    publishedAt: "2026-06-18",
    cta: "Open Body Shape Calculator",
    ctaHref: "/health/body-shape-calculator",
    tags: [
      "body shape calculator male",
      "body type calculator male",
      "men body shape calculator",
      "male body type calculator",
      "body shape calculator 3d",
      "how to measure body shape",
      "male body shapes",
      "inverted triangle trapezoid rectangle",
    ],
  },
  {
    slug: "bmr-vs-tdee-difference",
    title: "BMR vs TDEE: What's the Difference? (Simple Guide)",
    description:
      "BMR is the calories you burn at rest. TDEE is your total daily burn. See the difference, how to turn one into the other, the activity multipliers, and a free BMR + TDEE calculator.",
    category: "Health",
    intent: "Health information",
    uspFeature: "Embedded BMR + TDEE calculator",
    featuredImage: "/images/blogs/bmr-vs-tdee-cover.webp",
    readTime: "8 min read",
    publishedAt: "2026-06-18",
    cta: "Calculate Your BMR & TDEE",
    ctaHref: "/health/bmr-calculator",
    tags: [
      "bmr vs tdee",
      "what is bmr",
      "what is tdee",
      "basal metabolic rate",
      "total daily energy expenditure",
      "activity multiplier",
      "calorie deficit",
      "mifflin st jeor",
    ],
  },
  {
    slug: "ideal-weight-by-height-and-age",
    title: "Ideal Weight by Height & Age (Chart for Men & Women)",
    description:
      "See your ideal weight by height and age in one chart. Healthy weight ranges and Devine ideal targets for women and men from 4'10\" to 6'6\", in lbs and kg, plus a free ideal body weight calculator.",
    category: "Health",
    intent: "Health information",
    uspFeature: "Embedded ideal body weight calculator",
    featuredImage: "/images/blogs/ideal-weight-by-height-age-cover.webp",
    readTime: "8 min read",
    publishedAt: "2026-06-18",
    cta: "Open Ideal Body Weight Calculator",
    ctaHref: "/health/ideal-body-weight-calculator",
    tags: [
      "ideal weight by height",
      "ideal weight chart",
      "ideal body weight",
      "height weight chart",
      "healthy weight range",
      "ideal weight for women",
      "ideal weight for men",
      "weight by age",
    ],
  },

  // ── Face & Aesthetics ─────────────────────────────────────────────
  {
    slug: "mathematics-of-beauty-facial-harmony-calculator",
    title: "The Mathematics of Beauty: Calculate Your Facial Harmony",
    description:
      "See the math behind facial harmony: the golden ratio, facial thirds, and the six key angles that shape a balanced face. Includes a free facial harmony calculator with photo upload, manual input, and saved-result tracking.",
    category: "Face & Aesthetics",
    intent: "Understand facial proportions",
    uspFeature: "Interactive photo-based facial harmony calculator with save/compare",
    featuredImage: "/images/blogs/facial-harmony-cover.webp",
    readTime: "10 min read",
    publishedAt: "2026-06-15",
    cta: "Open Facial Harmony Calculator",
    ctaHref: "/health/facial-harmony-calculator",
    tags: [
      "facial harmony calculator",
      "golden ratio face",
      "gonial angle",
      "canthal tilt",
      "nasolabial angle",
      "facial symmetry",
      "facial attractiveness",
    ],
  },
  {
    slug: "semaglutide-dosage-chart",
    title: "Semaglutide Dosage Chart & Titration Schedule (Wegovy / Ozempic)",
    description:
      "The complete semaglutide dosage chart and titration schedule for Wegovy and Ozempic — starting dose, weekly step-ups, max dose, compounding math, storage rules, and a free GLP-1 dose calculator.",
    category: "Health & Fitness",
    intent: "Health information",
    uspFeature: "Embedded dosage chart + titration ladder",
    featuredImage: "/images/blogs/semaglutide-dosage-cover.webp",
    readTime: "11 min read",
    publishedAt: "2026-06-23",
    cta: "Free GLP-1 Dose Check",
    ctaHref: "/health/glp-1-dose-calculator",
    tags: [
      "semaglutide dosage",
      "semaglutide dosage chart",
      "wegovy dosage",
      "ozempic dosage",
      "titration schedule",
      "glp-1",
      "weight loss",
      "compounded semaglutide",
    ],
  },
  {
    slug: "ozempic-muscle-loss-body-composition",
    title:
      "Ozempic Muscle Loss: How to Track Your Body Composition and Prevent \"Skinny Fat\"",
    description:
      "Up to a third of the weight you lose on Ozempic, Wegovy, or Mounjaro can be muscle — not fat. Learn why your bathroom scale is lying to you, and how to track your body composition so you lose fat, keep muscle, and avoid \"skinny fat\" and \"Ozempic face.\"",
    category: "Health & Fitness",
    intent: "Track body composition on a GLP-1",
    uspFeature: "GLP-1 body composition tracker + fat-vs-muscle estimate",
    featuredImage: "/images/blogs/ozempic-muscle-loss-cover.png",
    readTime: "10 min read",
    publishedAt: "2026-06-30",
    cta: "Try the GLP-1 Tracker Free",
    ctaHref: "/health/glp-1-dose-calculator",
    tags: [
      "ozempic muscle loss",
      "glp-1 muscle loss",
      "skinny fat",
      "ozempic face",
      "body composition tracking",
      "wegovy",
      "mounjaro",
      "weight loss",
    ],
  },
];

// Helper functions ────────────────────────────────────────────────────
export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((b) => b.slug === slug);
}

export function getBlogsByCategory(category: BlogCategory): Blog[] {
  return blogs.filter((b) => b.category === category);
}

export function getRelatedBlogs(currentSlug: string, limit = 3): Blog[] {
  const current = getBlogBySlug(currentSlug);
  if (!current) return blogs.slice(0, limit);
  return blogs
    .filter((b) => b.slug !== currentSlug && b.category === current.category)
    .slice(0, limit);
}
