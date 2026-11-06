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
        <span className="win__title">~/agent: pytest -q</span>
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
            <i className={on ? styles.ctxFillOk : styles.ctxFillHot} style={{ transform: `scaleX(${pct / 100})` }} />
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

/* Conversations that really went through the gateway, and the shape of
   answer each one got. Every title in the sidebar hit the same local
   endpoint — the chip row is the only thing that knows which model. */
const CHATS = [
  {
    title: "Stale DNS on the node",
    q: "Why does the node still resolve the old IP?",
    lead: "CoreDNS is caching upstream answers for ",
    hit: "30s, not 5m",
    tail: " — the rollout did land; the cache simply outlived it.",
    status: "web: 4 results · grounded",
    foot: "cited 2 · 1.8 s",
    tok: "35 tok/s"
  },
  {
    title: "Dinner for six, one vegan",
    q: "What do I cook tonight?",
    lead: "Mushroom ragù, two pans — the vegan half never touches ",
    hit: "the butter",
    tail: ", and nobody at the table will know.",
    status: "web: 6 results · grounded",
    foot: "cited 4 · 2.4 s",
    tok: "28 tok/s"
  },
  {
    title: "Porting the eval harness",
    q: "Rewrite this pytest fixture in Go?",
    lead: "Yes — but keep the fixture table as ",
    hit: "a map, not a slice",
    tail: ". Table-driven tests carry over almost line for line.",
    status: "web: 0 results · answered from the model",
    foot: "no egress · 0.9 s",
    tok: "41 tok/s"
  }
];

/**
 * Alpaca mid-conversation: real chats in the sidebar, an answer that
 * says where it came from underneath. Pick another title and the
 * whole exchange swaps — same endpoint, same chip, different answer.
 */
export function AlpacaArt() {
  const [i, setI] = useState(0);
  const c = CHATS[i];

  return (
    <figure className={`win ${styles.alpaca}`}>
      <div className={styles.alpSide}>
        <span className={styles.alpBrand}>Alpaca</span>
        {CHATS.map((t, x) => (
          <button
            key={t.title}
            type="button"
            className={`${styles.alpItem} ${x === i ? styles.alpItemOn : ""}`}
            aria-pressed={x === i}
            onClick={() => setI(x)}
          >
            {t.title}
          </button>
        ))}
        <span className={styles.alpSideFoot}>localhost:11434</span>
      </div>

      <div className={styles.alpMain} aria-live="polite">
        <div className={styles.alpChips}>
          <span className={`chip ${styles.alpChip}`}>
            qwen, 4-bit
          </span>
          <span className="chip">{c.tok}</span>
        </div>
        <p className={styles.alpQ} key={`q${i}`}>
          {c.q}
        </p>
        <p className={styles.alpA} key={`a${i}`}>
          {c.lead}
          <em>{c.hit}</em>
          {c.tail}
        </p>
        <span className={styles.alpStatus} key={`s${i}`}>
          {c.status}
        </span>
        <span className={styles.alpFoot}>{c.foot}</span>
      </div>
    </figure>
  );
}

/* Bottles are Wine prefixes — the only wine is in the name. Each one
   pins its own runner and its own DXVK stance, which is why the 2003
   RPG still launches next door to Office. */
const BOTTLES = [
  {
    name: "Steam Library",
    runner: "soda-9.0",
    dxvk: true,
    last: "exited cleanly · 142.3 fps avg",
    note: "The mainstream case: current runner, DXVK carrying the rendering."
  },
  {
    name: "Old RPGs",
    runner: "wine-ge-8-26",
    dxvk: false,
    last: "exited cleanly · 42.1 fps avg",
    note: "DXVK off — the old renderer asked for the real Direct3D pipeline."
  },
  {
    name: "Work",
    runner: "vanilla-10.2",
    dxvk: true,
    last: "running · 3 h 12 m uptime",
    note: "Office in a prefix nothing else is allowed to touch."
  }
];

/**
 * Cellar's left rail is the bottles; the right is what that bottle
 * actually runs on. Pick another bottle and the runner, the DXVK
 * stance, and the last-run line all swap with it.
 */
export function CellarArt() {
  const [i, setI] = useState(1);
  const b = BOTTLES[i];

  return (
    <figure className={`win ${styles.cellar}`}>
      <div className="win__bar">
        <span className={`chip ${styles.celChip}`}>
          healthy
        </span>
        <span className="win__title">Cellar · ~/Cellar/bottles</span>
        <span className="win__end">{b.dxvk ? "dxvk on" : "dxvk off"}</span>
      </div>

      <div className={styles.celBody}>
        <div className={styles.celList}>
          {BOTTLES.map((v, x) => (
            <button
              key={v.name}
              type="button"
              className={`${styles.celItem} ${x === i ? styles.celItemOn : ""}`}
              aria-pressed={x === i}
              onClick={() => setI(x)}
            >
              <span className={styles.celName}>{v.name}</span>
              <span className={styles.celSub}>{v.runner}</span>
            </button>
          ))}
        </div>

        <div className={styles.celDetail} key={i} aria-live="polite">
          <p className={styles.celTitle}>{b.name}</p>
          <div className={styles.celMeta}>
            <span className={`chip ${styles.celChip}`}>
              {b.runner}
            </span>
            <span
              className={`${styles.celDxvk} ${b.dxvk ? styles.celDxvkOn : ""}`}
              aria-hidden="true"
            >
              <i className={styles.celKnob} />
            </span>
            <span className={styles.celDxvkLabel}>
              DXVK {b.dxvk ? "on" : "off"}
            </span>
          </div>
          <p className={styles.celLast}>{b.last}</p>
          <p className={styles.celNote}>{b.note}</p>
        </div>
      </div>

      <div className="win__foot">
        one runner per bottle: a bad update cannot leak next door
      </div>
    </figure>
  );
}

/* One trip down Peachtree, priced three ways. The staircase never
   moves; the product chip is the only variable, and it decides both
   the fare and which car pulls up. */
const RIDES = [
  { p: "X", price: "$12.40", eta: "4 min", car: "Prius · Ahmad 4.9★ · 4 seats" },
  { p: "XL", price: "$18.90", eta: "6 min", car: "Sienna · Marcus 4.8★ · 6 seats" },
  { p: "Black", price: "$27.60", eta: "9 min", car: "S-Class · Daniel 5.0★ · 4 seats" }
];

/**
 * Avenue at the moment of choosing: route drawn, stops listed, three
 * products one tap apart. The fare line is the product — pick a
 * different chip and the same trip reprices in place.
 */
export function AvenueArt() {
  const [i, setI] = useState(0);
  const r = RIDES[i];

  return (
    <figure className={`win ${styles.avenue}`}>
      <div className={styles.aveMap}>
        <svg viewBox="0 0 24 24" className={styles.aveRoute} aria-hidden="true">
          <path
            className={styles.aveLine}
            d="M5.5 3.5v7h6.5v7h7.5v3"
            fill="none"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle className={styles.avePick} cx="5.5" cy="3.5" r="2" />
          <rect
            className={styles.aveDrop}
            x="17.9"
            y="19"
            width="3.4"
            height="3.4"
            rx="0.8"
          />
        </svg>
        <div className={styles.aveStops}>
          <p className={styles.aveStop}>
            <i className={styles.avePin} aria-hidden="true" />
            <span className={styles.aveWhere}>Terminal N · door 4</span>
            <span className={styles.aveWhen}>pickup</span>
          </p>
          <p className={styles.aveStop}>
            <i className={`${styles.avePin} ${styles.avePinEnd}`} aria-hidden="true" />
            <span className={styles.aveWhere}>Peachtree &amp; 5th</span>
            <span className={styles.aveWhen}>drop-off</span>
          </p>
          <p className={styles.aveTrip} key={i}>
            {r.p} · {r.price} · {r.eta}
          </p>
          <p className={styles.aveCar}>{r.car}</p>
        </div>
      </div>

      <div className={styles.aveFoot} role="group" aria-label="Ride products">
        {RIDES.map((v, x) => (
          <button
            key={v.p}
            type="button"
            className={`${styles.aveBtn} ${x === i ? styles.aveBtnOn : ""}`}
            aria-pressed={x === i}
            onClick={() => setI(x)}
          >
            {v.p}
          </button>
        ))}
      </div>
    </figure>
  );
}

/* Seven seats, three temperaments. The stances flip per motion — the
   point of a council is that the same room reaches a different verdict
   on a different question, and leaves a record of who dissented. */
const SEATS = ["Cr", "En", "Pr", "Sk", "Fa", "Op", "Le"];

const MOTIONS = [
  {
    q: "Ship before the demo?",
    verdict: "Build it · 5 of 7",
    for: [true, true, true, false, true, true, false],
    note: "Skeptic and Lawyer dissent, in writing."
  },
  {
    q: "Rewrite ingest in Rust?",
    verdict: "Bury it · 6 of 7",
    for: [false, false, false, false, true, false, false],
    note: "The Futurist votes alone; the motion dies with the minutes."
  }
];

/**
 * EchoHQ's council chamber. Call a motion and the seats vote — stance
 * dots flip, the verdict bar lands. Convene the same motion twice and
   the verdict comes back identical, because a council you cannot
   replay is just a coin flip with chairs.
 */
export function EchoHQArt() {
  const [floor, setFloor] = useState({ m: -1, run: 0 });
  const motion = floor.m >= 0 ? MOTIONS[floor.m] : null;

  const convene = (n: number) => setFloor({ m: n, run: floor.run + 1 });

  return (
    <div className={styles.hqStage}>
      <figure className={`win ${styles.hq}`}>
        <div className="win__bar">
          <span className="chip chip--run">
            seated
          </span>
          <span className="win__title">EchoHQ, 7 members, quorum 5</span>
          <span className="win__end">
            {motion ? `vote ${floor.run}` : "recess"}
          </span>
        </div>

        <div className={styles.hqSeats}>
          {SEATS.map((s, n) => (
            <span key={s} className={styles.hqSeat}>
              <i
                className={`${styles.hqDot} ${
                  motion
                    ? motion.for[n]
                      ? styles.hqFor
                      : styles.hqAgainst
                    : ""
                }`}
                aria-hidden="true"
              />
              {s}
            </span>
          ))}
        </div>

        <div
          className={styles.hqVerdict}
          key={`${floor.m}-${floor.run}`}
          aria-live="polite"
        >
          <p className={styles.hqCall}>
            {motion ? motion.verdict : "In recess · 0 of 7"}
          </p>
          <p className={styles.hqNote}>
            {motion
              ? `${motion.note}${
                  floor.run > 1
                    ? " Reconvened — same verdict; the council is deterministic."
                    : ""
                }`
              : "Call a motion and the seats will vote."}
          </p>
        </div>
      </figure>

      <div className={styles.asks}>
        <span className={styles.asksLabel}>Motion</span>
        <button
          type="button"
          className={styles.askBtn}
          onClick={() => convene(floor.m >= 0 ? floor.m : 0)}
        >
          Convene
        </button>
        {MOTIONS.map((mt, n) => (
          <button
            key={mt.q}
            type="button"
            className={`${styles.askBtn} ${n === floor.m ? styles.askOn : ""}`}
            aria-pressed={n === floor.m}
            onClick={() => convene(n)}
          >
            {mt.q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Loop 217. The baseline bars never move — that is what makes them
   the baseline — and verified only grows after a re-bench passes. */
const METRICS = [
  { key: "avg fps", base: 61.4, lifted: 74.9 },
  { key: "1% low", base: 38.2, lifted: 51.7 }
];

const pct = (v: number): string => `scaleX(${v / 80})`;

/**
 * Optimize mid-loop: candidate applied, re-benched, and the verified
 * bars catching up. One button both ways — roll forward on a pass,
 * roll back when the number was luck. The baseline never moves
 * either way, which is the entire contract.
 */
export function OptimizeArt() {
  const [stage, setStage] = useState(0); /* 0 fresh · 1 rolled forward · 2 reverted */
  const applied = stage === 1;

  return (
    <figure className={`win ${styles.opt}`}>
      <div className="win__bar">
        <span className="chip chip--pass">
          loop 217
        </span>
        <span className="win__title">optima · bench → apply → re-bench</span>
        <span className={styles.toggle}>
          <button
            type="button"
            className={`${styles.tgBtn} ${applied ? styles.tgOn : ""}`}
            aria-pressed={applied}
            onClick={() => setStage(applied ? 2 : 1)}
          >
            {applied ? "Roll back" : "Apply candidate"}
          </button>
        </span>
      </div>

      <div className={styles.optBody}>
        {METRICS.map((mt) => (
          <div className={styles.optRow} key={mt.key}>
            <span className={styles.optKey}>{mt.key}</span>
            <span className={styles.optLine}>
              <span className={styles.optTag}>baseline</span>
              <span className={styles.optTrack}>
                <i
                  className={styles.optFillBase}
                  style={{ transform: pct(mt.base) }}
                />
              </span>
              <b className={styles.optVal}>{mt.base.toFixed(1)}</b>
            </span>
            <span className={styles.optLine}>
              <span className={styles.optTag}>verified</span>
              <span className={styles.optTrack}>
                <i
                  className={
                    applied ? styles.optFillNew : styles.optFillBase
                  }
                  style={{ transform: pct(applied ? mt.lifted : mt.base) }}
                />
              </span>
              <b
                className={`${styles.optVal} ${applied ? styles.optValNew : ""}`}
                key={stage}
              >
                {(applied ? mt.lifted : mt.base).toFixed(1)}
              </b>
            </span>
          </div>
        ))}
      </div>

      <div className="win__foot">
        <span className={stage === 1 ? styles.optPass : ""}>
          {stage === 1
            ? "+22% · PASS, rolled forward"
            : stage === 2
              ? "reverted — verified is sacred"
              : "candidate staged · verified is sacred"}
        </span>
      </div>
    </figure>
  );
}
