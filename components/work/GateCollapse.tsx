"use client";

import styles from "./GateCollapse.module.css";
import { useInView } from "./useInView";

/**
 * Human gate interventions, before and after.
 *
 * Two bars, because two is how many real numbers there are. A five-point
 * curve would look better and would be invented, and this is a record of
 * someone's actual work — so the chart shows the mid-400s, the under-20,
 * and nothing in between.
 *
 * The colour carries the argument: amber is the state that means "a
 * person is waiting on this", so the tall bar is amber and the short one
 * is green. The gate did not get weaker, it got worth trusting.
 */
export function GateCollapse() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <figure className={`win ${styles.chart}`} ref={ref}>
      <div className="win__bar">
        <span className="win__title">human gate interventions</span>
        <span className="win__end">
          <span className={styles.drop}>−95%</span>
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>before</span>
          <span className={styles.track} aria-hidden="true">
            <i className={styles.barGate} style={{ width: inView ? "100%" : "0%" }} />
          </span>
          <span className={styles.valGate}>mid-400s</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>after</span>
          <span className={styles.track} aria-hidden="true">
            <i
              className={styles.barPass}
              style={{ width: inView ? "4.1%" : "0%" }}
            />
          </span>
          <span className={styles.valPass}>under 20</span>
        </div>
      </div>

      <div className="win__foot">
        every remaining one is a call that genuinely needed a person
      </div>
    </figure>
  );
}
