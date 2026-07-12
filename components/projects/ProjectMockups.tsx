import type { ComponentType } from "react";
import styles from "./ProjectMockups.module.css";

// Static, non-interactive UI facsimiles rendered in place of project
// screenshots. Sized to fill the 4:3 media panel in ScrollProjects.

const RUNS = [
  { id: "#4187", time: "14:02", status: "running" },
  { id: "#4186", time: "13:47", status: "ok" },
  { id: "#4185", time: "13:31", status: "ok" },
  { id: "#4184", time: "13:12", status: "failed" },
  { id: "#4183", time: "12:58", status: "ok" }
];

const NODES = [
  { label: "Ingest", x: 10, y: 16, state: "done" },
  { label: "Retrieve", x: 32, y: 16, state: "done" },
  { label: "Triage", x: 54, y: 16, state: "running" },
  { label: "Validate", x: 76, y: 16, state: "queued" },
  { label: "Remediate", x: 54, y: 58, state: "idle" },
  { label: "Commit", x: 88, y: 58, state: "queued" }
];

const LOGS = [
  { time: "14:02:31", tag: "retrieve", tagClass: "ok", text: "12 docs · pgvector · 240ms" },
  { time: "14:02:32", tag: "triage", tagClass: "run", text: "route=invoice_flow conf=0.93" },
  { time: "14:02:33", tag: "validate", tagClass: "warn", text: "3 params coerced · retry 0/3" },
  { time: "14:02:33", tag: "commit", tagClass: "dim", text: "queued · awaiting validation" }
];

function AgenticMockup() {
  return (
    <div className={styles.window}>
      <div className={styles.titlebar}>
        <span className={styles.trafficDots} aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className={styles.titleText}>orchestrator · run #4187</span>
        <span className={styles.envBadge}>prod</span>
      </div>
      <div className={styles.agenticBody}>
        <aside className={styles.runRail}>
          <p className={styles.railLabel}>Runs</p>
          {RUNS.map((r) => (
            <div key={r.id} className={styles.runRow}>
              <i className={`${styles.statusDot} ${styles[r.status]}`} />
              <span className={styles.runId}>{r.id}</span>
              <span className={styles.runTime}>{r.time}</span>
            </div>
          ))}
        </aside>
        <div className={styles.agenticMain}>
          <div className={styles.canvas}>
            <svg
              className={styles.edges}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="10" y1="16" x2="32" y2="16" />
              <line x1="32" y1="16" x2="54" y2="16" />
              <line x1="54" y1="16" x2="76" y2="16" />
              <line x1="76" y1="16" x2="54" y2="58" className={styles.edgeRetry} />
              <line x1="76" y1="16" x2="88" y2="58" className={styles.edgeCommit} />
            </svg>
            {NODES.map((n) => (
              <div
                key={n.label}
                className={`${styles.node} ${styles[`node_${n.state}`]}`}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <i className={`${styles.statusDot} ${styles[n.state]}`} />
                {n.label}
              </div>
            ))}
            <span className={styles.edgeLabel}>on fail · retry ≤3</span>
          </div>
          <div className={styles.logPane}>
            {LOGS.map((l) => (
              <p key={l.time + l.tag} className={styles.logLine}>
                <span className={styles.logTime}>{l.time}</span>
                <span className={`${styles.logTag} ${styles[`tag_${l.tagClass}`]}`}>{l.tag}</span>
                <span className={styles.logText}>{l.text}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const WAVE = [
  8, 14, 22, 30, 20, 12, 26, 36, 28, 16, 9, 19, 32, 40, 24, 13, 28, 38, 22, 11,
  17, 30, 42, 32, 19, 9, 15, 26, 34, 24, 13, 21, 36, 30, 17, 11, 24, 32, 19, 9,
  14, 27, 35, 23, 12
];

const TRANSCRIPT = [
  { time: "00:04", speaker: "S1", text: "Okay, the deploy finished about ten minutes ago." },
  { time: "00:09", speaker: "S2", text: "Latency looks stable, keep the canary at ten percent." },
  { time: "00:11", speaker: "S2", text: "Error rate is flat at zero point two, well under budget." },
  { time: "00:13", speaker: "S1", text: "Good. Bumping it to twenty five percent after lunch." }
];

function SpeechMockup() {
  return (
    <div className={styles.window}>
      <div className={styles.titlebar}>
        <span className={styles.livePill}>
          <i className={styles.liveDot} /> LIVE
        </span>
        <span className={styles.titleText}>session · en-US</span>
        <span className={styles.metricChip}>p50 38 ms</span>
        <span className={styles.metricChip}>whisper-large-v3 · FP16</span>
      </div>
      <div className={styles.wave} aria-hidden="true">
        {WAVE.map((h, i) => (
          <i
            key={i}
            className={i > WAVE.length - 8 ? styles.waveBarHot : styles.waveBar}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <div className={styles.transcript}>
        {TRANSCRIPT.map((t) => (
          <p key={t.time} className={styles.speechRow}>
            <span className={styles.speechTime}>{t.time}</span>
            <span
              className={`${styles.speakerChip} ${
                t.speaker === "S1" ? styles.speakerBlue : styles.speakerTeal
              }`}
            >
              {t.speaker}
            </span>
            <span className={styles.speechText}>{t.text}</span>
          </p>
        ))}
        <p className={styles.speechRow}>
          <span className={styles.speechTime}>00:14</span>
          <span className={`${styles.speakerChip} ${styles.speakerBlue}`}>S1</span>
          <span className={styles.speechPartial}>
            Alright, let&apos;s watch the error budget for
            <i className={styles.caret} />
          </span>
        </p>
      </div>
      <div className={styles.speechFooter}>
        <span className={styles.footerLabel}>XTTS · voice: nova-2</span>
        <span className={styles.gpuMeter}>
          <span className={styles.footerLabel}>CUDA · A100</span>
          <i className={styles.meterTrack}>
            <i className={styles.meterFill} />
          </i>
          <span className={styles.footerLabel}>62%</span>
        </span>
      </div>
    </div>
  );
}

function SpotMeMockup() {
  return (
    <div className={styles.phoneScene}>
      <div className={styles.phone}>
        <i className={styles.notch} aria-hidden="true" />
        <div className={styles.phoneHeader}>
          <span className={styles.appName}>SpotMe!</span>
          <i className={styles.bellDot} aria-hidden="true" />
        </div>
        <span className={styles.gymChip}>
          <i className={styles.pinDot} /> LA Fitness · Midtown
        </span>
        <div className={styles.phoneCard}>
          <p className={styles.phoneCardTitle}>Spotters nearby</p>
          <div className={styles.avatarRow}>
            <i className={`${styles.avatar} ${styles.avatarTeal}`}>MK</i>
            <i className={`${styles.avatar} ${styles.avatarBlue}`}>JP</i>
            <i className={`${styles.avatar} ${styles.avatarAmber}`}>+4</i>
            <span className={styles.avatarNote}>3 online at your gym</span>
          </div>
          <span className={styles.phoneBtn}>Request a spot</span>
        </div>
        <div className={styles.phoneCard}>
          <div className={styles.postHead}>
            <i className={`${styles.avatar} ${styles.avatarBlue}`}>PR</i>
            <span className={styles.postName}>
              Priya R. <em className={styles.postTime}>12m</em>
            </span>
          </div>
          <p className={styles.postBody}>Bench PR: 225 lb × 3. Thanks for the spot, Marcus.</p>
          <p className={styles.postMeta}>24 likes · 6 comments</p>
        </div>
        <div className={styles.streakRow}>
          <span className={styles.streakLabel}>Weekly streak</span>
          <span className={styles.streakDays}>
            <i className={styles.dayOn} />
            <i className={styles.dayOn} />
            <i className={styles.dayOn} />
            <i className={styles.dayOn} />
            <i className={styles.dayOff} />
            <i className={styles.dayOff} />
            <i className={styles.dayOff} />
          </span>
          <span className={styles.streakCount}>4 days</span>
        </div>
        <div className={styles.tabBar}>
          <span className={styles.tabOn}>Home</span>
          <span>Map</span>
          <i className={styles.tabPlus}>+</i>
          <span>Chat</span>
          <span>Me</span>
        </div>
      </div>
      <div className={styles.toast}>
        <p className={styles.toastTitle}>Marcus accepted your spot</p>
        <p className={styles.toastBody}>Chest day · today 6:30 PM</p>
      </div>
    </div>
  );
}

const MOCKUPS: Record<string, ComponentType> = {
  agentic: AgenticMockup,
  speech: SpeechMockup,
  spotme: SpotMeMockup
};

export function ProjectMockup({ kind, label }: { kind: string; label: string }) {
  const Mockup = MOCKUPS[kind];
  if (!Mockup) return null;
  return (
    <div className={styles.frame} role="img" aria-label={`${label} interface preview`}>
      <Mockup />
    </div>
  );
}
