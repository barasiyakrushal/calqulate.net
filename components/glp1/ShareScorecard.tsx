"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Share2, Download, Copy, Check, ImageDown } from "lucide-react";
import type { ScorecardData } from "@/lib/glp1/scorecard";

const W = 1080;
const H = 1350;
const SHARE_URL = "https://calqulate.net/service/glp1-progress-tracker";

/**
 * Branded, screenshot-worthy weekly scorecard + one-tap sharing.
 * The <canvas> is the single source of truth: it's shown on screen AND exported
 * as the PNG. On mobile we use the native share sheet (real "share to Instagram/
 * Reddit/Facebook"); on desktop we download the image and open each composer.
 */
export function ShareScorecard({ data }: { data: ScorecardData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [caption, setCaption] = useState(fullCaption(data));
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawScorecard(canvas, data);
  }, [data]);

  const toBlob = useCallback(
    () =>
      new Promise<Blob | null>((resolve) => {
        const c = canvasRef.current;
        if (!c) return resolve(null);
        c.toBlob((b) => resolve(b), "image/png");
      }),
    [],
  );

  const download = useCallback(async () => {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calqulate-glp1-scorecard.png";
    a.click();
    URL.revokeObjectURL(url);
  }, [toBlob]);

  const copyImage = useCallback(async () => {
    try {
      const blob = await toBlob();
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Scorecard image copied");
    } catch {
      toast.error("Couldn't copy the image — try Download instead");
    }
  }, [toBlob]);

  const copyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy the caption");
    }
  }, [caption]);

  /** Native share sheet with the image file — the real path to Instagram et al. */
  const nativeShare = useCallback(async (): Promise<boolean> => {
    const blob = await toBlob();
    if (!blob) return false;
    const file = new File([blob], "calqulate-glp1-scorecard.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: caption, title: "My GLP-1 progress" });
        return true;
      } catch {
        return true; // user dismissed the sheet — treat as handled
      }
    }
    return false;
  }, [toBlob, caption]);

  const shareGeneric = useCallback(async () => {
    setBusy(true);
    const shared = await nativeShare();
    if (!shared) {
      await download();
      toast.success("Scorecard downloaded — attach it to your post");
    }
    setBusy(false);
  }, [nativeShare, download]);

  const shareTo = useCallback(
    async (platform: "reddit" | "facebook" | "instagram") => {
      setBusy(true);
      const shared = await nativeShare();
      if (!shared) {
        // Desktop fallback: save the image, copy the caption, open the composer.
        await download();
        try {
          await navigator.clipboard.writeText(caption);
        } catch {
          /* clipboard may be blocked; the image is still downloaded */
        }
        const composer: Record<typeof platform, string | null> = {
          reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(stripTags(caption))}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}&quote=${encodeURIComponent(caption)}`,
          instagram: null, // Instagram has no web composer
        };
        const url = composer[platform];
        if (url) window.open(url, "_blank", "noopener,noreferrer");
        toast.success(
          platform === "instagram"
            ? "Scorecard saved & caption copied — open Instagram to post it"
            : "Scorecard saved & caption copied — attach the image in the post",
        );
      }
      setBusy(false);
    },
    [nativeShare, download, caption],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-bold text-gray-900">Share your scorecard</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        A clean, branded card of your progress — post it to your community or send it to your doctor. Made on your device; nothing is uploaded.
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start">
        {/* Live preview (the same canvas that gets exported) */}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ aspectRatio: `${W} / ${H}` }}
          className="mx-auto h-auto w-full max-w-[220px] rounded-xl border border-gray-100 shadow-sm"
        />

        <div>
          {/* Primary + brand share buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={shareGeneric}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
            <BrandButton label="Reddit" bg="#FF4500" onClick={() => shareTo("reddit")} disabled={busy}>
              <RedditIcon />
            </BrandButton>
            <BrandButton label="Facebook" bg="#1877F2" onClick={() => shareTo("facebook")} disabled={busy}>
              <FacebookIcon />
            </BrandButton>
            <BrandButton
              label="Instagram"
              bg="linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)"
              onClick={() => shareTo("instagram")}
              disabled={busy}
            >
              <InstagramIcon />
            </BrandButton>
          </div>

          {/* Secondary actions */}
          <div className="mt-2 flex flex-wrap gap-2">
            <SecondaryButton onClick={download} icon={<ImageDown className="h-4 w-4" />}>Download</SecondaryButton>
            <SecondaryButton onClick={copyImage} icon={<Download className="h-4 w-4" />}>Copy image</SecondaryButton>
          </div>

          {/* Editable caption */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="sc-caption" className="text-xs font-semibold uppercase tracking-wide text-gray-400">Caption</label>
              <button onClick={copyCaption} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              id="sc-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="mt-1 w-full resize-y rounded-xl border border-input bg-background p-3 text-base text-gray-700"
            />
          </div>

          <p className="mt-2 text-[11px] text-gray-400">
            On phones, “Share” opens your share sheet to post straight to Instagram, Reddit or Facebook. On desktop it downloads the image and opens the composer. Your goal weight and exact bodyweight are never shown.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── buttons ───────────────────────────────────────────────────────────────────

function BrandButton({ label, bg, onClick, disabled, children }: { label: string; bg: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Share to ${label}`}
      style={{ background: bg }}
      className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SecondaryButton({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
      {icon} {children}
    </button>
  );
}

// ─── brand marks (inline so we don't depend on lucide brand icons) ─────────────

function RedditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.01 11.03c.02.16.03.32.03.49 0 2.5-2.91 4.53-6.5 4.53s-6.5-2.03-6.5-4.53c0-.17.01-.33.03-.49a1.4 1.4 0 0 1 .96-2.43c.36 0 .69.14.94.36 1.03-.7 2.42-1.15 3.96-1.2l.79-3.55 2.5.56a1.02 1.02 0 1 1-.1.46l-2.14-.48-.67 3.01c1.5.07 2.86.51 3.88 1.2.25-.22.58-.36.94-.36a1.4 1.4 0 0 1 .96 2.43zM9.1 12.7a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm5.66 2.87a.38.38 0 0 0-.53-.02c-.5.43-1.36.58-2.23.58-.87 0-1.73-.15-2.23-.58a.38.38 0 1 0-.5.57c.72.62 1.79.76 2.73.76.94 0 2.01-.14 2.73-.76a.38.38 0 0 0 .03-.53zm-.86-1.87a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.34a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 10.72a4.22 4.22 0 1 1 0-8.44 4.22 4.22 0 0 1 0 8.44zm6.77-10.98a1.52 1.52 0 1 1-3.04 0 1.52 1.52 0 0 1 3.04 0z" />
    </svg>
  );
}

// ─── caption helpers ───────────────────────────────────────────────────────────

function fullCaption(d: ScorecardData): string {
  return `${d.caption}\n\n${d.hashtags.map((h) => `#${h}`).join(" ")}`;
}
const stripTags = (s: string) => s.replace(/#\w+/g, "").replace(/\s+/g, " ").trim();

// ─── canvas rendering ──────────────────────────────────────────────────────────

const FONT = "'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif";

function drawScorecard(canvas: HTMLCanvasElement, d: ScorecardData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Top gradient band
  const bandH = 590;
  const grad = ctx.createLinearGradient(0, 0, W, bandH);
  grad.addColorStop(0, "#055536");
  grad.addColorStop(1, "#0e9355");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, bandH);

  const cx = W / 2;

  // Eyebrow title
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.textAlign = "center";
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText(spaced(d.title.toUpperCase()), cx, 96);

  // Period
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = `500 34px ${FONT}`;
  ctx.fillText(d.periodLabel, cx, 150);

  // Headline number
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 180px ${FONT}`;
  ctx.fillText(d.headlineValue, cx, 380);

  // Headline label
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `600 40px ${FONT}`;
  ctx.fillText(d.headlineLabel.toUpperCase(), cx, 450);

  // Status pill
  if (d.statusLine) {
    ctx.font = `600 32px ${FONT}`;
    const tw = ctx.measureText(d.statusLine).width;
    const pw = Math.min(W - 120, tw + 64);
    const px = cx - pw / 2;
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    roundRect(ctx, px, 500, pw, 60, 30);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(fit(ctx, d.statusLine, pw - 48), cx, 540);
  }

  // Stat tiles (2 columns)
  const stats = d.stats;
  const gap = 28;
  const marginX = 70;
  const tileW = (W - marginX * 2 - gap) / 2;
  const tileH = 190;
  const startY = bandH + 60;
  stats.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = marginX + col * (tileW + gap);
    const y = startY + row * (tileH + gap);

    ctx.fillStyle = "#f4f9f6";
    roundRect(ctx, x, y, tileW, tileH, 24);
    ctx.fill();
    ctx.strokeStyle = "#e3efe8";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, tileW, tileH, 24);
    ctx.stroke();

    ctx.textAlign = "left";
    const pad = 36;
    ctx.fillStyle = "#8a9a91";
    ctx.font = `600 28px ${FONT}`;
    ctx.fillText(s.label.toUpperCase(), x + pad, y + 56);

    ctx.fillStyle = "#0e9355";
    ctx.font = `800 64px ${FONT}`;
    ctx.fillText(fit(ctx, s.value, tileW - pad * 2), x + pad, y + 128);

    if (s.sub) {
      ctx.fillStyle = "#8a9a91";
      ctx.font = `500 28px ${FONT}`;
      ctx.fillText(s.sub, x + pad, y + 168);
    }
  });

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#0e9355";
  ctx.font = `800 46px ${FONT}`;
  ctx.fillText("calqulate.net", cx, H - 96);
  ctx.fillStyle = "#9aa8a1";
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText("GLP-1 progress tracker · estimates, not medical advice", cx, H - 52);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Truncate text with an ellipsis to fit a pixel width in the current font. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

const spaced = (s: string) => s.split("").join(" ");
