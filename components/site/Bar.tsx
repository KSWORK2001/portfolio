"use client";

import { useEffect, useState } from "react";
import styles from "./Bar.module.css";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#loop", label: "Approach" },
  { href: "#projects", label: "Projects" },
  { href: "#stack", label: "Stack" }
];

/**
 * A pinned status bar rather than a website nav.
 *
 * Karan is in Atlanta and most people reading this are not, so the bar
 * carries his local time the way a monitoring strip would. It is the
 * only live thing on the page that is about him rather than about the
 * work, which is why it gets the single green dot up here.
 */
export function Bar() {
  /* Rendered empty on the server and filled in on mount — a clock that
     ships in the static HTML would be wrong by the time anyone reads it. */
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const read = () =>
      setNow(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York"
        }).format(new Date())
      );
    read();
    const id = window.setInterval(read, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className={styles.bar} id="bar">
      <div className={styles.inner}>
        <a className={styles.brand} href="#top">
          <span className={styles.mark} aria-hidden="true">
            KS
          </span>
          <span className={styles.word}>Karan Shrivastava</span>
        </a>

        <nav className={styles.nav} aria-label="Sections">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <span className={styles.clock} aria-hidden={now === null}>
          <span className={styles.clockDot} />
          {now ? `${now} ATL` : " "}
        </span>

        <a className={styles.cta} href="#contact">
          Email
        </a>
      </div>
    </header>
  );
}
