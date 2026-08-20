"use client";

import { useState } from "react";
import styles from "./ProjectArt.module.css";

/**
 * Project artwork, built the same way the products are.
 *
 * There are no screenshots anywhere on this site. Each of these is the
 * real interface reconstructed in DOM — which is also the only honest
 * option, since a picture of a floating overlay cannot show the thing
 * that makes it interesting, namely that it is floating over something.
 *
 * All three are interactive, and the interaction is the demo in each
 * case: ask Echo a different question, watch TokenLess actually
 * compress, pick an asset the analyzer has already scored offline. A
 * still image of any of these would be showing you the least
 * interesting frame.
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

/* The kinds of thing people actually ask it mid-call, and what a
   grounded answer to each looks like. */
const ASKS = [
  {
    q: "What should I say next?",
    lead: "Their Q3 number was ",
    hit: "flat, not down",
    tail:
      ". Ask what changed in the pipeline after the August pricing test before you agree to anything.",
    foot: "grounded in the last 4 minutes"
  },
  {
    q: "Summarise the last five minutes",
    lead: "They walked Q3, flagged a pricing test, and asked for ",
    hit: "12% off to renew",
    tail: ". Nothing agreed yet — they are waiting on you.",
    foot: "9 turns condensed"
  },
  {
    q: "What did they commit to?",
    lead: "The security questionnaire by ",
    hit: "Friday",
    tail: ". Nothing on price — they pushed that to procurement.",
    foot: "2 commitments detected"
  }
];

/**
 * Echo as it looks mid-call: the bar pinned over whatever you are
 * sharing, with the answer hanging underneath. Pick a question and the
 * draft changes — which is the entire product in one gesture.
 */
export function EchoArt() {
  const [i, setI] = useState(0);
  const ask = ASKS[i];

  return (
    <div className={styles.echoStage}>
      <div className={styles.echoBar}>
        <EchoMark />
        <span className={styles.echoWord}>Echo</span>
        <span className={`chip chip--pass ${styles.echoChip}`}>
          <span className="dot" />
          Listening
        </span>
        <span className={styles.echoField} key={i}>
          {ask.q}
        </span>
        <span className={styles.echoKeys}>
          <kbd>⌥</kbd>
          <kbd>Space</kbd>
        </span>
      </div>

      <figure className={`win ${styles.echoReply}`} aria-live="polite">
        <figcaption className={styles.echoCap}>Draft reply</figcaption>
        <p className={styles.echoBody} key={i}>
          {ask.lead}
          <em>{ask.hit}</em>
          {ask.tail}
        </p>
        <span className={styles.echoFoot}>{ask.foot}</span>
      </figure>

      <div className={styles.asks}>
        <span className={styles.asksLabel}>Ask it</span>
        {ASKS.map((a, n) => (
          <button
            key={a.q}
            type="button"
            className={`${styles.askBtn} ${n === i ? styles.askOn : ""}`}
            aria-pressed={n === i}
            onClick={() => setI(n)}
          >
            {a.q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* The same test run, before and after the compressor. The failures are
   byte-identical in both — that is the design constraint, not a nicety. */
const RAW = [
  { t: "dim", v: "collected 217 items" },
  { t: "dim", v: "" },
  { t: "dots", v: "........................F.......................F......" },
  { t: "dots", v: "..........F..............................................." },
  { t: "dim", v: "" },
  { t: "head", v: "=================== FAILURES ===================" },
  { t: "fail", v: "___ test_refund_over_limit ___" },
  { t: "dim", v: "  self = <TestRefunds object at 0x7f2a1c0d3e50>" },
  { t: "dim", v: "  client = <FlaskClient object at 0x7f2a1c0d3f10>" },
  { t: "dim", v: "  " },
  { t: "dim", v: "      resp = client.post('/refund', json=payload)" },
  { t: "fail", v: "  >     assert resp.status_code == 402" },
  { t: "fail", v: "  E     assert 500 == 402" },
  { t: "dim", v: "  tests/test_payments.py:184: AssertionError" },
  { t: "dim", v: "  ...182 more lines elided in this mock..." }
];

const COMPRESSED = [
  { t: "dim", v: "214 passed, 3 failed in 12.4s" },
  { t: "dim", v: "" },
  { t: "head", v: "failures forwarded verbatim:" },
  { t: "fail", v: "  test_refund_over_limit" },
  { t: "fail", v: "  E  assert 500 == 402" },
  { t: "dim", v: "     tests/test_payments.py:184" },
  { t: "fail", v: "  test_partial_return_multi_item" },
  { t: "fail", v: "  E  assert Decimal('19.98') == Decimal('24.98')" },
  { t: "dim", v: "     tests/test_returns.py:96" },
  { t: "fail", v: "  test_address_change_midflight" },
  { t: "fail", v: "  E  KeyError: 'confirmation_id'" },
  { t: "dim", v: "     tests/test_orders.py:311" },
  { t: "dim", v: "" },
  { t: "ok", v: "passing tests summarised, tracebacks dropped" }
];

/**
 * TokenLess wrapping a test run. Flip the switch and watch the context
 * window empty out — while every failure survives byte for byte, which
 * is the whole reason the tool is trustworthy.
 */
export function TokenLessArt() {
  const [on, setOn] = useState(true);
  const lines = on ? COMPRESSED : RAW;
  const tokens = on ? 496 : 2481;
  const pct = on ? 16 : 78;

  return (
    <figure className={`win ${styles.term}`}>
      <div className="win__bar">
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="win__title">~/agent — pytest -q</span>
        <span className={styles.toggle}>
          <button
            type="button"
            className={`${styles.tgBtn} ${!on ? styles.tgOn : ""}`}
            aria-pressed={!on}
            onClick={() => setOn(false)}
          >
            raw
          </button>
          <button
            type="button"
            className={`${styles.tgBtn} ${on ? styles.tgOn : ""}`}
            aria-pressed={on}
            onClick={() => setOn(true)}
          >
            tokenless
          </button>
        </span>
      </div>

      <div className={styles.termBody} key={on ? "on" : "off"}>
        <p className={styles.cmd}>
          <span className={styles.prompt}>$</span>
          {on ? " npx tokenless -- pytest -q" : " pytest -q"}
        </p>
        <div className={styles.stream}>
          {lines.map((l, n) => (
            <p key={n} className={styles[`ln_${l.t}`]}>
              {l.v || " "}
            </p>
          ))}
        </div>
      </div>

      <div className={styles.ctx}>
        <p className={styles.ctxRow}>
          <span className={styles.ctxKey}>context window</span>
          <span className={styles.ctxTrack} aria-hidden="true">
            <i className={on ? styles.ctxFillOk : styles.ctxFillHot} style={{ width: `${pct}%` }} />
          </span>
          <span className={on ? styles.good : styles.hot}>
            {tokens.toLocaleString()} tok
          </span>
        </p>
      </div>

      <div className="win__foot">
        {on
          ? "1,985 tokens saved · every failure still verbatim"
          : "one tool call, and most of the window is gone"}
      </div>
    </figure>
  );
}

/* Scored locally — the point of the project is that none of this left
   the machine. */
const TICKERS = [
  {
    sym: "AAPL",
    name: "Apple Inc.",
    price: "241.30",
    move: "+1.2%",
    up: true,
    bars: [3, 4, 6, 5, 7, 6, 9],
    sent: [64, 24, 12],
    head: "Services margin beats; hardware guidance held flat."
  },
  {
    sym: "EURUSD",
    name: "Euro / US Dollar",
    price: "1.0842",
    move: "−0.3%",
    up: false,
    bars: [8, 7, 5, 6, 4, 5, 3],
    sent: [31, 38, 31],
    head: "Rate-path commentary reads dovish; desks split on timing."
  },
  {
    sym: "BTC",
    name: "Bitcoin",
    price: "68,412",
    move: "+4.1%",
    up: true,
    bars: [2, 4, 3, 6, 5, 8, 9],
    sent: [71, 18, 11],
    head: "ETF inflows up a fourth straight week; volumes thinning."
  }
];

/**
 * The market analyzer. Pick an asset and the sentiment read follows —
 * all of it computed by a model on localhost, which is the chip in the
 * corner and the reason the project exists.
 */
export function MarketArt() {
  const [i, setI] = useState(2);
  const t = TICKERS[i];
  const [pos, neu, neg] = t.sent;

  return (
    <figure className={`win ${styles.market}`}>
      <div className="win__bar">
        <span className="chip chip--pass">
          <span className="dot" />
          offline
        </span>
        <span className="win__title">llama.cpp · localhost:8080</span>
        <span className="win__end">no egress</span>
      </div>

      <div className={styles.tickers} role="tablist" aria-label="Assets">
        {TICKERS.map((k, n) => (
          <button
            key={k.sym}
            type="button"
            role="tab"
            aria-selected={n === i}
            className={`${styles.ticker} ${n === i ? styles.tickerOn : ""}`}
            onClick={() => setI(n)}
          >
            <span className={styles.sym}>{k.sym}</span>
            <span className={styles.price}>{k.price}</span>
            <span className={k.up ? styles.up : styles.down}>{k.move}</span>
            <span className={styles.spark} aria-hidden="true">
              {k.bars.map((h, x) => (
                <i
                  key={x}
                  className={k.up ? styles.barUp : styles.barDown}
                  style={{ height: `${h * 11}%` }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.sentiment} aria-live="polite">
        <p className={styles.sentLabel}>
          <b>{t.name}</b> · sentiment across 412 headlines, parsed locally
        </p>
        <span className={styles.sentBar} aria-hidden="true">
          <i className={styles.sentPos} style={{ width: `${pos}%` }} />
          <i className={styles.sentNeu} style={{ width: `${neu}%` }} />
          <i className={styles.sentNeg} style={{ width: `${neg}%` }} />
        </span>
        <p className={styles.sentKeys}>
          <span className={styles.up}>{pos}% positive</span>
          <span>{neu}% neutral</span>
          <span className={styles.down}>{neg}% negative</span>
        </p>
        <p className={styles.headline}>“{t.head}”</p>
      </div>
    </figure>
  );
}
