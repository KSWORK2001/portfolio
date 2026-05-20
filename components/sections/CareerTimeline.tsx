"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CareerTimeline.module.css";

type TimelineItem = {
  role: string;
  company: string;
  period: string;
  detail: string;
  bullets: string[];
};

type CareerTimelineProps = {
  items: TimelineItem[];
};

export function CareerTimeline({ items }: CareerTimelineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(() => items.map(() => false));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.idx);
          if (Number.isNaN(idx)) return;
          if (entry.isIntersecting) {
            setVisible((prev) => {
              if (prev[idx]) return prev;
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.25, rootMargin: "-10% 0px -15% 0px" }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const viewH = window.innerHeight;
      // Progress: from when top of wrap reaches center of viewport to when bottom does
      const start = -rect.top + viewH * 0.5;
      const total = rect.height;
      const p = Math.max(0, Math.min(1, start / total));
      setProgress(p);
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

  return (
    <section className="section">
      <div className="container">
        <p className="section-kicker">Experience</p>
        <h2 className="section-title">
          Six roles. <span className={styles.titleAccent}>One throughline.</span>
        </h2>
        <p className={styles.subhead}>
          Each step taught me something I bring to the next one. Hover any milestone for the bullets.
        </p>

        <div ref={wrapRef} className={styles.timeline}>
          <div className={styles.spine} aria-hidden="true">
            <div
              className={styles.spineFill}
              style={{ transform: `scaleY(${progress})` }}
            />
            <div
              className={styles.pulse}
              style={{ top: `${progress * 100}%` }}
            />
          </div>

          {items.map((item, idx) => {
            const side = idx % 2 === 0 ? "left" : "right";
            return (
              <div
                key={`${item.company}-${idx}`}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                data-idx={idx}
                className={`${styles.row} ${styles[`row${side === "left" ? "Left" : "Right"}`]} ${
                  visible[idx] ? styles.rowVisible : ""
                }`}
              >
                <span className={styles.node} aria-hidden="true">
                  <span className={styles.nodeInner} />
                </span>
                <span className={styles.connector} aria-hidden="true" />
                <article className={styles.card}>
                  <p className={styles.period}>{item.period}</p>
                  <h3 className={styles.role}>{item.role}</h3>
                  <p className={styles.company}>
                    <span className={styles.companyDot} aria-hidden="true" />
                    {item.company}
                  </p>
                  <p className={styles.detail}>{item.detail}</p>
                  <ul className={styles.bullets}>
                    {item.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
