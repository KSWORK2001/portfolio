import type { ReactNode } from "react";
import { AgentRun } from "@/components/work/AgentRun";
import { EchoArt, TokenLessArt } from "@/components/work/ProjectArt";
import { WorkflowMap } from "@/components/work/WorkflowMap";
import { profile } from "@/data/profile-data";
import styles from "./page.module.css";

/** The stack copy leads with the tool, so `**like this**` gets emphasis. */
function emphasize(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>
  );
}

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="btn__i">
    <path
      d="M8 1v9m0 0L4.5 6.5M8 10l3.5-3.5M2 13h12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LOOP = [
  {
    n: "1",
    title: "Retrieve",
    text: "Ground the step in documents it is allowed to see, rather than in whatever it remembers."
  },
  {
    n: "2",
    title: "Reason",
    text: "One decision at a time, with the reason attached, so a bad run can be read afterwards."
  },
  {
    n: "3",
    title: "Validate",
    text: "Every tool call is checked against a schema before it runs. Failing loudly beats passing something malformed downstream."
  },
  {
    n: "4",
    title: "Repair",
    text: "A rejected call goes back to the agent with the reason attached — three times, then a person."
  }
];

export default function HomePage() {
  return (
    <main id="main">
      <span id="top" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div>
            <p className="eyebrow" data-reveal>
              <span className="rule" />
              Applied AI engineer
            </p>
            <h1 className={styles.h1} data-reveal>
              I build agents that check their own work.
            </h1>
            <p className={styles.sub} data-reveal>
              Most of what I ship is not the model. It is the layer around it —
              the retrieval it is allowed to see, the schema its tool calls have
              to satisfy, and the gate that stops it before it writes to
              anything that matters. That layer is the reason the systems stay
              up.
            </p>

            <div className={styles.actions} data-reveal>
              <a className="btn btn--solid" href="#contact">
                Email me
              </a>
              <a className="btn btn--ghost" href={profile.resume} download>
                Résumé
                <DownloadIcon />
              </a>
            </div>

            <p className={styles.meta} data-reveal>
              Atlanta, GA · Senior Applied AI Engineer at The Home Depot · MS CS
              at Georgia Tech
            </p>
          </div>

          <div data-reveal>
            <AgentRun />
          </div>
        </div>
      </section>

      {/* ── Now ───────────────────────────────────────────────── */}
      <section className={`wrap ${styles.now}`}>
        <p className="eyebrow" data-reveal>
          <span className="rule" />
          Right now
        </p>
        <div className={styles.nowRow}>
          {profile.now.map((item) => (
            <article className={styles.nowCell} key={item.key} data-reveal>
              <h3>{item.key}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Work ──────────────────────────────────────────────── */}
      <section className="sec" id="work">
        <div className="wrap">
          <p className="eyebrow" data-reveal>
            <span className="rule" />
            Where I have worked
          </p>
          <h2 className="sec__h sec__h--wide" data-reveal>
            Every role here ended with something in production.
          </h2>

          <div className={styles.roles}>
            {profile.experiences.map((job) => (
              <article className={styles.role} key={job.company} data-reveal>
                <div className={styles.roleMeta}>
                  <p className={styles.rolePeriod}>{job.period}</p>
                  <p className={styles.roleCompany}>{job.company}</p>
                </div>
                <div className={styles.roleBody}>
                  <h3 className={styles.roleTitle}>{job.role}</h3>
                  <p className={styles.roleDetail}>{job.detail}</p>
                  <ul className={styles.roleList}>
                    {job.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.edu} data-reveal>
            {profile.education.map((e) => (
              <div className={styles.eduRow} key={e.school}>
                <span className={styles.eduPeriod}>{e.period}</span>
                <span className={styles.eduDegree}>{e.degree}</span>
                <span className={styles.eduSchool}>{e.school}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The loop: the page hands over to the machine ──────── */}
      <section className={styles.dark} id="loop">
        <div className="wrap">
          <div className={styles.darkHead}>
            <p className="eyebrow eyebrow--on-dark" data-reveal>
              <span className="rule" />
              How I build
            </p>
            <h2 className="sec__h sec__h--on-dark" data-reveal>
              The model proposes. The system decides.
            </h2>
            <p className="sec__p sec__p--on-dark" data-reveal>
              A language model is the least predictable component in the stack,
              so it gets the least authority. Everything around it is
              deterministic: what it may retrieve, what shape its output has to
              take, how many times it can try again, and the point past which it
              has to stop and ask. The engineering worth talking about is in
              that scaffolding, not in the prompt.
            </p>
          </div>

          <ol className={styles.loop} data-reveal>
            {LOOP.map((s) => (
              <li className={styles.loopStep} key={s.title}>
                <span className={styles.loopN}>{s.n}</span>
                <b>{s.title}</b>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>

          <div className={styles.mapGrid}>
            <div data-reveal>
              <h3 className={styles.mapTitle}>
                Chain the failures, not just the happy path.
              </h3>
              <p className={styles.mapCopy}>
                Most agent demos only draw the arrow that works. Production is
                all the other arrows — what happens on a schema failure, on a
                timeout, on the third retry, and who finds out about it.
              </p>
              <WorkflowMap />
            </div>

            <div className={styles.notes}>
              <article className={styles.note} data-reveal>
                <h4>It refuses to guess</h4>
                <p>
                  Tool arguments are Pydantic models, not free text. A call that
                  will not validate never reaches the API, and the agent is told
                  exactly which field was wrong so its next attempt is informed
                  rather than random.
                </p>
              </article>
              <article className={styles.note} data-reveal>
                <h4>It asks before it acts</h4>
                <p>
                  Irreversible actions sit behind a human gate. Tightening what
                  genuinely needed a person took interventions from the mid-400s
                  to under 20 — the gate became worth trusting by being asked
                  less often.
                </p>
              </article>
              <article
                className={`${styles.note} ${styles.noteGate}`}
                data-reveal
              >
                <h4>It is graded, not vibe-checked</h4>
                <p>
                  Golden workflow datasets run under pytest with a model as
                  judge on every change, so a prompt edit cannot quietly regress
                  a flow that used to work.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects ──────────────────────────────────────────── */}
      <section className="sec" id="projects">
        <div className="wrap">
          <p className="eyebrow" data-reveal>
            <span className="rule" />
            Selected work
          </p>
          <h2 className="sec__h sec__h--wide" data-reveal>
            Things I built end to end, and shipped to people who are not me.
          </h2>

          {profile.projects.map((p, i) => (
            <article
              className={`${styles.project} ${i % 2 ? styles.projectFlip : ""}`}
              key={p.title}
            >
              <div className={styles.projectCopy} data-reveal>
                <div className={styles.projectHead}>
                  <h3 className={styles.projectTitle}>{p.title}</h3>
                  <span className={styles.projectYear}>{p.year}</span>
                </div>
                <p className={styles.projectStack}>{p.stack}</p>
                <p className={styles.projectSummary}>{p.summary}</p>
                <ul className={styles.projectMetrics}>
                  {p.metrics.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <a
                  className={styles.projectLink}
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {p.hrefLabel}
                  <span aria-hidden="true">→</span>
                </a>
              </div>

              <div className={styles.projectArt} data-reveal>
                {p.art === "echo" ? <EchoArt /> : <TokenLessArt />}
              </div>
            </article>
          ))}

          <div className={styles.alsoRow}>
            {profile.alsoBuilt.map((p) => (
              <article className={styles.also} key={p.title} data-reveal>
                <h4>{p.title}</h4>
                <p className={styles.alsoStack}>{p.stack}</p>
                <p className={styles.alsoSummary}>{p.summary}</p>
                <p className={styles.alsoMetric}>{p.metric}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack ─────────────────────────────────────────────── */}
      <section className="sec sec--alt" id="stack">
        <div className="wrap">
          <p className="eyebrow" data-reveal>
            <span className="rule" />
            What I reach for
          </p>
          <h2 className="sec__h sec__h--wide" data-reveal>
            The tools, and what I actually use them for.
          </h2>

          <div className="spec">
            {profile.stack.map((row) => (
              <div className="spec__r" key={row.key} data-reveal>
                <span className="spec__k">{row.key}</span>
                <span className="spec__v">{emphasize(row.text)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="sec">
        <div className={`wrap ${styles.faqGrid}`}>
          <div>
            <p className="eyebrow" data-reveal>
              <span className="rule" />
              The usual questions
            </p>
            <h2 className="sec__h" data-reveal>
              Asked often enough to answer here.
            </h2>
          </div>

          <div className={styles.faqList} data-reveal>
            {profile.faq.map((item) => (
              <details className={styles.faq} key={item.q}>
                <summary>
                  {item.q}
                  <span className={styles.faqSign} aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section className={styles.contact} id="contact">
        <div className={`wrap ${styles.contactInner}`}>
          <img
            className={styles.portrait}
            src={profile.headshot}
            alt="Karan Shrivastava"
            width="1080"
            height="1350"
            loading="lazy"
            data-reveal
          />
          <h2 className={styles.contactH} data-reveal>
            Happily employed.
            <br />
            Still reading email.
          </h2>
          <p className={styles.contactP} data-reveal>
            If you are building something where an agent has to be right rather
            than impressive, I would like to hear about it.
          </p>
          <a
            className="btn btn--solid btn--lg"
            href={`mailto:${profile.email}`}
            data-reveal
          >
            {profile.email}
          </a>
          <p className={styles.contactMeta} data-reveal>
            <span>Atlanta, GA</span>
            <i />
            <span>US citizen</span>
            <i />
            <span>usually back within a day</span>
          </p>
        </div>
      </section>
    </main>
  );
}
