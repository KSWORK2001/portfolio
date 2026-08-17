"use client";

import styles from "./EvalMatrix.module.css";
import { useInView } from "./useInView";

/**
 * The nightly regression suite, one cell per golden workflow.
 *
 * The eight red cells are the reason this is here rather than a number.
 * A pass rate tells you nothing about whether the failures matter; the
 * named ones underneath do, and all three are the kind of failure a
 * pass rate hides — right steps, wrong policy; right answer, skipped
 * gate. That is what the judge is for.
 */

const TOTAL = 420;
const FAILED = new Set([37, 88, 141, 196, 203, 288, 331, 402]);

const NAMED = [
  { name: "refund_over_limit", why: "cited a superseded policy" },
  { name: "address_change_midflight", why: "skipped the confirm gate" },
  { name: "partial_return_multi_item", why: "right steps, wrong total" }
];

export function EvalMatrix() {
  const { ref, inView } = useInView<HTMLElement>(0.25);

  return (
    <figure className={`win ${styles.matrix}`} ref={ref}>
      <div className="win__bar">
        <span className="chip chip--pass">
          <span className="dot" />
          nightly
        </span>
        <span className="win__title">pytest -q tests/golden/</span>
        <span className="win__end">{TOTAL} workflows</span>
      </div>

      <div className={styles.gridWrap}>
        <div
          className={`${styles.grid} ${inView ? styles.gridIn : ""}`}
          role="img"
          aria-label={`${TOTAL - FAILED.size} of ${TOTAL} golden workflows passed`}
        >
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className={FAILED.has(i) ? styles.cellFail : styles.cellPass} />
          ))}
        </div>

        <p className={styles.tally}>
          <span className={styles.pass}>{TOTAL - FAILED.size} passed</span>
          <span className={styles.sep}>·</span>
          <span className={styles.fail}>{FAILED.size} failed</span>
          <span className={styles.rate}>98.1%</span>
        </p>
      </div>

      <ul className={styles.failures}>
        {NAMED.map((f) => (
          <li key={f.name}>
            <span className={styles.fName}>{f.name}</span>
            <span className={styles.fWhy}>judge: {f.why}</span>
          </li>
        ))}
        <li className={styles.more}>
          <span className={styles.fName}>+5 more</span>
          <span className={styles.fWhy}>all triaged before the next release</span>
        </li>
      </ul>
    </figure>
  );
}
