import styles from "./AgentRun.module.css";

/**
 * The hero artwork: one orchestrator run, laid out the way a run
 * actually is.
 *
 * This is the argument the whole page makes, so it is the first thing
 * you see. The interesting row is `validate` — it fails, and the run
 * repairs itself and carries on instead of handing a bad payload
 * downstream. The last row is the one Karan cares most about: the
 * system stops on its own before it writes to billing.
 */

const STEPS = [
  {
    action: "retrieve",
    detail: "12 docs · pgvector · 240 ms",
    state: "pass" as const,
    label: "ok"
  },
  {
    action: "route",
    detail: "invoice_flow · conf 0.93",
    state: "pass" as const,
    label: "ok"
  },
  {
    action: "validate",
    detail: "3 params failed schema",
    state: "fail" as const,
    label: "fail"
  },
  {
    action: "repair",
    detail: "re-read tool output · retry 1/3",
    state: "pass" as const,
    label: "ok"
  },
  {
    action: "gate",
    detail: "writes to billing — waiting on a human",
    state: "gate" as const,
    label: "held"
  }
];

export function AgentRun() {
  return (
    <div className={styles.stage}>
      {/* The workflow the agent is operating on, sitting underneath. */}
      <div className={styles.doc} aria-hidden="true">
        <span className={styles.docLine} style={{ ["--w" as string]: "72%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "94%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "58%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "86%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "45%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "78%" }} />
      </div>

      <figure className={`win ${styles.run}`}>
        <div className="win__bar">
          <span className="chip chip--run">
            <span className="dot" />
            running
          </span>
          <span className="win__title">orchestrator · run #4187</span>
          <span className="win__end">step 5</span>
        </div>

        <ol className={styles.steps} data-feed>
          {STEPS.map((step) => (
            <li key={step.action} className={styles.step}>
              <span className={`${styles.action} ${styles[step.state]}`}>
                {step.action}
              </span>
              <span className={styles.detail}>{step.detail}</span>
              <span className={`${styles.state} ${styles[step.state]}`}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        <div className={`win__foot ${styles.runFoot}`}>
          1 repair · 1 escalation · 0 silent failures
        </div>
      </figure>

      {/* The nightly regression suite, because a run that passes is only
          evidence if the suite behind it is still green. */}
      <figure className={`win ${styles.evalCard}`}>
        <figcaption className={styles.evalCap}>Nightly eval</figcaption>
        <p className={styles.evalNum}>
          412<span className={styles.evalOf}> / 420</span>
        </p>
        <p className={styles.evalSub}>golden workflows passed</p>
        <span className={styles.evalBar} aria-hidden="true">
          <i style={{ width: "98.1%" }} />
        </span>
      </figure>
    </div>
  );
}
