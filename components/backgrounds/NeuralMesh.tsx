"use client";

import { useEffect, useRef } from "react";
import styles from "./NeuralMesh.module.css";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseR: number;
  pulse: number;
};

type Pulse = {
  a: number;
  b: number;
  t: number;
  speed: number;
};

type NeuralMeshProps = {
  density?: number;
  linkDistance?: number;
  color?: string;
  accent?: string;
};

export function NeuralMesh({
  density = 0.00009,
  linkDistance = 150,
  color = "#79c0ff",
  accent = "#b48cff"
}: NeuralMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      const target = Math.min(140, Math.max(40, Math.floor(width * height * density)));
      const nodes: Node[] = [];
      for (let i = 0; i < target; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          baseR: 1.1 + Math.random() * 1.6,
          pulse: Math.random() * Math.PI * 2
        });
      }
      nodesRef.current = nodes;
      pulsesRef.current = [];
    };

    const colorRGB = hexToRgb(color);
    const accentRGB = hexToRgb(accent);

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const linkDistSq = linkDistance * linkDistance;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        // Subtle drift
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;

        // Mouse interaction (gentle repulsion + slight attraction at distance)
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 22000 && d2 > 1) {
            const d = Math.sqrt(d2);
            const force = (22000 - d2) / 22000;
            n.vx += (dx / d) * force * 0.18;
            n.vy += (dy / d) * force * 0.18;
          }
        }

        // Damping + wrap
        n.vx *= 0.96;
        n.vy *= 0.96;
        if (n.vx > 1.2) n.vx = 1.2;
        if (n.vx < -1.2) n.vx = -1.2;
        if (n.vy > 1.2) n.vy = 1.2;
        if (n.vy < -1.2) n.vy = -1.2;
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDistSq) {
            const t = 1 - d2 / linkDistSq;
            ctx.strokeStyle = `rgba(${colorRGB.r},${colorRGB.g},${colorRGB.b},${t * 0.22})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Random pulse spawn along close edges
            if (Math.random() < 0.00012 && pulsesRef.current.length < 28) {
              pulsesRef.current.push({ a: i, b: j, t: 0, speed: 0.008 + Math.random() * 0.012 });
            }
          }
        }
      }

      // Pulses
      const pulses = pulsesRef.current;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) {
          pulses.splice(i, 1);
          continue;
        }
        p.t += p.speed;
        if (p.t >= 1) {
          pulses.splice(i, 1);
          b.pulse = 0;
          continue;
        }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 12);
        grad.addColorStop(0, `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.9)`);
        grad.addColorStop(1, `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulseR = n.baseR + Math.sin(n.pulse) * 0.4;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulseR * 4);
        grad.addColorStop(0, `rgba(${colorRGB.r},${colorRGB.g},${colorRGB.b},0.95)`);
        grad.addColorStop(0.5, `rgba(${colorRGB.r},${colorRGB.g},${colorRGB.b},0.18)`);
        grad.addColorStop(1, `rgba(${colorRGB.r},${colorRGB.g},${colorRGB.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [density, linkDistance, color, accent]);

  return <canvas ref={canvasRef} className={styles.neuralMesh} aria-hidden="true" />;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
