"use client";

import { useEffect, useState } from "react";
import { useAchievements } from "@/components/achievements/AchievementsContext";
import styles from "./KonamiEgg.module.css";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a"
];

const LINES = [
  "It's not who I am underneath, but what I deploy that defines me.",
  "Bat-Signal received. Patching the Joker's prompt injection now.",
  "Why so serial...izer errors?",
  "Justice League hiring? I bring full-stack and a cape."
];

export function KonamiEgg() {
  const [active, setActive] = useState(false);
  const [line, setLine] = useState(LINES[0]);
  const { unlock } = useAchievements();

  useEffect(() => {
    let idx = 0;

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = SEQUENCE[idx];
      if (key === expected) {
        idx += 1;
        if (idx === SEQUENCE.length) {
          idx = 0;
          trigger();
        }
      } else {
        idx = key === SEQUENCE[0] ? 1 : 0;
      }
    };

    const trigger = () => {
      setLine(LINES[Math.floor(Math.random() * LINES.length)]);
      setActive(true);
      unlock("bat-signal");
      document.documentElement.classList.add("konami-on");
      window.setTimeout(() => {
        setActive(false);
        document.documentElement.classList.remove("konami-on");
      }, 4200);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!active) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <svg className={styles.signal} viewBox="0 0 200 120" aria-hidden="true">
        <defs>
          <radialGradient id="batGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="60" rx="98" ry="55" fill="url(#batGlow)" />
        <path
          d="M100 36 C 95 28, 86 26, 80 30 C 78 22, 70 18, 64 22 C 70 30, 66 38, 60 40 C 70 44, 78 50, 82 58 C 86 54, 94 54, 100 60 C 106 54, 114 54, 118 58 C 122 50, 130 44, 140 40 C 134 38, 130 30, 136 22 C 130 18, 122 22, 120 30 C 114 26, 105 28, 100 36 Z"
          fill="#0b0f14"
        />
      </svg>
      <p className={styles.line}>{line}</p>
      <p className={styles.hint}>↑ ↑ ↓ ↓ ← → ← → B A — Bat-Mode unlocked</p>
    </div>
  );
}
