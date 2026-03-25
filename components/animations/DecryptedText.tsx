"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./DecryptedText.module.css";

type DecryptedTextProps = {
  text: string;
  className?: string;
  speed?: number;
};

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

function glyphFor(text: string, index: number, revealed: number) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  const glyphIndex = (hash + index * 17 + revealed * 13) % glyphs.length;
  return glyphs[glyphIndex];
}

export function DecryptedText({ text, className, speed = 32 }: DecryptedTextProps) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    const timer = window.setInterval(() => {
      setRevealed((prev) => {
        if (prev >= text.length) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed]);

  const value = useMemo(() => {
    return text
      .split("")
      .map((char, idx) => {
        if (idx < revealed || char === " ") {
          return char;
        }
        return glyphFor(text, idx, revealed);
      })
      .join("");
  }, [text, revealed]);

  return <span className={`${styles.text} ${className ?? ""}`.trim()}>{value}</span>;
}
