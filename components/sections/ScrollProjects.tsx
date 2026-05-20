"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollProjects.module.css";

type Project = {
  title: string;
  stack: string;
  summary: string;
  impact: string;
  image: string;
};

type ScrollProjectsProps = {
  projects: Project[];
};

export function ScrollProjects({ projects }: ScrollProjectsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);

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
      const idx = Math.min(
        projects.length - 1,
        Math.floor(p * projects.length - 1e-6)
      );
      setActiveIdx((cur) => (cur === Math.max(0, idx) ? cur : Math.max(0, idx)));
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
  }, [projects.length]);

  const total = projects.length;
  const sliceP = (progress * total) % 1; // 0..1 within current slice

  return (
    <section
      ref={wrapRef}
      className={styles.wrap}
      style={{ height: `${total * 100 + 60}vh` }}
      aria-label="Project showcase"
    >
      <div className={styles.sticky}>
        <div className={styles.bg} />

        <div className={styles.header}>
          <p className={styles.kicker}>Built · Shipped</p>
          <h2 className={styles.heading}>
            Things I <span className={styles.accent}>actually built</span>.
          </h2>
          <p className={styles.counter}>
            <span className={styles.counterNum}>{String(activeIdx + 1).padStart(2, "0")}</span>
            <span className={styles.counterSep}>/</span>
            <span className={styles.counterTotal}>{String(total).padStart(2, "0")}</span>
          </p>
        </div>

        <div className={styles.stage}>
          {projects.map((p, i) => {
            const distance = i - activeIdx;
            const isActive = i === activeIdx;
            const isNext = distance === 1;
            const isPrev = distance === -1;
            // Dwell + handoff: card sits fully visible for the first 75% of its slice,
            // then a clean 25% transition swaps it out for the next one. No long crossfade.
            const HANDOFF_START = 0.75;
            const tHandoff = sliceP < HANDOFF_START
              ? 0
              : (sliceP - HANDOFF_START) / (1 - HANDOFF_START);
            let opacity = 0;
            let translateY = 30;
            let scale = 0.95;
            if (isActive) {
              opacity = 1 - tHandoff;
              translateY = -tHandoff * 24;
              scale = 1 - tHandoff * 0.03;
            } else if (isNext) {
              opacity = tHandoff;
              translateY = (1 - tHandoff) * 24;
              scale = 0.97 + tHandoff * 0.03;
            } else if (isPrev) {
              opacity = 0;
              translateY = -32;
              scale = 0.94;
            }
            return (
              <article
                key={p.title}
                className={styles.card}
                style={{
                  opacity,
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  pointerEvents: isActive ? "auto" : "none",
                  zIndex: isActive ? 3 : isNext ? 2 : 1
                }}
                aria-hidden={!isActive}
              >
                <div className={styles.media}>
                  <img src={p.image} alt={p.title} loading="lazy" />
                  <div className={styles.mediaGlow} />
                </div>
                <div className={styles.copy}>
                  <p className={styles.cardKicker}>{p.stack}</p>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  <p className={styles.cardSummary}>{p.summary}</p>
                  <div className={styles.impact}>
                    <span className={styles.impactDot} aria-hidden="true" />
                    <span>{p.impact}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.dots} aria-hidden="true">
          {projects.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === activeIdx ? styles.dotOn : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
