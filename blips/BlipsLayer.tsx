"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createBlips } from "./blipsEngine";

// useLayoutEffect on the client, useEffect on the server (avoids SSR warning)
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Full-viewport living "Blips" crew. Boots from a terminal, roams the page,
 * builds the tech stack into a rocket, Sudo's magic backfires, and the popped
 * card crossfades into the real DOM Developer Pass (.ab-pass). Then it loops to
 * ambient free-play. Respects prefers-reduced-motion (shows the pass, no crew).
 */
export default function BlipsLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useIso(() => {
    const reduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tilt = () => document.querySelector<HTMLElement>(".ab-tilt");
    const setReveal = (v: number) => {
      const el = tilt();
      if (!el) return;
      el.style.opacity = String(v);
      el.style.pointerEvents = v > 0.9 ? "" : "none";
    };

    if (reduced) {
      setReveal(1);
      return;
    }

    // Hide the real pass until the magic reveals it (pre-paint, no flash).
    const el = tilt();
    if (el) {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
    }

    const cv = canvasRef.current;
    if (!cv) return;

    const eng = createBlips(cv, {
      getPassRect: () => {
        const p = document.querySelector(".ab-pass");
        return p ? p.getBoundingClientRect() : null;
      },
      setPassReveal: setReveal,
    });

    return () => {
      eng.destroy();
      const e2 = tilt();
      if (e2) {
        e2.style.opacity = "";
        e2.style.pointerEvents = "";
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
        // isolate onto its own GPU layer so repaints don't cascade to the page
        transform: "translateZ(0)",
        willChange: "transform",
        contain: "strict",
        backfaceVisibility: "hidden",
      }}
    />
  );
}
