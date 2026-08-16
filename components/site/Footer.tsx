import { profile } from "@/data/profile-data";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.foot}>
      <div className={`wrap ${styles.inner}`}>
        <span className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            KS
          </span>
          <span className={styles.word}>Karan Shrivastava</span>
        </span>

        <nav className={styles.nav} aria-label="Elsewhere">
          <a href={`mailto:${profile.email}`}>Email</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={profile.resume}>Résumé</a>
        </nav>

        <span className={styles.copy}>Built by hand, Atlanta</span>
      </div>
    </footer>
  );
}
