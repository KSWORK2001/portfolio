"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { USA_OUTLINE, pointInUSA } from "./usa-outline";
import styles from "./AtlantaGlobe.module.css";

const ATL_LAT = 33.749;
const ATL_LON = -84.388;

const OTHER_PINS: { name: string; lat: number; lon: number }[] = [
  { name: "Atlanta · home", lat: ATL_LAT, lon: ATL_LON },
  { name: "Bay Area · AWS", lat: 37.371, lon: -121.997 },
  { name: "Dallas · AT&T", lat: 32.776, lon: -96.797 }
];

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function AtlantaGlobe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !wrap || !sticky) return;

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
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Wireframe globe — icosahedron at high subdivision = clean lat/lon look
    const globeRadius = 2.4;
    const globeGeo = new THREE.IcosahedronGeometry(globeRadius, 6);
    const wireGeo = new THREE.EdgesGeometry(globeGeo, 12);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x79c0ff,
      transparent: true,
      opacity: 0.32
    });
    const wireGlobe = new THREE.LineSegments(wireGeo, wireMat);
    scene.add(wireGlobe);

    // Inner translucent sphere for depth
    const innerGeo = new THREE.SphereGeometry(globeRadius * 0.985, 48, 48);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0b0f14,
      transparent: true,
      opacity: 0.78,
      depthWrite: true
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerSphere);

    // USA outline as a line on the globe surface
    const usaSurfaceR = globeRadius * 1.005;
    const usaPts: THREE.Vector3[] = USA_OUTLINE.map(([lat, lon]) =>
      latLonToVec3(lat, lon, usaSurfaceR)
    );
    // Subdivide each segment so the line follows the sphere's curvature
    const usaSmooth: THREE.Vector3[] = [];
    const SUBDIV = 6;
    for (let i = 0; i < usaPts.length; i++) {
      const a = usaPts[i];
      const b = usaPts[(i + 1) % usaPts.length];
      for (let s = 0; s < SUBDIV; s++) {
        const t = s / SUBDIV;
        const v = a.clone().lerp(b, t);
        v.normalize().multiplyScalar(usaSurfaceR);
        usaSmooth.push(v);
      }
    }
    usaSmooth.push(usaSmooth[0].clone());
    const usaLineGeo = new THREE.BufferGeometry().setFromPoints(usaSmooth);
    const usaLineMat = new THREE.LineBasicMaterial({
      color: 0xff9ffc,
      transparent: true,
      opacity: 0.95
    });
    const usaLine = new THREE.Line(usaLineGeo, usaLineMat);
    scene.add(usaLine);

    // Sampled landmass dots inside USA polygon
    const usaDotPositions: number[] = [];
    const SAMPLE_TARGET = 700;
    let attempts = 0;
    const usaDotR = globeRadius * 1.003;
    while (usaDotPositions.length / 3 < SAMPLE_TARGET && attempts < SAMPLE_TARGET * 12) {
      attempts += 1;
      const lat = 24 + Math.random() * 26; // 24..50
      const lon = -125 + Math.random() * 58; // -125..-67
      if (pointInUSA(lat, lon)) {
        const v = latLonToVec3(lat, lon, usaDotR);
        usaDotPositions.push(v.x, v.y, v.z);
      }
    }
    const usaDotGeo = new THREE.BufferGeometry();
    usaDotGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(usaDotPositions), 3)
    );
    const usaDotMat = new THREE.PointsMaterial({
      color: 0x79c0ff,
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85
    });
    const usaDots = new THREE.Points(usaDotGeo, usaDotMat);
    scene.add(usaDots);

    // Equator + meridian rings for orbit feel
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xb48cff,
      transparent: true,
      opacity: 0.55
    });
    const equatorPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      equatorPts.push(new THREE.Vector3(Math.cos(a) * globeRadius * 1.01, 0, Math.sin(a) * globeRadius * 1.01));
    }
    const equatorGeo = new THREE.BufferGeometry().setFromPoints(equatorPts);
    const equator = new THREE.LineLoop(equatorGeo, ringMat);
    scene.add(equator);

    const meridianPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      meridianPts.push(new THREE.Vector3(0, Math.cos(a) * globeRadius * 1.01, Math.sin(a) * globeRadius * 1.01));
    }
    const meridianGeo = new THREE.BufferGeometry().setFromPoints(meridianPts);
    const meridian = new THREE.LineLoop(meridianGeo, ringMat.clone());
    (meridian.material as THREE.LineBasicMaterial).opacity = 0.32;
    scene.add(meridian);

    // Pins
    const pinGroup = new THREE.Group();
    scene.add(pinGroup);

    const pinPositions: { vec: THREE.Vector3; primary: boolean }[] = OTHER_PINS.map((p, idx) => ({
      vec: latLonToVec3(p.lat, p.lon, globeRadius * 1.015),
      primary: idx === 0
    }));

    pinPositions.forEach(({ vec, primary }) => {
      const color = primary ? 0xff9ffc : 0x79c0ff;
      const size = primary ? 0.08 : 0.045;

      const dotGeo = new THREE.SphereGeometry(size, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(vec);
      pinGroup.add(dot);

      // Glow ring at pin
      const ringG = new THREE.RingGeometry(size * 1.6, size * 2.1, 32);
      const ringM = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringG, ringM);
      ring.position.copy(vec);
      ring.lookAt(0, 0, 0);
      pinGroup.add(ring);

      // Beam outward
      if (primary) {
        const beamPts = [vec.clone(), vec.clone().multiplyScalar(1.45)];
        const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPts);
        const beamMat = new THREE.LineBasicMaterial({
          color: 0xff9ffc,
          transparent: true,
          opacity: 0.85
        });
        const beam = new THREE.Line(beamGeo, beamMat);
        pinGroup.add(beam);

        // Floating sprite glow at end of beam
        const glowTex = makeGlowTex();
        const sprMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xff9ffc,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const spr = new THREE.Sprite(sprMat);
        spr.scale.setScalar(0.65);
        spr.position.copy(vec.clone().multiplyScalar(1.45));
        pinGroup.add(spr);
      }
    });

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const STAR_N = 600;
    const starPos = new Float32Array(STAR_N * 3);
    for (let i = 0; i < STAR_N; i++) {
      const r = 22 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xdfe9f7,
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const rect = sticky.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let scrollP = 0;
    let rafS = 0;
    const updateProgress = () => {
      const rect = wrap.getBoundingClientRect();
      const wrapH = wrap.offsetHeight;
      const viewH = window.innerHeight;
      const start = rect.top;
      const total = wrapH - viewH;
      const scrolled = -start;
      scrollP = Math.max(0, Math.min(1, scrolled / total));
      setProgress((cur) => (Math.abs(cur - scrollP) < 0.01 ? cur : scrollP));
      rafS = 0;
    };
    const onScroll = () => {
      if (rafS) return;
      rafS = requestAnimationFrame(updateProgress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();

    // Compute the rotation needed to face Atlanta forward when zoomed in
    const atlVec = latLonToVec3(ATL_LAT, ATL_LON, globeRadius);
    const targetRotY = Math.atan2(atlVec.x, atlVec.z); // bring to +Z front
    const targetRotX = -Math.asin(atlVec.y / globeRadius);

    let raf = 0;
    let curRotX = 0;
    let curRotY = 0;
    const animate = () => {
      const eased = easeInOut(scrollP);

      // Auto-rotation when far out, lock onto Atlanta when zoomed in
      const lockedRotY = targetRotY + (1 - eased) * (performance.now() * 0.00006);
      const lockedRotX = targetRotX * eased;

      // Mouse parallax adds onto whatever rotation we want
      const desiredX = lockedRotX + mouse.y * 0.18 * (1 - eased * 0.6);
      const desiredY = lockedRotY + mouse.x * 0.28 * (1 - eased * 0.6);
      curRotX += (desiredX - curRotX) * 0.06;
      curRotY += (desiredY - curRotY) * 0.06;

      wireGlobe.rotation.set(curRotX, curRotY, 0);
      innerSphere.rotation.set(curRotX, curRotY, 0);
      equator.rotation.set(curRotX, curRotY, 0);
      meridian.rotation.set(curRotX, curRotY, 0);
      pinGroup.rotation.set(curRotX, curRotY, 0);
      usaLine.rotation.set(curRotX, curRotY, 0);
      usaDots.rotation.set(curRotX, curRotY, 0);

      // Camera dolly: far -> close-up
      const zStart = 8.4;
      const zEnd = 4.2;
      camera.position.z = zStart + (zEnd - zStart) * eased;
      camera.position.y = -0.4 * eased;

      // Stars drift
      stars.rotation.y += 0.0005;

      // Pulse the primary pin ring opacity for a beat
      const pulse = 0.55 + Math.sin(performance.now() * 0.004) * 0.25;
      pinGroup.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && mesh.geometry instanceof THREE.RingGeometry) {
          (mesh.material as THREE.MeshBasicMaterial).opacity = pulse;
        }
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (rafS) cancelAnimationFrame(rafS);
      if (raf) cancelAnimationFrame(raf);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (mat) {
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      wireGeo.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <section ref={wrapRef} className={styles.wrap} aria-label="Home base — Atlanta">
      <div ref={stickyRef} className={styles.sticky}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        <div className={styles.overlayTop}>
          <p className={styles.kicker}>Home Base</p>
          <h2 className={styles.heading}>
            Shipping from <span className={styles.atl}>Atlanta</span>.
          </h2>
        </div>

        <div className={styles.overlayBottom}>
          <p className={styles.tag}>
            33.749° N · −84.388° W
          </p>
          <p className={styles.sub}>
            Working hours run on Eastern. Code runs on caffeine. Both ship daily.
          </p>
          <div className={styles.legend}>
            {OTHER_PINS.map((p, i) => (
              <span
                key={p.name}
                className={`${styles.legendItem} ${i === 0 ? styles.legendPrimary : ""}`}
              >
                <span className={styles.legendDot} aria-hidden="true" />
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.scrollHint} style={{ opacity: 1 - Math.min(1, progress * 3) }}>
          ↓ Scroll to zoom in
        </div>
      </div>
    </section>
  );
}

function makeGlowTex() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
