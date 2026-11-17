// 3D design of an indoor evening lounge (majlis for سهرة), about 9.00 x 5.00 m, 3.20 m high.
// Open index.html to orbit freely, or run stills.js to render the design images.
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
export const DURATION = 1;
window.DURATION = DURATION;
if (RENDER) document.body.classList.add('render');

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

// ================================================================ evening lounge (سهرة)
const RW = 5.0, RL = 9.0, RH = 3.2;                       // room width (x), length (z), slab height
const XW = RW / 2, ZL = RL / 2, SOF = 2.85;              // half sizes, underside of the perimeter soffit
const ceil = new THREE.Group(); scene.add(ceil);
const cloneTex = (t, rx, ry) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); return c; };

// ---------------------------------------------------------------- textures and materials
const darkMarbleTex = makeTex(1024, 1024, (g, w, h) => {
  g.fillStyle = '#141416'; g.fillRect(0, 0, w, h);
  g.save(); g.filter = 'blur(26px)';
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '60,58,62' : '8,8,10'},0.35)`; g.beginPath(); g.arc(rnd() * w, rnd() * h, rr(60, 180), 0, 7); g.fill(); }
  g.restore(); g.lineCap = 'round';
  for (let i = 0; i < 11; i++) {
    let x = rnd() * w, y = -40, dir = rr(0.7, 1.3); const pts = [[x, y]];
    while (y < h + 40) { x += Math.cos(dir) * 70 + rr(-30, 30); y += Math.sin(dir) * 70; dir = clamp(dir + rr(-0.3, 0.3), 0.4, 2.7); pts.push([x, y]); }
    for (const [lw, a] of [[rr(5, 10), 0.06], [rr(1, 2.4), rr(0.35, 0.6)]]) {
      g.strokeStyle = `rgba(235,232,226,${a})`; g.lineWidth = lw; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length - 1; k++) g.quadraticCurveTo(pts[k][0], pts[k][1], (pts[k][0] + pts[k + 1][0]) / 2, (pts[k][1] + pts[k + 1][1]) / 2);
      g.stroke();
    }
  }
});
const saduTex = makeTex(256, 256, (g, w, h) => {
  const bands = [['#8c1f1d', 34], ['#efe6d2', 10], ['#1c1a18', 16], ['#efe6d2', 8], ['#8c1f1d', 120], ['#efe6d2', 8], ['#1c1a18', 16], ['#efe6d2', 10], ['#8c1f1d', 34]];
  let y = 0; for (const [c, bh] of bands) { g.fillStyle = c; g.fillRect(0, y, w, bh); y += bh; }
  const cy = 128, s = 22;
  for (let x = 0; x < w + s; x += s * 2) {
    g.fillStyle = '#efe6d2'; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + s, cy - 40); g.lineTo(x + 2 * s, cy); g.lineTo(x + s, cy + 40); g.fill();
    g.fillStyle = '#1c1a18'; g.beginPath(); g.moveTo(x + s * 0.45, cy); g.lineTo(x + s, cy - 22); g.lineTo(x + s * 1.55, cy); g.lineTo(x + s, cy + 22); g.fill();
    g.fillStyle = '#c99a3a'; g.fillRect(x + s - 4, cy - 4, 8, 8);
  }
  for (const yy of [40, 216]) for (let x = 0; x < w; x += 16) { g.fillStyle = '#1c1a18'; g.beginPath(); g.moveTo(x, yy + 6); g.lineTo(x + 8, yy - 2); g.lineTo(x + 16, yy + 6); g.fill(); }
  speckle(g, w, h, 4000, 0, 255, 0.06, 1, 1.5);
}, { clampEdge: true });
const rugTex2 = makeTex(512, 1024, (g, w, h) => {
  g.fillStyle = '#c9bfae'; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 70000, 150, 230, 0.16, 1, 2);
  g.strokeStyle = '#7d7366'; g.lineWidth = 14; g.strokeRect(22, 22, w - 44, h - 44);
  g.strokeStyle = '#a3978a'; g.lineWidth = 4; g.strokeRect(48, 48, w - 96, h - 96);
  g.strokeStyle = 'rgba(125,115,102,0.55)'; g.lineWidth = 3;
  for (let y = 120; y < h - 100; y += 110) { g.beginPath(); g.moveTo(w / 2 - 90, y); g.lineTo(w / 2, y - 45); g.lineTo(w / 2 + 90, y); g.lineTo(w / 2, y + 45); g.closePath(); g.stroke(); }
}, { clampEdge: true });
const matchTex = makeTex(640, 360, (g, w, h) => {
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#2f7f37' : '#29702f'; g.fillRect(i * w / 12, 0, w / 12 + 1, h); }
  g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3;
  g.strokeRect(28, 46, w - 56, h - 66); g.beginPath(); g.moveTo(w / 2, 46); g.lineTo(w / 2, h - 20); g.stroke();
  g.beginPath(); g.arc(w / 2, (h + 26) / 2, 46, 0, 7); g.stroke();
  g.strokeRect(28, h / 2 - 50, 70, 120); g.strokeRect(w - 98, h / 2 - 50, 70, 120);
  for (let i = 0; i < 18; i++) { g.fillStyle = i % 2 ? '#f4f4f4' : '#1f43b0'; g.beginPath(); g.arc(rr(70, w - 70), rr(80, h - 40), 5, 0, 7); g.fill(); }
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w * 0.56, h * 0.58, 3.5, 0, 7); g.fill();
  g.fillStyle = 'rgba(10,14,30,0.85)'; g.fillRect(24, 12, 150, 26); g.fillStyle = '#ffffff'; g.font = '700 18px sans-serif'; g.fillText('1 - 2      67:12', 34, 31);
}, { clampEdge: true });
const fadeTex = makeTex(8, 128, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, { clampEdge: true });
const MS = {
  floor: std({ map: cloneTex(tileTex, RW / 2.4, RL / 2.4), color: 0xe2dbcf, roughness: 0.22, envMapIntensity: 1.5 }),
  wallOut: std({ color: 0x2a2d33, roughness: 0.9 }),
  navy: std({ map: plasterTex, color: 0x1c2333, roughness: 0.92 }),
  sky: std({ color: 0x0b1020, roughness: 0.95 }),
  soffit: std({ map: plasterTex, color: 0xeee6da, roughness: 0.95 }),
  base: std({ map: fabricTex, color: 0xcfc5b5, roughness: 0.85 }),
  seat: std({ map: fabricTex, color: 0xe2dacb, roughness: 0.85 }),
  panel: std({ map: fabricTex, color: 0xd6ccbb, roughness: 0.9 }),
  mustard: std({ map: fabricTex, color: 0xb59a2c, roughness: 0.85 }),
  grey: std({ map: fabricTex, color: 0x9a9a9f, roughness: 0.9 }),
  sadu: std({ map: saduTex, roughness: 0.95 }),
  rug: std({ map: rugTex2, roughness: 1 }),
  curtain: std({ map: fabricTex, color: 0xd9cfbf, roughness: 1, side: THREE.DoubleSide }),
  travertine: std({ map: plasterTex, color: 0xd9c8aa, roughness: 0.45 }),
  brass: std({ color: 0xb48a4a, roughness: 0.28, metalness: 1 }),
  darkMarble: std({ map: darkMarbleTex, roughness: 0.12, envMapIntensity: 2.5 }),
};
const washMat = (k) => new THREE.MeshBasicMaterial({ map: fadeTex, color: new THREE.Color(0xffb35c).multiplyScalar(k), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide });
// horizontal glow strip, bright along one edge (N = -z, S = +z, W = -x, E = +x) and fading over `depth`
function washQuad(cx, y, cz, len, depth, edge, k, parent = scene) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(len, depth), washMat(k));
  m.rotation.order = 'YXZ'; m.rotation.x = Math.PI / 2; m.rotation.y = { S: 0, N: Math.PI, W: -Math.PI / 2, E: Math.PI / 2 }[edge];
  m.position.set(cx, y, cz); parent.add(m); return m;
}
// vertical glow strip on a wall, bright at the top
function wallWash(x0, x1, z0, z1, yTop, yBot, k) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.hypot(x1 - x0, z1 - z0), yTop - yBot), washMat(k));
  m.rotation.y = Math.atan2(-(z1 - z0), x1 - x0); m.position.set((x0 + x1) / 2, (yTop + yBot) / 2, (z0 + z1) / 2); scene.add(m); return m;
}

// ---------------------------------------------------------------- shell
{
  const g = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), std({ color: 0x24262a, roughness: 1 })); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; scene.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(RW, RL), MS.floor); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const wm = [MS.wallOut, MS.wallOut, M.cut, MS.wallOut, MS.wallOut, MS.wallOut];
  boxMM(-XW - 0.2, -XW, 0, RH + 0.2, -ZL - 0.2, ZL + 0.2, wm); boxMM(XW, XW + 0.2, 0, RH + 0.2, -ZL - 0.2, ZL + 0.2, wm);
  boxMM(-XW, XW, 0, RH + 0.2, -ZL - 0.2, -ZL, wm); boxMM(-XW, XW, 0, RH + 0.2, ZL, ZL + 0.2, wm);
  for (const [x0, x1, z0, z1] of [[-XW, -XW + 0.012, -ZL, ZL], [-XW, XW, ZL - 0.012, ZL]]) boxMM(x0, x1, 0, RH, z0, z1, MS.navy, { cast: false });
  boxMM(-XW + 0.03, -XW + 0.045, 0, 0.08, -ZL, ZL, M.dark, { cast: false });                               // skirting
}

// ---------------------------------------------------------------- ceiling: perimeter soffit with cove LED, starry recess
{
  const R = { parent: ceil };
  boxMM(-XW, -XW + 0.55, SOF, RH, -ZL, ZL, MS.soffit, R);
  boxMM(XW - 0.55, XW - 0.25, SOF, RH, -ZL, ZL, MS.soffit, R);                                         // curtain pocket behind (0.25 m)
  boxMM(-XW + 0.55, XW - 0.55, SOF, RH, -ZL, -ZL + 0.55, MS.soffit, R);
  boxMM(-XW + 0.55, XW - 0.55, SOF, RH, ZL - 0.55, ZL, MS.soffit, R);
  boxMM(XW - 0.25, XW, RH - 0.02, RH, -ZL, ZL, MS.sky, R);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(RW - 1.1, RL - 1.1), MS.sky); sky.rotation.x = Math.PI / 2; sky.position.y = RH - 0.001; ceil.add(sky);
  const ix = XW - 0.55, iz = ZL - 0.55, led = glowMat(0xffc27a, 4);
  boxMM(-ix, -ix + 0.02, RH - 0.06, RH - 0.04, -iz, iz, led, { parent: ceil, cast: false }); boxMM(ix - 0.02, ix, RH - 0.06, RH - 0.04, -iz, iz, led, { parent: ceil, cast: false });
  boxMM(-ix, ix, RH - 0.06, RH - 0.04, -iz, -iz + 0.02, led, { parent: ceil, cast: false }); boxMM(-ix, ix, RH - 0.06, RH - 0.04, iz - 0.02, iz, led, { parent: ceil, cast: false });
  washQuad(-ix + 0.45, RH - 0.004, 0, 2 * iz, 0.9, 'W', 1.0, ceil); washQuad(ix - 0.45, RH - 0.004, 0, 2 * iz, 0.9, 'E', 1.0, ceil);
  washQuad(0, RH - 0.004, -iz + 0.45, 2 * ix, 0.9, 'N', 1.0, ceil); washQuad(0, RH - 0.004, iz - 0.45, 2 * ix, 0.9, 'S', 1.0, ceil);
  // fibre-optic stars
  for (const [n, size, k] of [[1100, 0.022, 1.6], [140, 0.045, 2.6]]) {
    const p = []; for (let i = 0; i < n; i++) p.push(rr(-ix + 0.08, ix - 0.08), RH - 0.006, rr(-iz + 0.08, iz - 0.08));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    ceil.add(new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, color: new THREE.Color(1, 0.97, 0.9).multiplyScalar(k), size, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })));
  }
  // downlights in the soffit
  for (let z = -3.6; z <= 3.61; z += 1.8) for (const x of [-XW + 0.28, XW - 0.4]) {
    const r = new THREE.Mesh(new THREE.CircleGeometry(0.055, 20), M.blackMetal); r.rotation.x = Math.PI / 2; r.position.set(x, SOF - 0.002, z); ceil.add(r);
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.036, 20), M.bulb); d.rotation.x = Math.PI / 2; d.position.set(x, SOF - 0.004, z); ceil.add(d);
  }
  // concealed AC: linear slot diffusers in the soffit (instead of the wall split unit)
  for (const x of [-XW + 0.3, XW - 0.42]) boxMM(x - 0.05, x + 0.05, SOF - 0.006, SOF, -2.6, 2.6, M.dark, { parent: ceil, cast: false });
}

// ---------------------------------------------------------------- left wall: upholstered band + timber slats + sconces
{
  const x0 = -XW + 0.012, z0 = -3.35, z1 = 3.35;
  for (let z = z0; z < z1 - 0.01; z += 0.5) boxMM(x0, x0 + 0.06, 0.42, 1.38, z + 0.006, z + 0.494, MS.panel, { r: 0.025 });
  boxMM(x0, x0 + 0.02, 1.38, SOF, -ZL, ZL, M.dark, { cast: false });
  slats('z', -ZL + 0.02, ZL - 0.02, x0 + 0.02, x0 + 0.045, () => [1.42, SOF], M.slat, 0.08, 0.055);
  boxMM(x0, x0 + 0.07, 1.38, 1.4, z0, z1, M.woodDark);
  boxMM(x0 + 0.05, x0 + 0.07, 1.4, 1.41, z0 + 0.02, z1 - 0.02, glowMat(0xffc27a, 3.5), { cast: false });   // up-light along the ledge
  const SY = 2.15, ph = SOF - 1.42;
  for (const z of [-2.5, -0.85, 0.85, 2.5]) {
    boxMM(x0 + 0.045, x0 + 0.12, SY - 0.15, SY + 0.15, z - 0.045, z + 0.045, M.blackMetal);
    boxMM(x0 + 0.055, x0 + 0.11, SY + 0.15, SY + 0.156, z - 0.035, z + 0.035, M.ledHot, { cast: false }); boxMM(x0 + 0.055, x0 + 0.11, SY - 0.156, SY - 0.15, z - 0.035, z + 0.035, M.ledHot, { cast: false });
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.0, ph), new THREE.MeshBasicMaterial({ map: washTexture(1.0, ph, 0.5, SY - 1.42), color: new THREE.Color(0xffb766).multiplyScalar(1.2), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    w.rotation.y = Math.PI / 2; w.position.set(x0 + 0.05, (1.42 + SOF) / 2, z); scene.add(w);
  }
}

// ---------------------------------------------------------------- right wall: full-length curtains with LED in the pocket
{
  const cx = XW - 0.13, w = RL - 0.02, folds = 52;
  const g = new THREE.PlaneGeometry(w, RH - 0.03, 520, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) / w + 0.5; p.setZ(i, Math.sin(u * Math.PI * 2 * folds) * 0.05 + Math.sin(u * 37.0) * 0.012); }
  g.computeVertexNormals();
  const c = new THREE.Mesh(g, MS.curtain); c.rotation.y = -Math.PI / 2; c.position.set(cx, (RH - 0.03) / 2 + 0.01, 0); c.receiveShadow = true; scene.add(c);
  boxMM(XW - 0.08, XW - 0.06, RH - 0.05, RH - 0.03, -ZL + 0.02, ZL - 0.02, glowMat(0xffc27a, 3.5), { parent: ceil, cast: false });
  wallWash(cx - 0.07, cx - 0.07, -ZL + 0.05, ZL - 0.05, SOF - 0.02, SOF - 1.4, 0.55);
}

// ---------------------------------------------------------------- back wall: TV feature wall
const TVZ = -ZL + 0.07;
{
  boxMM(-XW, XW, 0, SOF, -ZL, -ZL + 0.015, M.dark, { cast: false });
  slats('x', -XW + 0.02, -1.55, -ZL + 0.015, -ZL + 0.04, () => [0, SOF], M.slat, 0.08, 0.055);
  slats('x', 1.55, XW - 0.27, -ZL + 0.015, -ZL + 0.04, () => [0, SOF], M.slat, 0.08, 0.055);
  boxMM(-1.5, 1.5, 0, SOF, -ZL + 0.015, TVZ, MS.darkMarble, { uv: 0 });
  for (const s of [-1, 1]) boxMM(s * 1.525 - 0.012, s * 1.525 + 0.012, 0.02, SOF - 0.02, -ZL + 0.02, -ZL + 0.03, glowMat(0xffc27a, 3.5), { cast: false });
  // 85" TV with ambient back-light
  const TY = 1.32;
  boxMM(-1.02, 1.02, TY - 0.6, TY + 0.6, TVZ, TVZ + 0.005, glowMat(0xffb36a, 2.2), { cast: false });
  boxMM(-0.955, 0.955, TY - 0.545, TY + 0.545, TVZ + 0.005, TVZ + 0.035, M.blackMetal);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.89, 1.065), new THREE.MeshBasicMaterial({ map: matchTex, color: new THREE.Color(1.25, 1.25, 1.25) }));
  scr.position.set(0, TY, TVZ + 0.0365); scene.add(scr);
  // floating console with LED
  boxMM(-1.4, 1.4, 0.22, 0.56, TVZ, TVZ + 0.42, M.woodDark, { uv: 1.2 });
  slats('x', -1.4, 1.4, TVZ + 0.42, TVZ + 0.435, () => [0.24, 0.54], M.slat, 0.05, 0.035);
  boxMM(-1.42, 1.42, 0.56, 0.585, TVZ - 0.005, TVZ + 0.44, MS.darkMarble, { uv: 0 });
  boxMM(-1.36, 1.36, 0.212, 0.22, TVZ + 0.38, TVZ + 0.4, glowMat(0xffc27a, 3.5), { cast: false });
  washQuad(0, 0.004, TVZ + 0.42 + 0.35, 2.8, 0.7, 'N', 0.7);
  boxMM(-0.6, 0.6, 0.6, 0.67, TVZ + 0.12, TVZ + 0.22, M.blackMetal);                                       // sound bar
  cyl(0.07, 0.09, 0.32, MS.travertine, -1.1, 0.585 + 0.16, TVZ + 0.22); cyl(0.05, 0.07, 0.22, M.ceramicBeige, -0.92, 0.585 + 0.11, TVZ + 0.25);
  boxMM(0.85, 1.15, 0.585, 0.63, TVZ + 0.12, TVZ + 0.32, M.dark); boxMM(0.88, 1.12, 0.63, 0.66, TVZ + 0.14, TVZ + 0.3, MS.travertine);
  // corner plants with up-light
  for (const s of [-1, 1]) {
    const x = s * 2.02, z = -ZL + 0.42;
    cyl(0.26, 0.2, 0.6, M.pot, x, 0.3, z, { seg: 32 }); cyl(0.235, 0.235, 0.02, M.mulch, x, 0.59, z);
    cyl(0.025, 0.04, 1.2, M.trunk, x, 1.15, z, { seg: 8 });
    foliage([{ x, y: 1.75, z, r: 0.42 }, { x: x - s * 0.18, y: 1.45, z: z + 0.12, r: 0.3 }, { x: x + s * 0.05, y: 2.1, z: z + 0.05, r: 0.28 }], 900, 0.17, [0.28, 0.45, 0.28]);
    glowSprite(x + 0.18, 0.04, z + 0.3, 0.45, 0xffc27a, 1.4);
  }
  for (const s of [-1, 1]) { const sp = new THREE.SpotLight(0xffc98a, 9, 6, 0.5, 0.85, 2); sp.position.set(s * 1.05, SOF - 0.02, -ZL + 0.5); sp.target.position.set(s * 1.05, 0.2, -ZL + 0.02); scene.add(sp, sp.target); }
}

// ---------------------------------------------------------------- front wall: entrance door with slats
{
  boxMM(-XW, XW, 0, SOF, ZL - 0.015, ZL, M.dark, { cast: false });
  slats('x', -XW + 0.02, -0.85, ZL - 0.04, ZL - 0.015, () => [0, SOF], M.slat, 0.08, 0.055);
  slats('x', 0.85, XW - 0.27, ZL - 0.04, ZL - 0.015, () => [0, SOF], M.slat, 0.08, 0.055);
  slats('x', -0.85, 0.85, ZL - 0.04, ZL - 0.015, () => [2.52, SOF], M.slat, 0.08, 0.055);
  boxMM(-0.8, 0.8, 0, 2.5, ZL - 0.06, ZL - 0.015, M.woodDark, { uv: 1 });
  boxMM(-0.004, 0.004, 0.02, 2.48, ZL - 0.065, ZL - 0.06, M.dark, { cast: false });
  for (const s of [-1, 1]) boxMM(s * 0.07 - 0.012, s * 0.07 + 0.012, 0.75, 1.75, ZL - 0.1, ZL - 0.065, MS.brass);
}

// ---------------------------------------------------------------- majlis sofas along both long walls
function sofaRun(side) {
  const X = (u) => side * (XW - u), D = 0.85, z0 = -3.3, z1 = 3.3;
  const bx = (u0, u1, y0, y1, za, zb, mat, o) => boxMM(Math.min(X(u0), X(u1)), Math.max(X(u0), X(u1)), y0, y1, za, zb, mat, o);
  bx(0.08, D - 0.06, 0, 0.07, z0 + 0.06, z1 - 0.06, M.dark);
  bx(0.02, D, 0.07, 0.3, z0, z1, MS.base, { r: 0.03 });
  const n = 8, m = (z1 - z0 - 0.4) / n;
  for (let i = 0; i < n; i++) {
    const za = z0 + 0.2 + i * m;
    bx(0.25, D - 0.01, 0.3, 0.46, za + 0.006, za + m - 0.006, MS.seat, { r: 0.06 });
    bx(0.03, 0.27, 0.3, 0.9, za + 0.008, za + m - 0.008, MS.seat, { r: 0.08 });
    const mats = [[MS.mustard, MS.sadu], [MS.grey, MS.panel], [MS.sadu, MS.mustard], [MS.panel, MS.grey]][(i + (side > 0 ? 1 : 0)) % 4];
    mats.forEach((mat, j) => { const p = rbox(0.15, 0.42, 0.42, 0.065, mat, X(0.36 + j * 0.05), 0.69 - j * 0.03, za + m * (0.32 + j * 0.36)); p.rotation.order = 'YXZ'; p.rotation.y = rr(-0.15, 0.15); p.rotation.z = -side * (0.22 + j * 0.12); });
  }
  for (const za of [z0, z1 - 0.2]) bx(0.02, D, 0.3, 0.64, za, za + 0.2, MS.base, { r: 0.05 });
}
sofaRun(-1); sofaRun(1);

// ---------------------------------------------------------------- centre: rug, travertine tables with candles
const TABLES = [-1.45, 1.45];
{
  boxMM(-1.45, 1.45, 0, 0.012, -3.05, 3.05, MS.rug, { cast: false, uv: 0 });
  for (const z of TABLES) {
    cyl(0.5, 0.5, 0.05, MS.travertine, 0, 0.355, z, { seg: 48 }); cyl(0.3, 0.36, 0.33, M.woodDark, 0, 0.165, z, { seg: 40 });
    boxMM(-0.24, 0.24, 0.38, 0.395, z - 0.16, z + 0.16, MS.brass);
    for (const [dx, h] of [[-0.12, 0.12], [0.0, 0.18], [0.12, 0.09]]) {
      cyl(0.03, 0.03, h, std({ color: 0xf3ead8, roughness: 0.6 }), dx, 0.395 + h / 2, z, { cast: false });
      glowSprite(dx, 0.395 + h + 0.03, z, 0.22, 0xffb45a, 2.4);
    }
    const cl = new THREE.PointLight(0xffa64d, 0.9, 3.2, 2); cl.position.set(0, 0.75, z); scene.add(cl);
  }
}

// ---------------------------------------------------------------- lighting (warm, dimmed for the evening)
scene.add(new THREE.HemisphereLight(0xc9b6a0, 0x1a1612, 0.18));
{
  const key = new THREE.SpotLight(0xffc98a, 26, 0, 1.25, 1, 2); key.position.set(0, RH - 0.1, 0); key.target.position.set(0, 0, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.01; key.shadow.camera.near = 0.5; key.shadow.camera.far = 6;
  scene.add(key, key.target);
  for (const z of [-3.0, -1.0, 1.0, 3.0]) { const pl = new THREE.PointLight(0xffbd78, 2.6, 5.5, 2); pl.position.set(0, RH - 0.25, z); scene.add(pl); }
  for (const z of [-1.7, 1.7]) { const pl = new THREE.PointLight(0xffb470, 1.6, 4, 2); pl.position.set(-XW + 0.5, 2.1, z); scene.add(pl); }
}
// ---------------------------------------------------------------- 2D overlay
const out = document.getElementById('out'); out.width = W; out.height = H;
const ctx = out.getContext('2d');
const K = Math.min(H / 720, W / 1280);
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
const _v = new THREE.Vector3();
function project(x, y, z) { _v.set(x, y, z).project(camera); return [(_v.x * 0.5 + 0.5) * W, (-_v.y * 0.5 + 0.5) * H, _v.z]; }

// ---------------------------------------------------------------- design views (stills)
const VIEWS = {
  entrance_portrait: { cam: [-0.25, 1.55, 4.25, 0.05, 1.05, -4.5], fov: 64, cap: ['بعد: جلسة السهرة', 'نفس زاوية الصورة من المدخل', 'سقف نجوم • إضاءة مخفية دافئة • جدار شاشة'] },
  entrance: { cam: [-0.3, 1.6, 4.25, 0.05, 1.1, -4.5], fov: 52, cap: ['جلسة السهرة — من المدخل', 'سقف نجوم مع إضاءة مخفية دافئة', 'كنب مجلس على الجانبين • جدار شاشة • ستائر بطول الجدار'] },
  back: { cam: [1.25, 1.65, -3.7, -0.7, 1.05, 4.5], fov: 58, cap: ['من جهة الشاشة', 'جدار خشب شرائح مع إضاءة جدارية • باب خشب', 'ستائر بطول الجدار مع إضاءة مخفية من فوق'] },
  seat: { cam: [1.35, 1.2, 1.1, -2.5, 0.95, -0.6], fov: 55, cap: ['الجلسة', 'كنب مجلس بعمق 0.85 م • مساند سدو وخردلي', 'طاولات وسط من الترافرتين مع شموع'] },
  tv: { cam: [0.35, 1.15, 1.6, 0, 1.25, -4.5], fov: 48, cap: ['جدار الشاشة', 'شاشة 85 بوصة على رخام داكن مع إضاءة خلفية', 'كونسول معلق بإضاءة سفلية • خشب شرائح على الجانبين'] },
  plan: { cam: [0.35, 13.5, 0.3, 0.35, 0, 0.3], up: [1, 0, 0], fov: 34, noCeil: true, labels: true, cap: ['المسقط', 'مقاسات تقريبية من الصورة: 9.00 × 5.00 م', 'ارتفاع السقف 3.20 م • حدود السقف المعلّق 2.85 م'] },
};
function planLabels() {
  ctx.save(); ctx.direction = 'rtl'; ctx.textAlign = 'center';
  const lab = (txt, x, z) => {
    const [sx, sy] = project(x, 1.2, z);
    ctx.font = `700 ${18 * K}px Cairo`; const w = ctx.measureText(txt).width + 26 * K, h = 32 * K;
    ctx.fillStyle = 'rgba(18,14,10,0.78)'; rrect(sx - w / 2, sy - h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = '#fbf3e6'; ctx.fillText(txt, sx, sy + 6 * K);
  };
  lab('جدار الشاشة 85 بوصة', 0, -3.75); lab('كنب مجلس 6.60 م', -1.9, 0.2); lab('كنب مجلس 6.60 م', 1.9, 0.2); lab('ستائر بطول الجدار', 2.25, -2.6);
  lab('طاولة وسط', 0, TABLES[0]); lab('طاولة وسط', 0, TABLES[1]); lab('المدخل', 0, 4.1);
  const dim = (p0, p1, txt) => {
    const a0 = project(...p0), a1 = project(...p1);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2 * K; ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke();
    const ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]) + Math.PI / 2, tl = 9 * K;
    for (const q of [a0, a1]) { ctx.beginPath(); ctx.moveTo(q[0] - Math.cos(ang) * tl, q[1] - Math.sin(ang) * tl); ctx.lineTo(q[0] + Math.cos(ang) * tl, q[1] + Math.sin(ang) * tl); ctx.stroke(); }
    const mx = (a0[0] + a1[0]) / 2, my = (a0[1] + a1[1]) / 2;
    ctx.font = `700 ${18 * K}px Cairo`; const w = ctx.measureText(txt).width + 22 * K;
    ctx.fillStyle = 'rgba(18,14,10,0.85)'; rrect(mx - w / 2, my - 15 * K, w, 30 * K, 6 * K); ctx.fill();
    ctx.fillStyle = GOLD; ctx.fillText(txt, mx, my + 6.5 * K);
  };
  dim([XW + 0.42, 3.4, -ZL], [XW + 0.42, 3.4, ZL], '9.00 م'); dim([-XW, 3.4, ZL + 0.6], [XW, 3.4, ZL + 0.6], '5.00 م');
  ctx.restore();
}
window.renderView = (name) => {
  const v = VIEWS[name];
  camera.up.set(...(v.up || [0, 1, 0]));
  camera.position.set(v.cam[0], v.cam[1], v.cam[2]); camera.lookAt(v.cam[3], v.cam[4], v.cam[5]); camera.fov = v.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  ceil.visible = !v.noCeil;
  renderer.shadowMap.needsUpdate = true; composer.render();
  ctx.globalAlpha = 1; ctx.drawImage(renderer.domElement, 0, 0);
  if (v.labels) planLabels();
  caption(v.cap[0], v.cap[1], 1, v.cap[2]);
  return out.toDataURL('image/png').slice('data:image/png;base64,'.length);
};

// ---------------------------------------------------------------- boot
await document.fonts.load(`700 30px Cairo`, 'جلسة 9.00');
await document.fonts.load(`400 30px Cairo`, 'جلسة 9.00');
renderer.shadowMap.needsUpdate = true;
renderer.compile(scene, camera);
window.__ready = true;
if (!RENDER) {
  const controls = new OrbitControls(camera, out); controls.target.set(0, 1.1, 0);
  camera.position.set(-0.3, 1.6, 4.2); camera.fov = 55; camera.updateProjectionMatrix(); controls.update();
  const b = document.getElementById('bCeil'); b.onclick = () => { ceil.visible = !ceil.visible; b.classList.toggle('on', !ceil.visible); renderer.shadowMap.needsUpdate = true; };
  const loop = () => { controls.update(); composer.render(); ctx.drawImage(renderer.domElement, 0, 0); requestAnimationFrame(loop); };
  loop();
}
