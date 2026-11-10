"use client";

import type { Material } from "three";
import { useEffect, useRef } from "react";
import styles from "./NightField.module.css";

type Three = typeof import("three");

/**
 * The hero ground, in real 3D: a valley of points rolling toward a lit
 * portal on the horizon, with sparks drifting out of it toward you. The
 * camera leans with the pointer and pushes into the valley as the hero
 * scrolls away. three.js loads after first paint; until then, or without
 * WebGL, the CSS gradient on the canvas is the hero. Paused off screen;
 * reduced motion draws one still frame.
 */
export function NightField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let dead = false;
    import("three")
      .then((THREE) => {
        if (!dead && ref.current) stop = mount(THREE, ref.current);
      })
      // No WebGL, or the chunk failed to load: the CSS night stays.
      .catch(() => {});
    return () => {
      dead = true;
      stop?.();
    };
  }, []);

  return <canvas ref={ref} className={styles.field} aria-hidden="true" />;
}

const CAM_Z = 8;
const PORTAL_Z = -40;
const R = 15;

/** Page tokens are oklch, which three cannot parse, so let a 2D canvas resolve them to sRGB. */
function tokenReader(THREE: Three) {
  const css = getComputedStyle(document.documentElement);
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  return (name: string, fallback: string) => {
    if (!probe) return new THREE.Vector3(1, 1, 1);
    probe.fillStyle = fallback;
    probe.fillStyle = css.getPropertyValue(name).trim() || fallback;
    probe.clearRect(0, 0, 1, 1);
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return new THREE.Vector3(r / 255, g / 255, b / 255);
  };
}

function mount(THREE: Three, canvas: HTMLCanvasElement) {
  const token = tokenReader(THREE);
  const ink = token("--color-ink", "#efebe3");
  const lit = token("--color-accent", "#f0c48c");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

  const uTime = { value: 0 };
  const uScale = { value: 400 };
  const uPortal = { value: new THREE.Vector3(0, R * 0.3, PORTAL_Z) };
  const uSun = { value: new THREE.Vector2(0.5, 0.5) };
  const uAspect = { value: 1 };
  // Everything but the sky is light added to the dark, so draw order never matters.
  const glow = { transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending };

  /* Sky: the same night gradient as the CSS fallback, plus a warm bloom
     wherever the portal currently sits on screen. */
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uBand: { value: token("--color-band", "#05080f") },
        uPaper: { value: token("--color-paper", "#0a0f19") },
        uPaper2: { value: token("--color-paper-2", "#0f1520") },
        uLit: { value: lit },
        uSun,
        uAspect
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uBand, uPaper, uPaper2, uLit;
        uniform vec2 uSun;
        uniform float uAspect;
        varying vec2 vUv;
        void main() {
          float y = 1.0 - vUv.y;
          vec3 c = y < 0.52 ? mix(uBand, uPaper, y / 0.52) : mix(uPaper, uPaper2, (y - 0.52) / 0.48);
          vec2 d = (vUv - uSun) * vec2(uAspect, 1.0);
          c += uLit * 0.09 * exp(-dot(d, d) * 4.0);
          gl_FragColor = vec4(c, 1.0);
        }`
    })
  );
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  scene.add(sky);

  /* Ground: a grid of points that rolls toward the camera and wraps at
     the far edge, where the distance fade hides the seam. */
  const COLS = 180;
  const ROWS = 140;
  const grid = new Float32Array(COLS * ROWS * 3);
  for (let r = 0, i = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++, i += 3) {
      grid[i] = (c / (COLS - 1) - 0.5) * 90;
      grid[i + 2] = (r / ROWS) * 70;
    }
  }
  const groundGeo = new THREE.BufferGeometry();
  groundGeo.setAttribute("position", new THREE.BufferAttribute(grid, 3));
  const ground = new THREE.Points(
    groundGeo,
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uScale, uPortal, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: /* glsl */ `
        uniform float uTime, uScale;
        uniform vec3 uPortal;
        varying float vA, vWarm;
        void main() {
          vec3 p = position;
          p.z = mod(p.z + uTime * 1.6, 70.0) - 60.0;
          p.y = sin(p.x * 0.22 + uTime * 0.5 + p.z * 0.12) * 0.45
              + cos(p.z * 0.27 - uTime * 0.35 + p.x * 0.09) * 0.35
              + pow(abs(p.x) / 45.0, 2.0) * 10.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float dist = -mv.z;
          gl_PointSize = clamp(0.07 * uScale / dist, 1.0, 6.0);
          vA = smoothstep(64.0, 22.0, dist) * smoothstep(0.5, 4.0, dist);
          vWarm = exp(-distance(p.xz, uPortal.xz) * 0.08);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uLit;
        varying float vA, vWarm;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          vec3 c = mix(uInk, uLit, clamp(vWarm * 1.5, 0.0, 1.0));
          gl_FragColor = vec4(c, vA * (0.45 + vWarm) * smoothstep(0.5, 0.1, d));
        }`
    })
  );
  ground.frustumCulled = false;
  scene.add(ground);

  /* The portal: rim, halo and a slow swirl inside, all in one quad. The
     horizon swallows the bottom of it. */
  const clipVertex = /* glsl */ `
    varying vec2 vP;
    varying float vY;
    void main() {
      vP = position.xy / ${R.toFixed(2)};
      vec4 world = modelMatrix * vec4(position, 1.0);
      vY = world.y;
      gl_Position = projectionMatrix * viewMatrix * world;
    }`;
  const portal = new THREE.Mesh(
    new THREE.PlaneGeometry(R * 4, R * 4),
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: clipVertex,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uInk, uLit;
        varying vec2 vP;
        varying float vY;
        void main() {
          float r = length(vP);
          float a = atan(vP.y, vP.x);
          float rim = exp(-abs(r - 1.0) * 70.0) * 1.5 + exp(-abs(r - 1.0) * 8.0) * 0.4;
          float inside = 1.0 - smoothstep(0.95, 1.0, r);
          float swirl = sin(a * 5.0 + r * 9.0 - uTime * 0.9) * sin(a * 3.0 - r * 14.0 + uTime * 0.6);
          float ripple = pow(0.5 + 0.5 * sin(r * 22.0 + uTime * 1.4), 10.0) * r;
          float halo = step(1.0, r) * exp(-(r - 1.0) * 2.5) * 0.14;
          float light = rim + halo + inside * (0.05 + 0.12 * swirl * swirl * r + 0.12 * ripple);
          vec3 c = mix(mix(uLit, uInk, 0.25 * inside), vec3(1.0), smoothstep(0.9, 1.5, rim));
          float horizon = smoothstep(0.0, 0.8, vY);
          gl_FragColor = vec4(c, light * horizon * (1.0 - smoothstep(1.5, 2.0, r)));
        }`
    })
  );
  portal.position.copy(uPortal.value);
  scene.add(portal);

  /* Two thin rings turning around the portal on other axes: the part
     that makes it read as an object rather than a picture of one. */
  const ringMat = new THREE.ShaderMaterial({
    ...glow,
    uniforms: { uLit: { value: lit } },
    vertexShader: clipVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uLit;
      varying float vY;
      void main() { gl_FragColor = vec4(uLit, 0.55 * smoothstep(0.0, 0.8, vY)); }`
  });
  const rings = [1.06, 1.12].map((k) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R * k, 0.05, 8, 320), ringMat);
    portal.add(ring);
    return ring;
  });

  /* Sparks: they leave the portal, spiral outward and fade before they
     reach you. Positions are computed on the GPU from a seed. */
  const SPARKS = 900;
  const seeds = new Float32Array(SPARKS * 3);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
  sparkGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
  const sparks = new THREE.Points(
    sparkGeo,
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uScale, uPortal, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: /* glsl */ `
        uniform float uTime, uScale;
        uniform vec3 uPortal;
        attribute vec3 aSeed;
        varying float vA, vMix;
        void main() {
          float s = fract(aSeed.z + uTime * (0.02 + aSeed.y * 0.02));
          float ang = aSeed.x * 6.2832 + s * 2.4;
          float rad = ${R.toFixed(2)} * sqrt(aSeed.y) * (0.8 + s * 0.5);
          vec3 p = uPortal + vec3(cos(ang) * rad, sin(ang) * rad, s * (${CAM_Z.toFixed(1)} - uPortal.z - 10.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(0.12 * uScale / -mv.z, 1.0, 5.0);
          vA = smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.55, 1.0, s)) * smoothstep(0.0, 0.8, p.y);
          vMix = aSeed.x;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uLit;
        varying float vA, vMix;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(mix(uLit, uInk, vMix * 0.6), vA * 0.9 * smoothstep(0.5, 0.0, d));
        }`
    })
  );
  sparks.frustumCulled = false;
  scene.add(sparks);

  // Pointer target and eased camera, in -1..1; scroll in 0..1 of the hero.
  const aim = { x: 0, y: 0 };
  const cam = { x: 0, y: 0, s: 0 };
  const look = new THREE.Vector3();
  const onScreen = new THREE.Vector3();
  let raf = 0;
  let visible = true;

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    uScale.value = renderer.getPixelRatio() * h * 0.5;
    uAspect.value = camera.aspect;
    // Two columns: the portal stands behind the run panel. Stacked: centred.
    const halfW = Math.tan((camera.fov * Math.PI) / 360) * (CAM_Z - PORTAL_Z) * camera.aspect;
    uPortal.value.x = w > 1000 ? halfW * 0.55 : 0;
    portal.position.copy(uPortal.value);
  };

  const draw = (t: number) => {
    uTime.value = t * 0.001;
    cam.x += (aim.x - cam.x) * 0.05;
    cam.y += (aim.y - cam.y) * 0.05;
    const scroll = reduced ? 0 : Math.min(1, window.scrollY / Math.max(1, canvas.clientHeight));
    cam.s += (scroll - cam.s) * 0.08;

    camera.position.set(cam.x * 1.8, 2.2 - cam.y * 0.7 + cam.s * 1.2, CAM_Z - cam.s * 16);
    look.set(uPortal.value.x * 0.3, 2.6, PORTAL_Z);
    camera.lookAt(look);

    rings[0].rotation.set(t * 0.00021, t * 0.00013, 0);
    rings[1].rotation.set(-t * 0.00011, t * 0.00017, t * 0.00005);

    onScreen.copy(uPortal.value).project(camera);
    uSun.value.set(onScreen.x * 0.5 + 0.5, onScreen.y * 0.5 + 0.5);
    renderer.render(scene, camera);
  };

  const loop = (t: number) => {
    draw(t);
    if (visible) raf = requestAnimationFrame(loop);
  };

  resize();
  if (reduced) draw(0);
  else raf = requestAnimationFrame(loop);

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
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
        o.geometry.dispose();
        (o.material as Material).dispose();
      }
    });
    renderer.dispose();
  };
}
