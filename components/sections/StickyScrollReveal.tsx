"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./StickyScrollReveal.module.css";

type Item = {
  title: string;
  text: string;
  bullets: string[];
};

type StickyScrollRevealProps = {
  items: Item[];
};

export function StickyScrollReveal({ items }: StickyScrollRevealProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = document.querySelectorAll("[data-reveal-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.revealIndex);
            setActive(index);
          }
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const activeItem = useMemo(() => items[active] ?? items[0], [active, items]);

  return (
    <div className={styles.layout}>
      <aside className={styles.stickyPane}>
        <div className={styles.previewCard}>
          <p className={styles.kicker}>Experience highlight</p>
          <h3>{activeItem.title}</h3>
          <p>{activeItem.text}</p>
          <ul className={styles.bullets}>
            {activeItem.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </aside>
      <div className={styles.scrollPane}>
        {items.map((item, index) => (
          <section key={item.title} className={styles.step} data-reveal-index={index}>
            <h4>{item.title}</h4>
            <p>{item.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
