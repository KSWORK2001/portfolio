"use client";

import { useEffect } from "react";

export function ConsoleEgg() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & { __karanGreeted?: boolean };
    if (w.__karanGreeted) return;
    w.__karanGreeted = true;

    const banner =
      "%c👋  Hey curious dev — welcome to the dev tools.";
    const sub =
      "%cYou inspected the page. Bold move. If you're hiring for ML/SWE, hit work.karan2001@gmail.com — bonus points for opening this with a recruiter-shaped object.";
    const hint =
      "%cP.S. try the Konami code: ↑ ↑ ↓ ↓ ← → ← → B A";

    try {
      console.log(
        banner,
        "font-family: ui-monospace; font-size: 14px; color:#79c0ff; font-weight:700;"
      );
      console.log(sub, "color:#9bacbf; font-size:12px; line-height:1.5;");
      console.log(hint, "color:#fbbf24; font-size:12px; font-style:italic;");
    } catch {
      // ignore
    }
  }, []);

  return null;
}
