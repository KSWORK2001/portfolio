"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CardSwap.module.css";

type CardItem = {
  title: string;
  stack: string;
  summary: string;
  impact: string;
  image: string;
};

type CardSwapProps = {
  cards: CardItem[];
  intervalMs?: number;
};

export function CardSwap({ cards, intervalMs = 2800 }: CardSwapProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev: number) => (prev + 1) % cards.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [cards.length, intervalMs]);

  const activeCard = useMemo(() => cards[index] ?? cards[0], [cards, index]);

  return (
    <div className={styles.stage}>
      <article key={activeCard.title} className={styles.card}>
        <div className={styles.content}>
          <div className={styles.meta}>{activeCard.stack}</div>
          <h3>{activeCard.title}</h3>
          <p>{activeCard.summary}</p>
          <div className={styles.impact}>{activeCard.impact}</div>
        </div>
        <div className={styles.imageWrap}>
          <img src={activeCard.image} alt={`${activeCard.title} preview`} className={styles.image} />
        </div>
      </article>
    </div>
  );
}
