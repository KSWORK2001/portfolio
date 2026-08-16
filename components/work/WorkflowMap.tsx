import styles from "./WorkflowMap.module.css";

/**
 * The graph, drawn the way it is actually wired.
 *
 * The loop between `validate` and `repair` is the point: a failed
 * schema check routes back into the agent rather than out to a person,
 * and only a run that exhausts its retries is allowed to interrupt
 * someone. Edges are SVG so the curves are real; nodes are HTML so the
 * labels stay crisp. The canvas holds the viewBox aspect ratio exactly,
 * which is what keeps the two coordinate systems in agreement.
 */

const NODES = [
  { id: "retrieve", label: "Retrieve", x: 11.8, y: 16 },
  { id: "route", label: "Route", x: 35, y: 16 },
  { id: "validate", label: "Validate", x: 58.9, y: 16, tone: "live" },
  { id: "commit", label: "Commit", x: 86.8, y: 16, tone: "pass" },
  { id: "repair", label: "Repair", x: 58.9, y: 54, tone: "gate" },
  { id: "human", label: "Ask a human", x: 58.9, y: 84.8, tone: "gate" }
];

export function WorkflowMap() {
  return (
    <div className={styles.scroller}>
      <div className={styles.canvas} aria-hidden="true">
        <svg viewBox="0 0 560 250" className={styles.svg}>
          <defs>
            <marker
              id="wm-ink"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 z" fill="var(--run)" />
            </marker>
            <marker
              id="wm-pass"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 z" fill="var(--pass)" />
            </marker>
            <marker
              id="wm-gate"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 z" fill="var(--gate)" />
            </marker>
          </defs>

          {/* Happy path */}
          <path
            className={`${styles.edge} ${styles.flow}`}
            d="M108 40 L160 40"
            markerEnd="url(#wm-ink)"
          />
          <path
            className={`${styles.edge} ${styles.flow}`}
            d="M232 40 L286 40"
            markerEnd="url(#wm-ink)"
          />
          <path
            className={`${styles.edge} ${styles.pass}`}
            d="M374 40 L446 40"
            markerEnd="url(#wm-pass)"
          />

          {/* Validate fails, and hands back to the agent rather than out. */}
          <path
            className={`${styles.edge} ${styles.gate}`}
            d="M312 57 C296 84, 296 96, 306 118"
            markerEnd="url(#wm-gate)"
          />
          {/* Repair returns its fix to the same check that rejected it. */}
          <path
            className={`${styles.edge} ${styles.gate} ${styles.dashed}`}
            d="M352 118 C364 96, 364 84, 348 57"
            markerEnd="url(#wm-gate)"
          />
          {/* Only an exhausted run gets to interrupt a person. */}
          <path
            className={`${styles.edge} ${styles.gate}`}
            d="M330 152 L330 196"
            markerEnd="url(#wm-gate)"
          />

          <text className={styles.tag} x="466" y="26">
            ok
          </text>
          <text className={styles.tagGate} x="252" y="92">
            on fail
          </text>
          <text className={styles.tagGate} x="374" y="92">
            retry ≤3
          </text>
          <text className={styles.tagGate} x="342" y="180">
            retries spent
          </text>
        </svg>

        {NODES.map((n) => (
          <span
            key={n.id}
            className={`${styles.node} ${n.tone ? styles[n.tone] : ""}`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}
