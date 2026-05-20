"use client";

import { useEffect, useRef, useState } from "react";
import { useAchievements } from "@/components/achievements/AchievementsContext";
import styles from "./ScrollStats.module.css";

type Stat = { value: number; suffix: string; label: string };

type ScrollStatsProps = {
  stats: Stat[];
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function ScrollStats({ stats }: ScrollStatsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const { unlock } = useAchievements();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let raf = 0;
    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const wrapH = wrap.offsetHeight;
      const viewH = window.innerHeight;
      const start = rect.top;
      const total = wrapH - viewH;
      const scrolled = -start;
      const p = total <= 0 ? 0 : Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
      if (p >= 0.95) unlock("stat-stalker");
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Each stat gets its own scroll slice — staggered start so they count up one after another
  const sliceLength = 1 / stats.length;
  const overlap = 0.55; // stats overlap their counting window for a flowing feel

  return (
    <section ref={wrapRef} className={styles.wrap} aria-label="Impact at a glance">
      <div className={styles.sticky}>
        <div className={styles.bgGradient} style={{ opacity: 0.6 + progress * 0.3 }} />

        <div className={styles.inner}>
          <p className={styles.kicker}>The Impact</p>
          <h2 className={styles.heading}>
            Numbers that <span className={styles.accent}>actually moved</span>.
          </h2>

          <div className={styles.grid}>
            {stats.map((stat, i) => {
              const start = i * sliceLength * (1 - overlap);
              const end = Math.min(1, start + sliceLength);
              const localT = Math.max(0, Math.min(1, (progress - start) / (end - start)));
              const eased = easeOutCubic(localT);
              const displayed = Math.round(stat.value * eased);
              const active = localT > 0.05 && localT < 0.999;
              const done = localT >= 0.999;
              return (
                <div
                  key={stat.label}
                  className={`${styles.card} ${active ? styles.cardActive : ""} ${
                    done ? styles.cardDone : ""
                  }`}
                  style={{ ["--lt" as never]: localT }}
                >
                  <div className={styles.cardNum}>
                    <span>{displayed}</span>
                    <span className={styles.cardSuffix}>{stat.suffix}</span>
                  </div>
                  <p className={styles.cardLabel}>{stat.label}</p>
                  <div
                    className={styles.cardBar}
                    style={{ transform: `scaleX(${localT})` }}
                  />
                </div>
              );
            })}
          </div>

          <p className={styles.foot}>
            Built into real systems at Home Depot, AT&amp;T, Southern Company, Elevance — not slide decks.
          </p>
        </div>
      </div>
    </section>
  );
}
