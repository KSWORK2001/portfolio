"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AgentRun.module.css";

/**
 * The hero artwork: one orchestrator run, laid out the way a run is.
 *
 * It is interactive for one reason. The whole page argues that these
 * systems stop on their own before doing something expensive, and the
 * cheapest way to prove that is to make you be the thing they stop for.
 * The run reaches the billing write, refuses to go further, and waits.
 * Whatever you pick, the outcome is real: approve and it commits, deny
 * and nothing is written. Nobody scrolls past their own decision.
 *
 * This owns its entrance animation rather than borrowing the page's
 * shared feed observer, because replaying has to be able to restart it
 * and a class applied from outside would not survive the reset.
 */

const STEPS = [
  { action: "retrieve", detail: "12 docs · pgvector · 240 ms", state: "pass", label: "ok" },
  { action: "route", detail: "invoice_flow · conf 0.93", state: "pass", label: "ok" },
  { action: "validate", detail: "3 params failed schema", state: "fail", label: "fail" },
  { action: "repair", detail: "re-read tool output · retry 1/3", state: "pass", label: "ok" },
  { action: "gate", detail: "writes to billing — needs a human", state: "gate", label: "held" }
] as const;

type Decision = "pending" | "approved" | "denied";

export function AgentRun() {
  const [decision, setDecision] = useState<Decision>("pending");
  const [live, setLive] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  /* Hold the run back until it is on screen, so it appears to happen
     while you are watching rather than having finished without you. */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduced) {
      setLive(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);

    /* If the observer never reports, show the run anyway. */
    const failsafe = window.setTimeout(() => setLive(true), 2600);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  const replay = () => {
    setDecision("pending");
    setLive(false);
    /* Two frames: the class has to actually leave the DOM before it goes
       back on, or the animation never restarts. */
    requestAnimationFrame(() => requestAnimationFrame(() => setLive(true)));
  };

  const outcome =
    decision === "approved"
      ? { action: "commit", detail: "$12,480 posted to billing", state: "pass", label: "ok" }
      : { action: "halted", detail: "nothing was written", state: "fail", label: "stop" };

  return (
    <div className={styles.stage}>
      <figure className={`win ${styles.run}`}>
        <div className="win__bar">
          {/* Green has to keep meaning "passed", so a denied run reads as
              held rather than finished. */}
          <span
            className={`chip ${
              decision === "pending"
                ? "chip--run"
                : decision === "approved"
                  ? "chip--pass"
                  : "chip--gate"
            }`}
          >
            <span className="dot" />
            {decision === "pending"
              ? "running"
              : decision === "approved"
                ? "committed"
                : "halted"}
          </span>
          <span className="win__title">orchestrator · run #4187</span>
          <span className="win__end">step {decision === "pending" ? 5 : 6}</span>
        </div>

        <ol
          ref={listRef}
          className={`${styles.steps} ${live ? styles.live : ""}`}
        >
          {STEPS.map((step) => (
            <li key={step.action} className={styles.step}>
              <span className={`${styles.action} ${styles[step.state]}`}>{step.action}</span>
              <span className={styles.detail}>{step.detail}</span>
              <span className={`${styles.state} ${styles[step.state]}`}>{step.label}</span>
            </li>
          ))}

          {decision !== "pending" && (
            <li className={`${styles.step} ${styles.outcome}`}>
              <span className={`${styles.action} ${styles[outcome.state]}`}>{outcome.action}</span>
              <span className={styles.detail}>{outcome.detail}</span>
              <span className={`${styles.state} ${styles[outcome.state]}`}>{outcome.label}</span>
            </li>
          )}
        </ol>

        <div className={styles.gateBar} aria-live="polite">
          {decision === "pending" ? (
            <>
              <span className={styles.gateAsk}>Approve this write?</span>
              <span className={styles.gateBtns}>
                <button
                  type="button"
                  className={`${styles.gateBtn} ${styles.approve}`}
                  onClick={() => setDecision("approved")}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className={styles.gateBtn}
                  onClick={() => setDecision("denied")}
                >
                  Deny
                </button>
              </span>
            </>
          ) : (
            <>
              <span className={styles.gateAsk}>
                {decision === "approved"
                  ? "You approved it. That is the only reason it wrote anything."
                  : "You denied it. The run ended without touching billing."}
              </span>
              <button type="button" className={styles.replay} onClick={replay}>
                Run it again
              </button>
            </>
          )}
        </div>
      </figure>

      {/* A run that passes is only evidence if the suite behind it is
          still green. */}
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
