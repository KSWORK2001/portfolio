"use client";

import styles from "./QuotaPanel.module.css";
import { useInView } from "./useInView";

/**
 * Galaxy, the control plane, doing the one thing a control plane is for:
 * showing who is using the GPUs and stopping the project that is over
 * its cap. The amber row is the interesting one — it is throttled, not
 * killed, which is the distinction the panel exists to make.
 */

const PROJECTS = [
  { name: "merchandising-ai", pct: 74, hw: "A100 × 8" },
  { name: "associate-copilot", pct: 52, hw: "A100 × 4" },
  { name: "supply-forecast", pct: 96, hw: "H100 × 2", over: true },
  { name: "search-rerank", pct: 38, hw: "L4 × 12" },
  { name: "returns-triage", pct: 21, hw: "L4 × 6" }
];

export function QuotaPanel() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <figure className={`win ${styles.panel}`} ref={ref}>
      <div className="win__bar">
        <span className="chip chip--run">
          <span className="dot" />
          galaxy
        </span>
        <span className="win__title">inference quota · gcp</span>
        <span className="win__end">10 projects</span>
      </div>

      <div className={styles.rows}>
        {PROJECTS.map((p) => (
          <p className={styles.row} key={p.name}>
            <span className={styles.name}>{p.name}</span>
            <span className={styles.track} aria-hidden="true">
              <i
                className={p.over ? styles.fillOver : styles.fill}
                style={{ width: inView ? `${p.pct}%` : "0%" }}
              />
            </span>
            <span className={p.over ? styles.pctOver : styles.pct}>{p.pct}%</span>
            <span className={styles.hw}>{p.hw}</span>
          </p>
        ))}
      </div>

      <div className="win__foot">
        <span className={styles.warn}>supply-forecast</span>
        <span className={styles.footText}>
          over soft cap — throttled to burst, not cut off
        </span>
      </div>
    </figure>
  );
}
