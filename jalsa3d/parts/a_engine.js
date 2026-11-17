// 3D model + cinematic tour of the outdoor lounge pergola, winter mode (6.00 x 5.00 m, 3.00 m high, on a 0.60 m platform).
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
export const DURATION = 44;
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
