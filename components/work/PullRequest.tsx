import styles from "./PullRequest.module.css";

/**
 * The one piece of artwork in the work section, on the one entry that
 * proves the headline: a merged pull request with a bot in the author
 * slot and no human anywhere in the authoring path. Everything else on
 * the page describes what he built. This shows the receipt.
 */
export function PullRequest() {
  return (
    <figure className={`win ${styles.pr}`}>
      <div className="win__bar">
        <span className="chip chip--pass">
          <span className="dot" />
          merged
        </span>
        <span className="win__title">feat/JIRA-4471 → main</span>
        <span className="win__end">
          <span className={styles.add}>+142</span>{" "}
          <span className={styles.del}>−38</span>
        </span>
      </div>

      <div className={styles.body}>
        <p className={styles.who}>
          <span className={styles.avatar} aria-hidden="true">
            ⬡
          </span>
          <span className={styles.handle}>swe-agent</span>
          <span className={styles.bot}>bot</span>
          <span className={styles.action}>opened and authored this</span>
        </p>

        <h4 className={styles.title}>
          Add retry backoff to the payments client
        </h4>

        <ul className={styles.checks}>
          <li>
            <span className={styles.tick}>✓</span>14 checks passed
          </li>
          <li>
            <span className={styles.tick}>✓</span>approved by 2 reviewers
          </li>
          <li>
            <span className={styles.tick}>✓</span>story pulled from Jira, no
            prompt written
          </li>
        </ul>
      </div>

      <div className="win__foot">30 of these merged · none written by a person</div>
    </figure>
  );
}
