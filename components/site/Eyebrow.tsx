import type { ReactNode } from "react";

/**
 * Numbered eyebrow. The index is what gives a page its cadence rather
 * than just a sequence of headings, so most callers pass one; the hero
 * eyebrows do not, which is why `n` is optional.
 */
export function Eyebrow({
  n,
  children,
  onDark
}: {
  n?: string;
  children: ReactNode;
  onDark?: boolean;
}) {
  return (
    <p className={`eyebrow ${onDark ? "eyebrow--on-dark" : ""}`} data-reveal>
      {n ? <span className="eyebrow__n">{n}</span> : null}
      <span className="rule" />
      {children}
    </p>
  );
}
