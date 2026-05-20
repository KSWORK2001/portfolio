"use client";

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  max?: number;
  glow?: boolean;
  style?: CSSProperties;
};

export function TiltCard({ children, className = "", max = 8, glow = true, style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -2 * max;
    const ry = (px - 0.5) * 2 * max;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    if (glow) {
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transition: "transform 220ms ease",
        transformStyle: "preserve-3d",
        position: "relative",
        ...style
      }}
    >
      {children}
      {glow && (
        <div
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background:
              "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(121,192,255,0.18), transparent 55%)",
            opacity: 0.9,
            mixBlendMode: "screen"
          }}
        />
      )}
    </div>
  );
}
