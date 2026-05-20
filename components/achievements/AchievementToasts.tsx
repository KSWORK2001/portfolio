"use client";

import { useEffect } from "react";
import { useAchievements } from "./AchievementsContext";
import styles from "./Achievements.module.css";

export function AchievementToasts() {
  const { toastQueue, dismissToast } = useAchievements();

  useEffect(() => {
    if (toastQueue.length === 0) return;
    const head = toastQueue[0];
    const timer = window.setTimeout(() => dismissToast(head.id), 4200);
    return () => window.clearTimeout(timer);
  }, [toastQueue, dismissToast]);

  return (
    <div className={styles.toastStack} aria-live="polite">
      {toastQueue.slice(0, 3).map((a) => (
        <div key={a.id} className={styles.toast} onClick={() => dismissToast(a.id)}>
          <div className={styles.toastIcon}>{a.icon}</div>
          <div className={styles.toastBody}>
            <div className={styles.toastKicker}>Achievement unlocked</div>
            <div className={styles.toastTitle}>{a.title}</div>
            <div className={styles.toastHint}>{a.hint}</div>
          </div>
          <div className={styles.toastBar} />
        </div>
      ))}
    </div>
  );
}
