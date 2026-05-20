"use client";

import { ACHIEVEMENTS, useAchievements } from "./AchievementsContext";
import styles from "./Achievements.module.css";

export function AchievementsPanel() {
  const { unlocked, total, panelOpen, setPanelOpen, reset } = useAchievements();
  const count = unlocked.size;
  const pct = Math.round((count / total) * 100);

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setPanelOpen(!panelOpen)}
        aria-label={`Achievements ${count} of ${total}`}
        aria-expanded={panelOpen}
        title="Achievements — find them all"
      >
        <span className={styles.fabIcon}>🏆</span>
        <span className={styles.fabCount}>
          {count}/{total}
        </span>
        <span className={styles.fabBarWrap} aria-hidden="true">
          <span className={styles.fabBar} style={{ width: `${pct}%` }} />
        </span>
      </button>

      {panelOpen && (
        <div
          className={styles.panelBackdrop}
          onClick={() => setPanelOpen(false)}
          role="presentation"
        >
          <div
            className={styles.panel}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Achievements"
          >
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Discovery</p>
                <h3 className={styles.panelTitle}>Achievements</h3>
                <p className={styles.panelSub}>
                  {count} / {total} unlocked · {pct}% explored
                </p>
              </div>
              <button
                type="button"
                className={styles.panelClose}
                onClick={() => setPanelOpen(false)}
                aria-label="Close achievements panel"
              >
                ✕
              </button>
            </div>

            <ul className={styles.list}>
              {ACHIEVEMENTS.map((a) => {
                const got = unlocked.has(a.id);
                return (
                  <li key={a.id} className={`${styles.row} ${got ? styles.rowOn : styles.rowOff}`}>
                    <span className={styles.rowIcon} aria-hidden="true">
                      {got ? a.icon : "🔒"}
                    </span>
                    <span className={styles.rowText}>
                      <span className={styles.rowTitle}>{got ? a.title : "Locked"}</span>
                      <span className={styles.rowHint}>{a.hint}</span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <button type="button" className={styles.resetBtn} onClick={reset}>
              Reset progress
            </button>
          </div>
        </div>
      )}
    </>
  );
}
