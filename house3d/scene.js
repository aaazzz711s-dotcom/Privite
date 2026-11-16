// 3D model + cinematic tour of the 2-bedroom + bathroom design (7.00 x 6.00 m).
// Open index.html for a live tour / free orbit, or index.html?render=1 for frame capture (see render.js).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
const W = +(params.get('w') || 1280), H = +(params.get('h') || 720);
export const DURATION = 52;
window.DURATION = DURATION;
if (RENDER) document.body.classList.add('render');

// ---------------------------------------------------------------- dimensions
const FLOOR = 0.3;          // finished floor level above garden
const CEIL = 3.0;           // ceiling (2.70 m clear inside)
const ROOF_T = 0.45;        // roof slab / fascia thickness

// ---------------------------------------------------------------- utils
let _seed = 20261116;
function rnd() { _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0; let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const rr = (a, b) => a + (b - a) * rnd();
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = (u) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(u));

// ---------------------------------------------------------------- renderer
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;
RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.04, 400);

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.5, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.1;

// ---------------------------------------------------------------- textures
function makeTex(w, h, draw, o = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (o.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = o.clampEdge ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
function speckle(g, w, h, n, lo, hi, a, smin = 1, smax = 2.5) {
  for (let i = 0; i < n; i++) {
    const v = lo + rnd() * (hi - lo) | 0;
    g.fillStyle = `rgba(${v},${v},${v},${a})`;
    const s = rr(smin, smax); g.fillRect(rnd() * w, rnd() * h, s, s);
  }
}

const plasterTex = makeTex(512, 512, (g, w, h) => { g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, w, h); speckle(g, w, h, 45000, 205, 255, 0.22); });

const woodTex = makeTex(512, 1024, (g, w, h) => {
  g.fillStyle = '#a8784a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const dark = rnd() < 0.55;
    g.strokeStyle = (dark ? 'rgba(92,58,30,' : 'rgba(205,160,110,') + rr(0.06, 0.22) + ')';
    g.lineWidth = rr(1, 4); g.beginPath(); let x = rnd() * w; g.moveTo(x, 0);
    for (let y = 0; y <= h; y += 24) { x += rr(-2.2, 2.2); g.lineTo(x, y); }
    g.stroke();
  }
});

const tileTex = makeTex(1024, 1024, (g, w, h) => {   // 2.4 x 2.4 m: 120 x 60 cm porcelain
  g.fillStyle = '#b9aa92'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
    const v = rr(-8, 8);
    g.fillStyle = `rgb(${222 + v},${211 + v},${193 + v})`;
    g.fillRect(c * 512 + 2, r * 256 + 2, 508, 252);
  }
  g.save(); g.filter = 'blur(14px)';
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,250,240' : '190,175,150'},0.10)`; g.beginPath(); g.arc(rnd() * w, rnd() * h, rr(20, 90), 0, 7); g.fill(); }
  g.restore();
  speckle(g, w, h, 30000, 170, 240, 0.12);
  g.strokeStyle = 'rgba(160,145,120,0.9)'; g.lineWidth = 3;
  for (let r = 0; r <= 4; r++) { g.beginPath(); g.moveTo(0, r * 256); g.lineTo(w, r * 256); g.stroke(); }
  for (let c = 0; c <= 2; c++) { g.beginPath(); g.moveTo(c * 512, 0); g.lineTo(c * 512, h); g.stroke(); }
});

const marbleTex = makeTex(1024, 1024, (g, w, h) => {
  g.fillStyle = '#e8e5e0'; g.fillRect(0, 0, w, h);
  g.save(); g.filter = 'blur(30px)';
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,255,255' : '180,175,168'},0.25)`; g.beginPath(); g.arc(rnd() * w, rnd() * h, rr(40, 160), 0, 7); g.fill(); }
  g.restore();
  g.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    let x = rnd() * w, y = -40, dir = rr(0.6, 1.2);
    const pts = [[x, y]];
    while (y < h + 40) { x += Math.cos(dir) * 70 + rr(-25, 25); y += Math.sin(dir) * 70; dir += rr(-0.25, 0.25); dir = clamp(dir, 0.4, 2.7); pts.push([x, y]); }
    for (const [lw, a] of [[rr(6, 12), 0.05], [rr(1, 2.2), rr(0.18, 0.32)]]) {
      g.strokeStyle = `rgba(120,116,110,${a})`; g.lineWidth = lw; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length - 1; k++) g.quadraticCurveTo(pts[k][0], pts[k][1], (pts[k][0] + pts[k + 1][0]) / 2, (pts[k][1] + pts[k + 1][1]) / 2);
      g.stroke();
    }
  }
});

const grassTex = makeTex(512, 512, (g, w, h) => {
  g.fillStyle = '#25381b'; g.fillRect(0, 0, w, h);
  const cols = ['#2f4a22', '#3c5c29', '#1d2f14', '#46692f', '#334f24'];
  for (let i = 0; i < 16000; i++) {
    g.strokeStyle = cols[i % cols.length]; g.globalAlpha = rr(0.4, 0.9); g.lineWidth = rr(0.8, 1.8);
    const x = rnd() * w, y = rnd() * h, a = rr(-0.5, 0.5) - Math.PI / 2, l = rr(3, 9);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  g.globalAlpha = 1;
});

const pavingTex = makeTex(512, 512, (g, w, h) => {
  g.fillStyle = '#c9c2b6'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 30000, 150, 235, 0.25);
  g.strokeStyle = 'rgba(90,85,78,0.6)'; g.lineWidth = 4; g.strokeRect(0, 0, w, h);
});

const fabricTex = makeTex(256, 256, (g, w, h) => {
  g.fillStyle = '#f0f0f0'; g.fillRect(0, 0, w, h);
  g.globalAlpha = 0.08; g.fillStyle = '#000';
  for (let i = 0; i < w; i += 3) g.fillRect(i, 0, 1, h);
  for (let j = 0; j < h; j += 3) g.fillRect(0, j, w, 1);
  g.globalAlpha = 1; speckle(g, w, h, 6000, 200, 255, 0.2, 1, 1.5);
});

const rugTex = makeTex(512, 512, (g, w, h) => {
  g.fillStyle = '#cbbfa9'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 40000, 150, 240, 0.18, 1, 2);
  g.strokeStyle = '#9d8f78'; g.lineWidth = 10; g.strokeRect(26, 26, w - 52, h - 52);
  g.lineWidth = 3; g.strokeRect(46, 46, w - 92, h - 92);
});

const artTex = makeTex(512, 360, (g, w, h) => {
  g.fillStyle = '#ece3d3'; g.fillRect(0, 0, w, h);
  const strokes = [['#c9a77a', 46], ['#7b7454', 22], ['#3f3a33', 8], ['#b98d5f', 30], ['#d9c3a2', 60]];
  for (const [c, lw] of strokes) {
    g.strokeStyle = c; g.lineWidth = lw; g.lineCap = 'round'; g.globalAlpha = 0.85;
    g.beginPath(); const cx = rr(120, 390), cy = rr(120, 260), r = rr(70, 170);
    g.arc(cx, cy, r, rr(0, 3), rr(3.5, 6)); g.stroke();
  }
  g.globalAlpha = 1; g.fillStyle = '#a5683c'; g.beginPath(); g.arc(rr(320, 400), rr(90, 140), 28, 0, 7); g.fill();
  speckle(g, w, h, 8000, 120, 255, 0.08);
});

const leafTex = makeTex(64, 128, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, '#c4d0b6'); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(1, '#b0bf9f');
  g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, h - 2);
  g.quadraticCurveTo(-6, h * 0.5, w / 2, 2); g.quadraticCurveTo(w + 6, h * 0.5, w / 2, h - 2); g.fill();
  g.strokeStyle = 'rgba(130,150,110,0.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, h - 2); g.lineTo(w / 2, 8); g.stroke();
}, { clampEdge: true });

const glowTex = makeTex(128, 128, (g, w, h) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.45)');
  gr.addColorStop(0.5, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, { clampEdge: true });

// up-light cone (bottom centre, widening upwards)
const coneTex = (() => {
  const w = 128, h = 256, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = (h - y) / h, dx = (x - w / 2) / (w / 2);
    const spread = 0.08 + 0.85 * v;
    const I = Math.exp(-((dx / spread) ** 2) * 2.2) * Math.exp(-v * 2.2) * smooth(0, 0.06, v);
    const i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = clamp(I) * 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();

// wall-sconce wash (up + down cone) baked for a pier of given width
function washTexture(pw, ph, sx, sy) {
  const ppm = 200, w = Math.round(pw * ppm), h = Math.round(ph * ppm);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const mx = x / ppm, my = (h - y) / ppm, dx = mx - sx, dy = my - sy, ady = Math.abs(dy);
    const spread = 0.035 + 0.3 * ady;
    let I = Math.exp(-((dx / spread) ** 2) * 1.8) * Math.exp(-ady * (dy > 0 ? 1.1 : 1.4)) * smooth(0.05, 0.22, ady);
    I += 0.22 * Math.exp(-(dx * dx + dy * dy) / 0.03);
    const i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = clamp(I) * 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const skyTex = makeTex(4, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#02040a'); gr.addColorStop(0.45, '#08101f'); gr.addColorStop(0.78, '#141e33'); gr.addColorStop(1, '#1f2940');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, { clampEdge: true });
scene.background = skyTex;
scene.fog = new THREE.Fog(0x131b2c, 24, 75);

// ---------------------------------------------------------------- materials
const std = (o) => new THREE.MeshStandardMaterial(o);
const glowMat = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) });
const M = {
  plaster: std({ map: plasterTex, color: 0xeee3d0, roughness: 0.92 }),
  wallIn: std({ map: plasterTex, color: 0xe8d9c1, roughness: 0.9 }),
  cut: std({ color: 0x34312d, roughness: 0.9 }),
  charcoal: std({ color: 0x2a2826, roughness: 0.55, metalness: 0.15 }),
  roofTop: std({ color: 0x45423e, roughness: 0.95 }),
  alu: std({ color: 0x141414, roughness: 0.35, metalness: 0.6 }),
  glass: std({ color: 0x8fa6b4, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.16, envMapIntensity: 3, depthWrite: false }),
  glassClear: std({ color: 0xc8d6dc, roughness: 0.03, transparent: true, opacity: 0.12, envMapIntensity: 3, depthWrite: false }),
  glassFrost: std({ color: 0xf2efe8, roughness: 0.6, transparent: true, opacity: 0.75 }),
  wood: std({ map: woodTex, color: 0xffffff, roughness: 0.55 }),
  woodDark: std({ map: woodTex, color: 0x9a7a5c, roughness: 0.6 }),
  slat: std({ map: woodTex, color: 0xf0d2b0, roughness: 0.5 }),
  floor: std({ map: tileTex, roughness: 0.28, envMapIntensity: 1.5 }),
  marble: std({ map: marbleTex, roughness: 0.18, envMapIntensity: 1.5 }),
  marbleFloor: std({ map: marbleTex, color: 0xcfcac2, roughness: 0.25 }),
  ceiling: std({ color: 0xf3eee6, roughness: 0.95 }),
  fabric: std({ map: fabricTex, color: 0xd6c4a8, roughness: 0.95 }),
  linen: std({ map: fabricTex, color: 0xf5f1ea, roughness: 0.95 }),
  olive: std({ map: fabricTex, color: 0x7a6a40, roughness: 0.95 }),
  sage: std({ map: fabricTex, color: 0x8b8a62, roughness: 0.95 }),
  towel: std({ map: fabricTex, color: 0xe9dfcf, roughness: 1 }),
  rug: std({ map: rugTex, roughness: 1 }),
  ceramic: std({ color: 0xf6f5f2, roughness: 0.1, envMapIntensity: 2 }),
  ceramicBeige: std({ color: 0xd9c7aa, roughness: 0.35 }),
  stoneWhite: std({ color: 0xefebe4, roughness: 0.2 }),
  blackMetal: std({ color: 0x121212, roughness: 0.32, metalness: 0.75 }),
  mirror: std({ color: 0xdfe4e8, metalness: 1, roughness: 0.02, envMapIntensity: 8 }),
  dark: std({ color: 0x1d1a17, roughness: 0.9 }),
  stone: std({ map: pavingTex, roughness: 0.85 }),
  plinth: std({ color: 0x3b3936, roughness: 0.85 }),
  grass: std({ map: grassTex, roughness: 1 }),
  mulch: std({ color: 0x2c2118, roughness: 1 }),
  pot: std({ color: 0x2c2a27, roughness: 0.45, metalness: 0.1 }),
  potLight: std({ color: 0xd8ccb8, roughness: 0.6 }),
  trunk: std({ color: 0x4b3b2c, roughness: 0.95 }),
  hedge: std({ map: (() => { const t = grassTex.clone(); t.needsUpdate = true; return t; })(), color: 0x9fbf8f, roughness: 1 }),
  boundary: std({ map: plasterTex, color: 0x4d4741, roughness: 0.95 }),
  leaf: std({ map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75 }),
  curtain: std({ map: fabricTex, color: 0xf0e5d2, roughness: 1, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
  shade: std({ color: 0xf1dfbf, emissive: 0xffa94d, emissiveIntensity: 1.4, roughness: 1, side: THREE.DoubleSide }),
  led: glowMat(0xffc27a, 5),
  ledHot: glowMat(0xffd7a0, 10),
  bulb: glowMat(0xffd49a, 14),
};

// world-scaled UVs for boxes (scale = metres per texture tile, 0 = keep unit UVs)
function worldBox(w, h, d, scale = 1) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (!scale) return g;
  const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
    const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / scale, uv.getY(i) * dims[f][1] / scale);
  }
  return g;
}
function boxMM(x0, x1, y0, y1, z0, z1, mat, o = {}) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const geo = o.r ? new RoundedBoxGeometry(w, h, d, 3, Math.min(o.r, w / 2, h / 2, d / 2) * 0.999) : worldBox(w, h, d, o.uv ?? 1);
  const m = new THREE.Mesh(geo, mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false;
  (o.parent || scene).add(m); return m;
}
function rbox(w, h, d, r, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2) * 0.999), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}
function cyl(rt, rb, h, mat, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 24, 1, !!o.open), mat);
  m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = true; (o.parent || scene).add(m); return m;
}
function glowSprite(x, y, z, size, hex, k, parent = scene) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(hex).multiplyScalar(k), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.position.set(x, y, z); s.scale.set(size, size, 1); parent.add(s); return s;
}
function groundGlow(x, y, z, size, hex, k) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: glowTex, color: new THREE.Color(hex).multiplyScalar(k), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); scene.add(m); return m;
}
function upCone(x, y, z, w, h, hex, k) {
  const mat = new THREE.MeshBasicMaterial({ map: coneTex, color: new THREE.Color(hex).multiplyScalar(k), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  for (const a of [0, Math.PI / 2]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y + h / 2, z); m.rotation.y = a; scene.add(m); }
}

// roof group uses transparent clones so it can fade away for the "dollhouse" view
const roof = new THREE.Group(); scene.add(roof);
const mirrors = [];
const roofMats = new Map();
function R(mat) {
  if (!roofMats.has(mat)) { const c = mat.clone(); c.transparent = true; c.userData.baseOpacity = mat.opacity; roofMats.set(mat, c); }
  return roofMats.get(mat);
}

// ---------------------------------------------------------------- walls
function wallMats(outside) {         // outside: index of the BoxGeometry face that faces the garden (-1 = none)
  const a = [M.wallIn, M.wallIn, M.cut, M.wallIn, M.wallIn, M.wallIn];
  if (outside >= 0) { a[outside] = M.plaster; }
  return a;
}
function wallRun(axis, c, a0, a1, t, openings, mats) {
  const segs = []; let cur = a0;
  for (const o of [...openings].sort((p, q) => p.a0 - q.a0)) {
    if (o.a0 > cur) segs.push([cur, o.a0, FLOOR, CEIL]);
    if (o.y0 > FLOOR) segs.push([o.a0, o.a1, FLOOR, o.y0]);
    if (o.y1 < CEIL) segs.push([o.a0, o.a1, o.y1, CEIL]);
    cur = o.a1;
  }
  if (cur < a1) segs.push([cur, a1, FLOOR, CEIL]);
  for (const [s0, s1, y0, y1] of segs) {
    if (axis === 'x') boxMM(s0, s1, y0, y1, c - t / 2, c + t / 2, mats, { uv: 2 });
    else boxMM(c - t / 2, c + t / 2, y0, y1, s0, s1, mats, { uv: 2 });
  }
}
const F = FLOOR;
const frontOps = [
  { a0: -3.1, a1: -1.0, y0: F, y1: F + 2.4 },     // W1 sliding glass — bedroom 1
  { a0: -0.5, a1: 0.5, y0: F, y1: F + 2.4 },      // D1 entrance
  { a0: 1.0, a1: 3.1, y0: F, y1: F + 2.4 },       // W1 sliding glass — bedroom 2
];
const backOps = [
  { a0: -3.0, a1: -1.6, y0: F + 0.9, y1: F + 2.3 },
  { a0: -0.3, a1: 0.3, y0: F + 1.9, y1: F + 2.5 }, // W2 bathroom high window
  { a0: 1.6, a1: 3.0, y0: F + 0.9, y1: F + 2.3 },
];
wallRun('x', 2.9, -3.5, 3.5, 0.2, frontOps, wallMats(4));
wallRun('x', -2.9, -3.5, 3.5, 0.2, backOps, wallMats(5));
wallRun('z', -3.4, -2.8, 2.8, 0.2, [], wallMats(1));
wallRun('z', 3.4, -2.8, 2.8, 0.2, [], wallMats(0));
wallRun('z', -0.75, -2.8, 2.8, 0.1, [{ a0: 1.75, a1: 2.65, y0: F, y1: F + 2.3 }], wallMats(-1));
wallRun('z', 0.75, -2.8, 2.8, 0.1, [{ a0: 1.75, a1: 2.65, y0: F, y1: F + 2.3 }], wallMats(-1));
wallRun('x', 0.25, -0.7, 0.7, 0.1, [{ a0: -0.4, a1: 0.4, y0: F, y1: F + 2.2 }], wallMats(-1));

// plinth, porch, floor
boxMM(-3.5, 3.5, 0, F, -3.0, 3.5, [M.plinth, M.plinth, M.stone, M.plinth, M.plinth, M.plinth], { uv: 0.6 });
boxMM(-0.8, 0.8, 0, 0.15, 3.5, 3.85, M.stone, { uv: 0.6 });
{
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 5.6), M.floor);
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, F + 0.002, 0); fl.receiveShadow = true;
  M.floor.map.repeat.set(6.6 / 2.4, 5.6 / 2.4); scene.add(fl);
}

// glazing
function glazing(axis, c, a0, a1, y0, y1, panes, glass = M.glass) {
  const f = 0.05, dd = 0.035;
  const B = (p0, p1, yy0, yy1, q0, q1, mat, o) => axis === 'x' ? boxMM(p0, p1, yy0, yy1, q0, q1, mat, o) : boxMM(q0, q1, yy0, yy1, p0, p1, mat, o);
  B(a0, a1, y1 - f, y1, c - dd, c + dd, M.alu); B(a0, a1, y0, y0 + f * 0.6, c - dd, c + dd, M.alu);
  B(a0, a0 + f, y0, y1, c - dd, c + dd, M.alu); B(a1 - f, a1, y0, y1, c - dd, c + dd, M.alu);
  for (let i = 1; i < panes; i++) { const m = a0 + (a1 - a0) * i / panes; B(m - f / 2, m + f / 2, y0, y1, c - dd, c + dd, M.alu); }
  B(a0 + f, a1 - f, y0 + f * 0.6, y1 - f, c - 0.004, c + 0.004, glass, { cast: false, receive: false });
}
glazing('x', 2.9, -3.1, -1.0, F, F + 2.4, 2);
glazing('x', 2.9, 1.0, 3.1, F, F + 2.4, 2);
glazing('x', -2.9, -3.0, -1.6, F + 0.9, F + 2.3, 2);
glazing('x', -2.9, 1.6, 3.0, F + 0.9, F + 2.3, 2);
glazing('x', -2.9, -0.3, 0.3, F + 1.9, F + 2.5, 1, M.glassFrost);

// vertical timber slats (merged)
function slats(along, a0, a1, d0, d1, yFn, mat, pitch = 0.075, sw = 0.05, parent = scene) {
  const geos = [], n = Math.floor((a1 - a0) / pitch), start = a0 + ((a1 - a0) - n * pitch) / 2 + pitch / 2;
  for (let i = 0; i < n; i++) {
    const c = start + i * pitch, [y0, y1] = yFn(c);
    if (y1 <= y0) continue;
    const g = along === 'x' ? worldBox(sw, y1 - y0, d1 - d0, 1.2) : worldBox(d1 - d0, y1 - y0, sw, 1.2);
    if (along === 'x') g.translate(c, (y0 + y1) / 2, (d0 + d1) / 2); else g.translate((d0 + d1) / 2, (y0 + y1) / 2, c);
    g.clearGroups(); geos.push(g);
  }
  const m = new THREE.Mesh(mergeGeometries(geos), mat); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}

// ---------------------------------------------------------------- front facade details
// timber cladding around the entrance
for (const [x0, x1, y0] of [[-0.62, -0.5, F], [0.5, 0.62, F], [-0.5, 0.5, F + 2.4]]) boxMM(x0, x1, y0, CEIL, 3.0, 3.01, M.dark, { cast: false });
{ // canopy spot over the entrance door
  const ds = new THREE.SpotLight(0xffc98a, 6, 6, 0.5, 0.8, 2); ds.position.set(0, CEIL - 0.05, 3.3); ds.target.position.set(0, F + 0.6, 2.95); scene.add(ds, ds.target);
  const ring = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), R(M.blackMetal)); ring.rotation.x = Math.PI / 2; ring.position.set(0, CEIL - 0.022, 3.3); roof.add(ring);
  const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.04, 20), R(M.bulb)); bulb.rotation.x = Math.PI / 2; bulb.position.set(0, CEIL - 0.024, 3.3); roof.add(bulb);
}
slats('x', -0.62, 0.62, 3.01, 3.035, (x) => Math.abs(x) < 0.5 ? [F + 2.4, CEIL] : [F, CEIL], M.slat);
// entrance door (pivot on the left jamb)
const entranceDoor = new THREE.Group(); entranceDoor.position.set(-0.5, 0, 2.93); scene.add(entranceDoor);
boxMM(0.005, 0.995, F, F + 2.39, -0.025, 0.025, M.woodDark, { parent: entranceDoor });
slats('x', 0.005, 0.995, 0.025, 0.045, () => [F + 0.01, F + 2.38], M.slat, 0.075, 0.05, entranceDoor);
boxMM(0.86, 0.885, F + 0.55, F + 1.95, 0.05, 0.08, M.blackMetal, { parent: entranceDoor });
boxMM(0.86, 0.885, F + 0.95, F + 1.0, -0.07, -0.025, M.blackMetal, { parent: entranceDoor });

// dark frame: side fins + roof slab / fascia
boxMM(-3.75, -3.5, 0, CEIL + ROOF_T, 2.2, 3.55, M.charcoal);
boxMM(3.5, 3.75, 0, CEIL + ROOF_T, 2.2, 3.55, M.charcoal);
boxMM(-3.75, 3.75, CEIL, CEIL + ROOF_T, -3.15, 3.55, [R(M.charcoal), R(M.charcoal), R(M.roofTop), R(M.charcoal), R(M.charcoal), R(M.charcoal)], { parent: roof });
boxMM(-3.5, 3.5, CEIL - 0.02, CEIL, 3.0, 3.55, R(M.slat), { parent: roof, uv: 1.2 });          // timber soffit
boxMM(-3.48, 3.48, CEIL - 0.04, CEIL - 0.02, 3.03, 3.06, R(M.led), { parent: roof, cast: false }); // hidden LED
{
  const ra = new THREE.RectAreaLight(0xffc68a, 4.5, 6.9, 0.12);
  ra.position.set(0, CEIL - 0.05, 3.1); ra.lookAt(0, 0, 2.55); scene.add(ra);
}
// interior ceiling
{
  const c = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 5.6), R(M.ceiling));
  c.rotation.x = Math.PI / 2; c.position.set(0, CEIL - 0.001, 0); c.receiveShadow = true; roof.add(c);
}

// wall sconces with up/down wash
const SCONCE_Y = F + 1.95;
for (const [x, p0, p1] of [[-3.3, -3.5, -3.1], [-0.81, -1.0, -0.62], [0.81, 0.62, 1.0], [3.3, 3.1, 3.5]]) {
  boxMM(x - 0.04, x + 0.04, SCONCE_Y - 0.13, SCONCE_Y + 0.13, 3.0, 3.09, M.charcoal);
  boxMM(x - 0.03, x + 0.03, SCONCE_Y + 0.13, SCONCE_Y + 0.135, 3.01, 3.08, M.ledHot, { cast: false });
  boxMM(x - 0.03, x + 0.03, SCONCE_Y - 0.135, SCONCE_Y - 0.13, 3.01, 3.08, M.ledHot, { cast: false });
  const pw = p1 - p0, ph = CEIL - F;
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({
    map: washTexture(pw, ph, x - p0, SCONCE_Y - F), color: new THREE.Color(0xffb766).multiplyScalar(1.2),
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
  wash.position.set((p0 + p1) / 2, (F + CEIL) / 2, 3.004); scene.add(wash);
}

// ---------------------------------------------------------------- interior helpers
function lamp(x, y, z) {
  cyl(0.055, 0.075, 0.26, M.ceramicBeige, x, y + 0.13, z);
  cyl(0.12, 0.15, 0.2, M.shade, x, y + 0.36, z, { open: true, cast: false });
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), M.bulb); b.position.set(x, y + 0.33, z); scene.add(b);
}
function curtain(x0, x1, z, y0, y1, folds) {
  const w = x1 - x0, g = new THREE.PlaneGeometry(w, y1 - y0, 40, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) / w + 0.5) * Math.PI * 2 * folds) * 0.035);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, M.curtain); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z); m.castShadow = false; m.receiveShadow = true; scene.add(m);
}
function downlight(x, z) {
  const ring = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), R(M.blackMetal)); ring.rotation.x = Math.PI / 2; ring.position.set(x, CEIL - 0.003, z); roof.add(ring);
  const d = new THREE.Mesh(new THREE.CircleGeometry(0.04, 20), R(M.bulb)); d.rotation.x = Math.PI / 2; d.position.set(x, CEIL - 0.005, z); roof.add(d);
}
function artPanel(axis, c, a0, a1, y0, y1, facePlus) {
  const art = std({ map: artTex, roughness: 0.9 });
  const mats = Array(6).fill(M.woodDark);
  if (axis === 'z') { mats[facePlus ? 0 : 1] = art; boxMM(c - 0.017, c + 0.017, y0, y1, a0, a1, mats, { uv: 0 }); }
  else { mats[facePlus ? 4 : 5] = art; boxMM(a0, a1, y0, y1, c - 0.017, c + 0.017, mats, { uv: 0 }); }
}

// ---------------------------------------------------------------- foliage
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color();
function foliage(clusters, count, size, hsl, parent = scene) {
  const geo = new THREE.PlaneGeometry(size * 0.5, size); geo.translate(0, size * 0.5, 0);
  const mesh = new THREE.InstancedMesh(geo, M.leaf, count);
  const tot = clusters.reduce((a, c) => a + c.r * c.r, 0);
  for (let i = 0; i < count; i++) {
    let pick = rnd() * tot, cl = clusters[0];
    for (const c of clusters) { pick -= c.r * c.r; if (pick <= 0) { cl = c; break; } }
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, sq = Math.sqrt(1 - u * u), rad = cl.r * Math.pow(rnd(), 0.3);
    _p.set(cl.x + sq * Math.cos(th) * rad, cl.y + u * rad * (cl.sy || 0.8), cl.z + sq * Math.sin(th) * rad);
    _e.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28); _q.setFromEuler(_e);
    const sc = rr(0.7, 1.3); _s.set(sc, sc, sc);
    _m.compose(_p, _q, _s); mesh.setMatrixAt(i, _m);
    _c.setHSL(hsl[0] + rr(-0.025, 0.025), clamp(hsl[1] + rr(-0.08, 0.08)), clamp(hsl[2] + rr(-0.07, 0.07)), THREE.SRGBColorSpace);
    mesh.setColorAt(i, _c);
  }
  mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function spiky(x, y, z, n, len, hsl) {
  const geo = new THREE.PlaneGeometry(len * 0.16, len); geo.translate(0, len / 2, 0);
  const mesh = new THREE.InstancedMesh(geo, M.leaf, n);
  for (let i = 0; i < n; i++) {
    _e.set(rr(0.25, 1.05), i / n * Math.PI * 2 + rr(-0.2, 0.2), 0, 'YXZ'); _q.setFromEuler(_e);
    const sc = rr(0.7, 1.1); _s.set(sc, sc, sc); _p.set(x, y, z);
    _m.compose(_p, _q, _s); mesh.setMatrixAt(i, _m);
    _c.setHSL(hsl[0] + rr(-0.02, 0.02), hsl[1], clamp(hsl[2] + rr(-0.05, 0.05)), THREE.SRGBColorSpace); mesh.setColorAt(i, _c);
  }
  mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
}
function shrub(x, z, r, n, hsl = [0.27, 0.5, 0.26], y0 = 0) {
  foliage([{ x, y: y0 + r * 0.75, z, r }, { x: x + r * 0.4, y: y0 + r * 0.6, z: z + r * 0.2, r: r * 0.7 }], n, 0.11, hsl);
}
function tree(x, z, h, spread, n, hsl) {
  const tr = cyl(0.06 * h / 3, 0.12 * h / 3, h * 0.7, M.trunk, x, h * 0.35, z, { seg: 10 });
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7 + rr(0, 0.5), b = cyl(0.025, 0.05, spread * 0.9, M.trunk, 0, 0, 0, { seg: 6 });
    b.position.set(x + Math.cos(a) * spread * 0.3, h * 0.62, z + Math.sin(a) * spread * 0.3);
    b.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8);
  }
  const cl = [{ x, y: h * 0.86, z, r: spread * 0.6 }];
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + rr(0, 0.6); cl.push({ x: x + Math.cos(a) * spread * 0.6, y: h * rr(0.68, 0.9), z: z + Math.sin(a) * spread * 0.6, r: spread * rr(0.38, 0.5) }); }
  foliage(cl, n, 0.17, hsl);
  return tr;
}
function olive(x, z) {
  cyl(0.24, 0.18, 0.62, M.pot, x, F + 0.31, z, { seg: 32 });
  cyl(0.215, 0.215, 0.02, M.mulch, x, F + 0.6, z);
  cyl(0.025, 0.04, 1.1, M.trunk, x, F + 1.1, z, { seg: 8 });
  foliage([{ x, y: F + 1.85, z, r: 0.36 }, { x: x + 0.18, y: F + 1.6, z: z + 0.08, r: 0.26 }, { x: x - 0.15, y: F + 1.65, z: z - 0.1, r: 0.26 }], 900, 0.075, [0.22, 0.22, 0.42]);
}

// ---------------------------------------------------------------- bedrooms
function bedroom(s) {           // s = -1 left (bedroom 1), +1 right (bedroom 2)
  const X = (u) => s * (3.3 - u);   // u = distance from the outside side wall
  const bx = (u0, u1, y0, y1, z0, z1, mat, o) => boxMM(Math.min(X(u0), X(u1)), Math.max(X(u0), X(u1)), y0, y1, z0, z1, mat, o);
  const zc = 0.0;   // bed: 1.80 x 2.00 m mattress
  bx(0.5, 2.38, F, F + 0.012, zc - 1.4, zc + 1.4, M.rug, { cast: false, uv: 0 });
  // upholstered channel headboard
  for (let i = 0; i < 5; i++) { const z0 = zc - 1.1 + i * 0.44; bx(0.0, 0.1, F + 0.32, F + 1.3, z0 + 0.008, z0 + 0.432, M.fabric, { r: 0.035 }); }
  // bed
  bx(0.25, 1.98, F, F + 0.1, zc - 0.8, zc + 0.8, M.dark);
  bx(0.1, 2.14, F + 0.1, F + 0.38, zc - 0.94, zc + 0.94, M.fabric, { r: 0.04 });
  bx(0.12, 2.12, F + 0.38, F + 0.6, zc - 0.9, zc + 0.9, M.linen, { r: 0.06 });
  bx(0.74, 2.16, F + 0.4, F + 0.665, zc - 0.96, zc + 0.96, M.linen, { r: 0.05 });
  bx(0.68, 0.88, F + 0.58, F + 0.7, zc - 0.95, zc + 0.95, M.linen, { r: 0.05 });
  bx(1.54, 2.2, F + 0.44, F + 0.715, zc - 1.0, zc + 1.0, M.olive, { r: 0.04 });
  for (const dz of [-0.45, 0.45]) { const p = rbox(0.16, 0.46, 0.7, 0.07, M.linen, X(0.3), F + 0.8, zc + dz); p.rotation.z = -s * 0.3; }
  for (const [du, dz, mat] of [[0.46, -0.34, M.olive], [0.46, 0.34, M.olive], [0.54, 0, M.sage]]) {
    const p = rbox(0.13, 0.36, mat === M.sage ? 0.42 : 0.5, 0.06, mat, X(du), F + 0.77, zc + dz); p.rotation.z = -s * 0.22;
  }
  // nightstands + lamps
  for (const sz of [-1, 1]) {
    const z0 = zc + sz * 1.4;
    bx(0.04, 0.5, F, F + 0.52, z0 - 0.24, z0 + 0.24, M.wood);
    bx(0.5, 0.506, F + 0.33, F + 0.336, z0 - 0.22, z0 + 0.22, M.dark, { cast: false });
    bx(0.5, 0.52, F + 0.42, F + 0.432, z0 - 0.08, z0 + 0.08, M.blackMetal);
    lamp(X(0.27), F + 0.52, z0);
    // timber slat panels flanking the bed + vertical LED
    const za = zc + sz * 1.12, zb = zc + sz * 1.8;
    bx(0, 0.01, F, CEIL, Math.min(za, zb), Math.max(za, zb), M.dark, { cast: false });
    slats('z', Math.min(za, zb), Math.max(za, zb), Math.min(X(0.01), X(0.035)), Math.max(X(0.01), X(0.035)), () => [F, CEIL], M.slat);
    bx(0.0, 0.03, F + 0.05, CEIL - 0.05, za - 0.008, za + 0.008, M.led, { cast: false });
  }
  artPanel('z', X(0.017), zc - 0.55, zc + 0.55, F + 1.45, F + 2.15, s < 0);
  const lampLight = new THREE.PointLight(0xffb469, 2.6, 5, 2); lampLight.position.set(X(1.25), F + 1.85, zc); scene.add(lampLight);
  // built-in wardrobe on the bathroom-side wall
  bx(1.9, 2.5, F, CEIL, -2.8, -1.15, M.wood, { uv: 1.3 });
  for (const zg of [-2.25, -1.7]) bx(1.896, 1.903, F + 0.02, CEIL - 0.02, zg - 0.004, zg + 0.004, M.dark, { cast: false });
  bx(1.896, 1.903, CEIL - 0.46, CEIL - 0.45, -2.78, -1.17, M.dark, { cast: false });
  for (const zh of [-2.31, -2.19, -1.66]) bx(1.86, 1.876, F + 0.85, F + 1.75, zh - 0.01, zh + 0.01, M.blackMetal);
  bx(1.88, 1.9, F + 0.02, CEIL - 0.05, -1.162, -1.15, M.led, { cast: false });
  // dressing desk + mirror + chair
  bx(0.0, 0.46, F + 0.74, F + 0.78, 1.75, 2.62, M.wood);
  bx(0.02, 0.44, F + 0.6, F + 0.74, 1.8, 2.57, M.wood);
  bx(0.44, 0.446, F + 0.665, F + 0.672, 1.82, 2.55, M.dark, { cast: false });
  for (const z of [1.78, 2.59]) bx(0.4, 0.43, F, F + 0.6, z - 0.015, z + 0.015, M.blackMetal);
  bx(0.0, 0.015, F + 1.03, F + 1.97, 1.9, 2.5, M.blackMetal);
  mirrors.push([bx(0.0, 0.02, F + 1.05, F + 1.95, 1.92, 2.48, M.mirror), -s]);
  cyl(0.045, 0.06, 0.2, M.ceramicBeige, X(0.2), F + 0.88, 2.5);
  bx(0.56, 1.0, F + 0.44, F + 0.52, 1.97, 2.41, M.fabric, { r: 0.03 });
  bx(0.95, 1.02, F + 0.5, F + 0.95, 1.99, 2.39, M.fabric, { r: 0.03 });
  for (const u of [0.6, 0.96]) for (const z of [2.01, 2.37]) bx(u - 0.012, u + 0.012, F, F + 0.44, z - 0.012, z + 0.012, M.blackMetal);
  // curtains + pelmet
  curtain(Math.min(X(0.05), X(0.6)), Math.max(X(0.05), X(0.6)), 2.72, F + 0.01, CEIL - 0.12, 4);
  curtain(Math.min(X(1.85), X(2.42)), Math.max(X(1.85), X(2.42)), 2.72, F + 0.01, CEIL - 0.12, 4);
  curtain(Math.min(X(0.08), X(0.5)), Math.max(X(0.08), X(0.5)), -2.72, F + 0.01, CEIL - 0.12, 3);
  bx(0.0, 2.5, CEIL - 0.12, CEIL, 2.62, 2.8, R(M.ceiling), { parent: roof });
  bx(0.0, 1.9, CEIL - 0.12, CEIL, -2.8, -2.62, R(M.ceiling), { parent: roof });
  // corner plant
  cyl(0.17, 0.13, 0.42, M.potLight, X(0.3), F + 0.21, -2.45, { seg: 28 });
  foliage([{ x: X(0.3), y: F + 0.95, z: -2.45, r: 0.32 }, { x: X(0.36), y: F + 1.3, z: -2.4, r: 0.22 }], 260, 0.16, [0.28, 0.45, 0.28]);
  // ceiling: cove LED line + downlights
  bx(0.05, 2.45, CEIL - 0.13, CEIL - 0.12, 2.6, 2.62, R(M.led), { parent: roof, cast: false });
  bx(0.04, 0.06, CEIL - 0.05, CEIL - 0.03, -2.6, 2.6, R(M.led), { parent: roof, cast: false });
  bx(2.44, 2.46, CEIL - 0.05, CEIL - 0.03, -1.1, 2.6, R(M.led), { parent: roof, cast: false });
  for (const u of [0.8, 1.6]) for (const z of [-1.9, 1.9]) downlight(X(u), z);
  // key light with shadows
  const sp = new THREE.SpotLight(0xffc98a, 20, 0, 1.2, 0.9, 2);
  sp.position.set(X(1.3), CEIL - 0.06, 0.0); sp.target.position.set(X(1.15), F, 0.1);
  sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0006; sp.shadow.normalBias = 0.01;
  sp.shadow.camera.near = 0.1; sp.shadow.camera.far = 7;
  scene.add(sp, sp.target);
  // bedroom door (closed) with lever on both sides
  boxMM(s * 0.75 - 0.02, s * 0.75 + 0.02, F, F + 2.29, 1.755, 2.645, M.wood);
  for (const side of [-1, 1]) { const a = s * 0.75 + side * 0.02, b = s * 0.75 + side * 0.05; boxMM(Math.min(a, b), Math.max(a, b), F + 1.0, F + 1.02, 1.82, 1.96, M.blackMetal); }
}
bedroom(-1);
bedroom(1);

// ---------------------------------------------------------------- bathroom
{
  boxMM(-0.7, 0.7, F, F + 0.008, -2.8, 0.2, M.marbleFloor, { cast: false, uv: 1.4 });
  const mb = (x0, x1, y0, y1, z0, z1) => boxMM(x0, x1, y0, y1, z0, z1, M.marble, { uv: 1.6, cast: false });
  mb(-0.7, -0.69, F, CEIL, -2.79, 0.19); mb(0.69, 0.7, F, CEIL, -2.79, 0.19);
  mb(-0.7, 0.7, F, F + 1.9, -2.8, -2.79); mb(-0.7, 0.7, F + 2.5, CEIL, -2.8, -2.79);
  mb(-0.7, -0.3, F + 1.9, F + 2.5, -2.8, -2.79); mb(0.3, 0.7, F + 1.9, F + 2.5, -2.8, -2.79);
  mb(-0.7, -0.4, F, CEIL, 0.19, 0.2); mb(0.4, 0.7, F, CEIL, 0.19, 0.2); mb(-0.4, 0.4, F + 2.2, CEIL, 0.19, 0.2);
  // walk-in shower
  boxMM(-0.69, 0.05, F + 0.02, F + 2.05, -1.856, -1.848, M.glassClear, { cast: false, receive: false });
  boxMM(-0.69, 0.06, F + 2.05, F + 2.07, -1.862, -1.842, M.blackMetal);
  boxMM(0.04, 0.06, F + 0.02, F + 2.07, -1.862, -1.842, M.blackMetal);
  boxMM(-0.6, 0.6, F + 0.008, F + 0.011, -2.72, -2.69, M.blackMetal, { cast: false });
  boxMM(-0.012, 0.012, F + 2.2, F + 2.22, -2.79, -2.35, M.blackMetal);
  boxMM(-0.15, 0.15, F + 2.18, F + 2.2, -2.5, -2.2, M.blackMetal);
  { const pl = cyl(0.07, 0.07, 0.012, M.blackMetal, 0.3, F + 1.1, -2.783); pl.rotation.x = Math.PI / 2; }
  boxMM(0.29, 0.31, F + 1.1, F + 1.12, -2.78, -2.7, M.blackMetal);
  boxMM(-0.46, -0.44, F + 0.9, F + 1.9, -2.79, -2.77, M.blackMetal);
  // niche shelf with LED
  boxMM(-0.69, -0.6, F + 1.0, F + 1.02, -2.62, -2.05, M.stoneWhite);
  boxMM(-0.69, -0.6, F + 1.55, F + 1.57, -2.62, -2.05, M.stoneWhite);
  boxMM(-0.69, -0.61, F + 1.545, F + 1.55, -2.6, -2.07, M.led, { cast: false });
  cyl(0.03, 0.03, 0.2, M.ceramicBeige, -0.65, F + 1.12, -2.4); cyl(0.028, 0.028, 0.16, M.dark, -0.65, F + 1.1, -2.28);
  // wall-hung WC
  rbox(0.55, 0.32, 0.37, 0.12, M.ceramic, 0.42, F + 0.42, -1.35);
  rbox(0.5, 0.035, 0.36, 0.015, M.ceramic, 0.43, F + 0.6, -1.35);
  boxMM(0.68, 0.69, F + 0.98, F + 1.14, -1.46, -1.24, M.blackMetal);
  // floating vanity, vessel basin, backlit mirror
  boxMM(0.25, 0.69, F + 0.38, F + 0.8, -0.85, 0.12, M.wood, { uv: 1 });
  boxMM(0.246, 0.252, F + 0.585, F + 0.595, -0.83, 0.1, M.dark, { cast: false });
  boxMM(0.23, 0.69, F + 0.8, F + 0.84, -0.87, 0.14, M.stoneWhite);
  {
    const pts = [[0, 0], [0.15, 0], [0.19, 0.03], [0.205, 0.13], [0.19, 0.13], [0.175, 0.04], [0.14, 0.02], [0, 0.02]].map(([a, b]) => new THREE.Vector2(a, b));
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), M.ceramic); bowl.position.set(0.46, F + 0.84, -0.37); bowl.castShadow = bowl.receiveShadow = true; scene.add(bowl);
  }
  boxMM(0.56, 0.69, F + 1.06, F + 1.08, -0.385, -0.355, M.blackMetal);
  boxMM(0.675, 0.69, F + 1.12, F + 1.16, -0.25, -0.22, M.blackMetal);
  boxMM(0.27, 0.67, F + 0.372, F + 0.378, -0.83, 0.1, M.led, { cast: false });
  groundGlow(0.5, F + 0.012, -0.36, 1.2, 0xffb766, 0.6);
  boxMM(0.682, 0.69, F + 1.17, F + 2.13, -0.78, 0.05, M.ledHot, { cast: false });
  mirrors.push([boxMM(0.672, 0.684, F + 1.2, F + 2.1, -0.75, 0.02, M.mirror), -1]);
  cyl(0.06, 0.05, 0.12, M.potLight, 0.33, F + 0.9, 0.0);
  foliage([{ x: 0.33, y: F + 1.06, z: 0.0, r: 0.1 }], 70, 0.07, [0.29, 0.45, 0.3]);
  // towel
  boxMM(-0.69, -0.63, F + 1.44, F + 1.46, -1.08, -0.62, M.blackMetal);
  rbox(0.035, 0.56, 0.38, 0.012, M.towel, -0.655, F + 1.17, -0.85);
  // bathroom door (open into the bathroom)
  const bd = new THREE.Group(); bd.position.set(-0.4, 0, 0.25); bd.rotation.y = -1.4; scene.add(bd);
  boxMM(0.005, 0.795, F, F + 2.19, -0.02, 0.02, M.wood, { parent: bd });
  boxMM(0.68, 0.76, F + 1.0, F + 1.02, 0.02, 0.05, M.blackMetal, { parent: bd });
  boxMM(0.68, 0.76, F + 1.0, F + 1.02, -0.05, -0.02, M.blackMetal, { parent: bd });
  // light
  for (const z of [-2.35, -1.3, -0.35]) downlight(0, z);
  const bl = new THREE.PointLight(0xffd2a0, 4.5, 4.5, 2); bl.position.set(0, CEIL - 0.3, -1.25); scene.add(bl);
}

// ---------------------------------------------------------------- entrance corridor
{
  boxMM(-0.42, 0.42, F, F + 0.01, 0.5, 2.6, M.rug, { cast: false, uv: 0 });
  artPanel('z', -0.683, 1.12, 1.66, F + 1.2, F + 1.9, true);
  boxMM(0.42, 0.7, F + 0.78, F + 0.82, 0.55, 1.45, M.wood);
  boxMM(0.42, 0.7, F + 0.775, F + 0.78, 0.6, 1.4, M.led, { cast: false });
  cyl(0.05, 0.07, 0.26, M.ceramicBeige, 0.56, F + 0.95, 0.75);
  { const mr = cyl(0.3, 0.3, 0.012, M.mirror, 0.69, F + 1.55, 1.0, { seg: 48 }); mr.rotation.z = Math.PI / 2; mirrors.push([mr, -1]);
    const rg = cyl(0.315, 0.315, 0.008, M.blackMetal, 0.696, F + 1.55, 1.0, { seg: 48 }); rg.rotation.z = Math.PI / 2; }
  for (const z of [0.9, 2.2]) downlight(0, z);
  const cl = new THREE.PointLight(0xffcf96, 3.2, 4.5, 2); cl.position.set(0, CEIL - 0.3, 1.5); scene.add(cl);
}

// ---------------------------------------------------------------- garden
{
  const g = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), M.grass);
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true; M.grass.map.repeat.set(55, 55); scene.add(g);
  for (let z = 4.0; z < 11; z += 0.8) boxMM(-0.6, 0.6, -0.01, 0.025, z, z + 0.62, M.stone, { cast: false, uv: 0 });
  for (const s of [-1, 1]) {
    boxMM(Math.min(s * 0.95, s * 3.75), Math.max(s * 0.95, s * 3.75), -0.01, 0.02, 3.55, 4.4, M.mulch, { cast: false });
    shrub(s * 1.35, 3.95, 0.32, 260);
    spiky(s * 2.05, 0.02, 3.95, 18, 0.65, [0.3, 0.45, 0.3]);
    shrub(s * 2.75, 3.98, 0.36, 300, [0.25, 0.55, 0.24]);
    spiky(s * 3.45, 0.02, 3.9, 22, 0.9, [0.28, 0.5, 0.26]);
    olive(s * 0.8, 3.27);
    // path bollards
    for (const z of [5.0, 6.9, 8.8]) {
      cyl(0.045, 0.045, 0.45, M.charcoal, s * 0.95, 0.225, z, { seg: 12 });
      cyl(0.04, 0.04, 0.03, M.ledHot, s * 0.95, 0.43, z, { seg: 12, cast: false });
      groundGlow(s * 0.95, 0.03, z, 1.4, 0xffb766, 0.55);
    }
  }
  // garden trees with up-lights
  const trees = [[-5.3, 3.6, 4.6, 1.5, 3200, [0.24, 0.42, 0.24]], [5.5, 1.8, 4.3, 1.4, 3000, [0.26, 0.45, 0.22]],
    [-3.2, -6.6, 5.0, 1.6, 2400, [0.27, 0.4, 0.2]], [3.8, -6.2, 4.4, 1.4, 2000, [0.25, 0.42, 0.2]]];
  for (const [x, z, h, sp, n, hsl] of trees) {
    tree(x, z, h, sp, n, hsl);
    cyl(0.07, 0.07, 0.03, M.ledHot, x + 0.35, 0.02, z + 0.35, { cast: false });
    groundGlow(x + 0.35, 0.03, z + 0.35, 1.6, 0xffb766, 0.5);
    if (z > 0) {
      const tl = new THREE.SpotLight(0xffcf96, 10, 9, 0.55, 0.7, 2);
      tl.position.set(x + 0.4, 0.1, z + 0.5); tl.target.position.set(x, h * 0.8, z); scene.add(tl, tl.target);
    }
  }
  // corner shrubs (as in the plan)
  shrub(-4.3, 3.0, 0.45, 380); shrub(4.3, 3.2, 0.42, 360); shrub(-4.2, -3.4, 0.5, 400); shrub(4.3, -3.3, 0.5, 400);
  spiky(-4.3, 0.02, 1.5, 22, 1.0, [0.28, 0.5, 0.25]); spiky(4.3, 0.02, -1.0, 22, 1.0, [0.28, 0.5, 0.25]);
  // boundary walls + hedge + wall washes
  boxMM(-12, 12, 0, 2.2, -10.3, -10.0, M.boundary, { uv: 2 });
  boxMM(-12.3, -12, 0, 2.2, -10.3, 7, M.boundary, { uv: 2 });
  boxMM(12, 12.3, 0, 2.2, -10.3, 7, M.boundary, { uv: 2 });
  boxMM(-11.9, 11.9, 0, 1.2, -9.95, -9.35, M.hedge, { uv: 1.5 });
  for (let x = -10.5; x <= 10.5; x += 3) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), new THREE.MeshBasicMaterial({ map: coneTex, color: new THREE.Color(0xffbe78).multiplyScalar(0.8), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    w.position.set(x, 1.1, -9.33); scene.add(w);
  }
  // distant tree silhouettes
  const silMat = new THREE.MeshLambertMaterial({ color: 0x0b120d });
  for (let i = 0; i < 46; i++) {
    const a = i / 46 * Math.PI * 2 + rr(-0.05, 0.05), d = rr(28, 42), h = rr(5, 11);
    const m = new THREE.Mesh(i % 3 ? new THREE.SphereGeometry(h * 0.35, 10, 8) : new THREE.ConeGeometry(h * 0.3, h, 10), silMat);
    m.position.set(Math.cos(a) * d, i % 3 ? h * 0.55 : h * 0.5, Math.sin(a) * d); scene.add(m);
  }
  // stars
  const sp = []; for (let i = 0; i < 1400; i++) { const th = rnd() * 6.28, y = rr(0.12, 1), r = Math.sqrt(1 - y * y); sp.push(Math.cos(th) * r * 180, y * 180, Math.sin(th) * r * 180); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));
}

// ---------------------------------------------------------------- night lighting
scene.add(new THREE.HemisphereLight(0x2a3b66, 0x0c0e12, 0.45));
const moon = new THREE.DirectionalLight(0x9fb4e6, 0.5);
moon.position.set(-12, 18, -10); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 60 });
moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.02;
scene.add(moon);

// ---------------------------------------------------------------- tour timeline
function track(keys) {     // Hermite spline through [t, px,py,pz, tx,ty,tz] keys (C1, eased ends)
  const n = keys.length;
  const tg = keys.map((k, i) => (i === 0 || i === n - 1) ? k.map(() => 0) : k.map((_, j) => j === 0 ? 0 : (keys[i + 1][j] - keys[i - 1][j]) / (keys[i + 1][0] - keys[i - 1][0])));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const a = keys[i], b = keys[i + 1], dt = b[0] - a[0], s = (t - a[0]) / dt, s2 = s * s, s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
    const o = []; for (let j = 1; j < a.length; j++) o.push(h00 * a[j] + h10 * dt * tg[i][j] + h01 * b[j] + h11 * dt * tg[i + 1][j]);
    return o;
  };
}
const lin = (t0, t1, a, b) => (t) => { const u = ease((t - t0) / (t1 - t0)); return a.map((v, i) => v + (b[i] - v) * u); };
const AREAS = [   // clear interior areas as modelled
  ['غرفة نوم 1', '2.50 × 5.60 م', '14.00 م²'],
  ['غرفة نوم 2', '2.50 × 5.60 م', '14.00 م²'],
  ['دورة المياه', '1.40 × 3.00 م', '4.20 م²'],
  ['الممر', '1.40 × 2.50 م', '3.50 م²'],
];
const XF = 0.45;   // half cross-fade
const E = F + 1.5; // eye height inside
const shots = [
  { name: 'ext', t0: 0, t1: 28, fov: 50, cam: track([
      [0, -8.5, 1.5, 15.5, 0.3, 1.9, 2.5],
      [3.5, -5.6, 1.6, 11.2, 0.2, 1.85, 2.6],
      [7.0, -2.4, 1.6, 8.2, 0.0, 1.75, 2.8],
      [10.5, 4.2, 2.6, 8.8, 0.0, 1.6, 1.5],
      [14.0, 9.6, 6.0, 5.4, 0.0, 1.0, 0.0],
      [17.5, 6.8, 11.0, 6.4, 0.0, 0.5, 0.0],
      [21.0, 0.4, 13.8, 5.2, 0.0, 0.3, 0.3],
      [24.6, -7.8, 10.4, 3.2, 0.0, 0.3, 0.0],
      [28.45, -6.8, 8.6, -7.0, 0.0, 0.5, 0.0]]),
    state: (t) => ({ roof: smooth(12.8, 16.0, t), door: 0, labels: smooth(16.6, 17.6, t) * (1 - smooth(26.4, 27.3, t)) }) },
  { name: 'corridor', t0: 28, t1: 32.4, fov: 60, cam: lin(28 - XF, 32.4 + XF, [0, E + 0.05, 5.6, 0, E, 2.0], [0, E, 0.95, 0, F + 1.1, -2.5]),
    state: (t) => ({ roof: 0, door: ease((t - 28.1) / 1.6) * 1.5, labels: 0 }), cap: ['المدخل والممر', 'المساحة 3.50 م²  •  1.40 × 2.50 م', 'باب خشبي 1.00 × 2.40 م'] },
  { name: 'bed1', t0: 32.4, t1: 37.2, fov: 62, cam: lin(32.4 - XF, 37.2 + XF, [-0.9, E - 0.1, 0.95, -3.3, F + 1.0, 0.0], [-0.9, E - 0.05, -0.65, -3.3, F + 1.05, 0.0]),
    state: () => ({ roof: 0, door: 0, labels: 0 }), cap: ['غرفة نوم 1', 'المساحة 14.00 م²  •  2.50 × 5.60 م', 'سرير 1.80 × 2.00 م • خزانة مدمجة • مكتب تسريحة'] },
  { name: 'bath', t0: 37.2, t1: 41.6, fov: 64, cam: lin(37.2 - XF, 41.6 + XF, [0.02, E, 0.75, 0.3, F + 1.0, -2.6], [0.0, E, -0.15, 0.42, F + 1.05, -2.3]),
    state: () => ({ roof: 0, door: 0, labels: 0 }), cap: ['دورة المياه', 'المساحة 4.20 م²  •  1.40 × 3.00 م', 'دش زجاجي • كرسي معلق • مغسلة بكونتر'] },
  { name: 'bed2', t0: 41.6, t1: 46.0, fov: 62, cam: lin(41.6 - XF, 46.0 + XF, [1.05, E + 0.05, 2.45, 2.4, F + 0.9, -0.9], [1.15, E, 2.2, 2.9, F + 0.9, 0.0]),
    state: () => ({ roof: 0, door: 0, labels: 0 }), cap: ['غرفة نوم 2', 'المساحة 14.00 م²  •  2.50 × 5.60 م', 'سرير 1.80 × 2.00 م • إضاءة مخفية LED • سبوت'] },
  { name: 'final', t0: 46.0, t1: DURATION, fov: 50, cam: lin(46.0 - XF, DURATION, [-5.2, 1.75, 8.6, 0.1, 1.75, 2.2], [-9.8, 3.9, 15.8, 0.6, 1.9, 1.4]),
    state: () => ({ roof: 0, door: 0, labels: 0 }) },
];

let lastStateKey = '';
function applyState(st) {
  const L = ease(st.roof);
  roof.visible = L < 0.995;
  roof.position.y = L * 2.2;
  for (const m of roofMats.values()) m.opacity = m.userData.baseOpacity * (1 - L);
  entranceDoor.rotation.y = st.door;
  const key = st.roof.toFixed(3) + '|' + st.door.toFixed(3);
  if (key !== lastStateKey) { renderer.shadowMap.needsUpdate = true; lastStateKey = key; }
}
function renderShot(shot, t) {
  const c = shot.cam(t);
  camera.position.set(c[0], c[1], c[2]); camera.lookAt(c[3], c[4], c[5]);
  camera.fov = shot.fov; camera.updateProjectionMatrix();
  const st = shot.state(t); applyState(st);
  composer.render();
  return st;
}

// ---------------------------------------------------------------- 2D overlay
const out = document.getElementById('out'); out.width = W; out.height = H;
const ctx = out.getContext('2d');
const K = H / 720;
const GOLD = '#d4ae74';
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function caption(title, sub, a, sub2) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl';
  ctx.font = `700 ${30 * K}px Cairo`; const tw = ctx.measureText(title).width;
  ctx.font = `700 ${19 * K}px Cairo`; const sw = sub ? ctx.measureText(sub).width : 0;
  ctx.font = `400 ${16 * K}px Cairo`; const sw2 = sub2 ? ctx.measureText(sub2).width : 0;
  const bw = Math.max(tw, sw, sw2) + 64 * K, bh = (sub ? (sub2 ? 126 : 98) : 66) * K, x1 = W - 46 * K + (1 - a) * 24 * K, x0 = x1 - bw, y0 = H - 54 * K - bh;
  ctx.fillStyle = 'rgba(18,14,10,0.62)'; rrect(x0, y0, bw, bh, 10 * K); ctx.fill();
  ctx.fillStyle = GOLD; ctx.fillRect(x1 - 6 * K, y0 + 14 * K, 4 * K, bh - 28 * K);
  ctx.textAlign = 'right'; ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${30 * K}px Cairo`;
  ctx.fillText(title, x1 - 26 * K, y0 + 44 * K);
  if (sub) { ctx.fillStyle = sub2 ? GOLD : '#e2cfae'; ctx.font = `${sub2 ? 700 : 400} ${19 * K}px Cairo`; ctx.fillText(sub, x1 - 26 * K, y0 + 78 * K); }
  if (sub2) { ctx.fillStyle = '#d8c7aa'; ctx.font = `400 ${16 * K}px Cairo`; ctx.fillText(sub2, x1 - 26 * K, y0 + 106 * K); }
  ctx.restore();
}
function titleCard(a) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl'; ctx.textAlign = 'center';
  const gr = ctx.createLinearGradient(0, 0, 0, H * 0.5); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H * 0.5);
  ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${66 * K}px Cairo`; ctx.fillText('تصميم تفصيلي', W / 2, 118 * K);
  ctx.fillStyle = GOLD; ctx.fillRect(W / 2 - 70 * K, 140 * K, 140 * K, 3 * K);
  ctx.fillStyle = '#efe0c6'; ctx.font = `400 ${32 * K}px Cairo`; ctx.fillText('غرفتين نوم + دورة مياه', W / 2, 190 * K);
  ctx.restore();
}
function endCard(a) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl'; ctx.textAlign = 'center';
  let gr = ctx.createLinearGradient(0, 0, 0, H * 0.4); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H * 0.4);
  gr = ctx.createLinearGradient(0, H * 0.6, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = gr; ctx.fillRect(0, H * 0.6, W, H * 0.4);
  ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${56 * K}px Cairo`; ctx.fillText('تصميم تفصيلي', W / 2, 100 * K);
  ctx.fillStyle = GOLD; ctx.fillRect(W / 2 - 60 * K, 120 * K, 120 * K, 3 * K);
  ctx.fillStyle = '#efe0c6'; ctx.font = `400 ${28 * K}px Cairo`; ctx.fillText('غرفتين نوم + دورة مياه', W / 2, 164 * K);
  ctx.fillStyle = '#e6d3b2'; ctx.font = `700 ${20 * K}px Cairo`;
  ctx.fillText(AREAS.map(([n, , a]) => `${n}: ${a}`).join('   •   '), W / 2, 210 * K);
  const items = [['الطول', '7.00 م'], ['العرض', '6.00 م'], ['المساحة الإجمالية', '42.00 م²'], ['ارتفاع السقف', '3.00 م']];
  const bw = 190 * K, gap = 16 * K, total = items.length * bw + (items.length - 1) * gap, y = H - 140 * K;
  items.forEach(([k, v], i) => {
    const x = W / 2 + total / 2 - bw - i * (bw + gap);
    ctx.fillStyle = 'rgba(30,24,18,0.72)'; rrect(x, y, bw, 96 * K, 10 * K); ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5 * K; ctx.stroke();
    ctx.fillStyle = '#d9c6a6'; ctx.font = `400 ${19 * K}px Cairo`; ctx.fillText(k, x + bw / 2, y + 36 * K);
    ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${28 * K}px Cairo`; ctx.fillText(v, x + bw / 2, y + 74 * K);
  });
  ctx.restore();
}
const _v = new THREE.Vector3();
function project(x, y, z) { _v.set(x, y, z).project(camera); return [(_v.x * 0.5 + 0.5) * W, (-_v.y * 0.5 + 0.5) * H, _v.z]; }
function areaTable(a) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl';
  const pw = 330 * K, rowH = 34 * K, x0 = 40 * K - (1 - a) * 24 * K, x1 = x0 + pw, y0 = 40 * K;
  const rows = AREAS.length, ph = 62 * K + rows * rowH + 92 * K;
  ctx.fillStyle = 'rgba(18,14,10,0.7)'; rrect(x0, y0, pw, ph, 12 * K); ctx.fill();
  ctx.fillStyle = GOLD; ctx.fillRect(x1 - 6 * K, y0 + 14 * K, 4 * K, ph - 28 * K);
  ctx.textAlign = 'right'; ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${23 * K}px Cairo`;
  ctx.fillText('جدول المساحات', x1 - 24 * K, y0 + 38 * K);
  let y = y0 + 62 * K;
  for (const [name, dims, area] of AREAS) {
    ctx.textAlign = 'right'; ctx.fillStyle = '#efe3cf'; ctx.font = `700 ${17 * K}px Cairo`; ctx.fillText(name, x1 - 24 * K, y + 22 * K);
    ctx.textAlign = 'center'; ctx.fillStyle = '#b9a88c'; ctx.font = `400 ${14 * K}px Cairo`; ctx.fillText(dims, x0 + pw * 0.47, y + 21 * K);
    ctx.textAlign = 'left'; ctx.fillStyle = GOLD; ctx.font = `700 ${17 * K}px Cairo`; ctx.fillText(area, x0 + 18 * K, y + 22 * K);
    ctx.fillStyle = 'rgba(212,174,116,0.18)'; ctx.fillRect(x0 + 18 * K, y + rowH - 1, pw - 48 * K, 1);
    y += rowH;
  }
  y += 10 * K;
  for (const [name, area, big] of [['المساحة الصافية للغرف', '35.70 م²', false], ['المساحة الإجمالية للمبنى', '42.00 م²', true]]) {
    ctx.textAlign = 'right'; ctx.fillStyle = big ? '#fbf3e6' : '#d8c7aa'; ctx.font = `700 ${(big ? 17 : 15) * K}px Cairo`; ctx.fillText(name, x1 - 24 * K, y + 22 * K);
    ctx.textAlign = 'left'; ctx.fillStyle = big ? '#fbf3e6' : GOLD; ctx.font = `700 ${(big ? 19 : 16) * K}px Cairo`; ctx.fillText(area, x0 + 18 * K, y + 22 * K);
    y += 36 * K;
  }
  ctx.restore();
}
let dimsAlpha = 0;
function planLabels(a) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl'; ctx.textAlign = 'center';
  const labels = [['غرفة نوم 1', '14.00 م²', -2.05, 2.05], ['دورة مياه', '4.20 م²', 0, -1.1], ['ممر', '3.50 م²', 0, 1.6], ['غرفة نوم 2', '14.00 م²', 2.05, 2.05]];
  for (const [txt, area, x, z] of labels) {
    const [sx, sy, sz] = project(x, CEIL + 0.25, z); if (sz > 1) continue;
    const small = txt === 'ممر', f1 = (small ? 15 : 19) * K, f2 = (small ? 14 : 17) * K;
    ctx.font = `700 ${f1}px Cairo`; const w1 = ctx.measureText(txt).width;
    ctx.font = `700 ${f2}px Cairo`; const w2 = ctx.measureText(area).width;
    const w = Math.max(w1, w2) + 28 * K, h = (small ? 50 : 58) * K;
    ctx.fillStyle = 'rgba(18,14,10,0.76)'; rrect(sx - w / 2, sy - h / 2, w, h, 14 * K); ctx.fill();
    ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${f1}px Cairo`; ctx.fillText(txt, sx, sy - (small ? 3 : 4) * K);
    ctx.fillStyle = GOLD; ctx.font = `700 ${f2}px Cairo`; ctx.fillText(area, sx, sy + (small ? 17 : 20) * K);
  }
  const dim = (p0, p1, txt) => {
    const a0 = project(...p0), a1 = project(...p1); if (a0[2] > 1 || a1[2] > 1) return;
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2 * K; ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke();
    const ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]) + Math.PI / 2, tl = 9 * K;
    for (const q of [a0, a1]) { ctx.beginPath(); ctx.moveTo(q[0] - Math.cos(ang) * tl, q[1] - Math.sin(ang) * tl); ctx.lineTo(q[0] + Math.cos(ang) * tl, q[1] + Math.sin(ang) * tl); ctx.stroke(); }
    const mx = (a0[0] + a1[0]) / 2, my = (a0[1] + a1[1]) / 2;
    ctx.font = `700 ${17 * K}px Cairo`; const w = ctx.measureText(txt).width + 20 * K;
    ctx.fillStyle = 'rgba(18,14,10,0.8)'; rrect(mx - w / 2, my - 14 * K, w, 28 * K, 6 * K); ctx.fill();
    ctx.fillStyle = GOLD; ctx.fillText(txt, mx, my + 6 * K);
  };
  ctx.globalAlpha = a * dimsAlpha;
  if (dimsAlpha > 0.001) { dim([-3.5, 0.05, 4.9], [3.5, 0.05, 4.9], '7.00 م'); dim([4.6, 0.05, -3.0], [4.6, 0.05, 3.0], '6.00 م'); }
  ctx.restore();
}
function overlays(t, shot, w) {
  if (shot.name === 'ext') {
    titleCard(w * smooth(0.6, 1.6, t) * (1 - smooth(5.2, 6.2, t)));
    caption('الواجهة الأمامية', 'إضاءة جدارية دافئة • واجهات زجاجية • خشب شرائح', w * smooth(7.2, 7.8, t) * (1 - smooth(12.2, 12.8, t)));
    dimsAlpha = 1 - smooth(22.6, 23.4, t);
    areaTable(w * smooth(17.4, 18.2, t) * (1 - smooth(26.4, 27.1, t)));
    planLabels(w * shot.state(t).labels);
    caption('المسقط ثلاثي الأبعاد', '7.00 × 6.00 م  •  المساحة 42 م²', w * smooth(17.0, 17.6, t) * (1 - smooth(26.2, 26.8, t)));
  } else if (shot.cap) {
    caption(shot.cap[0], shot.cap[1], w * smooth(shot.t0 + 0.4, shot.t0 + 0.9, t) * (1 - smooth(shot.t1 - 0.7, shot.t1 - 0.25, t)), shot.cap[2]);
  } else if (shot.name === 'final') {
    endCard(w * smooth(47.4, 48.6, t));
  }
}

function frame(t) {
  let i = shots.findIndex((s) => t >= s.t0 && t < s.t1); if (i < 0) i = shots.length - 1;
  let A = shots[i], B = null, a = 0;
  if (i + 1 < shots.length && t > A.t1 - XF) { B = shots[i + 1]; a = smooth(A.t1 - XF, A.t1 + XF, t); }
  else if (i > 0 && t < A.t0 + XF) { B = A; A = shots[i - 1]; a = smooth(B.t0 - XF, B.t0 + XF, t); }
  renderShot(A, t); ctx.globalAlpha = 1; ctx.drawImage(renderer.domElement, 0, 0);
  if (B) { renderShot(B, t); ctx.globalAlpha = a; ctx.drawImage(renderer.domElement, 0, 0); ctx.globalAlpha = 1; }
  // overlays need the camera of each shot: re-pose camera without rendering
  const pose = (s) => { const c = s.cam(t); camera.position.set(c[0], c[1], c[2]); camera.lookAt(c[3], c[4], c[5]); camera.fov = s.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); };
  pose(A); overlays(t, A, B ? 1 - a : 1);
  if (B) { pose(B); overlays(t, B, a); }
  const fade = smooth(0, 1.0, t) * (1 - smooth(DURATION - 1.2, DURATION, t));
  if (fade < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fade})`; ctx.fillRect(0, 0, W, H); }
}

window.renderFrame = (t, quality = 0.93) => { frame(t); return out.toDataURL('image/jpeg', quality).slice('data:image/jpeg;base64,'.length); };
window.renderStill = (t) => { frame(t); return out.toDataURL('image/png').slice('data:image/png;base64,'.length); };

// ---------------------------------------------------------------- boot
await document.fonts.load(`700 30px Cairo`, 'تصميم 7.00');
await document.fonts.load(`400 30px Cairo`, 'تصميم 7.00');
function bakeMirrors() {
  applyState({ roof: 0, door: 0 }); renderer.shadowMap.needsUpdate = true;
  const p = new THREE.Vector3();
  for (const [mesh, nx] of mirrors) {
    const rt = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
    const cc = new THREE.CubeCamera(0.05, 40, rt);
    mesh.getWorldPosition(p); cc.position.set(p.x + nx * 0.08, p.y, p.z); scene.add(cc);
    mesh.visible = false; cc.update(renderer, scene); mesh.visible = true; scene.remove(cc);
    mesh.material = new THREE.MeshBasicMaterial({ color: 0xe9edf0, envMap: rt.texture, combine: THREE.MultiplyOperation, reflectivity: 1 });
  }
  lastStateKey = '';
}
bakeMirrors();
renderer.compile(scene, camera);
for (const t of [2, 15, 20, 30, 34, 39, 43, 50]) frame(t);
window.__ready = true;

if (!RENDER) {
  let mode = 'tour', roofHidden = false, start = performance.now();
  const controls = new OrbitControls(camera, out); controls.enabled = false; controls.target.set(0, 1.2, 0);
  const bTour = document.getElementById('bTour'), bOrbit = document.getElementById('bOrbit'), bRoof = document.getElementById('bRoof');
  const setMode = (m) => {
    mode = m; bTour.classList.toggle('on', m === 'tour'); bOrbit.classList.toggle('on', m === 'orbit');
    controls.enabled = m === 'orbit';
    if (m === 'orbit') { camera.position.set(-9, 8, 11); camera.fov = 50; camera.updateProjectionMatrix(); controls.target.set(0, 1.2, 0); controls.update(); }
    else start = performance.now();
  };
  bTour.onclick = () => setMode('tour'); bOrbit.onclick = () => setMode('orbit');
  bRoof.onclick = () => { roofHidden = !roofHidden; bRoof.classList.toggle('on', roofHidden); if (mode !== 'orbit') setMode('orbit'); };
  const loop = () => {
    if (mode === 'tour') frame(((performance.now() - start) / 1000) % DURATION);
    else { controls.update(); applyState({ roof: roofHidden ? 1 : 0, door: 0 }); composer.render(); ctx.drawImage(renderer.domElement, 0, 0); }
    requestAnimationFrame(loop);
  };
  loop();
}
