/**
 * The 3D world behind the whole home page, loaded lazily by NightField.
 *
 * Scrolling flies one camera along one path: a valley of points facing a
 * lit portal (hero), through the portal (as Work begins), down a tunnel
 * of gate rings (Work and the loop), and out into open space around a
 * planet of points (projects to contact). Bloom, film grain, a vignette
 * and chromatic aberration sit on top; fast scrolling widens the lens.
 *
 * Every shader writes sRGB values straight to the screen (no output
 * conversion), so the page tokens render as the same colours as the CSS.
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const CAM_Z = 8;
const R = 15;
const PORTAL = new THREE.Vector3(0, R * 0.3, -40);
const PLANET = new THREE.Vector3(0, 6, -300);
const PLANET_R = 22;
const TUNNEL_R = 3.4;
const TUNNEL = [
  new THREE.Vector3(0, 4.5, -48),
  new THREE.Vector3(0, 4.5, -70),
  new THREE.Vector3(5, 6, -120),
  new THREE.Vector3(-3, 3, -170),
  new THREE.Vector3(0, 4.5, -212)
];
/** Scene brightness at each camera stop, dimmer where the page is mostly words. */
const EXPOSURE = [1, 1, 1.15, 0.72, 0.7, 0.75, 1, 0.7, 0.62, 0.8];

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Page tokens are oklch, which three cannot parse, so let a 2D canvas resolve them to sRGB. */
function tokenReader() {
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

/** Points get bigger and warmer under the cursor. Shared by every point shader. */
const CURSOR = /* glsl */ `
  uniform vec2 uMouse;
  uniform float uAspect;
  float cursorGlow(vec4 clip) {
    vec2 d = (clip.xy / clip.w - uMouse) * vec2(uAspect, 1.0);
    return exp(-dot(d, d) * 14.0);
  }`;

const DOT = /* glsl */ `
  float dotMask() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    return smoothstep(0.5, 0.05, d);
  }`;

export function mount(canvas: HTMLCanvasElement) {
  const token = tokenReader();
  const ink = token("--color-ink", "#efebe3");
  const lit = token("--color-accent", "#f0c48c");
  const pass = token("--pass", "#3ccf6e");
  const fail = token("--fail", "#f0607a");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1500);

  const uTime = { value: 0 };
  const uScale = { value: 400 };
  const uMouse = { value: new THREE.Vector2(9, 9) };
  const uAspect = { value: 1 };
  const uSpace = { value: 0 };
  const uSunDir = { value: new THREE.Vector3(0, 0, -1) };
  const uSun = { value: 1 };
  const cursor = { uMouse, uAspect };
  // Everything but the sky is light added to the dark, so draw order never matters.
  const glow = { transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending };
  const points = (geo: THREE.BufferGeometry, mat: THREE.ShaderMaterial) => {
    const p = new THREE.Points(geo, mat);
    p.frustumCulled = false;
    scene.add(p);
    return p;
  };
  const geometry = (attrs: Record<string, [Float32Array, number]>) => {
    const geo = new THREE.BufferGeometry();
    for (const [name, [data, size]] of Object.entries(attrs)) {
      geo.setAttribute(name, new THREE.BufferAttribute(data, size));
    }
    return geo;
  };

  /* ── Sky: a dome that follows the camera. Night gradient on the
     valley side, a warm sun toward the portal, deep space later. ── */
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uBand: { value: token("--color-band", "#05080f") },
        uPaper: { value: token("--color-paper", "#0a0f19") },
        uPaper2: { value: token("--color-paper-2", "#0f1520") },
        uLit: { value: lit },
        uSunDir,
        uSun,
        uSpace
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uBand, uPaper, uPaper2, uLit, uSunDir;
        uniform float uSun, uSpace;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          vec3 c = d.y > 0.0 ? mix(uPaper, uBand, smoothstep(0.0, 0.4, d.y))
                             : mix(uPaper, uPaper2, smoothstep(0.0, -0.3, d.y));
          c = mix(c, uBand * 0.6, uSpace);
          float sun = max(dot(d, uSunDir), 0.0);
          c += uLit * (pow(sun, 30.0) * 0.14 + pow(sun, 5.0) * 0.035) * uSun;
          c += uLit * pow(sun, 3.0) * 0.03 * uSpace;
          gl_FragColor = vec4(c, 1.0);
        }`
    })
  );
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  scene.add(sky);

  /* ── Stars: on a sphere that rides with the camera, so they never get
     closer. Above the horizon only, until you are out in space. ── */
  const STARS = 2600;
  const starPos = new Float32Array(STARS * 3);
  const starSeed = new Float32Array(STARS);
  for (let i = 0; i < STARS; i++) {
    const v = new THREE.Vector3().randomDirection();
    starPos.set([v.x * 700, v.y * 700, v.z * 700], i * 3);
    starSeed[i] = Math.random();
  }
  const stars = points(
    geometry({ position: [starPos, 3], aSeed: [starSeed, 1] }),
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uSpace, uInk: { value: ink } },
      vertexShader: /* glsl */ `
        uniform float uTime, uSpace;
        attribute float aSeed;
        varying float vA;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 1.0 + aSeed * aSeed * 2.2;
          float above = mix(smoothstep(0.02, 0.15, normalize(position).y), 1.0, uSpace);
          float twinkle = 0.6 + 0.4 * sin(uTime * (0.5 + aSeed * 2.0) + aSeed * 40.0);
          vA = above * twinkle * mix(0.35, 0.9, uSpace) * (0.3 + aSeed * 0.7);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk;
        varying float vA;
        ${DOT}
        void main() { gl_FragColor = vec4(uInk, vA * dotMask()); }`
    })
  );

  /* ── Ground: a valley of points that rolls toward the camera and wraps
     at the far edge, where the distance fade hides the seam. ── */
  const COLS = 180;
  const ROWS = 140;
  const grid = new Float32Array(COLS * ROWS * 3);
  for (let r = 0, i = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++, i += 3) {
      grid[i] = (c / (COLS - 1) - 0.5) * 90;
      grid[i + 2] = (r / ROWS) * 70;
    }
  }
  points(
    geometry({ position: [grid, 3] }),
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uScale, ...cursor, uPortal: { value: PORTAL }, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: /* glsl */ `
        uniform float uTime, uScale;
        uniform vec3 uPortal;
        varying float vA, vWarm;
        ${CURSOR}
        void main() {
          vec3 p = position;
          p.z = mod(p.z + uTime * 1.6, 70.0) - 60.0;
          p.y = sin(p.x * 0.22 + uTime * 0.5 + p.z * 0.12) * 0.45
              + cos(p.z * 0.27 - uTime * 0.35 + p.x * 0.09) * 0.35
              + pow(abs(p.x) / 45.0, 2.0) * 10.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float g = cursorGlow(gl_Position);
          float dist = -mv.z;
          gl_PointSize = clamp(0.07 * uScale / dist, 1.0, 6.0) * (1.0 + g * 1.6);
          vA = smoothstep(64.0, 22.0, dist) * smoothstep(0.5, 4.0, dist);
          vWarm = exp(-distance(p.xz, uPortal.xz) * 0.08) + g;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uLit;
        varying float vA, vWarm;
        ${DOT}
        void main() {
          vec3 c = mix(uInk, uLit, clamp(vWarm * 1.5, 0.0, 1.0));
          gl_FragColor = vec4(c, vA * (0.45 + vWarm) * dotMask());
        }`
    })
  );

  /* ── The portal: rim, halo and a slow swirl inside, in one quad, with
     two thin rings turning around it. The horizon swallows its foot. ── */
  const clipVertex = (radius: number) => /* glsl */ `
    varying vec2 vP;
    varying float vY;
    void main() {
      vP = position.xy / ${radius.toFixed(2)};
      vec4 world = modelMatrix * vec4(position, 1.0);
      vY = world.y;
      gl_Position = projectionMatrix * viewMatrix * world;
    }`;
  const portal = new THREE.Mesh(
    new THREE.PlaneGeometry(R * 4, R * 4),
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: clipVertex(R),
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
          float light = rim + halo + inside * (0.04 + 0.1 * swirl * swirl * r + 0.1 * ripple);
          vec3 c = mix(mix(uLit, uInk, 0.25 * inside), vec3(1.0), smoothstep(0.9, 1.5, rim));
          float horizon = smoothstep(0.0, 0.8, vY);
          gl_FragColor = vec4(c, light * horizon * (1.0 - smoothstep(1.5, 2.0, r)));
        }`
    })
  );
  portal.position.copy(PORTAL);
  scene.add(portal);

  const ringMat = new THREE.ShaderMaterial({
    ...glow,
    uniforms: { uLit: { value: lit } },
    vertexShader: clipVertex(R),
    fragmentShader: /* glsl */ `
      uniform vec3 uLit;
      varying float vY;
      void main() { gl_FragColor = vec4(uLit, 0.55 * smoothstep(0.0, 0.8, vY)); }`
  });
  /* The world behind the portal only shows through it: this disc marks
     the stencil, and the tunnel draws where it is marked until you cross. */
  const portalMask = new THREE.Mesh(
    new THREE.CircleGeometry(R * 0.97, 96),
    new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthTest: false,
      depthWrite: false,
      stencilWrite: true,
      stencilRef: 1,
      stencilZPass: THREE.ReplaceStencilOp
    })
  );
  portalMask.position.copy(PORTAL);
  scene.add(portalMask);
  const throughPortal = { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc };

  const gyro = [1.06, 1.12].map((k) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R * k, 0.05, 8, 320), ringMat);
    portal.add(ring);
    return ring;
  });

  /* ── Sparks: they leave the portal, spiral outward and fade before
     they reach the hero camera. Positions come from a seed on the GPU. ── */
  const SPARKS = 900;
  const sparkSeed = new Float32Array(SPARKS * 3).map(Math.random);
  points(
    geometry({ position: [new Float32Array(SPARKS * 3), 3], aSeed: [sparkSeed, 3] }),
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uScale, ...cursor, uPortal: { value: PORTAL }, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: /* glsl */ `
        uniform float uTime, uScale;
        uniform vec3 uPortal;
        attribute vec3 aSeed;
        varying float vA, vMix;
        ${CURSOR}
        void main() {
          float s = fract(aSeed.z + uTime * (0.02 + aSeed.y * 0.02));
          float ang = aSeed.x * 6.2832 + s * 2.4;
          float rad = ${R.toFixed(2)} * sqrt(aSeed.y) * (0.8 + s * 0.5);
          vec3 p = uPortal + vec3(cos(ang) * rad, sin(ang) * rad, s * (${CAM_Z.toFixed(1)} - uPortal.z - 10.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float g = cursorGlow(gl_Position);
          gl_PointSize = clamp(0.12 * uScale / -mv.z, 1.0, 5.0) * (1.0 + g * 2.0);
          vA = smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.55, 1.0, s)) * smoothstep(0.0, 0.8, p.y) * step(0.0, -mv.z);
          vMix = aSeed.x * (1.0 - g);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uLit;
        varying float vA, vMix;
        ${DOT}
        void main() { gl_FragColor = vec4(mix(uLit, uInk, vMix * 0.6), vA * 0.9 * dotMask()); }`
    })
  );

  /* ── The tunnel behind the portal: a row of gate rings along a curve,
     with pulses running down it and dust drifting through. Most rings
     are amber; a few pass and a few fail, as in the runs on the page. ── */
  const tunnelCurve = new THREE.CatmullRomCurve3(TUNNEL, false, "centripetal");
  const RINGS = 60;
  const ringTint = new Float32Array(RINGS * 3);
  const ringIdx = new Float32Array(RINGS);
  const ringGeo = new THREE.TorusGeometry(TUNNEL_R, 0.035, 6, 120);
  const tunnel = new THREE.InstancedMesh(
    ringGeo,
    new THREE.ShaderMaterial({
      ...glow,
      ...throughPortal,
      uniforms: { uTime },
      vertexShader: /* glsl */ `
        uniform float uTime;
        attribute vec3 aTint;
        attribute float aIdx;
        varying vec3 vTint;
        varying float vPulse;
        void main() {
          vTint = aTint;
          vPulse = pow(fract(aIdx * 3.0 - uTime * 0.3), 14.0);
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vTint;
        varying float vPulse;
        void main() { gl_FragColor = vec4(mix(vTint, vec3(1.0), vPulse * 0.5), 0.3 + vPulse); }`
    }),
    RINGS
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const forward = new THREE.Vector3(0, 0, 1);
  const one = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < RINGS; i++) {
    const u = i / (RINGS - 1);
    q.setFromUnitVectors(forward, tunnelCurve.getTangentAt(u));
    tunnel.setMatrixAt(i, m4.compose(tunnelCurve.getPointAt(u), q, one));
    const tint = i % 11 === 5 ? pass : i % 17 === 12 ? fail : lit;
    ringTint.set([tint.x, tint.y, tint.z], i * 3);
    ringIdx[i] = u;
  }
  ringGeo.setAttribute("aTint", new THREE.InstancedBufferAttribute(ringTint, 3));
  ringGeo.setAttribute("aIdx", new THREE.InstancedBufferAttribute(ringIdx, 1));
  tunnel.frustumCulled = false;
  scene.add(tunnel);

  const DUST = 2600;
  const dustPos = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST).map(Math.random);
  for (let i = 0; i < DUST; i++) {
    const p = tunnelCurve.getPointAt(Math.random());
    const a = Math.random() * Math.PI * 2;
    const r = 0.8 + Math.random() * (TUNNEL_R - 0.6);
    dustPos.set([p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, p.z], i * 3);
  }
  const dust = points(
    geometry({ position: [dustPos, 3], aSeed: [dustSeed, 1] }),
    new THREE.ShaderMaterial({
      ...glow,
      ...throughPortal,
      uniforms: { uTime, uScale, ...cursor, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: /* glsl */ `
        uniform float uTime, uScale;
        attribute float aSeed;
        varying float vA, vG;
        ${CURSOR}
        void main() {
          float s = fract(aSeed + uTime * 0.03);
          vec3 p = position + vec3(0.0, 0.0, (s - 0.5) * 16.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vG = cursorGlow(gl_Position);
          float dist = -mv.z;
          gl_PointSize = clamp(0.1 * uScale / dist, 1.0, 7.0) * (1.0 + vG * 2.0);
          vA = sin(s * 3.1416) * smoothstep(0.3, 2.0, dist) * smoothstep(90.0, 30.0, dist);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uLit;
        varying float vA, vG;
        ${DOT}
        void main() { gl_FragColor = vec4(mix(uInk, uLit, 0.35 + vG), vA * 0.7 * dotMask()); }`
    })
  );

  /* ── The planet: a Fibonacci sphere of points with lit "land", a
     tilted ring of debris, and an atmosphere that always faces you. ── */
  const PN = 9000;
  const sphere = new Float32Array(PN * 3);
  for (let i = 0; i < PN; i++) {
    const y = 1 - (i / (PN - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    sphere.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3);
  }
  points(
    geometry({ position: [sphere, 3] }),
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uScale, uSpace, ...cursor, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: /* glsl */ `
        uniform float uTime, uScale, uSpace;
        varying float vA, vLand;
        ${CURSOR}
        void main() {
          float a = uTime * 0.04;
          vec3 n = vec3(cos(a) * position.x - sin(a) * position.z, position.y, sin(a) * position.x + cos(a) * position.z);
          float land = sin(position.x * 3.1 + sin(position.y * 2.3) * 2.0) * sin(position.y * 2.7 + position.z * 1.9)
                     * sin(position.z * 3.7 + position.x * 1.3);
          vLand = smoothstep(0.04, 0.22, land);
          vec3 p = vec3(${PLANET.x.toFixed(1)}, ${PLANET.y.toFixed(1)}, ${PLANET.z.toFixed(1)}) + n * ${PLANET_R.toFixed(1)};
          vec4 mv = viewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float g = cursorGlow(gl_Position);
          float facing = dot(n, normalize(cameraPosition - p));
          gl_PointSize = clamp((0.09 + vLand * 0.08) * uScale / -mv.z, 1.0, 6.0) * (1.0 + g);
          vA = smoothstep(-0.15, 0.25, facing) * (0.35 + 0.65 * (1.0 - facing)) * (0.5 + vLand) * step(0.0, -mv.z) * uSpace;
          vLand = clamp(vLand + g, 0.0, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uLit;
        varying float vA, vLand;
        ${DOT}
        void main() { gl_FragColor = vec4(mix(uInk * 0.7, uLit, vLand), vA * dotMask()); }`
    })
  );

  const DEBRIS = 5200;
  const debris = new Float32Array(DEBRIS * 3).map(Math.random);
  const debrisRing = points(
    geometry({ position: [debris, 3] }),
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uTime, uScale, uSpace, ...cursor, uInk: { value: ink }, uLit: { value: lit } },
      vertexShader: /* glsl */ `
        uniform float uTime, uScale, uSpace;
        varying float vA, vWarm;
        ${CURSOR}
        void main() {
          float r = ${(PLANET_R * 1.4).toFixed(1)} + position.y * position.y * ${(PLANET_R * 0.6).toFixed(1)};
          float a = position.x * 6.2832 + uTime * 0.6 / r;
          vec3 local = vec3(cos(a) * r, (position.z - 0.5) * 0.6, sin(a) * r);
          vec4 mv = modelViewMatrix * vec4(local, 1.0);
          gl_Position = projectionMatrix * mv;
          float g = cursorGlow(gl_Position);
          gl_PointSize = clamp(0.1 * uScale / -mv.z, 1.0, 5.0) * (1.0 + g * 1.5);
          vA = (0.25 + position.z * 0.5) * step(0.0, -mv.z) * smoothstep(0.5, 6.0, -mv.z) * uSpace;
          vWarm = step(0.8, position.z) + g;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uLit;
        varying float vA, vWarm;
        ${DOT}
        void main() { gl_FragColor = vec4(mix(uInk, uLit, clamp(vWarm, 0.0, 1.0)), vA * dotMask()); }`
    })
  );
  debrisRing.position.copy(PLANET);
  debrisRing.rotation.set(0.38, 0, -0.22);

  const atmosphere = new THREE.Mesh(
    new THREE.PlaneGeometry(PLANET_R * 3.2, PLANET_R * 3.2),
    new THREE.ShaderMaterial({
      ...glow,
      uniforms: { uLit: { value: lit }, uSpace },
      vertexShader: /* glsl */ `
        varying vec2 vP;
        void main() { vP = position.xy / ${PLANET_R.toFixed(1)}; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uLit;
        uniform float uSpace;
        varying vec2 vP;
        void main() {
          float r = length(vP);
          float light = exp(-abs(r - 1.0) * 9.0) * 0.45 + step(1.0, r) * exp(-(r - 1.0) * 3.0) * 0.12;
          gl_FragColor = vec4(uLit, light * uSpace * (1.0 - smoothstep(1.4, 1.6, r)));
        }`
    })
  );
  atmosphere.position.copy(PLANET);
  scene.add(atmosphere);

  /* ── Post: bloom, then one pass for lens and film. ── */
  // 8-bit target: stacked additive light clamps at white instead of blooming
  // into a blob. Stencil for the portal mask.
  const composer = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(1, 1, { type: THREE.UnsignedByteType, stencilBuffer: true })
  );
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.35, 0.45);
  composer.addPass(bloom);
  const finish = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uCA: { value: 0.002 },
      uFlash: { value: 0 },
      uExposure: { value: 1 },
      uLit: { value: lit }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uTime, uCA, uFlash, uExposure;
      uniform vec3 uLit;
      varying vec2 vUv;
      void main() {
        vec2 c = vUv - 0.5;
        float r2 = dot(c, c);
        vec2 off = c * uCA * (0.4 + r2 * 3.0);
        vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        col = col * uExposure + uLit * uFlash;
        col *= 1.0 - r2 * 0.85;
        float n = fract(sin(dot(vUv * 731.0 + fract(uTime) * 91.0, vec2(12.9898, 78.233))) * 43758.5453);
        col += (n - 0.5) * 0.03;
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  composer.addPass(finish);
  const fx = finish.uniforms;

  /* ── The flight. The path's first two stops depend on the layout, so
     it is rebuilt on resize; scroll positions of the sections pick
     which stop the camera is at. ── */
  let shift = 0;
  let path = new THREE.CatmullRomCurve3();
  let anchors: Array<[number, number]> = [[0, 0]];
  const STOPS = EXPOSURE.length - 1;

  const buildPath = () => {
    path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-shift, 2.2, CAM_Z),
        new THREE.Vector3(-shift * 0.4, 3.6, -16),
        PORTAL.clone(),
        TUNNEL[1],
        TUNNEL[2],
        TUNNEL[3],
        TUNNEL[4],
        new THREE.Vector3(24, 12, -250),
        new THREE.Vector3(44, 8, -300),
        new THREE.Vector3(-36, 20, -258)
      ],
      false,
      "centripetal"
    );
  };

  const measure = () => {
    const vh = window.innerHeight;
    const top = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : NaN;
    };
    const work = top("#work");
    const raw: Array<[number, number]> = [
      [0, 0],
      [work - vh * 0.3, 2],
      [work + vh * 0.7, 3],
      [top("#loop"), 5],
      [top("#projects"), 6],
      [top("#contact") - vh, 8],
      [document.documentElement.scrollHeight - vh, STOPS]
    ];
    // Keep only anchors that exist and move forward, so the mapping is monotonic.
    anchors = [];
    for (const a of raw) {
      if (Number.isFinite(a[0]) && (!anchors.length || a[0] > anchors[anchors.length - 1][0])) anchors.push(a);
    }
  };

  const stopAt = (y: number) => {
    for (let i = 1; i < anchors.length; i++) {
      const [y0, s0] = anchors[i - 1];
      const [y1, s1] = anchors[i];
      if (y <= y1) return s0 + (s1 - s0) * Math.max(0, (y - y0) / (y1 - y0));
    }
    return anchors[anchors.length - 1][1];
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    uScale.value = pr * h * 0.5;
    uAspect.value = camera.aspect;
    // Two columns: the hero camera stands left of the portal, so it frames the run panel.
    const halfW = Math.tan((50 * Math.PI) / 360) * (CAM_Z - PORTAL.z) * camera.aspect;
    shift = w > 1000 ? halfW * 0.78 : 0;
    buildPath();
    measure();
  };

  // Pointer target and eased camera; `stop` is the eased position along the path.
  const aim = { x: 0, y: 0 };
  const cam = { x: 0, y: 0, stop: 0, warp: 0 };
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const heroLook = new THREE.Vector3();
  const introFrom = new THREE.Vector3();
  const introLook = new THREE.Vector3();
  let start = -1;
  const intro = !reduced && window.scrollY < 40;

  const draw = (t: number) => {
    if (start < 0) start = t;
    const time = reduced ? 14 : t * 0.001;
    uTime.value = time;
    fx.uTime.value = time;

    cam.x += (aim.x - cam.x) * 0.05;
    cam.y += (aim.y - cam.y) * 0.05;
    const target = reduced ? 0 : stopAt(window.scrollY);
    const before = cam.stop;
    cam.stop += (target - cam.stop) * 0.07;
    cam.warp += (Math.min(1, Math.abs(cam.stop - before) * 9) - cam.warp) * 0.1;
    const s = cam.stop;

    // Position on the path, plus a pointer lean that tightens inside the tunnel.
    const u = Math.min(1, s / STOPS);
    path.getPoint(u, pos);
    const inTunnel = smooth(2.2, 2.8, s) * (1 - smooth(5.6, 6.2, s));
    const lean = 1 - inTunnel * 0.7;
    pos.x += cam.x * 1.8 * lean;
    pos.y += -cam.y * 0.8 * lean;

    // Look: straight down the valley in the hero, then ahead on the path, then at the planet.
    heroLook.set(-shift * 0.7, 2.6, PORTAL.z);
    path.getPoint(Math.min(1, u + 0.012), tmp);
    look.copy(heroLook).lerp(tmp, smooth(0.3, 1.5, s));
    look.lerp(PLANET, smooth(6.2, 7.3, s));

    if (intro) {
      const k = Math.min(1, (t - start) / 3200);
      const e = 1 - Math.pow(1 - k, 4);
      introFrom.set(-shift - 14, 30, 74);
      introLook.set(-shift * 0.7, -4, -10);
      pos.lerpVectors(introFrom, pos, e);
      look.lerpVectors(introLook, look, e);
    }

    camera.position.copy(pos);
    camera.lookAt(look);
    const seeAll = pos.z < PORTAL.z ? THREE.AlwaysStencilFunc : THREE.EqualStencilFunc;
    (tunnel.material as THREE.Material).stencilFunc = seeAll;
    (dust.material as THREE.Material).stencilFunc = seeAll;
    camera.rotateZ(Math.sin(s * 1.7) * 0.12 * inTunnel);
    camera.fov = 50 + cam.warp * 22;
    camera.updateProjectionMatrix();

    sky.position.copy(pos);
    stars.position.copy(pos);
    atmosphere.quaternion.copy(camera.quaternion);
    gyro[0].rotation.set(time * 0.21, time * 0.13, 0);
    gyro[1].rotation.set(-time * 0.11, time * 0.17, time * 0.05);

    uSpace.value = smooth(5.6, 6.6, s);
    uSun.value = 1 - smooth(1.8, 2.2, s);
    uSunDir.value.copy(PORTAL).sub(pos).normalize();
    if (uSun.value === 0) uSunDir.value.copy(PLANET).sub(pos).normalize();

    // A flash as you cross the portal and as you leave the tunnel.
    const cross = Math.exp(-Math.abs(pos.z - PORTAL.z) * 0.22) * 0.3 + Math.exp(-Math.abs(pos.z - TUNNEL[4].z) * 0.3) * 0.12;
    const i = Math.min(STOPS - 1, Math.floor(s));
    fx.uExposure.value = EXPOSURE[i] + (EXPOSURE[i + 1] - EXPOSURE[i]) * (s - i);
    fx.uFlash.value = cross * 0.35;
    fx.uCA.value = 0.0015 + cam.warp * 0.012 + cross * 0.02;

    composer.render();
  };

  let raf = 0;
  const loop = (t: number) => {
    draw(t);
    raf = requestAnimationFrame(loop);
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
    uMouse.value.set(aim.x, -aim.y);
  };
  const onLeave = () => uMouse.value.set(9, 9);
  window.addEventListener("resize", onResize);
  // Section heights shift as fonts and images land; re-measure when the page does.
  const ro = new ResizeObserver(measure);
  ro.observe(document.body);
  if (!reduced) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    bloom.dispose();
    composer.dispose();
    renderer.dispose();
  };
}
