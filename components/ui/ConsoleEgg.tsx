"use client";

import { useEffect } from "react";

/**
 * The one easter egg left on the site, for the people most likely to
 * look: every visual on this page is DOM and CSS, so opening the
 * inspector is a fair way to check the claim.
 */
export function ConsoleEgg() {
  useEffect(() => {
    const w = window as Window & { __ks?: boolean };
    if (w.__ks) return;
    w.__ks = true;

    try {
      console.log(
        "%cNo screenshots on this page.",
        "font-family: ui-monospace, monospace; font-size: 13px; color: #22c55e; font-weight: 700;"
      );
      console.log(
        "%cEvery interface here is DOM and CSS — the traces, the graph, the terminal. Inspect any of it.\nHiring? work.karan2001@gmail.com",
        "font-family: ui-monospace, monospace; color: #a09a90; font-size: 12px; line-height: 1.6;"
      );
    } catch {
      /* Some embedded browsers ship a console that throws on styling. */
    }
  }, []);

  return null;
}
