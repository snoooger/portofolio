"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Pin dan scrub berat hanya untuk layar lebar tanpa reduced-motion. */
export const DESKTOP_MOTION =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
export const LIGHT_MOTION =
  "(max-width: 1023px) and (prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
