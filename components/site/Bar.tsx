"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { profile } from "@/data/profile-data";
import styles from "./Bar.module.css";

/* Section anchors live on the home page. Stored bare, and prefixed with
   the root only when the bar is rendered somewhere else — see `to` below. */
const SECTIONS = [
  { hash: "#work", label: "Work" },
  { hash: "#loop", label: "Approach" },
  { hash: "#projects", label: "Projects" },
  { hash: "#stack", label: "Stack" }
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
  const pathname = usePathname();

  /* trailingSlash is on, so /personal arrives as "/personal/" in some
     contexts and "/personal" in others. Only "/" is the home page. */
  const onHome = pathname === "/" || pathname === "";

  /* On the home page a bare hash just scrolls. From any other route the
     same hash would look for a section that is not there, so it has to
     travel home first. Keeping it bare on home matters: "/#work" would
     be a full navigation rather than a scroll. */
  const to = (hash: string) => (onHome ? hash : `/${hash}`);

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
        <a className={styles.brand} href={to("#top")}>
          {/* Decorative rather than labelled: his name is the very next
              node, so giving the photo alt text would make the link
              announce itself twice. Deliberately not lazy — the bar is
              fixed, so this is always above the fold. */}
          <img
            className={styles.mark}
            src={profile.avatar}
            alt=""
            width="256"
            height="256"
          />
          <span className={styles.word}>Karan Shrivastava</span>
        </a>

        <nav className={styles.nav} aria-label="Sections">
          {SECTIONS.map((item) => (
            <a key={item.hash} href={to(item.hash)}>
              {item.label}
            </a>
          ))}
          {/* A real route, not an anchor, so it never gets the prefix. */}
          <a
            href="/personal"
            aria-current={onHome ? undefined : "page"}
            className={onHome ? undefined : styles.navOn}
          >
            Personal
          </a>
        </nav>

        <span className={styles.clock} aria-hidden={now === null}>
          <span className={styles.clockDot} />
          {now ? `${now} ATL` : " "}
        </span>

        <a className={styles.cta} href={to("#contact")}>
          Email
        </a>
      </div>
    </header>
  );
}
