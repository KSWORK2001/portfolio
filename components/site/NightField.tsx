"use client";

import { useEffect, useRef } from "react";
import styles from "./NightField.module.css";

/**
 * The 3D world behind the home page (see ./world.ts). It loads after
 * first paint as its own chunk; until then, or without WebGL, the CSS
 * gradient on the canvas is the night.
 */
export function NightField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let dead = false;
    import("./world")
      .then(({ mount }) => {
        if (!dead && ref.current) stop = mount(ref.current);
      })
      // No WebGL, or the chunk failed to load: the CSS night stays.
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") console.error(err);
      });
    return () => {
      dead = true;
      stop?.();
    };
  }, []);

  return <canvas ref={ref} className={styles.field} aria-hidden="true" />;
}
