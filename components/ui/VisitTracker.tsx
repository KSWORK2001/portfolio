"use client";

import { useEffect, useState } from "react";
import styles from "./VisitTracker.module.css";

const STORAGE_KEY = "karan.portfolio.lastVisit.v1";
const VISIT_COUNT_KEY = "karan.portfolio.visitCount.v1";

type Greeting = {
  headline: string;
  sub?: string;
  tone: "first" | "soon" | "recent" | "back" | "stale" | "ghost";
};

function formatRelative(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  const y = Math.floor(d / 365);
  return `${y} year${y === 1 ? "" : "s"} ago`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function buildGreeting(prev: number | null, visitCount: number): Greeting {
  if (prev === null) {
    return {
      headline: "First time here? Welcome.",
      sub: "Don't worry — I'll remember you next time. (Not in a creepy way.)",
      tone: "first"
    };
  }

  const diff = Date.now() - prev;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (diff < 10 * minute) {
    return {
      headline: "Wasn't expecting you this soon.",
      sub: `Last seen ${formatRelative(diff)}. Stalker behavior. Respect.`,
      tone: "soon"
    };
  }
  if (diff < hour) {
    return {
      headline: "Back already?",
      sub: `You were just here — ${formatRelative(diff)}. Forget something?`,
      tone: "soon"
    };
  }
  if (diff < day) {
    return {
      headline: "Welcome back.",
      sub: `Last visit was ${formatRelative(diff)} — visit #${visitCount + 1}.`,
      tone: "recent"
    };
  }
  if (diff < week) {
    return {
      headline: "Good to see you again.",
      sub: `Last visit: ${formatDate(prev)} (${formatRelative(diff)}). Visit #${visitCount + 1}.`,
      tone: "back"
    };
  }
  if (diff < month) {
    return {
      headline: "Long time no scroll.",
      sub: `Last visit was ${formatDate(prev)}. Anything new since then? Always.`,
      tone: "stale"
    };
  }
  return {
    headline: "Where have you been?",
    sub: `Last seen ${formatDate(prev)} — that's ${formatRelative(diff)}. The portfolio has shipped. I hope you have too.`,
    tone: "ghost"
  };
}

export function VisitTracker() {
  const [greeting, setGreeting] = useState<Greeting | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let prev: number | null = null;
    let visitCount = 0;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) prev = Number(raw) || null;
      const countRaw = localStorage.getItem(VISIT_COUNT_KEY);
      visitCount = countRaw ? Number(countRaw) || 0 : 0;
    } catch {
      // ignore
    }

    // Suppress re-showing on hot reloads within the same session
    const sessionShown = sessionStorage.getItem("karan.portfolio.greeted");
    if (sessionShown) {
      // Still bump the timestamp so other tabs/pages get fresh
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      return;
    }

    setGreeting(buildGreeting(prev, visitCount));

    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      localStorage.setItem(VISIT_COUNT_KEY, String(visitCount + 1));
      sessionStorage.setItem("karan.portfolio.greeted", "1");
    } catch {
      // ignore
    }

    const auto = window.setTimeout(() => setDismissed(true), 9000);
    return () => window.clearTimeout(auto);
  }, []);

  if (!greeting || dismissed) return null;

  return (
    <div className={`${styles.toast} ${styles[`tone_${greeting.tone}`]}`} role="status">
      <button
        type="button"
        className={styles.close}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        ✕
      </button>
      <p className={styles.kicker}>Welcome chip</p>
      <p className={styles.headline}>{greeting.headline}</p>
      {greeting.sub && <p className={styles.sub}>{greeting.sub}</p>}
      <div className={styles.timer} />
    </div>
  );
}
