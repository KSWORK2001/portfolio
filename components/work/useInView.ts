"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once, when the element has been on screen enough to be worth
 * animating for. Charts that fill in before you scroll to them have not
 * shown you anything, so every animated artwork on the page waits.
 *
 * Returns `true` immediately if the reader prefers reduced motion, or if
 * the observer never reports — the artwork should end up in its finished
 * state either way, never stuck at zero.
 */
export function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduced) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);

    const failsafe = window.setTimeout(() => setInView(true), 3000);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [threshold]);

  return { ref, inView };
}
