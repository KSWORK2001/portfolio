"use client";

import { useEffect, useState } from "react";
import styles from "./TrueFocus.module.css";

type TrueFocusProps = {
  words: string[];
  intervalMs?: number;
};

export function TrueFocus({ words, intervalMs = 1800 }: TrueFocusProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [words.length, intervalMs]);

  return (
    <div className={styles.wrapper}>
      {words.map((word, idx) => (
        <span key={word} className={idx === activeIndex ? styles.active : styles.inactive}>
          {word}
        </span>
      ))}
    </div>
  );
}
