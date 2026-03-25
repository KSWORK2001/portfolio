"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./StickyScrollReveal.module.css";

type Item = {
  company: string;
  role: string;
  detail: string;
  period: string;
  bullets: string[];
};

type StickyScrollRevealProps = {
  items: Item[];
};

export function StickyScrollReveal({ items }: StickyScrollRevealProps) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const sections = stepRefs.current.filter((section): section is HTMLElement => section !== null);
    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length === 0) {
          return;
        }

        const index = Number((visibleEntries[0].target as HTMLElement).dataset.revealIndex);
        if (!Number.isNaN(index)) {
          setActive(index);
        }
      },
      {
        rootMargin: "-20% 0px -35% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items.length]);

  const activeItem = useMemo(() => items[active] ?? items[0], [active, items]);

  return (
    <div className={styles.layout}>
      <aside className={styles.stickyPane}>
        <div className={styles.previewCard}>
          <p className={styles.kicker}>Experience highlight</p>
          <h3>{activeItem.company}</h3>
          <p className={styles.previewRole}>{activeItem.role}</p>
          <p>{activeItem.detail}</p>
        </div>
      </aside>
      <div className={styles.scrollPane}>
        {items.map((item, index) => (
          <section
            key={`${item.company}-${item.role}`}
            className={styles.step}
            data-reveal-index={index}
            ref={(node) => {
              stepRefs.current[index] = node;
            }}
          >
            <h4>{item.role}</h4>
            <p className={styles.stepMeta}>
              {item.company} • {item.period}
            </p>
            <ul className={styles.stepBullets}>
              {item.bullets.map((bullet) => (
                <li key={`${item.company}-${bullet}`}>{bullet}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
