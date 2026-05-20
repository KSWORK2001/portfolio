"use client";

import { useEffect, useRef, useState } from "react";
import { USA_OUTLINE, pointInUSA } from "./usa-outline";
import styles from "./USAMap.module.css";

const VB_W = 1000;
const VB_H = 500;

// Equirectangular projection sized to viewBox.
// USA bbox: lon -125..-67 (range 58), lat 24..50 (range 26)
const LON_MIN = -125;
const LON_RANGE = 58;
const LAT_MAX = 50;
const LAT_RANGE = 26;

function project(lat: number, lon: number): [number, number] {
  const x = ((lon - LON_MIN) / LON_RANGE) * VB_W;
  const y = ((LAT_MAX - lat) / LAT_RANGE) * VB_H;
  return [x, y];
}

type City = {
  name: string;
  company: string;
  role: string;
  period: string;
  lat: number;
  lon: number;
  blurb: string;
};

const CITIES: City[] = [
  {
    name: "Denver, CO",
    company: "Cognizant",
    role: "Machine Learning Engineer",
    period: "Jun 2025 – Aug 2025",
    lat: 39.7392,
    lon: -104.9903,
    blurb:
      "Cut LLM inference latency by 32% on A100/V100/T4 with ONNX conversion, quantization, and precision tuning."
  },
  {
    name: "Dallas, TX",
    company: "AT&T",
    role: "Generative AI Architect",
    period: "Oct 2025 – Mar 2026",
    lat: 32.7767,
    lon: -96.797,
    blurb:
      "Built an agentic orchestration system (LangGraph + LangChain) that eliminated ~90% of manual hand-offs in enterprise flows."
  },
  {
    name: "Atlanta, GA",
    company: "The Home Depot",
    role: "Senior Applied AI Engineer",
    period: "Apr 2026 – Present",
    lat: 33.749,
    lon: -84.388,
    blurb:
      "Shipping production agentic systems on Claude and Google Vertex AI for retail-scale workflows. Currently here."
  }
];

// Build the USA outline as an SVG path
function buildOutlinePath() {
  const pts = USA_OUTLINE.map(([lat, lon]) => project(lat, lon));
  const [sx, sy] = pts[0];
  let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += " Z";
  return d;
}

// Sample interior dots once per mount
function sampleInteriorDots(count: number): [number, number][] {
  const out: [number, number][] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 12) {
    attempts += 1;
    const lat = 24 + Math.random() * 26;
    const lon = -125 + Math.random() * 58;
    if (pointInUSA(lat, lon)) {
      out.push(project(lat, lon));
    }
  }
  return out;
}

type ViewBox = { x: number; y: number; w: number; h: number };

const FULL_VB: ViewBox = { x: 0, y: 0, w: VB_W, h: VB_H };

function cityViewBox(city: City): ViewBox {
  const [cx, cy] = project(city.lat, city.lon);
  const w = 320;
  const h = (VB_H / VB_W) * w;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpVB(a: ViewBox, b: ViewBox, t: number): ViewBox {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t)
  };
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function USAMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState<[number, number][]>([]);

  useEffect(() => {
    setDots(sampleInteriorDots(420));
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const wrapH = wrap.offsetHeight;
      const viewH = window.innerHeight;
      const start = rect.top;
      const total = wrapH - viewH;
      const scrolled = -start;
      const p = total <= 0 ? 0 : Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Stages:
  // 0.00 – 0.18: full USA (intro)
  // 0.18 – 0.40: zoom into Denver
  // 0.40 – 0.62: zoom into Dallas
  // 0.62 – 0.84: zoom into Atlanta
  // 0.84 – 1.00: stay on Atlanta (outro)
  const stages: ViewBox[] = [
    FULL_VB,
    cityViewBox(CITIES[0]),
    cityViewBox(CITIES[1]),
    cityViewBox(CITIES[2]),
    cityViewBox(CITIES[2])
  ];
  const breakpoints = [0, 0.22, 0.5, 0.78, 1.0];

  let segIdx = 0;
  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (progress >= breakpoints[i] && progress <= breakpoints[i + 1]) {
      segIdx = i;
      break;
    }
  }
  const localT = easeInOut(
    Math.max(
      0,
      Math.min(
        1,
        (progress - breakpoints[segIdx]) /
          Math.max(0.0001, breakpoints[segIdx + 1] - breakpoints[segIdx])
      )
    )
  );
  const vb = lerpVB(stages[segIdx], stages[segIdx + 1], localT);
  const viewBoxStr = `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`;

  // Active city for overlay copy
  const activeCityIdx = progress < 0.22 ? -1 : progress < 0.5 ? 0 : progress < 0.78 ? 1 : 2;

  const outlinePath = buildOutlinePath();
  const pinPts = CITIES.map((c) => project(c.lat, c.lon));

  // Connection line between the three pins (drawn after first stage)
  const connectionD = pinPts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  // Stroke scale — keep pin/line widths consistent through zoom
  const zoom = VB_W / vb.w;

  return (
    <section ref={wrapRef} className={styles.wrap} aria-label="Where I have worked">
      <div className={styles.sticky}>
        <div className={styles.bg} />

        <div className={styles.headerOverlay}>
          <p className={styles.kicker}>The Map</p>
          <h2 className={styles.heading}>
            Three cities. <span className={styles.accent}>Three chapters.</span>
          </h2>
        </div>

        <svg
          className={styles.svg}
          viewBox={viewBoxStr}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="usaFill" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#1a2230" />
              <stop offset="100%" stopColor="#0b0f14" />
            </radialGradient>
            <linearGradient id="connectionGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#79c0ff" />
              <stop offset="50%" stopColor="#b48cff" />
              <stop offset="100%" stopColor="#ff9ffc" />
            </linearGradient>
            <filter id="pinGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* USA filled shape */}
          <path
            d={outlinePath}
            fill="url(#usaFill)"
            stroke="rgba(121,192,255,0.55)"
            strokeWidth={1.2 / zoom}
            strokeLinejoin="round"
          />

          {/* Interior dots */}
          <g>
            {dots.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={0.9 / zoom}
                fill="rgba(121,192,255,0.45)"
              />
            ))}
          </g>

          {/* Connection line between pins */}
          <path
            d={connectionD}
            fill="none"
            stroke="url(#connectionGrad)"
            strokeWidth={1.4 / zoom}
            strokeLinecap="round"
            strokeDasharray={`${4 / zoom} ${4 / zoom}`}
            opacity={0.65}
          />

          {/* Pins */}
          {CITIES.map((city, i) => {
            const [x, y] = pinPts[i];
            const active = i === activeCityIdx;
            const baseR = active ? 6.5 / zoom : 4.2 / zoom;
            const ringR = baseR * 2.4;
            const color = active ? "#ff9ffc" : "#79c0ff";
            return (
              <g key={city.name} filter="url(#pinGlow)">
                <circle
                  cx={x}
                  cy={y}
                  r={ringR}
                  fill="none"
                  stroke={color}
                  strokeWidth={1 / zoom}
                  opacity={active ? 0.85 : 0.45}
                >
                  {active && (
                    <animate
                      attributeName="r"
                      values={`${ringR};${ringR * 1.5};${ringR}`}
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                <circle cx={x} cy={y} r={baseR} fill={color} />
              </g>
            );
          })}
        </svg>

        <div className={styles.cityCards}>
          {CITIES.map((city, i) => (
            <article
              key={city.name}
              className={`${styles.cityCard} ${
                i === activeCityIdx ? styles.cityCardActive : ""
              }`}
              aria-hidden={i !== activeCityIdx}
            >
              <p className={styles.cityKicker}>
                {String(i + 1).padStart(2, "0")} · {city.name}
              </p>
              <h3 className={styles.cityCompany}>{city.company}</h3>
              <p className={styles.cityRole}>{city.role}</p>
              <p className={styles.cityPeriod}>{city.period}</p>
              <p className={styles.cityBlurb}>{city.blurb}</p>
            </article>
          ))}
          {activeCityIdx === -1 && (
            <article className={`${styles.cityCard} ${styles.cityCardActive}`}>
              <p className={styles.cityKicker}>00 · USA</p>
              <h3 className={styles.cityCompany}>Three pins. One country.</h3>
              <p className={styles.cityBlurb}>
                Cognizant in Denver. AT&amp;T in Dallas. Home Depot in Atlanta. Keep scrolling to fly between them.
              </p>
            </article>
          )}
        </div>

        <div className={styles.dots} aria-hidden="true">
          {[-1, 0, 1, 2].map((i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === activeCityIdx ? styles.dotOn : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
