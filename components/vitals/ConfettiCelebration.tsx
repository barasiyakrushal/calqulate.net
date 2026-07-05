"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * One-shot confetti burst for the welcome page. Pieces are generated after mount
 * (client-only) so there's no hydration mismatch, and the CSS animation plays
 * once then fades out. Purely decorative — pointer-events-none, aria-hidden, and
 * fully suppressed under prefers-reduced-motion (see globals.css).
 */

const COLORS = ["#10b981", "#059669", "#34d399", "#f59e0b", "#fbbf24", "#ffffff"];

interface Piece {
  id: number;
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
}

export function ConfettiCelebration() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    // Fire the payment-success toast once, alongside the confetti burst.
    toast.success("Payment successful! Welcome to Vitals Pro.");
    const arr: Piece[] = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.7,
      duration: 2.4 + Math.random() * 1.8,
      drift: (Math.random() - 0.5) * 160,
    }));
    setPieces(arr);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-80 overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--confetti-drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
