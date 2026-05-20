"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAchievements } from "./AchievementsContext";

/** Wrap the email CTA — unlocks "inbox-slide" on click. */
export function EmailTrigger({ children }: { children: ReactNode }) {
  const { unlock } = useAchievements();
  return (
    <span onClickCapture={() => unlock("inbox-slide")} style={{ display: "contents" }}>
      {children}
    </span>
  );
}

/** Wrap each FAQ <details>; unlock "curious-mind" once all FAQs have been opened. */
export function FaqTracker({
  total,
  children
}: {
  total: number;
  children: ReactNode;
}) {
  const opened = useRef(new Set<string>());
  const containerRef = useRef<HTMLDivElement>(null);
  const { unlock } = useAchievements();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onToggle = (e: Event) => {
      const details = e.target as HTMLDetailsElement | null;
      if (!details || details.tagName !== "DETAILS") return;
      if (details.open) {
        const key =
          details.dataset.faqId || details.querySelector("summary")?.textContent || "";
        opened.current.add(key);
        if (opened.current.size >= total) {
          unlock("curious-mind");
        }
      }
    };
    container.addEventListener("toggle", onToggle, true);
    return () => container.removeEventListener("toggle", onToggle, true);
  }, [total, unlock]);

  return <div ref={containerRef}>{children}</div>;
}

/** Wrap all stat cards; unlock "stat-stalker" after the user has hovered each one. */
export function StatHoverTracker({
  total,
  children
}: {
  total: number;
  children: ReactNode;
}) {
  const hovered = useRef(new Set<number>());
  const { unlock } = useAchievements();

  const onEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest("[data-stat-idx]") as HTMLElement | null;
    if (!target) return;
    const idx = Number(target.dataset.statIdx);
    if (!Number.isNaN(idx)) {
      hovered.current.add(idx);
      if (hovered.current.size >= total) {
        unlock("stat-stalker");
      }
    }
  };

  return (
    <div onMouseOverCapture={onEnter} style={{ display: "contents" }}>
      {children}
    </div>
  );
}

/** Click counter on the headshot. 5 clicks = "star-struck". */
export function HeadshotClickTracker({ children }: { children: ReactNode }) {
  const count = useRef(0);
  const { unlock } = useAchievements();

  useEffect(() => {
    return () => {
      count.current = 0;
    };
  }, []);

  return (
    <span
      onClickCapture={() => {
        count.current += 1;
        if (count.current >= 5) unlock("star-struck");
      }}
      style={{ display: "contents" }}
    >
      {children}
    </span>
  );
}
