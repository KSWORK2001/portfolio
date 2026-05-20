"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./ScrollMorph.module.css";

type Stage = {
  kicker: string;
  title: string;
  body: string;
  color: string;
};

const STAGES: Stage[] = [
  {
    kicker: "01 · The Kid Who Broke Things",
    title: "Started by breaking my dad's PC. Repeatedly.",
    body:
      "Learned to code because the only way to fix what I broke was to understand it. Curiosity has been the through-line ever since.",
    color: "#79c0ff"
  },
  {
    kicker: "02 · The Builder",
    title: "50+ prototypes. Some shipped. Some didn't. All taught me something.",
    body:
      "From C++ memory bugs at Nexcen to NLP pipelines at Elevance to enterprise agents at AT&T — building is how I learn what I actually believe.",
    color: "#b48cff"
  },
  {
    kicker: "03 · The Atlanta Engineer",
    title: "Now shipping AI agents at The Home Depot.",
    body:
      "Claude, Vertex AI, LangGraph — designing agentic systems that touch real retail workflows, not slide decks. MS at Georgia Tech runs in parallel.",
    color: "#ff9ffc"
  },
  {
    kicker: "04 · The Tinkerer (Always)",
    title: "Echo, TokenLess, SpotMe — side projects keep me honest.",
    body:
      "300+ downloads here, a HackGT trophy there, a stubborn refusal to put pineapple on pizza everywhere. Hire me, or just ask about DC vs Marvel.",
    color: "#fbbf24"
  }
];

const POINT_COUNT = 2500;

function fibonacciSphere(count: number, radius: number) {
  const out = new Float32Array(count * 3);
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    out[i * 3] = Math.cos(theta) * r * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return out;
}

function cubeLattice(count: number, side: number) {
  const out = new Float32Array(count * 3);
  const n = Math.ceil(Math.cbrt(count));
  const step = (side * 2) / (n - 1);
  let i = 0;
  for (let x = 0; x < n && i < count; x++) {
    for (let y = 0; y < n && i < count; y++) {
      for (let z = 0; z < n && i < count; z++) {
        // Hollow-ish: only place points on shell or near edges for cooler look
        const onShell =
          x === 0 || x === n - 1 || y === 0 || y === n - 1 || z === 0 || z === n - 1;
        if (!onShell && Math.random() > 0.05) continue;
        out[i * 3] = -side + x * step;
        out[i * 3 + 1] = -side + y * step;
        out[i * 3 + 2] = -side + z * step;
        i += 1;
      }
    }
  }
  // Fill any remaining slots with random shell positions
  for (; i < count; i++) {
    const face = Math.floor(Math.random() * 6);
    const u = Math.random() * 2 - 1;
    const v = Math.random() * 2 - 1;
    let x = 0;
    let y = 0;
    let z = 0;
    if (face === 0) { x = side; y = u * side; z = v * side; }
    else if (face === 1) { x = -side; y = u * side; z = v * side; }
    else if (face === 2) { y = side; x = u * side; z = v * side; }
    else if (face === 3) { y = -side; x = u * side; z = v * side; }
    else if (face === 4) { z = side; x = u * side; y = v * side; }
    else { z = -side; x = u * side; y = v * side; }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

function torus(count: number, R: number, r: number) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2;
    const v = ((i * 37) % count) / count * Math.PI * 2;
    out[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
    out[i * 3 + 1] = r * Math.sin(v);
    out[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);
  }
  return out;
}

function helix(count: number, radius: number, height: number, turns: number) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2 * turns;
    // Two-strand DNA-ish helix
    const strand = i % 2 === 0 ? 1 : -1;
    out[i * 3] = Math.cos(angle) * radius * strand;
    out[i * 3 + 1] = (t - 0.5) * height;
    out[i * 3 + 2] = Math.sin(angle) * radius * strand;
  }
  return out;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function ScrollMorph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !wrap || !sticky) return;

    // Targets — same length, all POINT_COUNT * 3
    const targets = [
      fibonacciSphere(POINT_COUNT, 2.2),
      cubeLattice(POINT_COUNT, 2.1),
      torus(POINT_COUNT, 2.0, 0.65),
      helix(POINT_COUNT, 1.6, 5.0, 5)
    ];

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const positions = new Float32Array(targets[0]);
    const colors = new Float32Array(POINT_COUNT * 3);
    const base = new THREE.Color("#79c0ff");
    const accent = new THREE.Color("#b48cff");
    for (let i = 0; i < POINT_COUNT; i++) {
      const mix = Math.random();
      const c = base.clone().lerp(accent, mix);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Glow sprite behind for depth
    const glowTex = makeGlowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x5227ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(8);
    glow.position.set(0, 0, -1);
    scene.add(glow);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = sticky.clientWidth;
      const h = sticky.clientHeight;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Mouse
    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const rect = sticky.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // Scroll progress within the wrap
    let progress = 0;
    let rafScroll = 0;
    const updateProgress = () => {
      const rect = wrap.getBoundingClientRect();
      const wrapH = wrap.offsetHeight;
      const viewH = window.innerHeight;
      // Progress = scrolled distance through the pinned region
      const start = rect.top;
      const total = wrapH - viewH;
      const scrolled = -start;
      progress = Math.max(0, Math.min(1, scrolled / total));

      const stageF = progress * (STAGES.length - 1);
      const newIdx = Math.round(stageF);
      setStageIdx((cur) => (cur === newIdx ? cur : newIdx));
      rafScroll = 0;
    };
    const onScroll = () => {
      if (rafScroll) return;
      rafScroll = requestAnimationFrame(updateProgress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();

    // Animate
    let raf = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const animate = () => {
      // Lerp positions toward current scroll progress shape
      const stageF = progress * (targets.length - 1);
      const a = Math.floor(stageF);
      const b = Math.min(a + 1, targets.length - 1);
      const k = easeInOut(stageF - a);
      const pa = targets[a];
      const pb = targets[b];
      const arr = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < arr.length; i++) {
        const target = pa[i] + (pb[i] - pa[i]) * k;
        arr[i] += (target - arr[i]) * 0.12;
      }
      geo.attributes.position.needsUpdate = true;

      // Drift rotation + mouse parallax
      targetRotY = mouse.x * 0.5;
      targetRotX = mouse.y * 0.35;
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;
      points.rotation.x = rotX;
      points.rotation.y = rotY + performance.now() * 0.00015;

      // Color shift glow by stage
      const stage = STAGES[Math.min(STAGES.length - 1, Math.round(progress * (STAGES.length - 1)))];
      const targetColor = new THREE.Color(stage.color);
      (glowMat.color as THREE.Color).lerp(targetColor, 0.04);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (rafScroll) cancelAnimationFrame(rafScroll);
      if (raf) cancelAnimationFrame(raf);
      geo.dispose();
      mat.dispose();
      glowMat.dispose();
      glowTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <section ref={wrapRef} className={styles.wrap} aria-label="Personal story chapters">
      <div ref={stickyRef} className={styles.sticky}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.overlay}>
          <div className={styles.copy}>
            <p className={styles.kickerLine}>The Long Version</p>
            <h2 className={styles.heading}>
              Four <span className={styles.headingAccent}>chapters</span> of how I got here.
            </h2>
          </div>
          <div className={styles.stages}>
            {STAGES.map((s, i) => (
              <div
                key={s.kicker}
                className={`${styles.stage} ${i === stageIdx ? styles.stageOn : ""}`}
                style={{ ["--stage-color" as never]: s.color }}
              >
                <p className={styles.stageKicker}>{s.kicker}</p>
                <p className={styles.stageTitle}>{s.title}</p>
                <p className={styles.stageBody}>{s.body}</p>
              </div>
            ))}
          </div>
          <div className={styles.dots} aria-hidden="true">
            {STAGES.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === stageIdx ? styles.dotOn : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}
