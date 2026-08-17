"use client";

import { useEffect } from "react";

/**
 * All of the page's motion, in one place.
 *
 * Everything here is an enhancement and nothing is a requirement: the
 * hidden state for reveals is scoped to `html.js`, so if this never
 * mounts the page is simply visible rather than blank.
 */
export function ScrollFX() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    /* Reveal content as it comes into view. One observer, unobserving as
       it goes, so scrolling back up does not replay everything. */
    const targets = Array.from(document.querySelectorAll("[data-reveal]"));
    const showAll = () => targets.forEach((el) => el.classList.add("is-in"));

    if (!("IntersectionObserver" in window) || reduced) {
      showAll();
    } else {
      const reveal = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.classList.add("is-in");
            reveal.unobserve(e.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      targets.forEach((el) => reveal.observe(el));
      cleanups.push(() => reveal.disconnect());

      /* If nothing has reported in shortly after load, something is
         stopping the observer. Show everything rather than leave the
         page looking empty. */
      const failsafe = window.setTimeout(() => {
        if (!document.querySelector("[data-reveal].is-in")) showAll();
      }, 1200);
      cleanups.push(() => window.clearTimeout(failsafe));
    }

    /* The bar gives ground once you leave the hero. */
    const bar = document.getElementById("bar");
    if (bar) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          bar.classList.toggle("is-tight", window.scrollY > 120);
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
