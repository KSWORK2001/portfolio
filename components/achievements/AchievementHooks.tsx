"use client";

import { useEffect } from "react";
import { useAchievements } from "./AchievementsContext";

export function AchievementHooks() {
  const { unlock } = useAchievements();

  useEffect(() => {
    // First-blood: arrived on the site
    const arriveTimer = window.setTimeout(() => unlock("first-blood"), 700);

    // Patient visitor: 60s on site
    const patientTimer = window.setTimeout(() => unlock("patient-visitor"), 60_000);

    // Completionist: scrolled all the way to bottom
    const onScroll = () => {
      const h = document.documentElement;
      if (h.scrollTop + h.clientHeight >= h.scrollHeight - 8) {
        unlock("completionist");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Dev-tools lurker: detect open devtools via window outer/inner delta
    const devCheck = () => {
      const widthDelta = window.outerWidth - window.innerWidth;
      const heightDelta = window.outerHeight - window.innerHeight;
      if (widthDelta > 160 || heightDelta > 160) {
        unlock("dev-tools-lurker");
      }
    };
    const devTimer = window.setInterval(devCheck, 1500);

    return () => {
      window.clearTimeout(arriveTimer);
      window.clearTimeout(patientTimer);
      window.clearInterval(devTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [unlock]);

  return null;
}
