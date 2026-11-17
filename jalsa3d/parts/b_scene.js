
// ================================================================ outdoor lounge — winter mode
const PW = 6.0, PD = 5.0, PH = 3.0, PLAT = 0.6;            // pergola width, depth, height above the platform; platform height
const X1 = PW / 2, Z1 = PD / 2, Y0 = PLAT, YT = PLAT + PH, YB = YT - 0.25;   // YB = underside of the roof beams
const PX = X1 + 0.3, PZ = Z1 + 0.3;                              // platform half-size
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
  for (const [x, z] of [[1.56, Z1 - 0.42], [-X1 + 0.36, 1.05]]) {
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
  cyl(0.018, 0.018, 0.34, M.blackMetal, 0, YB - 0.14, -0.45, { cast: false });
  fan.position.set(0, YB - 0.36, -0.45);
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
const TVZ = Z1 - 0.55;                                                // inner face of the TV wall
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
  for (const z of [-0.9, 1.0]) {
    boxMM(-X1 + 0.08, -X1 + 0.16, SY - 0.14, SY + 0.14, z - 0.04, z + 0.04, M.blackMetal);
    boxMM(-X1 + 0.09, -X1 + 0.15, SY + 0.14, SY + 0.146, z - 0.03, z + 0.03, M.ledHot, { cast: false }); boxMM(-X1 + 0.09, -X1 + 0.15, SY - 0.146, SY - 0.14, z - 0.03, z + 0.03, M.ledHot, { cast: false });
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, ph), wm()); w.rotation.y = Math.PI / 2; w.position.set(-X1 + 0.086, (Y0 + YB) / 2, z); scene.add(w);
  }
  // free-standing slat TV wall at the front, facing the sofa (2.20 m wide, 2.30 m high)
  const TW = 1.1, TH = Y0 + 2.3;
  boxMM(-TW, TW, Y0, TH, TVZ + 0.025, TVZ + 0.095, M.dark);
  slats('x', -TW, TW, TVZ, TVZ + 0.025, () => [Y0, TH], M.slat, 0.08, 0.055);
  slats('x', -TW, TW, TVZ + 0.095, TVZ + 0.12, () => [Y0, TH], M.slat, 0.08, 0.055);
  boxMM(-TW - 0.02, TW + 0.02, TH, TH + 0.04, TVZ - 0.01, TVZ + 0.13, M.alu);
  for (const s of [-1, 1]) boxMM(s * TW - 0.008, s * TW + 0.008, Y0 + 0.05, TH - 0.05, TVZ - 0.01, TVZ, glowMat(0xffc27a, 2.0), { cast: false });
  boxMM(-0.9, 0.9, Y0 + 0.42, Y0 + 0.47, TVZ - 0.3, TVZ, M.wood);                                   // floating shelf
  boxMM(-0.88, 0.88, Y0 + 0.412, Y0 + 0.42, TVZ - 0.28, TVZ - 0.02, M.led, { cast: false });
  const tvTex = makeTex(640, 360, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.6); sky.addColorStop(0, '#2b2a6b'); sky.addColorStop(0.55, '#b5628c'); sky.addColorStop(1, '#ffb070');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    const peaks = (base, amp, col, n, seed) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, h); let s = seed;
      for (let i = 0; i <= n; i++) { s = (s * 9301 + 49297) % 233280; g.lineTo(i / n * w, base - (i % 2 ? amp : amp * 0.35) * (0.6 + 0.4 * s / 233280)); } g.lineTo(w, h); g.fill(); };
    peaks(h * 0.62, 150, '#3a4a8a', 7, 11); peaks(h * 0.66, 110, '#243566', 9, 29); peaks(h * 0.7, 60, '#16213f', 12, 57);
    const lake = g.createLinearGradient(0, h * 0.7, 0, h); lake.addColorStop(0, '#c98a8a'); lake.addColorStop(1, '#1c2a52'); g.fillStyle = lake; g.fillRect(0, h * 0.7, w, h * 0.3);
    g.fillStyle = 'rgba(255,255,255,0.75)'; for (const [x, y] of [[95, 105], [280, 95], [470, 112]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - 28, y + 46); g.lineTo(x + 30, y + 44); g.fill(); }
  }, { clampEdge: true });
  const TVY = Y0 + 1.4;
  boxMM(-0.76, 0.76, TVY - 0.44, TVY + 0.44, TVZ - 0.045, TVZ - 0.005, M.blackMetal);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.46, 0.82), new THREE.MeshBasicMaterial({ map: tvTex, color: new THREE.Color(1.5, 1.5, 1.5) }));
  scr.rotation.y = Math.PI; scr.position.set(0, TVY, TVZ - 0.047); scene.add(scr);
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
