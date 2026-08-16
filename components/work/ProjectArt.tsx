import styles from "./ProjectArt.module.css";

/**
 * Project artwork, built the same way the products are.
 *
 * There are no screenshots anywhere on this site. Each of these is the
 * real interface reconstructed in DOM — which is also the only honest
 * option, since a picture of a floating overlay cannot show the thing
 * that makes it interesting, namely that it is floating over something.
 */

/** Echo's mark: concentric arcs, drawn rather than imported. */
function EchoMark() {
  return (
    <svg viewBox="0 0 24 24" className={styles.echoMark} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path d="M6.5 3.8a11 11 0 0 1 0 16.4" opacity="0.45" />
        <path d="M10.5 6.6a7 7 0 0 1 0 10.8" opacity="0.72" />
        <path d="M14.5 9.4a3 3 0 0 1 0 5.2" />
      </g>
    </svg>
  );
}

/**
 * Echo as it looks mid-call: the bar pinned over the document you are
 * sharing, with the answer popover under it.
 */
export function EchoArt() {
  return (
    <div className={styles.echoStage}>
      <div className={styles.doc} aria-hidden="true">
        <span className={styles.docLine} style={{ ["--w" as string]: "64%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "91%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "77%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "48%" }} />
        <span className={styles.docLine} style={{ ["--w" as string]: "84%" }} />
      </div>

      <div className={styles.echoBar}>
        <EchoMark />
        <span className={styles.echoWord}>Echo</span>
        <span className={`chip chip--pass ${styles.echoChip}`}>
          <span className="dot" />
          Listening
        </span>
        <span className={styles.echoField}>What should I say next?</span>
        <span className={styles.echoKeys}>
          <kbd>⌥</kbd>
          <kbd>Space</kbd>
        </span>
      </div>

      <figure className={`win ${styles.echoReply}`}>
        <figcaption className={styles.echoCap}>Draft reply</figcaption>
        <p className={styles.echoBody}>
          Their Q3 number was <em>flat, not down</em>. Ask what changed in the
          pipeline after the pricing test before agreeing to the discount.
        </p>
        <span className={styles.echoFoot}>from the last 4 minutes of transcript</span>
      </figure>
    </div>
  );
}

/**
 * TokenLess wrapping a test run. The point of the tool is the last line:
 * it compresses hard, but failures pass through untouched.
 */
export function TokenLessArt() {
  return (
    <figure className={`win ${styles.term}`}>
      <div className="win__bar">
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="win__title">~/agent — tokenless</span>
      </div>

      <div className={styles.termBody}>
        <p className={styles.cmd}>
          <span className={styles.prompt}>$</span> npx tokenless -- pytest -q
        </p>

        <div className={styles.meter}>
          <p className={styles.meterRow}>
            <span className={styles.meterKey}>captured</span>
            <span className={styles.meterVal}>2,481 tokens</span>
            <span className={styles.trackWide} aria-hidden="true">
              <i style={{ width: "100%" }} />
            </span>
          </p>
          <p className={styles.meterRow}>
            <span className={styles.meterKey}>forwarded</span>
            <span className={`${styles.meterVal} ${styles.good}`}>496 tokens</span>
            <span className={styles.trackWide} aria-hidden="true">
              <i className={styles.good} style={{ width: "20%" }} />
            </span>
          </p>
        </div>

        <p className={styles.result}>
          <span className={styles.ok}>✓</span> 214 passed
          <span className={styles.sep}>·</span>
          <span className={styles.bad}>3 failed</span>
          <span className={styles.note}>— failures forwarded verbatim</span>
        </p>
      </div>

      <div className="win__foot">saved 1,985 tokens on this call alone</div>
    </figure>
  );
}
