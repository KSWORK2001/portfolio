"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  target?: string;
  rel?: string;
  strength?: number;
};

export function MagneticButton({
  children,
  href,
  className = "",
  target,
  rel,
  strength = 0.35
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  };

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className={className}
      data-magnetic="true"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)", display: "inline-block" }}
    >
      {children}
    </a>
  );
}
