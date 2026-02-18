"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  end: number;
  durationMs?: number;
  suffix?: string;
  className?: string;
};

export function CountUp({ end, durationMs = 1400, suffix = "", className }: CountUpProps) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || started) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) {
      return;
    }

    let frame = 0;
    const totalFrames = Math.max(1, Math.round(durationMs / 16));

    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(end * eased));

      if (progress >= 1) {
        window.clearInterval(timer);
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [durationMs, end, started]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
