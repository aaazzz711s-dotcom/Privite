
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
