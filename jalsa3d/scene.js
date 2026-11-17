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

// ================================================================ outdoor lounge — winter mode
const PW = 6.0, PD = 5.0, PH = 3.0, PLAT = 0.6;            // pergola width, depth, height above the platform; platform height
const X1 = PW / 2, Z1 = PD / 2, Y0 = PLAT, YT = PLAT + PH, YB = YT - 0.25;   // YB = underside of the roof beams
const PX = X1 + 0.3, PZ = Z1 + 0.3;                              // platform half-size
const TVOPT = params.get('tvopt') || 'lift';                     // lift | projector | drop | arm
const cloneTex = (t, rx, ry) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); return c; };
const MX = {
  paving: std({ map: cloneTex(pavingTex, 45, 45), color: 0xb9ae9e, roughness: 0.5, envMapIntensity: 1.6 }),
  stoneBeige: std({ map: plasterTex, color: 0xd9cdb7, roughness: 0.85 }),
  marbleBlack: std({ color: 0x161617, roughness: 0.2, envMapIntensity: 3 }),
  louverTop: std({ color: 0x262422, roughness: 0.5, metalness: 0.3 }),
  hedgeBack: std({ color: 0x16210f, roughness: 1 }),
  terracotta: std({ color: 0x8a4a34, roughness: 0.9 }),
  winGlow: glowMat(0xffc27a, 1.6),
  rattan: std({ map: woodTex, color: 0x7a5a40, roughness: 0.7 }),
};
const tileMats = (side) => [side, side, M.floor, side, side, side];

// fade texture (opaque at the top edge) for LED washes on floors and plinth faces
const fadeTex = makeTex(8, 128, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, { clampEdge: true });
const washMat = (k) => new THREE.MeshBasicMaterial({ map: fadeTex, color: new THREE.Color(0xffb35c).multiplyScalar(k), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide });
function floorWash(x0, x1, y, zNear, zFar, k = 0.9) {          // bright at zNear, fading towards zFar
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, Math.abs(zFar - zNear)), washMat(k));
  m.rotation.x = -Math.PI / 2; if (zFar < zNear) m.rotation.z = Math.PI;
  m.position.set((x0 + x1) / 2, y, (zNear + zFar) / 2); scene.add(m);
}
function floorWashX(z0, z1, y, xNear, xFar, k = 0.9) {         // same, running along z
  const m = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, Math.abs(xFar - xNear)), washMat(k));
  m.rotation.x = -Math.PI / 2; m.rotation.z = xFar > xNear ? Math.PI / 2 : -Math.PI / 2;
  m.position.set((xNear + xFar) / 2, y, (z0 + z1) / 2); scene.add(m);
}
function wallWashDown(x0, x1, yTop, yBot, z, k = 0.8) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, yTop - yBot), washMat(k)); m.position.set((x0 + x1) / 2, (yTop + yBot) / 2, z); scene.add(m);
}

// ---------------------------------------------------------------- courtyard and surroundings
{
  const g = new THREE.Mesh(new THREE.PlaneGeometry(54, 54), MX.paving); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g);
  // living green walls behind and to the left
  const leafWall = (n, place) => {
    const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.12, 0.22), M.leaf, n);
    for (let i = 0; i < n; i++) {
      place(_p); _e.set(rr(-1, 1), rr(-1, 1), rr(0, 6.28)); _q.setFromEuler(_e); const sc = rr(0.8, 1.6); _s.set(sc, sc, sc);
      _m.compose(_p, _q, _s); mesh.setMatrixAt(i, _m);
      _c.setHSL(0.27 + rr(-0.03, 0.03), 0.5 + rr(-0.1, 0.1), 0.2 + rr(-0.07, 0.09), THREE.SRGBColorSpace); mesh.setColorAt(i, _c);
    }
    mesh.castShadow = false; mesh.receiveShadow = true; scene.add(mesh);
  };
  const HZ = -Z1 - 0.9, HX = -X1 - 1.85;
  boxMM(HX - 0.35, 1.4, 0, 4.2, HZ - 0.35, HZ, MX.hedgeBack);
  leafWall(7000, (p) => p.set(rr(HX - 0.35, 1.4), rr(0.05, 4.2), HZ + rr(0, 0.1)));
  boxMM(HX - 0.35, HX, 0, 4.2, HZ, 4.2, MX.hedgeBack);
  leafWall(6500, (p) => p.set(HX + rr(0, 0.1), rr(0.05, 4.2), rr(HZ, 4.2)));
  leafWall(700, (p) => p.set(rr(HX - 0.35, HX), rr(0.05, 4.2), 4.2 + rr(0, 0.08)));
  leafWall(2500, (p) => p.set(HX - 0.35 - rr(0, 0.08), rr(0.05, 4.2), rr(HZ, 4.2)));
  // the house behind, on the right
  boxMM(1.4, 10.5, 0, 6.4, -6.8, -4.4, M.plaster, { uv: 2 });
  boxMM(1.2, 10.7, 6.4, 6.75, -7.0, -4.2, MX.terracotta);
  for (const x of [3.7, 6.9]) { boxMM(x - 0.6, x + 0.6, 3.6, 5.3, -4.4, -4.37, MX.winGlow, { cast: false }); boxMM(x - 0.66, x + 0.66, 3.54, 5.36, -4.41, -4.39, M.alu, { cast: false }); }
  // low planter wall on the right with shrubs
  boxMM(6.4, 6.8, 0, 0.9, -4.4, 6.5, MX.stoneBeige, { uv: 2 });
  for (const z of [-2.6, 0.2, 3.0]) shrub(5.95, z, 0.5, 420, [0.27, 0.5, 0.24]);
  // front garden: lawn, stepping stones, trees with up-lights
  {
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(15, 13.6), std({ map: cloneTex(grassTex, 10, 9), roughness: 1 }));
    lawn.rotation.x = -Math.PI / 2; lawn.position.set(-0.6, 0.004, 11.4); lawn.receiveShadow = true; scene.add(lawn);
    for (let z = 4.75; z < 9.6; z += 0.78) boxMM(-2.15, -1.25, -0.01, 0.025, z, z + 0.55, M.stone, { cast: false, uv: 0 });
    for (const [x, z, h, sp, n, hsl] of [[-7.5, 7.0, 4.4, 1.4, 2600, [0.25, 0.44, 0.24]], [2.9, 11.2, 4.8, 1.5, 2800, [0.27, 0.42, 0.22]], [-1.2, 15.2, 5.2, 1.7, 2600, [0.24, 0.4, 0.22]], [6.4, 15.0, 4.6, 1.5, 2200, [0.26, 0.42, 0.24]]]) {
      tree(x, z, h, sp, n, hsl);
      glowSprite(x + 0.3, 0.06, z + 0.3, 0.6, 0xffc27a, 1.1); groundGlow(x + 0.3, 0.02, z + 0.3, 1.8, 0xffb766, 0.45);
    }
    for (const [x, z] of [[-1.2, 15.2], [2.9, 11.2]]) { const tl = new THREE.SpotLight(0xffcf96, 16, 10, 0.6, 0.7, 2); tl.position.set(x + 0.45, 0.1, z + 0.5); tl.target.position.set(x, 3.3, z); scene.add(tl, tl.target); }
    for (const [x, z, r] of [[-6.2, 6.0, 0.55], [0.9, 7.4, 0.4], [4.8, 6.6, 0.5], [-3.2, 13.0, 0.5], [1.8, 14.2, 0.45]]) shrub(x, z, r, 360, [0.27, 0.52, 0.25]);
    for (const z of [5.4, 7.0, 8.6]) for (const sx of [-2.45, -0.95]) { cyl(0.04, 0.04, 0.4, M.charcoal, sx, 0.2, z, { seg: 10 }); cyl(0.035, 0.035, 0.03, M.ledHot, sx, 0.39, z, { seg: 10, cast: false }); groundGlow(sx, 0.02, z, 1.2, 0xffb766, 0.5); }
  }
  // distant silhouettes + stars
  const sil = new THREE.MeshLambertMaterial({ color: 0x0b120d });
  for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2 + rr(-0.05, 0.05), d = rr(24, 34), h = rr(5, 10);
    const m = new THREE.Mesh(i % 3 ? new THREE.SphereGeometry(h * 0.35, 10, 8) : new THREE.ConeGeometry(h * 0.3, h, 10), sil); m.position.set(Math.cos(a) * d, h * 0.5, Math.sin(a) * d); scene.add(m); }
  const sp = []; for (let i = 0; i < 1200; i++) { const th = rnd() * 6.28, y = rr(0.15, 1), r = Math.sqrt(1 - y * y); sp.push(Math.cos(th) * r * 180, y * 180, Math.sin(th) * r * 180); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));
}

// ---------------------------------------------------------------- platform and steps
const SX0 = -3.1, SX1 = -0.3;                                   // steps span
{
  boxMM(-PX + 0.05, PX - 0.05, 0, 0.52, -PZ + 0.05, PZ - 0.05, M.dark);
  boxMM(-PX, PX, 0.52, PLAT, -PZ, PZ, tileMats(MX.stoneBeige), { uv: 2.4 });
  // slatted plinth cladding
  const yS = () => [0.04, 0.5], e = 0.05;
  slats('x', SX1 + 0.05, PX - e, PZ - e, PZ - e + 0.03, yS, M.slat, 0.08, 0.055);
  slats('x', -PX + e, SX0 - 0.05, PZ - e, PZ - e + 0.03, yS, M.slat, 0.08, 0.055);
  slats('z', -PZ + e, PZ - e, PX - e, PX - e + 0.03, yS, M.slat, 0.08, 0.055);
  slats('z', -PZ + e, PZ - e, -PX + e - 0.03, -PX + e, yS, M.slat, 0.08, 0.055);
  // hidden LED under the platform edge + washes
  boxMM(-PX + 0.02, PX - 0.02, 0.497, 0.52, PZ - 0.035, PZ - 0.005, M.led, { cast: false });
  boxMM(PX - 0.035, PX - 0.005, 0.497, 0.52, -PZ + 0.02, PZ - 0.02, M.led, { cast: false });
  boxMM(-PX + 0.005, -PX + 0.035, 0.497, 0.52, -PZ + 0.02, PZ - 0.02, M.led, { cast: false });
  wallWashDown(SX1 + 0.05, PX - e, 0.5, 0.02, PZ - e + 0.036, 0.9); wallWashDown(-PX + e, SX0 - 0.05, 0.5, 0.02, PZ - e + 0.036, 0.9);
  floorWash(SX1 + 0.05, PX, 0.012, PZ, PZ + 1.1, 0.75); floorWash(-PX, SX0 - 0.05, 0.012, PZ, PZ + 1.1, 0.75);
  floorWashX(-PZ, PZ, 0.012, PX, PX + 1.1, 0.75);
  // steps: 4 risers of 0.15 m, treads 0.35 m, LED under every nosing
  for (let i = 1; i <= 3; i++) {
    const top = PLAT - 0.15 * i, z0 = PZ + 0.35 * (i - 1), z1 = z0 + 0.35;
    boxMM(SX0, SX1, 0, top - 0.04, PZ - 0.05, z1 - 0.025, MX.stoneBeige, { uv: 2 });
    boxMM(SX0 - 0.02, SX1 + 0.02, top - 0.04, top, z0 - 0.02, z1, tileMats(MX.stoneBeige), { uv: 2.4 });
    boxMM(SX0 + 0.03, SX1 - 0.03, top - 0.062, top - 0.042, z1 - 0.024, z1 - 0.006, M.led, { cast: false });
    floorWash(SX0, SX1, top - 0.15 + 0.008, z1, z1 + (i === 3 ? 0.9 : 0.34), i === 3 ? 0.8 : 1.0);
  }
  floorWash(SX0, SX1, PLAT - 0.15 + 0.008, PZ, PZ + 0.34, 1.0);
}

// ---------------------------------------------------------------- planters and greenery
function miniTree(x, y0, z, h, r, n, hsl, leaf = 0.1) {
  cyl(0.025, 0.045, h * 0.6, M.trunk, x, y0 + h * 0.3, z, { seg: 8 });
  foliage([{ x, y: y0 + h * 0.8, z, r }, { x: x + r * 0.5, y: y0 + h * 0.62, z: z + r * 0.2, r: r * 0.7 }, { x: x - r * 0.45, y: y0 + h * 0.66, z: z - r * 0.25, r: r * 0.7 }], n, leaf, hsl);
}
function planter(x0, x1, z0, z1, h, y0 = 0) {
  boxMM(x0, x1, y0, y0 + h, z0, z1, MX.stoneBeige, { uv: 1.5 });
  boxMM(x0 + 0.05, x1 - 0.05, y0 + h - 0.01, y0 + h + 0.004, z0 + 0.05, z1 - 0.05, M.mulch, { cast: false });
}
{
  const zp = PZ + 0.06;
  planter(SX1 + 0.15, SX1 + 1.55, zp, zp + 0.64, 0.5);                  // right of the steps
  spiky(SX1 + 0.55, 0.5, zp + 0.32, 20, 0.75, [0.29, 0.48, 0.3]); shrub(SX1 + 1.15, zp + 0.32, 0.3, 300, [0.26, 0.5, 0.26], 0.42);
  glowSprite(SX1 + 0.85, 0.62, zp + 0.56, 0.5, 0xffc27a, 1.2);
  planter(PX - 1.05, PX + 0.25, zp, zp + 0.74, 0.5);                    // front-right corner
  miniTree(PX - 0.4, 0.5, zp + 0.36, 1.5, 0.5, 900, [0.25, 0.42, 0.3]); spiky(PX - 0.8, 0.5, zp + 0.44, 14, 0.5, [0.3, 0.5, 0.3]);
  planter(SX0 - 1.35, SX0 - 0.15, zp, zp + 0.74, 0.5);                  // left of the steps
  miniTree(SX0 - 0.75, 0.5, zp + 0.36, 1.7, 0.55, 1000, [0.24, 0.38, 0.32]); shrub(SX0 - 0.45, zp + 0.44, 0.22, 200, [0.27, 0.5, 0.26], 0.45);
  // tall plants inside: beside the TV wall and on the left wall
  for (const [x, z] of [[1.56, Z1 - 0.42], ...(TVOPT === 'arm' ? [] : [[-X1 + 0.36, 1.05]])]) {
    boxMM(x - 0.19, x + 0.19, Y0, Y0 + 0.5, z - 0.19, z + 0.19, MX.stoneBeige);
    miniTree(x, Y0 + 0.5, z, 1.7, 0.34, 650, [0.26, 0.45, 0.28], 0.12);
  }
  for (const [x, z] of [[PX - 0.4, zp + 0.6], [SX0 - 0.75, zp + 0.6]]) glowSprite(x, 0.62, z, 0.5, 0xffc27a, 1.2);
  { const tl = new THREE.PointLight(0xffcf96, 2.4, 4.5, 2); tl.position.set(PX - 0.7, 1.0, PZ + 1.1); scene.add(tl); }
}

// ---------------------------------------------------------------- pergola: frame, louvered roof, LED, fan
const louvers = [];
const fan = new THREE.Group(); scene.add(fan);
{
  const P = 0.14;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) boxMM(sx * X1 - (sx > 0 ? P : 0), sx * X1 + (sx > 0 ? 0 : P), Y0, YB, sz * Z1 - (sz > 0 ? P : 0), sz * Z1 + (sz > 0 ? 0 : P), M.alu);
  boxMM(-X1, X1, YB, YT, Z1 - P, Z1, M.alu); boxMM(-X1, X1, YB, YT, -Z1, -Z1 + P, M.alu);
  boxMM(-X1, -X1 + P, YB, YT, -Z1 + P, Z1 - P, M.alu); boxMM(X1 - P, X1, YB, YT, -Z1 + P, Z1 - P, M.alu);
  boxMM(-0.05, 0.05, YB + 0.03, YT, -Z1 + P, Z1 - P, M.alu);                                                 // centre beam
  // adjustable louvers (two bays), timber-look underside
  const nL = 24, span = PD - 2 * P, pitch = span / nL, lm = [MX.louverTop, MX.louverTop, MX.louverTop, M.slat, MX.louverTop, MX.louverTop];
  for (const [xa, xb] of [[-X1 + P, -0.05], [0.05, X1 - P]]) for (let i = 0; i < nL; i++) {
    const m = new THREE.Mesh(worldBox(xb - xa, 0.028, pitch - 0.01, 1.2), lm);
    m.position.set((xa + xb) / 2, YT - 0.1, -Z1 + P + pitch * (i + 0.5)); m.castShadow = m.receiveShadow = true; scene.add(m); louvers.push(m);
  }
  // perimeter LED under the beams
  const yl = YB - 0.012;
  boxMM(-X1 + P, X1 - P, yl - 0.012, yl, Z1 - P - 0.03, Z1 - P - 0.012, M.led, { cast: false }); boxMM(-X1 + P, X1 - P, yl - 0.012, yl, -Z1 + P + 0.012, -Z1 + P + 0.03, M.led, { cast: false });
  boxMM(-X1 + P + 0.012, -X1 + P + 0.03, yl - 0.012, yl, -Z1 + P, Z1 - P, M.led, { cast: false }); boxMM(X1 - P - 0.03, X1 - P - 0.012, yl - 0.012, yl, -Z1 + P, Z1 - P, M.led, { cast: false });
  boxMM(-X1 + 0.02, X1 - 0.02, YB - 0.012, YB, Z1 + 0.001, Z1 + 0.012, M.led, { cast: false });               // outer front line
  // ceiling fan
  const FANX = TVOPT === 'projector' ? 1.55 : 0;                  // keep the fan out of the projector beam
  cyl(0.018, 0.018, 0.34, M.blackMetal, FANX, YB - 0.14, -0.45, { cast: false });
  fan.position.set(FANX, YB - 0.36, -0.45);
  cyl(0.1, 0.12, 0.13, M.blackMetal, 0, 0, 0, { parent: fan, cast: false });
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Group(); b.rotation.y = i / 5 * Math.PI * 2; fan.add(b);
    const bl = boxMM(0.14, 0.78, -0.012, 0, -0.075, 0.075, M.woodDark, { parent: b, cast: false, r: 0.006 }); bl.rotation.x = 0.16;
  }
}

// ---------------------------------------------------------------- enclosure: slat walls, sliding glass, TV, sconces
function glassPanel(axis, c, a0, a1, y0, y1) {
  const f = 0.035, d = 0.02;
  const B = (p0, p1, yy0, yy1, mat, o, dd = d) => axis === 'x' ? boxMM(p0, p1, yy0, yy1, c - dd, c + dd, mat, o) : boxMM(c - dd, c + dd, yy0, yy1, p0, p1, mat, o);
  B(a0, a1, y1 - f, y1, M.alu); B(a0, a1, y0, y0 + f, M.alu); B(a0, a0 + f, y0, y1, M.alu); B(a1 - f, a1, y0, y1, M.alu);
  B(a0 + f, a1 - f, y0 + f, y1 - f, M.glass, { cast: false, receive: false }, 0.005);
}
const GX0 = -X1 + 0.14, GX1 = X1 - 0.14, GP = (GX1 - GX0) / 5;        // five front panels of 1.14 m
const TVZ = Z1 - 0.65;                                                // front face (sofa side) of the TV-lift cabinet
const TVLZ = TVZ + 0.2, TV_DOWN = Y0 + 0.46, TV_UP = Y0 + 1.4;        // TV plane and its centre height when hidden / raised
const tvLift = new THREE.Group(); scene.add(tvLift);
let setTV = () => {};
{
  const ZG = Z1 - 0.07;
  boxMM(GX0, GX1, YB - 0.05, YB, ZG - 0.06, ZG + 0.03, M.alu, { cast: false }); boxMM(GX0, GX1, Y0, Y0 + 0.012, ZG - 0.06, ZG + 0.03, M.alu, { cast: false });   // tracks
  for (let i = 0; i < 5; i++) {
    if (i === 0) glassPanel('x', ZG - 0.045, GX0 + GP - 0.06, GX0 + 2 * GP - 0.06, Y0 + 0.012, YB - 0.05);   // entrance leaf, parked behind the second panel
    else glassPanel('x', ZG, GX0 + GP * i, GX0 + GP * (i + 1), Y0 + 0.012, YB - 0.05);
  }
  const XG = X1 - 0.07, zs = (PD - 0.28) / 4;
  for (let i = 0; i < 4; i++) glassPanel('z', XG, -Z1 + 0.14 + zs * i, -Z1 + 0.14 + zs * (i + 1), Y0 + 0.012, YB - 0.05);
  // rear slat wall and left slat screen
  boxMM(GX0, GX1, Y0, YB, -Z1, -Z1 + 0.05, M.dark, { cast: true });
  slats('x', GX0, GX1, -Z1 + 0.05, -Z1 + 0.08, () => [Y0, YB], M.slat, 0.08, 0.055);
  boxMM(-X1, -X1 + 0.05, Y0, YB, -Z1 + 0.14, Z1 - 0.14, M.dark);
  slats('z', -Z1 + 0.14, Z1 - 0.14, -X1 + 0.05, -X1 + 0.08, () => [Y0, YB], M.slat, 0.08, 0.055);
  // sconces with up/down wash
  const SY = Y0 + 1.75, ph = YB - Y0;
  const wm = () => new THREE.MeshBasicMaterial({ map: washTexture(1.1, ph, 0.55, SY - Y0), color: new THREE.Color(0xffb766).multiplyScalar(1.1), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
  for (const x of [-1.9, 0, 1.9]) {
    boxMM(x - 0.04, x + 0.04, SY - 0.14, SY + 0.14, -Z1 + 0.08, -Z1 + 0.16, M.blackMetal);
    boxMM(x - 0.03, x + 0.03, SY + 0.14, SY + 0.146, -Z1 + 0.09, -Z1 + 0.15, M.ledHot, { cast: false }); boxMM(x - 0.03, x + 0.03, SY - 0.146, SY - 0.14, -Z1 + 0.09, -Z1 + 0.15, M.ledHot, { cast: false });
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, ph), wm()); w.position.set(x, (Y0 + YB) / 2, -Z1 + 0.086); scene.add(w);
  }
  for (const z of (TVOPT === 'arm' ? [-0.9, 0.05] : [-0.9, 1.0])) {
    boxMM(-X1 + 0.08, -X1 + 0.16, SY - 0.14, SY + 0.14, z - 0.04, z + 0.04, M.blackMetal);
    boxMM(-X1 + 0.09, -X1 + 0.15, SY + 0.14, SY + 0.146, z - 0.03, z + 0.03, M.ledHot, { cast: false }); boxMM(-X1 + 0.09, -X1 + 0.15, SY - 0.146, SY - 0.14, z - 0.03, z + 0.03, M.ledHot, { cast: false });
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, ph), wm()); w.rotation.y = Math.PI / 2; w.position.set(-X1 + 0.086, (Y0 + YB) / 2, z); scene.add(w);
  }
  const tvTex = makeTex(640, 360, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.6); sky.addColorStop(0, '#2b2a6b'); sky.addColorStop(0.55, '#b5628c'); sky.addColorStop(1, '#ffb070');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    const peaks = (base, amp, col, n, seed) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, h); let s = seed;
      for (let i = 0; i <= n; i++) { s = (s * 9301 + 49297) % 233280; g.lineTo(i / n * w, base - (i % 2 ? amp : amp * 0.35) * (0.6 + 0.4 * s / 233280)); } g.lineTo(w, h); g.fill(); };
    peaks(h * 0.62, 150, '#3a4a8a', 7, 11); peaks(h * 0.66, 110, '#243566', 9, 29); peaks(h * 0.7, 60, '#16213f', 12, 57);
    const lake = g.createLinearGradient(0, h * 0.7, 0, h); lake.addColorStop(0, '#c98a8a'); lake.addColorStop(1, '#1c2a52'); g.fillStyle = lake; g.fillRect(0, h * 0.7, w, h * 0.3);
    g.fillStyle = 'rgba(255,255,255,0.75)'; for (const [x, y] of [[95, 105], [280, 95], [470, 112]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - 28, y + 46); g.lineTo(x + 30, y + 44); g.fill(); }
  }, { clampEdge: true });
  const tvScreen = (parent, z) => {
    boxMM(-0.76, 0.76, -0.44, 0.44, z - 0.02, z + 0.02, M.blackMetal, { parent, cast: false });
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.46, 0.82), new THREE.MeshBasicMaterial({ map: tvTex, color: new THREE.Color(1.5, 1.5, 1.5) }));
    sc.rotation.y = Math.PI; sc.position.set(0, 0, z - 0.022); parent.add(sc); screens.push(sc);
  };
  const screens = [], screenOn = (on) => { for (const sc of screens) { sc.material.color.setScalar(on ? 1.5 : 0.025); sc.material.map = on ? tvTex : null; sc.material.needsUpdate = true; } };
  const rod = (mat, r = 0.022) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 10), mat); scene.add(m); return m; };
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
  const placeRod = (m, a, b) => { _b.subVectors(b, a); m.position.copy(a).addScaledVector(_b, 0.5); m.scale.set(1, _b.length(), 1); m.quaternion.setFromUnitVectors(_up, _b.normalize()); };
  if (TVOPT === 'lift') {
    // TV-lift cabinet in front of the glass (1.80 x 0.45 x 0.90 m); the 65" TV rises out of it
    const CW = 0.9, CZ0 = TVZ, CZ1 = TVZ + 0.45, CH = Y0 + 0.9;
    boxMM(-CW + 0.04, CW - 0.04, Y0, Y0 + 0.08, CZ0 + 0.04, CZ1 - 0.02, M.dark);
    boxMM(-CW, CW, Y0 + 0.08, CH - 0.03, CZ0, CZ1, M.woodDark, { uv: 1.2 });
    slats('x', -CW, CW, CZ0 - 0.02, CZ0, () => [Y0 + 0.1, CH - 0.05], M.slat, 0.06, 0.04);
    boxMM(-CW - 0.01, CW + 0.01, CH - 0.03, CH, CZ0 - 0.03, CZ1 + 0.01, MX.marbleBlack);
    boxMM(-0.78, 0.78, CH - 0.002, CH + 0.002, TVLZ - 0.035, TVLZ + 0.035, M.dark, { cast: false });       // lift slot
    boxMM(-CW + 0.05, CW - 0.05, Y0 + 0.07, Y0 + 0.08, CZ0 + 0.035, CZ0 + 0.045, glowMat(0xffc27a, 3.5), { cast: false });
    floorWash(-CW, CW, Y0 + 0.006, CZ0, CZ0 - 0.55, 0.55);
    tvScreen(tvLift, TVLZ);
    boxMM(-0.03, 0.03, -0.9, -0.44, TVLZ - 0.01, TVLZ + 0.01, M.blackMetal, { parent: tvLift, cast: false });   // lift column
    setTV = (v) => { tvLift.position.y = TV_DOWN + (TV_UP - TV_DOWN) * v; tvLift.visible = v > 0.002; };
  } else if (TVOPT === 'projector') {
    // 110" motorised screen in a cassette under the front beam; projector hidden under the rear beam
    const SZ = Z1 - 0.3, SW = 2.6, DROP = 1.64, CY = YB - 0.13, IW = 2.44, IH = 1.37;
    boxMM(-SW / 2 - 0.1, SW / 2 + 0.1, CY, YB, SZ - 0.07, SZ + 0.07, M.blackMetal);
    const sg = new THREE.PlaneGeometry(SW, 1); sg.translate(0, -0.5, 0);
    const fabric = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0xf1f0ec, roughness: 0.9, side: THREE.DoubleSide })); fabric.position.set(0, CY, SZ); scene.add(fabric);
    const bar = boxMM(-SW / 2 - 0.02, SW / 2 + 0.02, -0.035, 0, SZ - 0.015, SZ + 0.015, M.blackMetal, { cast: false });
    const img = new THREE.Mesh(new THREE.PlaneGeometry(IW, IH), new THREE.MeshBasicMaterial({ map: tvTex, color: new THREE.Color(1.25, 1.25, 1.25) }));
    img.rotation.y = Math.PI; scene.add(img);
    const PZp = -Z1 + 0.5, PY = YB - 0.09;
    boxMM(-0.21, 0.21, YB - 0.17, YB - 0.01, PZp - 0.2, PZp + 0.15, M.blackMetal);
    { const l = cyl(0.045, 0.045, 0.03, glowMat(0xbfd0ff, 2.5), 0, PY, PZp + 0.165, { cast: false }); l.rotation.x = Math.PI / 2; }
    const iy = CY - DROP + 0.08 + IH / 2;
    const bg = new THREE.BufferGeometry(), apex = [0, PY, PZp + 0.18], c = (sx, sy) => [sx * IW / 2, iy + sy * IH / 2, SZ - 0.01];
    bg.setAttribute('position', new THREE.Float32BufferAttribute([...apex, ...c(-1, -1), ...c(1, -1), ...apex, ...c(1, -1), ...c(1, 1), ...apex, ...c(1, 1), ...c(-1, 1), ...apex, ...c(-1, 1), ...c(-1, -1)], 3));
    const beam = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9fb4ff).multiplyScalar(0.05), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    scene.add(beam);
    setTV = (v) => {
      const d = 0.03 + DROP * v;
      fabric.scale.y = d; bar.position.y = CY - d;
      img.visible = beam.visible = v > 0.97; img.position.set(0, iy, SZ - 0.006);
    };
  } else if (TVOPT === 'drop') {
    // 65" TV on a motorised flip-down mount under the centre roof beam: folds flat under the roof, flips down and lowers 0.55 m
    const HZ = 1.25, HY = YB - 0.08, LOW = 0.55;
    boxMM(-0.28, 0.28, YB - 0.06, YB + 0.03, HZ - 0.12, HZ + 0.98, M.blackMetal);
    const pivot = new THREE.Group(); scene.add(pivot);
    const tvG = new THREE.Group(); tvG.position.y = -0.44; pivot.add(tvG); tvScreen(tvG, -0.02);
    const arms = [-0.45, 0.45].map(() => rod(M.blackMetal, 0.018));
    setTV = (v) => {
      const s1 = clamp(v / 0.5), s2 = clamp((v - 0.5) / 0.5), y = HY - LOW * ease(s2);
      pivot.position.set(0, y, HZ); pivot.rotation.x = -(Math.PI / 2) * (1 - ease(s1)); screenOn(v > 0.97);
      arms.forEach((m, i) => { const x = i ? 0.45 : -0.45; m.visible = s2 > 0.001; placeRod(m, _a.set(x, YB - 0.06, HZ), new THREE.Vector3(x, y - 0.01, HZ)); });
    };
  } else if (TVOPT === 'arm') {
    // 65" TV on an articulating arm on the left slat wall near the front corner: flat on the wall when closed, pulled out and turned to the sofa when open
    const WX = -X1 + 0.08, AZ = 1.55, AY = Y0 + 1.45;
    boxMM(WX, WX + 0.03, AY - 0.22, AY + 0.22, AZ - 0.14, AZ + 0.14, M.blackMetal);
    const tvG = new THREE.Group(); scene.add(tvG); tvScreen(tvG, 0);
    const a1 = rod(M.blackMetal, 0.025), a2 = rod(M.blackMetal, 0.025), elbow = new THREE.Vector3();
    setTV = (v) => {
      const e = ease(v), px = WX + 0.07 + 0.62 * e, pz = AZ - 0.15 * e;
      const dx = 0.3 - px, dz = -1.6 - pz, open = Math.atan2(-dx, -dz);
      tvG.position.set(px, AY, pz); tvG.rotation.y = -Math.PI / 2 + (open + Math.PI / 2) * e; screenOn(v > 0.97);
      const back = new THREE.Vector3(Math.sin(tvG.rotation.y), 0, Math.cos(tvG.rotation.y)).multiplyScalar(0.03).add(tvG.position);
      const wall = _a.set(WX + 0.03, AY, AZ);
      elbow.set((wall.x + back.x) / 2 + 0.05 * e, AY, (wall.z + back.z) / 2 + 0.28 * e);
      a1.visible = a2.visible = e > 0.02; placeRod(a1, wall, elbow); placeRod(a2, elbow, back);
    };
  }
}

// ---------------------------------------------------------------- U-shaped sofa, fire table, heater
const flames = [];
const FZ0 = -0.5, HTX = 2.3, HTZ = 1.75;     // fire table centre; heater position (1.35 m clear of the nearest seat)
function pillow(x, y, z, ry, mat, tilt = -0.28) { const p = rbox(0.44, 0.44, 0.15, 0.065, mat, x, y, z); p.rotation.order = 'YXZ'; p.rotation.y = ry; p.rotation.x = tilt; return p; }
{
  const run = (x0, x1, z0, z1, back) => {
    boxMM(x0, x1, Y0 + 0.07, Y0 + 0.3, z0, z1, MX.rattan, { uv: 1.2 });
    boxMM(x0 + 0.06, x1 - 0.06, Y0, Y0 + 0.07, z0 + 0.06, z1 - 0.06, M.dark);
    const alongX = (x1 - x0) > (z1 - z0), len = alongX ? x1 - x0 : z1 - z0, n = Math.round(len / 0.84), m = len / n, bt = 0.24;
    for (let i = 0; i < n; i++) {
      if (alongX) {
        const cx = x0 + (i + 0.5) * m;
        rbox(m - 0.02, 0.17, (z1 - z0) - bt, 0.05, M.linen, cx, Y0 + 0.385, z0 + bt + ((z1 - z0) - bt) / 2);
        rbox(m - 0.03, 0.44, 0.2, 0.07, M.linen, cx, Y0 + 0.64, z0 + 0.13).rotation.x = -0.12;
      } else {
        const cz = z0 + (i + 0.5) * m, e = back === 'E';
        rbox((x1 - x0) - bt, 0.17, m - 0.02, 0.05, M.linen, e ? x0 + ((x1 - x0) - bt) / 2 : x0 + bt + ((x1 - x0) - bt) / 2, Y0 + 0.385, cz);
        rbox(0.2, 0.44, m - 0.03, 0.07, M.linen, e ? x1 - 0.13 : x0 + 0.13, Y0 + 0.64, cz).rotation.z = e ? -0.12 : 0.12;
      }
    }
  };
  const SXo = X1 - 0.15, SD = 0.8, ZB = -Z1 + 0.1, RZ = 0.4;             // sofa outer half-width, sofa depth 0.80 m, back edge, front end of the returns
  run(-SXo, SXo, ZB, ZB + SD, 'N');
  run(-SXo, -SXo + SD, ZB + SD, RZ, 'W');
  run(SXo - SD, SXo, ZB + SD, RZ, 'E');
  for (const s of [-1, 1]) rbox(0.2, 0.44, SD - 0.28, 0.07, M.linen, s * (SXo - 0.13), Y0 + 0.64, ZB + 0.24 + (SD - 0.28) / 2).rotation.z = -s * 0.12;   // corner backs
  const pm = [M.olive, M.fabric, M.sage, M.olive, M.fabric, M.olive, M.sage];
  [-2.44, -1.63, -0.81, 0.0, 0.81, 1.63, 2.44].forEach((x, i) => pillow(x, Y0 + 0.69, ZB + 0.36, rr(-0.12, 0.12), pm[i]));
  for (const s of [-1, 1]) { pillow(s * (SXo - 0.36), Y0 + 0.69, -1.05, -s * Math.PI / 2 + rr(-0.1, 0.1), M.olive); pillow(s * (SXo - 0.36), Y0 + 0.69, -0.1, -s * Math.PI / 2 + rr(-0.1, 0.1), M.fabric); }
  boxMM(-1.95, 1.95, Y0, Y0 + 0.012, -1.5, 0.75, M.rug, { cast: false, uv: 0 });
  // fire table in black marble
  const FZ = -0.5;
  boxMM(-0.95, 0.95, Y0 + 0.05, Y0 + 0.42, FZ - 0.33, FZ + 0.33, MX.marbleBlack);
  boxMM(-0.88, 0.88, Y0, Y0 + 0.05, FZ - 0.27, FZ + 0.27, M.dark);
  boxMM(-0.72, 0.72, Y0 + 0.42, Y0 + 0.426, FZ - 0.12, FZ + 0.12, M.dark, { cast: false });
  const rock = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.035, 0), std({ color: 0x2a2623, roughness: 0.9, emissive: 0xff5a14, emissiveIntensity: 0.35 }), 60);
  for (let i = 0; i < 60; i++) { _p.set(rr(-0.7, 0.7), Y0 + 0.44 + rr(0, 0.02), FZ + rr(-0.1, 0.1)); _e.set(rr(0, 6), rr(0, 6), rr(0, 6)); _q.setFromEuler(_e); const sc = rr(0.7, 1.4); _s.set(sc, sc * 0.8, sc); _m.compose(_p, _q, _s); rock.setMatrixAt(i, _m); }
  scene.add(rock);
  const flameTex = makeTex(64, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h * 0.72, 2, w / 2, h * 0.6, h * 0.62);
    gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.25, 'rgba(255,190,70,0.95)'); gr.addColorStop(0.6, 'rgba(255,95,20,0.55)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 2); g.bezierCurveTo(w * 0.95, h * 0.45, w * 0.95, h * 0.95, w / 2, h - 2); g.bezierCurveTo(w * 0.05, h * 0.95, w * 0.05, h * 0.45, w / 2, 2); g.fill();
  }, { clampEdge: true });
  const flameMat = () => new THREE.SpriteMaterial({ map: flameTex, color: new THREE.Color(0xffb060).multiplyScalar(2.6), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  for (let i = 0; i < 13; i++) { const s = new THREE.Sprite(flameMat()); s.userData = { x: -0.66 + i * 0.11, y: Y0 + 0.44, z: FZ + rr(-0.04, 0.04), k: 1, ph: rr(0, 6.28) }; scene.add(s); flames.push(s); }
  // pyramid patio heater in the front-right corner
  const hx = HTX, hz = HTZ, bar = (a, b, r, mat) => {
    const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), mat);
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; scene.add(m);
  };
  boxMM(hx - 0.21, hx + 0.21, Y0, Y0 + 0.74, hz - 0.21, hz + 0.21, M.blackMetal);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bar(new THREE.Vector3(hx + sx * 0.2, Y0 + 0.74, hz + sz * 0.2), new THREE.Vector3(hx + sx * 0.1, Y0 + 2.02, hz + sz * 0.1), 0.012, M.blackMetal);
  cyl(0.05, 0.05, 1.25, std({ color: 0xffe2b0, roughness: 0.1, transparent: true, opacity: 0.22, depthWrite: false }), hx, Y0 + 1.38, hz, { cast: false });
  { const cap = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.14, 4), M.blackMetal); cap.rotation.y = Math.PI / 4; cap.position.set(hx, Y0 + 2.1, hz); cap.castShadow = true; scene.add(cap); }
  for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(flameMat()); s.userData = { x: hx, y: Y0 + 0.78 + i * 0.3, z: hz, k: 1.9 - i * 0.25, ph: rr(0, 6.28), heater: 1 }; scene.add(s); flames.push(s); }
}
const fireLight = new THREE.PointLight(0xff9a40, 3.4, 6, 2); fireLight.position.set(0, Y0 + 0.85, FZ0); scene.add(fireLight);
const heatLight = new THREE.PointLight(0xff9a40, 1.6, 4, 2); heatLight.position.set(HTX - 0.25, Y0 + 1.5, HTZ - 0.2); scene.add(heatLight);
function updateFire(t) {
  for (const s of flames) {
    const u = s.userData, f = 0.75 + 0.25 * Math.sin(t * 9.1 + u.ph) + 0.12 * Math.sin(t * 23.7 + u.ph * 2.3) + 0.08 * Math.sin(t * 41.3 + u.ph * 4.1);
    const hgt = (u.heater ? 0.42 : 0.26) * u.k * f, wid = (u.heater ? 0.1 : 0.13) * (0.85 + 0.15 * Math.sin(t * 13 + u.ph));
    s.scale.set(wid, hgt, 1); s.position.set(u.x + 0.012 * Math.sin(t * 6.3 + u.ph), u.y + hgt * 0.45, u.z); s.material.opacity = 0.7 + 0.3 * f / 1.2;
  }
  fireLight.intensity = 3.2 * (0.85 + 0.12 * Math.sin(t * 8.3) + 0.07 * Math.sin(t * 19.1));
  heatLight.intensity = 1.6 * (0.9 + 0.1 * Math.sin(t * 6.1 + 1));
}

// ---------------------------------------------------------------- lighting (dusk + warm LED)
scene.add(new THREE.HemisphereLight(0x34467a, 0x0d0f13, 0.55));
const moon = new THREE.DirectionalLight(0x9fb4e6, 0.5);
moon.position.set(9, 16, 11); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 55 }); moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.02;
scene.add(moon);
{
  const key = new THREE.SpotLight(0xffc98a, 30, 0, 1.28, 0.9, 2); key.position.set(0, YB - 0.1, -0.3); key.target.position.set(0, Y0, -0.25);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.01; key.shadow.camera.near = 0.3; key.shadow.camera.far = 7; scene.add(key, key.target);
  for (const [x, z] of [[-1.7, -0.9], [1.7, -0.9], [-0.6, 1.3]]) { const pl = new THREE.PointLight(0xffbd78, 4.4, 6, 2); pl.position.set(x, YB - 0.35, z); scene.add(pl); }
  const st = new THREE.PointLight(0xffb766, 2.2, 5, 2); st.position.set((SX0 + SX1) / 2, 0.9, PZ + 1.5); scene.add(st);
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
const _v = new THREE.Vector3();
function project(x, y, z) { _v.set(x, y, z).project(camera); return [(_v.x * 0.5 + 0.5) * W, (-_v.y * 0.5 + 0.5) * H, _v.z]; }

// ---------------------------------------------------------------- tour timeline
const XF = 0.45, E = Y0 + 1.5;
const shots = [
  { name: 'ext', t0: 0, t1: 24, fov: 50, cam: track([
      [0, -5.4, 1.5, 12.8, -0.3, 1.9, 1.0],
      [4.2, -3.6, 1.7, 9.8, -0.4, 1.95, 1.0],
      [8.3, 0.6, 2.0, 9.8, 0, 1.9, 0.5],
      [12, 6.3, 2.6, 7.8, 0.3, 1.8, 0.3],
      [15.2, 7.0, 7.2, 6.6, 0, 1.3, 0],
      [18.5, 0.6, 12.6, 4.7, 0, 0.6, 0.35],
      [21.7, -4.6, 7.2, 8.0, -0.3, 1.2, 0.4],
      [24.45, -3.2, 2.6, 8.2, -1.9, 1.6, 1.6]]),
    state: (t) => ({ louver: smooth(14.3, 16.6, t) * (1 - smooth(20.8, 22.6, t)), labels: smooth(16.8, 17.6, t) * (1 - smooth(20.3, 21.0, t)) }) },
  { name: 'enter', t0: 24, t1: 28.4, fov: 60, cam: lin(24 - XF, 28.4 + XF, [-2.29, 1.75, 6.4, -1.9, 1.75, 0], [-1.85, E, 1.3, 0.9, Y0 + 0.85, -1.7]),
    state: () => ({ louver: 0, labels: 0 }), cap: ['داخل الجلسة', 'كنب على شكل U بعمق 0.80 م', 'طاولة نار وسطية • مساحة مفتوحة قدام الكنب'] },
  { name: 'tv', t0: 28.4, t1: 35.0, fov: 60, cam: lin(28.4 - XF, 35.0 + XF, [0.55, Y0 + 1.18, -1.5, 0.15, Y0 + 1.05, 6.0], [0.25, Y0 + 1.2, -1.25, 0.05, Y0 + 1.2, 6.0]),
    state: (t) => ({ louver: 0, labels: 0, tv: ease((t - 30.2) / 2.6) }), cap: ['تلفزيون مخفي يطلع بالريموت', 'وهو نازل: الواجهة مفتوحة على الحديقة', 'كبت 1.80 × 0.45 × 0.90 م • شاشة 65 بوصة'] },
  { name: 'roof', t0: 35.0, t1: 38.6, fov: 62, cam: lin(35.0 - XF, 38.6 + XF, [1.55, Y0 + 1.2, 0.1, -1.6, Y0 + 0.95, -1.4], [1.35, Y0 + 1.25, -0.05, -0.9, Y0 + 2.2, -0.9]),
    state: () => ({ louver: 0, labels: 0, tv: 1 }), cap: ['سقف شرائح متحرك', 'مروحة سقف • إضاءة LED مخفية', 'جدران خشب شرائح • زجاج سحاب'] },
  { name: 'final', t0: 38.6, t1: DURATION, fov: 50, cam: lin(38.6 - XF, DURATION, [-3.4, 1.9, 9.4, -0.2, 1.9, 0.6], [-4.6, 3.5, 13.6, 0, 1.8, 0.3]),
    state: () => ({ louver: 0, labels: 0, tv: 0 }) },
];

let lastStateKey = '';
function applyState(st, t) {
  const a = -ease(st.louver) * 1.22;      // blades turn edge-on to the overhead camera
  for (const m of louvers) m.rotation.x = a;
  fan.rotation.y = t * 2.6;
  updateFire(t);
  setTV(ease(st.tv || 0));
  const key = st.louver.toFixed(3);
  if (key !== lastStateKey) { renderer.shadowMap.needsUpdate = true; lastStateKey = key; }
}
function renderShot(shot, t) {
  const c = shot.cam(t);
  camera.position.set(c[0], c[1], c[2]); camera.lookAt(c[3], c[4], c[5]);
  camera.fov = shot.fov; camera.updateProjectionMatrix();
  const st = shot.state(t); applyState(st, t);
  composer.render();
  return st;
}

// ---------------------------------------------------------------- overlays
function titleCard(a) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl'; ctx.textAlign = 'center';
  const gr = ctx.createLinearGradient(0, 0, 0, H * 0.5); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H * 0.5);
  ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${64 * K}px Cairo`; ctx.fillText('الجلسة الخارجية', W / 2, 112 * K);
  ctx.fillStyle = GOLD; ctx.fillRect(W / 2 - 70 * K, 134 * K, 140 * K, 3 * K);
  ctx.fillStyle = '#efe0c6'; ctx.font = `400 ${30 * K}px Cairo`; ctx.fillText('الوضع الشتوي', W / 2, 182 * K);
  ctx.restore();
}
function endCard(a) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl'; ctx.textAlign = 'center';
  let gr = ctx.createLinearGradient(0, 0, 0, H * 0.42); gr.addColorStop(0, 'rgba(0,0,0,0.65)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H * 0.42);
  gr = ctx.createLinearGradient(0, H * 0.6, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = gr; ctx.fillRect(0, H * 0.6, W, H * 0.4);
  ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${54 * K}px Cairo`; ctx.fillText('الجلسة الخارجية — الوضع الشتوي', W / 2, 96 * K);
  ctx.fillStyle = GOLD; ctx.fillRect(W / 2 - 60 * K, 116 * K, 120 * K, 3 * K);
  ctx.fillStyle = '#e6d3b2'; ctx.font = `700 ${20 * K}px Cairo`;
  ctx.fillText('سقف شرائح متحرك   •   واجهة زجاج على الحديقة   •   تلفزيون مخفي   •   طاولة نار   •   دفاية   •   كنب 0.80 م', W / 2, 160 * K);
  const items = [['العرض', '6.00 م'], ['العمق', '5.00 م'], ['الارتفاع', '3.00 م'], ['ارتفاع المصطبة', '0.60 م']];
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
function planLabels(a) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl'; ctx.textAlign = 'center';
  const labels = [['كنب U بعمق 0.80 م', 0, YT + 0.2, -2.0], ['طاولة نار', 0, YT + 0.2, FZ0], ['دفاية', HTX, YT + 0.2, HTZ], ['تلفزيون مخفي', 0, YT + 0.2, TVZ + 0.22], ['المدخل', GX0 + GP / 2, 0.9, PZ + 0.5]];
  for (const [txt, x, y, z] of labels) {
    const [sx, sy, sz] = project(x, y, z); if (sz > 1) continue;
    ctx.font = `700 ${17 * K}px Cairo`; const w = ctx.measureText(txt).width + 26 * K, h = 32 * K;
    ctx.fillStyle = 'rgba(18,14,10,0.76)'; rrect(sx - w / 2, sy - h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = '#fbf3e6'; ctx.fillText(txt, sx, sy + 6 * K);
  }
  const dim = (p0, p1, txt) => {
    const a0 = project(...p0), a1 = project(...p1); if (a0[2] > 1 || a1[2] > 1) return;
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2 * K; ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke();
    const ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]) + Math.PI / 2, tl = 9 * K;
    for (const q of [a0, a1]) { ctx.beginPath(); ctx.moveTo(q[0] - Math.cos(ang) * tl, q[1] - Math.sin(ang) * tl); ctx.lineTo(q[0] + Math.cos(ang) * tl, q[1] + Math.sin(ang) * tl); ctx.stroke(); }
    const mx = (a0[0] + a1[0]) / 2, my = (a0[1] + a1[1]) / 2;
    ctx.font = `700 ${18 * K}px Cairo`; const w = ctx.measureText(txt).width + 22 * K;
    ctx.fillStyle = 'rgba(18,14,10,0.82)'; rrect(mx - w / 2, my - 15 * K, w, 30 * K, 6 * K); ctx.fill();
    ctx.fillStyle = GOLD; ctx.fillText(txt, mx, my + 6.5 * K);
  };
  dim([-X1, 0.05, PZ + 2.0], [X1, 0.05, PZ + 2.0], '6.00 م'); dim([X1 + 1.3, 0.05, -Z1], [X1 + 1.3, 0.05, Z1], '5.00 م');
  ctx.restore();
}
function overlays(t, shot, w) {
  if (shot.name === 'ext') {
    titleCard(w * smooth(0.6, 1.6, t) * (1 - smooth(5.2, 6.2, t)));
    caption('الواجهة', 'إطار ألمنيوم أسود • زجاج سحاب', w * smooth(7.6, 8.2, t) * (1 - smooth(12.8, 13.4, t)), 'إضاءة LED مخفية تحت المصطبة والدرج');
    planLabels(w * shot.state(t).labels);
    caption('المسقط من الأعلى', '6.00 × 5.00 م  •  المساحة 30 م²', w * smooth(16.8, 17.4, t) * (1 - smooth(20.6, 21.2, t)), 'سقف الشرائح مفتوح');
  } else if (shot.cap) {
    caption(shot.cap[0], shot.cap[1], w * smooth(shot.t0 + 0.4, shot.t0 + 0.9, t) * (1 - smooth(shot.t1 - 0.7, shot.t1 - 0.25, t)), shot.cap[2]);
  } else if (shot.name === 'final') {
    endCard(w * smooth(39.8, 41.0, t));
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
window.renderView = (cam, fov, st, t, cap) => {     // single still with a fixed camera and state (used for the TV options)
  camera.position.set(cam[0], cam[1], cam[2]); camera.lookAt(cam[3], cam[4], cam[5]); camera.fov = fov; camera.updateProjectionMatrix();
  applyState(st, t); renderer.shadowMap.needsUpdate = true; composer.render();
  ctx.globalAlpha = 1; ctx.drawImage(renderer.domElement, 0, 0);
  if (cap) caption(cap[0], cap[1], 1, cap[2]);
  return out.toDataURL('image/png').slice('data:image/png;base64,'.length);
};

// ---------------------------------------------------------------- boot
await document.fonts.load(`700 30px Cairo`, 'تصميم 8.00');
await document.fonts.load(`400 30px Cairo`, 'تصميم 8.00');
renderer.compile(scene, camera);
for (const t of [2, 12, 18, 26, 29, 33, 36, 42]) frame(t);
window.__ready = true;

if (!RENDER) {
  let mode = 'tour', roofOpen = false, start = performance.now();
  const controls = new OrbitControls(camera, out); controls.enabled = false; controls.target.set(0, 1.6, 0);
  const bTour = document.getElementById('bTour'), bOrbit = document.getElementById('bOrbit'), bRoof = document.getElementById('bRoof');
  const setMode = (m) => {
    mode = m; bTour.classList.toggle('on', m === 'tour'); bOrbit.classList.toggle('on', m === 'orbit');
    controls.enabled = m === 'orbit';
    if (m === 'orbit') { camera.position.set(-7, 5, 9); camera.fov = 50; camera.updateProjectionMatrix(); controls.target.set(0, 1.6, 0); controls.update(); }
    else start = performance.now();
  };
  bTour.onclick = () => setMode('tour'); bOrbit.onclick = () => setMode('orbit');
  bRoof.onclick = () => { roofOpen = !roofOpen; bRoof.classList.toggle('on', roofOpen); if (mode !== 'orbit') setMode('orbit'); };
  const loop = () => {
    if (mode === 'tour') frame(((performance.now() - start) / 1000) % DURATION);
    else { controls.update(); applyState({ louver: roofOpen ? 1 : 0 }, performance.now() / 1000); composer.render(); ctx.drawImage(renderer.domElement, 0, 0); }
    requestAnimationFrame(loop);
  };
  loop();
}
