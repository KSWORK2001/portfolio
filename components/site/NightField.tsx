"use client";

import { useEffect, useRef } from "react";
import styles from "./NightField.module.css";

/**
 * The hero ground: a plane of points in perspective, rolling slowly
 * toward a far horizon where a row of windows is still lit. The camera
 * leans with the pointer, so the whole field reads as depth, not a
 * pattern. One canvas, paused off screen; reduced motion draws one
 * still frame. Colours come from the page tokens, read once.
 */
export function NightField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--color-ink").trim() || "white";
    const lit = css.getPropertyValue("--color-accent").trim() || "orange";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const COLS = 64;
    const ROWS = 44;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    // Pointer target and eased camera, both in -1..1.
    const aim = { x: 0, y: 0 };
    const cam = { x: 0, y: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // A fixed scatter of far windows on the horizon, seeded so it never jumps.
    const windows = Array.from({ length: 70 }, (_, i) => {
      const r = Math.sin(i * 91.7) * 43758.5453;
      return { x: r - Math.floor(r), lift: ((i * 37) % 11) / 11, size: 0.6 + ((i * 13) % 5) / 5 };
    });

    const draw = (t: number) => {
      cam.x += (aim.x - cam.x) * 0.04;
      cam.y += (aim.y - cam.y) * 0.04;
      ctx.clearRect(0, 0, w, h);

      const horizon = h * (0.52 + cam.y * 0.03);
      const fov = h * 0.9;
      const camH = 1.1;
      const time = t * 0.00018;

      // The far lit row, drawn first so the field rolls over it.
      ctx.fillStyle = lit;
      for (const win of windows) {
        const x = (win.x - 0.5) * w * 1.3 + w / 2 - cam.x * 8;
        const y = horizon - 2 - win.lift * 6;
        ctx.globalAlpha = 0.25 + win.lift * 0.5;
        ctx.fillRect(x, y, 1.4 * win.size, 1.4 * win.size);
      }

      ctx.fillStyle = ink;
      for (let r = 0; r < ROWS; r++) {
        // Rows scroll toward the viewer and wrap, so the plane drifts.
        const zf = ((r + (time * 6) % 1) / ROWS);
        const z = 1.2 + zf * zf * 26;
        const scale = fov / z;
        for (let c = 0; c < COLS; c++) {
          const xw = (c / (COLS - 1) - 0.5) * 34 - cam.x * 2.2;
          const wave =
            Math.sin(xw * 0.32 + time * 9 + z * 0.22) * 0.34 +
            Math.cos(z * 0.38 - time * 6 + xw * 0.12) * 0.28;
          const sx = w / 2 + xw * scale;
          if (sx < -10 || sx > w + 10) continue;
          const sy = horizon + (camH - wave) * scale * 0.5;
          if (sy > h + 10) continue;
          const fade = 1 - zf;
          ctx.globalAlpha = Math.max(0.04, Math.min(1, 0.15 + fade * (0.7 + wave * 0.6)));
          const d = Math.max(0.8, 3.2 * fade * fade + 0.6);
          ctx.fillRect(sx, sy, d, d);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      draw(t);
      if (visible) raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      if (reduced) draw(0);
    };
    const onMove = (e: PointerEvent) => {
      aim.x = (e.clientX / window.innerWidth) * 2 - 1;
      aim.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("resize", onResize);
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && !reduced) raf = requestAnimationFrame(loop);
      if (!visible) cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className={styles.field} aria-hidden="true" />;
}
