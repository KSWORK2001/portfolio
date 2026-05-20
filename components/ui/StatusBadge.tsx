"use client";

import { useEffect, useState } from "react";
import styles from "./StatusBadge.module.css";

const QUIPS = [
  "currently caffeinated",
  "training a model (probably)",
  "pretending the bug is a feature",
  "GPU goes brrr",
  "asking the LLM nicely",
  "in deep work — slack me anyway",
  "agentic shenanigans in progress",
  "vibe-debugging"
];

export function StatusBadge() {
  const [time, setTime] = useState("");
  const [quip, setQuip] = useState(QUIPS[0]);

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    setTime(fmt());
    setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]);

    const tick = setInterval(() => setTime(fmt()), 30_000);
    const flip = setInterval(
      () => setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]),
      6_000
    );
    return () => {
      clearInterval(tick);
      clearInterval(flip);
    };
  }, []);

  return (
    <div className={styles.badge} aria-live="polite">
      <span className={styles.dot} />
      <span className={styles.label}>
        ATL · <strong>{time}</strong>
      </span>
      <span className={styles.sep}>·</span>
      <span className={styles.quip} key={quip}>
        {quip}
      </span>
    </div>
  );
}
