/**
 * The 3D world behind the whole home page, loaded lazily by NightField.
 *
 * Scrolling flies one camera along one path: a valley of points facing a
 * lit portal (hero), through the portal to the edge of the solar system,
 * then sunward past every planet: Neptune, Uranus and Saturn (Work),
 * Jupiter (the loop), through the asteroid belt to Mars, Earth and the
 * Moon (projects), Venus and Mercury (stack), and into the light of the
 * Sun (contact). Until you cross the portal, everything beyond it only
 * shows through the ring.
 *
 * Bodies are lit by the Sun's real position in the scene. Earth uses two
 * public-domain NASA maps (public/textures); everything else is drawn in
 * the shaders. Dust rides with the camera and streaks with speed. Bloom,
 * grain, a vignette and chromatic aberration sit on top; fast scrolling
 * widens the lens.
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

/* Bodies, placed along the line from the hero camera through the portal:
   [distance past the portal, to the right, up]. Not to scale; arranged so
   each one passes beside the camera rather than through the words. */
const NEPTUNE = { at: [130, 0, 0], r: 16 };
const URANUS = { at: [330, 45, 5], r: 17 };
const SATURN = { at: [580, -5, -5], r: 30 };
const JUPITER = { at: [870, 40, -10], r: 46 };
/** A slab of rocks with a lane [side, rise] left clear for the camera. */
const BELT = { from: 1030, to: 1240, lane: [-15, 5], rocks: 800 };
const MARS = { at: [1350, 24, 0], r: 7 };
const EARTH = { at: [1550, 0, 0], r: 14 };
const MOON = { orbit: 34, r: 3.6 };
const VENUS = { at: [1750, 40, 10], r: 13 };
const MERCURY = { at: [1920, -30, -4], r: 5.5 };
const SUN = { at: [2320, 75, 25], r: 100 };

/* The camera's stops after the portal, and where it looks at each one.
   It passes most planets on their left, a little sunward, looking out
   sideways like a window, so each shows its lit half. */
const STOPS_AT = [
  [140, -46, 14], [185, -36, 22], // Neptune
  [372, 0, 20], [430, -30, 30], // Uranus
  [630, -115, 55], [700, -80, -40], // Saturn: over the rings, then under
  [880, -75, 25], [960, -60, 30], // Jupiter
  [1050, -15, 6], [1220, -15, 5], // through the belt
  [1358, -2, 7], // Mars
  [1530, -38, 14], [1570, -40, 16], // Earth and the Moon
  [1792, 0, 24], [1850, -20, 30], // Venus
  [1928, -52, 6], // Mercury
  [2060, -30, 30], [2100, -10, 10] // the Sun
];
/** Where the camera looks, from the point after the hero to the last stop. */
const LOOKS_AT = [
  [60, 0, 0], [118, -5, 2],
  [142, -4, 4], [130, 0, 0],
  [352, 40, 6], [500, -10, 10],
  [585, -5, -5], [600, -5, -5],
  [880, 30, -8], [890, 30, -8],
  [1150, 50, 0], [1280, 75, -5],
  [1349, 21, 0],
  [1545, -4, 4], [1570, -6, 6],
  [1772, 32, 12], [1860, 20, 10],
  [1926, -30, -1],
  [2320, 60, 25], [2320, 75, 215]
];
/** Scene brightness at each camera stop, dimmer where the page is mostly words. */
const EXPOSURE = [1, 1, 1.1, 1.05, 1, 0.85, 0.85, 0.9, 0.9, 1.1, 1, 0.85, 0.85, 0.85, 0.8, 0.8, 0.95, 0.9, 0.9, 0.8, 0.75];

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

/** Value noise and fbm, sampled on the unit sphere so there is no seam. */
const NOISE = /* glsl */ `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
                   mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                   mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 1.7; a *= 0.5; }
    return s;
  }`;

/** Shared by every sphere: world normal, world position, unit object position (for noise), uv. */
const SPHERE_VERTEX = /* glsl */ `
  varying vec3 vN, vW, vObj;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vObj = normalize(position);
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

/** Light from the Sun's real position, and the view direction. */
const LIT = /* glsl */ `
  uniform vec3 uSunPos;
  varying vec3 vN, vW, vObj;
  varying vec2 vUv;
  vec3 N, L, V;
  float ndl;
  void light() {
    N = normalize(vN);
    L = normalize(uSunPos - vW);
    V = normalize(cameraPosition - vW);
    ndl = dot(N, L);
  }`;

export function mount(canvas: HTMLCanvasElement) {
  const token = tokenReader();
  const ink = token("--color-ink", "#efebe3");
  const lit = token("--color-accent", "#f0c48c");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 3000);

  const uTime = { value: 0 };
  const uScale = { value: 400 };
  const uMouse = { value: new THREE.Vector2(9, 9) };
  const uAspect = { value: 1 };
  const uSpace = { value: 0 };
  const uSunDir = { value: new THREE.Vector3(0, 0, -1) };
  const uSun = { value: 1 };
  const uSunPos = { value: new THREE.Vector3() };
  const cursor = { uMouse, uAspect };
  // Light added to the dark. Depth-tested, so the planets hide what is behind them.
  const glow = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
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
    new THREE.SphereGeometry(1400, 32, 16),
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
        ${NOISE}
        void main() {
          vec3 d = normalize(vDir);
          vec3 c = d.y > 0.0 ? mix(uPaper, uBand, smoothstep(0.0, 0.4, d.y))
                             : mix(uPaper, uPaper2, smoothstep(0.0, -0.3, d.y));
          c = mix(c, uBand * 0.5, uSpace);
          // The Milky Way, once you are out in space.
          float galaxy = exp(-pow(dot(d, normalize(vec3(0.35, 0.85, -0.4))) * 4.0, 2.0));
          c += vec3(0.6, 0.65, 0.8) * galaxy * (0.2 + 0.8 * fbm(d * 7.0)) * 0.07 * uSpace;
          float sun = max(dot(d, uSunDir), 0.0);
          c += uLit * (pow(sun, 30.0) * 0.14 + pow(sun, 5.0) * 0.035) * uSun;
          c += uLit * pow(sun, 4.0) * 0.05 * uSpace;
          gl_FragColor = vec4(c, 1.0);
        }`
    })
  );
  sky.renderOrder = -2;
  sky.frustumCulled = false;
  scene.add(sky);

  /* ── Stars: on a sphere that rides with the camera, so they never get
     closer. Above the horizon only, until you are out in space. ── */
  const STARS = 3200;
  const starPos = new Float32Array(STARS * 3);
  const starSeed = new Float32Array(STARS);
  for (let i = 0; i < STARS; i++) {
    const v = new THREE.Vector3().randomDirection();
    starPos.set([v.x * 1300, v.y * 1300, v.z * 1300], i * 3);
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
          float light = rim + halo + inside * (0.03 + 0.06 * swirl * swirl * r + 0.06 * ripple);
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
  const gyro = [1.06, 1.12].map((k) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R * k, 0.05, 8, 320), ringMat);
    portal.add(ring);
    return ring;
  });

  /* The world beyond the portal only shows through it: this disc marks
     the stencil, and everything beyond draws where it is marked until
     the camera crosses. */
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
  portalMask.renderOrder = -1;
  scene.add(portalMask);
  const beyond: THREE.Material[] = [];
  const throughPortal = <M extends THREE.Material>(m: M) => {
    m.stencilWrite = true;
    m.stencilRef = 1;
    m.stencilFunc = THREE.EqualStencilFunc;
    beyond.push(m);
    return m;
  };

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

  /* ── The solar system. ── */
  const v3 = (a: number[]) => ({ value: new THREE.Vector3().fromArray(a) });
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const map = (name: string) => {
    const t = loader.load(`${base}/textures/${name}`);
    t.anisotropy = maxAniso;
    return t;
  };
  const dayMap = map("earth-day.jpg");
  const nightMap = map("earth-night.jpg");

  const sphere = (radius: number, mat: THREE.ShaderMaterial, detail = 96) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(radius, detail, detail / 2), throughPortal(mat));
    scene.add(m);
    return m;
  };
  /** A soft shell of air around a planet, brightest at the limb and when the Sun is behind it. */
  const atmosphere = (planet: THREE.Object3D, radius: number, tint: number[], strength: number) => {
    const k = 1.07;
    const air = sphere(
      radius * k,
      new THREE.ShaderMaterial({
        ...glow,
        side: THREE.BackSide,
        uniforms: { uSunPos, uTint: v3(tint) },
        vertexShader: SPHERE_VERTEX,
        fragmentShader: /* glsl */ `
          uniform vec3 uTint;
          ${LIT}
          void main() {
            light();
            float limb = pow(clamp(-dot(N, V) / ${Math.sqrt(1 - 1 / (k * k)).toFixed(3)}, 0.0, 1.0), 3.0);
            float day = smoothstep(-0.35, 0.45, ndl);
            float behind = pow(max(dot(-V, L), 0.0), 6.0);
            gl_FragColor = vec4(uTint, limb * (day * 0.8 + behind * 2.5) * ${strength.toFixed(2)});
          }`
      }),
      48
    );
    planet.add(air);
  };

  // Earth: NASA day and night maps, drifting clouds, a glint on the oceans, amber cities at night.
  const earthTilt = new THREE.Group();
  earthTilt.rotation.z = 0.41;
  scene.add(earthTilt);
  const earth = sphere(
    EARTH.r,
    new THREE.ShaderMaterial({
      uniforms: { uSunPos, uTime, uDay: { value: dayMap }, uNight: { value: nightMap }, uLit: { value: lit } },
      vertexShader: SPHERE_VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D uDay, uNight;
        uniform vec3 uLit;
        uniform float uTime;
        ${LIT}
        ${NOISE}
        void main() {
          light();
          vec3 day = texture2D(uDay, vUv).rgb;
          vec3 night = texture2D(uNight, vUv).rgb;
          float cities = smoothstep(0.22, 0.65, max(night.r, night.g) - night.b * 0.35);
          float ocean = smoothstep(0.04, 0.16, day.b - day.r);
          float clouds = smoothstep(0.56, 0.8, fbm(vObj * 3.2 + vec3(uTime * 0.008, 0.0, 0.0)));
          float sunlit = smoothstep(-0.12, 0.25, ndl);
          vec3 H = normalize(L + V);
          vec3 c = day * (0.03 + max(ndl, 0.0) * 0.95);
          c += vec3(1.0, 0.95, 0.85) * pow(max(dot(N, H), 0.0), 90.0) * ocean * sunlit * 0.35;
          c = mix(c, vec3(0.78) * max(ndl, 0.0), clouds * 0.7);
          c += uLit * cities * (1.0 - sunlit) * (1.0 - clouds * 0.7) * 1.4;
          c += vec3(0.3, 0.55, 1.0) * pow(1.0 - max(dot(N, V), 0.0), 3.0) * smoothstep(-0.3, 0.6, ndl) * 0.55;
          gl_FragColor = vec4(c, 1.0);
        }`
    }),
    128
  );
  earthTilt.add(earth);
  atmosphere(earthTilt, EARTH.r, [0.35, 0.6, 1.0], 0.6);

  // The Moon and Mercury: grey rock, cratered by noise.
  const rock = (dark: number[], bright: number[]) =>
    new THREE.ShaderMaterial({
      uniforms: { uSunPos, uDark: v3(dark), uBright: v3(bright) },
      vertexShader: SPHERE_VERTEX,
      fragmentShader: /* glsl */ `
        uniform vec3 uDark, uBright;
        ${LIT}
        ${NOISE}
        vec3 cell(vec3 p) {
          return fract(sin(vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)),
                                dot(p, vec3(113.5, 271.9, 124.6)))) * 43758.5453);
        }
        // Round craters from cellular noise: a dark bowl inside, a bright rim around it.
        float craters(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          float d = 1.0;
          for (int x = -1; x <= 1; x++)
            for (int y = -1; y <= 1; y++)
              for (int z = -1; z <= 1; z++) {
                vec3 g = vec3(x, y, z);
                d = min(d, length(g + cell(i + g) * 0.8 - f));
              }
          return -0.3 * (1.0 - smoothstep(0.0, 0.34, d)) + 0.22 * exp(-pow((d - 0.37) * 14.0, 2.0));
        }
        void main() {
          light();
          float h = fbm(vObj * 3.5);
          vec3 c = mix(uDark, uBright, h) * (0.85 + 0.3 * fbm(vObj * 18.0));
          c *= 1.0 + craters(vObj * 5.0) + 0.6 * craters(vObj * 13.0);
          gl_FragColor = vec4(c * (0.015 + max(ndl, 0.0) * 1.1), 1.0);
        }`
    });
  const moon = sphere(MOON.r, rock([0.3, 0.3, 0.3], [0.72, 0.71, 0.69]), 64);
  const mercury = sphere(MERCURY.r, rock([0.32, 0.29, 0.26], [0.66, 0.61, 0.55]), 64);

  // Venus: no surface to see, only slow banded cloud the colour of old paper.
  const venus = sphere(
    VENUS.r,
    new THREE.ShaderMaterial({
      uniforms: { uSunPos, uTime },
      vertexShader: SPHERE_VERTEX,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        ${LIT}
        ${NOISE}
        void main() {
          light();
          vec3 p = vObj;
          float warp = fbm(p * 2.5 + vec3(0.0, 0.0, uTime * 0.01));
          float bands = fbm(vec3(p.x * 1.6, p.y * 6.0 + warp * 2.2, p.z * 1.6) + vec3(uTime * 0.012, 0.0, 0.0));
          vec3 c = mix(vec3(0.5, 0.38, 0.22), vec3(0.8, 0.7, 0.5), smoothstep(0.25, 0.75, bands));
          gl_FragColor = vec4(c * (0.015 + smoothstep(-0.05, 1.0, ndl) * 0.55), 1.0);
        }`
    })
  );
  atmosphere(venus, VENUS.r, [1.0, 0.82, 0.5], 0.35);

  // Mars: rust, darker plains, white poles.
  const mars = sphere(
    MARS.r,
    new THREE.ShaderMaterial({
      uniforms: { uSunPos },
      vertexShader: SPHERE_VERTEX,
      fragmentShader: /* glsl */ `
        ${LIT}
        ${NOISE}
        void main() {
          light();
          vec3 c = mix(vec3(0.62, 0.3, 0.15), vec3(0.82, 0.5, 0.3), fbm(vObj * 4.0));
          c = mix(c, vec3(0.3, 0.17, 0.11), smoothstep(0.5, 0.62, fbm(vObj * 1.6 + 4.0)) * 0.75);
          c = mix(c, vec3(0.9, 0.88, 0.85), smoothstep(0.84, 0.9, abs(vObj.y) + (fbm(vObj * 8.0) - 0.5) * 0.1));
          gl_FragColor = vec4(c * (0.015 + max(ndl, 0.0) * 1.05), 1.0);
        }`
    }),
    64
  );
  atmosphere(mars, MARS.r, [1.0, 0.6, 0.4], 0.25);

  /** Gas giants: cloud bands by latitude, stirred by noise, with an optional storm. */
  const giant = (o: {
    light: number[];
    dark: number[];
    streak: number[];
    bands: number;
    stir: number;
    /** Direction on the sphere and size. */
    storm?: number[];
    stormTint?: number[];
  }) =>
    new THREE.ShaderMaterial({
      uniforms: {
        uSunPos,
        uTime,
        uLight: v3(o.light),
        uDark: v3(o.dark),
        uStreak: v3(o.streak),
        uBands: { value: o.bands },
        uStir: { value: o.stir },
        uStorm: { value: new THREE.Vector4().fromArray(o.storm ?? [0, 1, 0, 0]) },
        uStormTint: v3(o.stormTint ?? [0, 0, 0])
      },
      vertexShader: SPHERE_VERTEX,
      fragmentShader: /* glsl */ `
        uniform vec3 uLight, uDark, uStreak, uStormTint;
        uniform vec4 uStorm;
        uniform float uTime, uBands, uStir;
        ${LIT}
        ${NOISE}
        void main() {
          light();
          vec3 p = vObj;
          float stir = fbm(p * 3.0 + vec3(uTime * 0.01, 0.0, 0.0)) - 0.5;
          float lat = p.y + stir * uStir;
          float band = noise(vec3(0.5, lat * uBands, 0.5));
          float streak = fbm(vec3(p.x * 3.0, lat * uBands * 4.0, p.z * 3.0));
          vec3 c = mix(uDark, uLight, smoothstep(0.35, 0.65, band));
          c = mix(c, uStreak, smoothstep(0.5, 0.8, streak) * 0.5);
          vec3 q = p - normalize(uStorm.xyz);
          q.y *= 1.8;
          float storm = 1.0 - smoothstep(uStorm.w * 0.6, uStorm.w + 1e-4, length(q) + stir * 0.04);
          c = mix(c, uStormTint, storm * step(1e-4, uStorm.w));
          // Kept under the bloom threshold: a big bright disc blooms into a white smear.
          c *= (0.012 + smoothstep(-0.08, 1.0, ndl) * 0.5) * (0.8 + 0.2 * max(dot(N, V), 0.0));
          gl_FragColor = vec4(c, 1.0);
        }`
    });

  const jupiter = sphere(
    JUPITER.r,
    giant({
      light: [0.86, 0.79, 0.66],
      dark: [0.62, 0.43, 0.29],
      streak: [0.52, 0.32, 0.22],
      bands: 7,
      stir: 0.12,
      storm: [-0.85, -0.38, 0.3, 0.17],
      stormTint: [0.74, 0.36, 0.22]
    }),
    128
  );
  atmosphere(jupiter, JUPITER.r, [1.0, 0.85, 0.65], 0.15);

  // Saturn sits in a group turned so its rings open toward the camera's path (set in layout).
  const saturnTilt = new THREE.Group();
  scene.add(saturnTilt);
  const saturn = sphere(
    SATURN.r,
    giant({ light: [0.86, 0.76, 0.56], dark: [0.72, 0.6, 0.42], streak: [0.8, 0.7, 0.5], bands: 10, stir: 0.04 }),
    128
  );
  saturnTilt.add(saturn);
  atmosphere(saturn, SATURN.r, [1.0, 0.85, 0.6], 0.15);
  const rings = new THREE.Mesh(
    new THREE.RingGeometry(SATURN.r * 1.24, SATURN.r * 2.27, 256, 1),
    throughPortal(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uSunPos, uCenter: { value: saturnTilt.position } },
        vertexShader: /* glsl */ `
          varying vec3 vW;
          varying float vR;
          void main() {
            vR = length(position.xy) / ${SATURN.r.toFixed(1)};
            vec4 w = modelMatrix * vec4(position, 1.0);
            vW = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uSunPos, uCenter;
          varying vec3 vW;
          varying float vR;
          ${NOISE}
          void main() {
            float n = 0.6 * noise(vec3(vR * 30.0, 0.5, 0.5)) + 0.4 * noise(vec3(vR * 120.0, 0.5, 0.5));
            float a = smoothstep(1.24, 1.3, vR) * (1.0 - smoothstep(2.2, 2.27, vR));
            a *= mix(0.3, 1.0, smoothstep(1.5, 1.56, vR)); // the faint inner ring
            a *= 1.0 - 0.9 * (smoothstep(1.93, 1.95, vR) - smoothstep(2.0, 2.03, vR)); // the Cassini division
            a *= 0.4 + 0.6 * n;
            // The planet's shadow: does the ray toward the Sun pass through Saturn?
            vec3 L = normalize(uSunPos - vW);
            vec3 oc = vW - uCenter;
            float b = dot(oc, L);
            float R2 = ${(SATURN.r * SATURN.r).toFixed(1)};
            float shadow = step(b, 0.0) * smoothstep(R2 * 1.04, R2 * 0.96, dot(oc, oc) - b * b);
            vec3 c = mix(vec3(0.5, 0.44, 0.36), vec3(0.86, 0.78, 0.62), n);
            gl_FragColor = vec4(c * (0.05 + 0.55 * (1.0 - shadow)), a);
          }`
      })
    )
  );
  rings.rotation.x = -Math.PI / 2;
  saturnTilt.add(rings);

  // Uranus rolls on its side, so its faint bands run pole to pole.
  const uranus = sphere(
    URANUS.r,
    giant({ light: [0.58, 0.8, 0.84], dark: [0.5, 0.72, 0.78], streak: [0.64, 0.84, 0.88], bands: 6, stir: 0.02 })
  );
  uranus.rotation.z = 1.7;
  atmosphere(uranus, URANUS.r, [0.55, 0.85, 0.9], 0.25);

  const neptune = sphere(
    NEPTUNE.r,
    giant({
      light: [0.32, 0.52, 0.98],
      dark: [0.2, 0.36, 0.82],
      streak: [0.6, 0.74, 0.96],
      bands: 8,
      stir: 0.06,
      storm: [-0.8, -0.35, 0.45, 0.13],
      stormTint: [0.1, 0.16, 0.45]
    })
  );
  atmosphere(neptune, NEPTUNE.r, [0.35, 0.55, 1.0], 0.5);

  /* The asteroid belt: lumpy rocks, one draw call. Placed in layout, since
     they sit around the camera's path. */
  const rockGeo = new THREE.IcosahedronGeometry(1, 1);
  const rp = rockGeo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < rp.count; i++) {
    // A smooth function of position, so shared corners move together and faces stay closed.
    v.fromBufferAttribute(rp, i);
    v.multiplyScalar(1 + 0.35 * Math.sin(v.x * 3.1 + 1) * Math.sin(v.y * 2.7 + 2) * Math.sin(v.z * 3.7));
    rp.setXYZ(i, v.x, v.y, v.z);
  }
  rockGeo.computeVertexNormals();
  const belt = new THREE.InstancedMesh(
    rockGeo,
    throughPortal(
      new THREE.ShaderMaterial({
        uniforms: { uSunPos },
        vertexShader: /* glsl */ `
          varying vec3 vN, vW;
          varying float vTint;
          void main() {
            mat4 m = modelMatrix * instanceMatrix;
            vN = normalize(mat3(m) * normal);
            vec4 w = m * vec4(position, 1.0);
            vW = w.xyz;
            vTint = fract(sin(dot(instanceMatrix[3].xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uSunPos;
          varying vec3 vN, vW;
          varying float vTint;
          void main() {
            vec3 N = normalize(vN);
            vec3 V = normalize(cameraPosition - vW);
            vec3 c = mix(vec3(0.3, 0.27, 0.24), vec3(0.58, 0.5, 0.41), vTint);
            float lit = 0.03 + max(dot(N, normalize(uSunPos - vW)), 0.0) * 1.1 + pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.12;
            gl_FragColor = vec4(c * lit * smoothstep(500.0, 150.0, distance(cameraPosition, vW)), 1.0);
          }`
      })
    ),
    BELT.rocks
  );
  belt.frustumCulled = false;
  scene.add(belt);
  const rockSeed = new Float32Array(BELT.rocks * 6).map(Math.random);

  // The Sun: boiling granulation, darker at the limb, inside a corona of rays.
  const sun = sphere(
    SUN.r,
    new THREE.ShaderMaterial({
      uniforms: { uTime },
      vertexShader: SPHERE_VERTEX,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vN, vW, vObj;
        ${NOISE}
        void main() {
          float mu = max(dot(normalize(vN), normalize(cameraPosition - vW)), 0.0);
          float g = fbm(vObj * 5.0 + vec3(0.0, uTime * 0.04, 0.0)) * 0.5 + fbm(vObj * 26.0 - uTime * 0.07) * 0.5;
          vec3 c = mix(vec3(0.85, 0.28, 0.02), vec3(1.0, 0.72, 0.28), smoothstep(0.3, 0.7, g));
          c *= 0.6 + 0.4 * sqrt(mu);
          gl_FragColor = vec4(c, 1.0);
        }`
    }),
    192
  );
  const corona = new THREE.Mesh(
    new THREE.PlaneGeometry(SUN.r * 6, SUN.r * 6),
    throughPortal(
      new THREE.ShaderMaterial({
        ...glow,
        uniforms: { uTime },
        vertexShader: /* glsl */ `
          varying vec2 vP;
          void main() { vP = position.xy / ${SUN.r.toFixed(1)}; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vP;
          ${NOISE}
          void main() {
            float r = length(vP);
            float a = atan(vP.y, vP.x);
            float rays = fbm(vec3(cos(a) * 4.0, sin(a) * 4.0, uTime * 0.05 - r * 0.4));
            float out_ = max(r - 1.0, 0.0);
            float halo = exp(-out_ * 3.2) * 0.35;
            float streaks = pow(rays, 2.5) * exp(-out_ * 1.2) * smoothstep(0.0, 0.25, out_) * 0.9;
            vec3 c = mix(vec3(1.0, 0.45, 0.1), vec3(1.0, 0.75, 0.4), exp(-out_ * 4.0));
            gl_FragColor = vec4(c, (halo + streaks) * smoothstep(3.0, 1.6, r));
          }`
      })
    )
  );
  scene.add(corona);

  /* ── Dust: motes in a box that rides with the camera, so there is always
     something close to fly past. Each is a line that stretches with speed. ── */
  const DUST = 700;
  const dustSeed = new Float32Array(DUST * 6);
  const dustEnd = new Float32Array(DUST * 2);
  for (let i = 0; i < DUST; i++) {
    const seed = [Math.random(), Math.random(), Math.random()];
    dustSeed.set(seed, i * 6);
    dustSeed.set(seed, i * 6 + 3);
    dustEnd[i * 2 + 1] = 1;
  }
  const uVel = { value: new THREE.Vector3() };
  const dust = new THREE.LineSegments(
    geometry({ position: [new Float32Array(DUST * 6), 3], aSeed: [dustSeed, 3], aEnd: [dustEnd, 1] }),
    throughPortal(
      new THREE.ShaderMaterial({
        ...glow,
        uniforms: { uSpace, uVel, uInk: { value: ink } },
        vertexShader: /* glsl */ `
          uniform vec3 uVel;
          uniform float uSpace;
          attribute vec3 aSeed;
          attribute float aEnd;
          varying float vA;
          void main() {
            const float BOX = 80.0;
            vec3 lo = cameraPosition - BOX * 0.5;
            vec3 p = lo + mod(aSeed * BOX - lo, BOX) - uVel * aEnd;
            gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
            vA = uSpace * smoothstep(BOX * 0.5, BOX * 0.15, distance(p, cameraPosition)) * (1.0 - aEnd * 0.85);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uInk;
          varying float vA;
          void main() { gl_FragColor = vec4(uInk, vA * 0.7); }`
      })
    )
  );
  dust.frustumCulled = false;
  scene.add(dust);

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

  /* ── Layout. Everything past the portal sits on the line from the hero
     camera through the portal, and that camera moves with the layout,
     so the bodies and the path are rebuilt on resize. ── */
  let shift = 0;
  let path = new THREE.CatmullRomCurve3();
  let looks: THREE.Vector3[] = [];
  let anchors: Array<[number, number]> = [[0, 0]];
  const STOPS = EXPOSURE.length - 1;
  const placed: Array<[number[], ...THREE.Object3D[]]> = [
    [NEPTUNE.at, neptune],
    [URANUS.at, uranus],
    [SATURN.at, saturnTilt],
    [JUPITER.at, jupiter],
    [MARS.at, mars],
    [EARTH.at, earthTilt],
    [VENUS.at, venus],
    [MERCURY.at, mercury],
    [SUN.at, sun, corona]
  ];
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const size3 = new THREE.Vector3();
  const frame = { f: new THREE.Vector3(), r: new THREE.Vector3(), u: new THREE.Vector3() };
  const at = ([d, side, rise]: number[], out = new THREE.Vector3()) =>
    out
      .copy(PORTAL)
      .addScaledVector(frame.f, d)
      .addScaledVector(frame.r, side)
      .addScaledVector(frame.u, rise);

  const layout = () => {
    const hero = new THREE.Vector3(-shift, 2.2, CAM_Z);
    frame.f.copy(PORTAL).sub(hero).normalize();
    frame.r.crossVectors(frame.f, THREE.Object3D.DEFAULT_UP).normalize();
    frame.u.crossVectors(frame.r, frame.f);

    for (const [p, ...objs] of placed) {
      at(p, v);
      for (const o of objs) o.position.copy(v);
    }
    uSunPos.value.copy(sun.position);
    // Saturn's pole leans off the frame's up, so the rings show as an open, tilted ellipse.
    v.copy(frame.u).addScaledVector(frame.r, -0.2).addScaledVector(frame.f, 0.1).normalize();
    saturnTilt.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP, v);

    for (let i = 0; i < BELT.rocks; i++) {
      const [a, b, c, s, x, y] = rockSeed.subarray(i * 6, i * 6 + 6);
      const size = 0.3 + s ** 5 * 4;
      // Uniform across the slab, except a lane on the camera's path wider than the rock.
      const side = BELT.lane[0] + Math.sign(b - 0.5) * (12 + size * 2 + Math.abs(b - 0.5) * 360);
      at([BELT.from + a * (BELT.to - BELT.from), side, BELT.lane[1] + (c - 0.5) * 70], v);
      q.setFromEuler(e.set(x * 6.3, y * 6.3, s * 6.3));
      belt.setMatrixAt(i, m4.compose(v, q, size3.set(size * (1 + x * 0.6), size, size * (1 + y * 0.4))));
    }
    belt.instanceMatrix.needsUpdate = true;

    path = new THREE.CatmullRomCurve3(
      [hero, new THREE.Vector3(-shift * 0.4, 3.6, -16), PORTAL.clone(), ...STOPS_AT.map((p) => at(p))],
      false,
      "centripetal"
    );
    looks = [new THREE.Vector3(-shift * 0.7, 2.6, PORTAL.z), ...LOOKS_AT.map((p) => at(p))];
  };

  const measure = () => {
    const vh = window.innerHeight;
    const top = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : NaN;
    };
    const [work, loop, projects, stack, contact] = ["#work", "#loop", "#projects", "#stack", "#contact"].map(top);
    const span = (a: number, b: number, ks: number[]) => ks.map((k) => a + (b - a) * k);
    const portal = work - vh * 0.3;
    // The scroll position of each stop in order, so each section gets its share of the flight.
    const ys = [
      0,
      portal / 2,
      portal,
      work + vh * 0.6,
      ...span(work, loop, [0.3, 0.45, 0.6, 0.75, 0.92]), // Neptune, Uranus, Saturn
      ...span(loop, projects, [0.2, 0.75]), // Jupiter
      ...span(projects, stack, [0.12, 0.3, 0.48, 0.66, 0.82, 0.97]), // the belt, Mars, Earth, Venus
      ...span(stack, contact - vh, [0.4, 0.75, 1]), // Venus, Mercury, the Sun
      document.documentElement.scrollHeight - vh
    ];
    // Keep only anchors that exist and move forward, so the mapping is monotonic.
    anchors = [];
    ys.forEach((y, stop) => {
      if (Number.isFinite(y) && (!anchors.length || y > anchors[anchors.length - 1][0])) anchors.push([y, stop]);
    });
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
    layout();
    measure();
  };

  // Pointer target and eased camera; `stop` is the eased position along the path.
  const aim = { x: 0, y: 0 };
  const cam = { x: 0, y: 0, stop: 0, warp: 0 };
  const pos = new THREE.Vector3();
  const lastPos = new THREE.Vector3();
  const look = new THREE.Vector3();
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
    const space = smooth(1.9, 2.4, s);

    path.getPoint(Math.min(1, s / STOPS), pos);
    pos.x += cam.x * 1.8;
    pos.y += -cam.y * 0.8;

    const i = Math.min(STOPS - 1, Math.floor(s));
    look.lerpVectors(looks[i], looks[i + 1], smooth(0, 1, s - i));

    if (intro) {
      const k = Math.min(1, (t - start) / 3200);
      const e = 1 - Math.pow(1 - k, 4);
      introFrom.set(-shift - 14, 30, 74);
      introLook.set(-shift * 0.7, -4, -10);
      pos.lerpVectors(introFrom, pos, e);
      look.lerpVectors(introLook, look, e);
    }

    // Dust streaks along the camera's motion; at rest it is short specks.
    const vel = uVel.value.subVectors(pos, lastPos).multiplyScalar(3).clampLength(0, 24);
    if (vel.lengthSq() < 0.02) vel.copy(frame.f).multiplyScalar(0.15);
    lastPos.copy(pos);

    camera.position.copy(pos);
    camera.lookAt(look);
    camera.rotateZ(Math.sin(s * 1.3) * 0.05 * space);
    camera.fov = 50 + cam.warp * 22;
    camera.updateProjectionMatrix();
    const seeAll = pos.z < PORTAL.z ? THREE.AlwaysStencilFunc : THREE.EqualStencilFunc;
    for (const m of beyond) m.stencilFunc = seeAll;

    sky.position.copy(pos);
    stars.position.copy(pos);
    corona.quaternion.copy(camera.quaternion);
    gyro[0].rotation.set(time * 0.21, time * 0.13, 0);
    gyro[1].rotation.set(-time * 0.11, time * 0.17, time * 0.05);
    earth.rotation.y = time * 0.02;
    venus.rotation.y = -time * 0.006;
    mercury.rotation.y = time * 0.01;
    mars.rotation.y = time * 0.02;
    jupiter.rotation.y = time * 0.003;
    saturn.rotation.y = time * 0.004;
    neptune.rotation.y = time * 0.005;
    const orbit = time * 0.03 + 2.2;
    moon.position
      .copy(earthTilt.position)
      .addScaledVector(frame.r, Math.cos(orbit) * MOON.orbit)
      .addScaledVector(frame.f, Math.sin(orbit) * MOON.orbit)
      .addScaledVector(frame.u, 5);

    uSpace.value = space;
    uSun.value = 1 - space;
    uSunDir.value.copy(space > 0.5 ? uSunPos.value : PORTAL).sub(pos).normalize();

    // A flash as you cross the portal.
    const cross = Math.exp(-Math.abs(pos.z - PORTAL.z) * 0.22) * 0.3;
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
      if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.Line) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    dayMap.dispose();
    nightMap.dispose();
    bloom.dispose();
    composer.dispose();
    renderer.dispose();
  };
}
