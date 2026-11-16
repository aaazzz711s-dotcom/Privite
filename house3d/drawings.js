// Construction drawing sheets for the 7.60 x 6.00 m design (same data as scene.js).
// Open drawings.html in a browser, or run export-drawings.js for PNG sheets + PDF.
const C = { ink: '#1f1b16', wall: '#2b2622', dim: '#8a4b12', paper: '#fffdf8', wood: '#d2a878', woodD: '#9a6a3c', glass: '#3f86ad',
  grey: '#8b857c', floor: '#fbf7ee', bath: '#e3ebee', green: '#7f9d68', stone: '#d9d3c7', led: '#e07b00', fabric: '#e9dcc4', dark: '#3a3632' };
const f2 = (n) => (Math.round(n * 100) / 100).toFixed(2);
const F = 0.30, H = 2.70, SLAB = 0.30, TOP = F + H + SLAB, BED_Z = 0.74, XE = 3.6, XO = 3.8, FIN = 4.05;
const TOTAL = 7;
const L = (t) => '\u2066' + t + '\u2069';   // keep +0.30 / 1.60 × 0.35 left-to-right inside Arabic text

class View {
  constructor(ox, oy, s, up = false) { this.ox = ox; this.oy = oy; this.s = s; this.k = up ? -1 : 1; this.o = []; }
  X(a) { return +(this.ox + a * this.s).toFixed(1); }
  Y(b) { return +(this.oy + this.k * b * this.s).toFixed(1); }
  raw(s) { this.o.push(s); }
  rect(a0, a1, b0, b1, st = '') {
    const x = Math.min(this.X(a0), this.X(a1)), y = Math.min(this.Y(b0), this.Y(b1));
    this.o.push(`<rect x="${x}" y="${y}" width="${Math.abs(this.X(a1) - this.X(a0)).toFixed(1)}" height="${Math.abs(this.Y(b1) - this.Y(b0)).toFixed(1)}" ${st}/>`);
  }
  line(a0, b0, a1, b1, st = '') { this.o.push(`<line x1="${this.X(a0)}" y1="${this.Y(b0)}" x2="${this.X(a1)}" y2="${this.Y(b1)}" ${st}/>`); }
  circle(a, b, r, st = '') { this.o.push(`<circle cx="${this.X(a)}" cy="${this.Y(b)}" r="${(r * this.s).toFixed(1)}" ${st}/>`); }
  poly(pts, st = '') { this.o.push(`<polygon points="${pts.map(([a, b]) => this.X(a) + ',' + this.Y(b)).join(' ')}" ${st}/>`); }
  text(a, b, str, o = {}) {
    const x = this.X(a) + (o.dx || 0), y = this.Y(b) + (o.dy || 0);
    const rot = o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : '';
    this.o.push(`<text x="${x}" y="${y}" font-size="${o.size || 18}" font-weight="${o.weight || 700}" fill="${o.fill || C.ink}" text-anchor="${o.anchor || 'middle'}"${o.ltr ? '' : ' direction="rtl"'}${rot}>${str}</text>`);
  }
  // ---- dimensions (model coords; label = distance in metres)
  dimH(a0, a1, bl, o = {}) {
    const x0 = this.X(a0), x1 = this.X(a1), y = this.Y(bl), w = Math.abs(x1 - x0), small = w < 46;
    this.o.push(`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.dim}" stroke-width="1.3"/>`);
    for (const x of [x0, x1]) this.o.push(`<line x1="${x - 5}" y1="${y + 5}" x2="${x + 5}" y2="${y - 5}" stroke="${C.dim}" stroke-width="2.2"/>`);
    const size = o.size || (small ? 14.5 : 17), side = o.side || -1;
    const ty = side < 0 ? y - 6 - (small ? (o.lift ?? 15) : 0) : y + size + 3 + (small ? (o.lift ?? 15) : 0);
    this.o.push(`<text x="${(x0 + x1) / 2}" y="${ty}" font-size="${size}" font-weight="800" fill="${C.dim}" text-anchor="middle">${o.label ?? f2(Math.abs(a1 - a0))}</text>`);
  }
  dimV(b0, b1, al, o = {}) {
    const y0 = this.Y(b0), y1 = this.Y(b1), x = this.X(al), h = Math.abs(y1 - y0), small = h < 46;
    this.o.push(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${C.dim}" stroke-width="1.3"/>`);
    for (const y of [y0, y1]) this.o.push(`<line x1="${x - 5}" y1="${y + 5}" x2="${x + 5}" y2="${y - 5}" stroke="${C.dim}" stroke-width="2.2"/>`);
    const size = o.size || (small ? 14.5 : 17), side = o.side || -1;
    const tx = side < 0 ? x - 6 - (small ? (o.lift ?? 15) : 0) : x + size + 2 + (small ? (o.lift ?? 15) : 0), ty = (y0 + y1) / 2;
    this.o.push(`<text x="${tx}" y="${ty}" font-size="${size}" font-weight="800" fill="${C.dim}" text-anchor="middle" transform="rotate(-90 ${tx} ${ty})">${o.label ?? f2(Math.abs(b1 - b0))}</text>`);
  }
  chainH(as, bl, bFrom, o = {}) {
    for (const a of as) { const y0 = this.Y(bFrom), y1 = this.Y(bl), d = Math.sign(y1 - y0) || 1;
      this.o.push(`<line x1="${this.X(a)}" y1="${y0 + d * 5}" x2="${this.X(a)}" y2="${y1 + d * 7}" stroke="${C.dim}" stroke-width="0.8" opacity="0.75"/>`); }
    for (let i = 0; i < as.length - 1; i++) this.dimH(as[i], as[i + 1], bl, o);
  }
  chainV(bs, al, aFrom, o = {}) {
    for (const b of bs) { const x0 = this.X(aFrom), x1 = this.X(al), d = Math.sign(x1 - x0) || 1;
      this.o.push(`<line x1="${x0 + d * 5}" y1="${this.Y(b)}" x2="${x1 + d * 7}" y2="${this.Y(b)}" stroke="${C.dim}" stroke-width="0.8" opacity="0.75"/>`); }
    for (let i = 0; i < bs.length - 1; i++) this.dimV(bs[i], bs[i + 1], al, o);
  }
  tag(a, b, label, kind = 'door') {
    const x = this.X(a), y = this.Y(b);
    if (kind === 'door') this.o.push(`<circle cx="${x}" cy="${y}" r="17" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.8"/>`);
    else this.o.push(`<polygon points="${x - 20},${y} ${x - 10},${y - 16} ${x + 10},${y - 16} ${x + 20},${y} ${x + 10},${y + 16} ${x - 10},${y + 16}" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.8"/>`);
    this.o.push(`<text x="${x}" y="${y + 5.5}" font-size="15" font-weight="800" fill="${C.ink}" text-anchor="middle">${label}</text>`);
  }
  num(a, b, n) {
    const x = this.X(a), y = this.Y(b);
    this.o.push(`<circle cx="${x}" cy="${y}" r="14" fill="${C.dim}"/><text x="${x}" y="${y + 5.5}" font-size="15.5" font-weight="800" fill="#fff" text-anchor="middle">${n}</text>`);
  }
  level(a, b, label, o = {}) {
    const x = this.X(a), y = this.Y(b);
    this.o.push(`<path d="M${x - 8} ${y - 12} L${x + 8} ${y - 12} L${x} ${y} Z" fill="${C.ink}"/><line x1="${x - 26}" y1="${y}" x2="${x + 26}" y2="${y}" stroke="${C.ink}" stroke-width="1.4"/>`);
    this.o.push(`<text x="${x + (o.right ? 34 : -34)}" y="${y - 3}" font-size="15.5" font-weight="800" fill="${C.ink}" text-anchor="${o.right ? 'start' : 'end'}" direction="ltr">${label}</text>`);
  }
}
const S = { wall: `fill="${C.wall}"`, thin: `fill="none" stroke="${C.ink}" stroke-width="1.2"`, med: `fill="none" stroke="${C.ink}" stroke-width="2"`,
  furn: `fill="${C.paper}" stroke="${C.ink}" stroke-width="1.3"`, wood: `fill="${C.wood}" stroke="${C.ink}" stroke-width="1.3"`,
  dash: `fill="none" stroke="${C.grey}" stroke-width="1.2" stroke-dasharray="7 5"` };

// ------------------------------------------------------------------ plan
const WALLS = [
  [-3.8, -3.4, 2.8, 3.0], [-1.0, -0.5, 2.8, 3.0], [0.5, 1.0, 2.8, 3.0], [3.4, 3.8, 2.8, 3.0],         // front
  [-3.8, -3.2, -3.0, -2.8], [-1.6, -0.3, -3.0, -2.8], [0.3, 1.6, -3.0, -2.8], [3.2, 3.8, -3.0, -2.8], // back
  [-3.8, -3.6, -2.8, 2.8], [3.6, 3.8, -2.8, 2.8],                                                     // sides
  [-0.8, -0.7, -2.8, 1.75], [-0.8, -0.7, 2.65, 2.8], [0.7, 0.8, -2.8, 1.75], [0.7, 0.8, 2.65, 2.8],   // bedroom / core walls
  [-0.7, -0.6, 0.2, 0.3], [0.2, 0.7, 0.2, 0.3],                                                       // bathroom / corridor wall
];
function arc(v, hx, hz, r, fromA, toA) {      // door swing: angles in degrees in plan coords (x right, z down)
  const p = (a) => [v.X(hx + r * Math.cos(a * Math.PI / 180)), v.Y(hz + r * Math.sin(a * Math.PI / 180))];
  const [x0, y0] = p(fromA), [x1, y1] = p(toA), sweep = toA > fromA ? 1 : 0;
  v.raw(`<path d="M${x0} ${y0} A${(r * v.s).toFixed(1)} ${(r * v.s).toFixed(1)} 0 0 ${sweep} ${x1} ${y1}" fill="none" stroke="${C.ink}" stroke-width="1" stroke-dasharray="5 4"/>`);
  v.raw(`<line x1="${v.X(hx)}" y1="${v.Y(hz)}" x2="${x1}" y2="${y1}" stroke="${C.ink}" stroke-width="3"/>`);
}
function windowSym(v, x0, x1, z0, z1) {
  v.rect(x0, x1, z0, z1, `fill="${C.paper}" stroke="${C.ink}" stroke-width="1.4"`);
  const zm = (z0 + z1) / 2; v.line(x0, zm, x1, zm, `stroke="${C.glass}" stroke-width="3"`);
}
function planBase(v, o = {}) {
  v.rect(-XE, XE, -2.8, 2.8, `fill="${C.floor}"`);
  v.rect(-0.7, 0.7, -2.8, 0.2, `fill="${C.bath}"`);
  v.rect(-XO, XO, 3.0, 3.5, `fill="${C.stone}" stroke="${C.ink}" stroke-width="1.2"`);                // porch
  v.rect(-0.8, 0.8, 3.5, 3.85, `fill="${C.stone}" stroke="${C.ink}" stroke-width="1.2"`);             // step
  v.rect(-FIN, FIN, -3.15, 3.55, S.dash);                                                              // roof outline
  for (const s of [-1, 1]) v.rect(s * XO, s * FIN, 2.2, 3.55, `fill="${C.dark}"`);                     // side fins
  for (const w of WALLS) v.rect(w[0], w[1], w[2], w[3], S.wall);
  for (const s of [-1, 1]) { windowSym(v, s * 1.0, s * 3.4, 2.8, 3.0); windowSym(v, s * 1.6, s * 3.2, -3.0, -2.8); }
  windowSym(v, -0.3, 0.3, -3.0, -2.8);
  arc(v, -0.5, 2.9, 1.0, 0, -90);              // D1 opens into the corridor
  arc(v, -0.75, 2.65, 0.9, -90, -180);         // D2 bedroom 1
  arc(v, 0.75, 2.65, 0.9, -90, 0);             // D2 bedroom 2
  arc(v, -0.6, 0.25, 0.8, 0, 90);              // D3 opens into the corridor
  if (o.tags) {
    v.tag(0, 3.25, 'D1'); v.tag(-1.28, 2.3, 'D2'); v.tag(1.28, 2.3, 'D2'); v.tag(-0.22, 0.72, 'D3');
    v.tag(-2.2, 2.52, 'W1', 'win'); v.tag(2.2, 2.52, 'W1', 'win'); v.tag(-2.4, -2.5, 'W3', 'win'); v.tag(2.4, -2.5, 'W3', 'win'); v.tag(0, -2.5, 'W2', 'win');
  }
}
function bedroomFurn(v, s, o = {}) {
  const X = (u) => s * (XE - u), zc = BED_Z, r = (u0, u1, z0, z1, st) => v.rect(X(u0), X(u1), z0, z1, st);
  r(0.5, 2.62, zc - 1.4, zc + 1.4, S.dash);                                           // rug
  for (const sz of [-1, 1]) r(0, 0.035, zc + sz * 1.12, zc + sz * 1.8, `fill="${C.woodD}"`);   // slat panels
  r(0, 0.1, zc - 1.1, zc + 1.1, `fill="${C.fabric}" stroke="${C.ink}" stroke-width="1.2"`);    // headboard
  r(0.1, 2.14, zc - 0.94, zc + 0.94, `fill="${C.fabric}" stroke="${C.ink}" stroke-width="1.4"`);
  r(0.12, 2.12, zc - 0.9, zc + 0.9, S.furn);
  for (const dz of [-0.45, 0.45]) r(0.18, 0.6, zc + dz - 0.36, zc + dz + 0.36, `fill="#fff" stroke="${C.ink}" stroke-width="1" rx="8"`);
  r(1.54, 2.14, zc - 0.94, zc + 0.94, `fill="#b5a273" stroke="${C.ink}" stroke-width="1"`);
  for (const sz of [-1, 1]) { r(0.04, 0.54, zc + sz * 1.4 - 0.2, zc + sz * 1.4 + 0.2, S.wood); v.circle(X(0.27), zc + sz * 1.4, 0.13, `fill="#ffe2a8" stroke="${C.ink}" stroke-width="1"`); }
  r(2.2, 2.8, -2.8, -0.8, S.wood);                                                    // wardrobe
  v.line(X(2.2), -2.8, X(2.8), -0.8, `stroke="${C.ink}" stroke-width="0.9"`); v.line(X(2.8), -2.8, X(2.2), -0.8, `stroke="${C.ink}" stroke-width="0.9"`);
  v.line(X(2.25), -2.78, X(2.25), -0.82, `stroke="${C.ink}" stroke-width="1"`);
  r(0.45, 1.65, -2.8, -2.4, S.wood);                                                  // desk
  r(0.83, 1.27, -2.3, -1.86, `fill="${C.fabric}" stroke="${C.ink}" stroke-width="1.2" rx="5"`);
  v.line(X(2.79), zc - 0.3, X(2.79), zc + 0.3, `stroke="${C.glass}" stroke-width="5"`);   // mirror
  v.circle(X(0.2), -2.56, 0.2, `fill="${C.green}" stroke="${C.ink}" stroke-width="1"`);
  for (const [u0, u1] of [[0.05, 0.62], [2.15, 2.74]]) {                                 // curtains
    const n = 8, pts = []; for (let i = 0; i <= n; i++) pts.push(`${v.X(X(u0 + (u1 - u0) * i / n))},${v.Y(2.72 + (i % 2 ? 0.045 : -0.045))}`);
    v.raw(`<polyline points="${pts.join(' ')}" fill="none" stroke="${C.grey}" stroke-width="1.6"/>`);
  }
  if (o.nums) { v.num(X(1.15), zc + 0.05, 1); v.num(X(0.29), zc - 1.75, 2); v.num(X(2.5), -1.8, 3); v.num(X(1.05), -2.6, 4); v.num(X(1.05), -1.72, 5); v.num(X(2.52), zc, 6); v.num(X(1.6), zc + 1.18, 7); v.num(X(0.35), 2.42, 8); }
}
function bathFurn(v, o = {}) {
  v.raw(`<defs><pattern id="sh${o.id || 0}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="${C.glass}" stroke-width="1" opacity="0.6"/></pattern></defs>`);
  v.rect(-0.7, 0.7, -2.8, -1.85, `fill="url(#sh${o.id || 0})"`);
  v.line(-0.69, -1.85, 0.05, -1.85, `stroke="${C.glass}" stroke-width="4"`);
  v.rect(-0.15, 0.15, -2.5, -2.2, S.thin); v.line(-0.6, -2.705, 0.6, -2.705, `stroke="${C.ink}" stroke-width="3"`);
  v.rect(-0.69, -0.6, -2.62, -2.05, S.furn);
  v.rect(0.145, 0.695, -1.605, -1.235, `fill="#fff" stroke="${C.ink}" stroke-width="1.4" rx="16"`);
  v.rect(0.19, 0.69, -1.0, 0.19, S.wood); v.circle(0.45, -0.4, 0.2, `fill="#fff" stroke="${C.ink}" stroke-width="1.3"`);
  v.line(0.685, -0.8, 0.685, 0.0, `stroke="${C.glass}" stroke-width="5"`);
  v.line(-0.66, -1.08, -0.66, -0.62, `stroke="${C.ink}" stroke-width="3"`);
  if (o.nums) { v.num(0, -2.38, 9); v.num(0.42, -1.42, 10); v.num(0.45, -0.75, 11); }
}
function corridorFurn(v, o = {}) {
  v.rect(-0.42, 0.42, 0.5, 2.6, S.dash); v.rect(0.42, 0.7, 0.55, 1.45, S.wood);
  for (const s of [-1, 1]) v.circle(s * 0.8, 3.27, 0.24, `fill="${C.green}" stroke="${C.ink}" stroke-width="1.2"`);
  if (o.nums) { v.num(0.56, 1.0, 12); v.num(1.45, 3.27, 13); }
}
function garden(v, zMax) {
  for (const s of [-1, 1]) v.rect(s * 0.95, s * FIN, 3.55, 4.4, `fill="#dfe6d2" stroke="${C.green}" stroke-width="1"`);
  for (let z = 4.0; z + 0.62 <= zMax; z += 0.8) v.rect(-0.6, 0.6, z, z + 0.62, `fill="${C.stone}" stroke="${C.ink}" stroke-width="1"`);
}
function sectionMark(v, a0, b0, a1, b1, label, da, db) {
  v.line(a0, b0, a1, b1, `stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="18 5 3 5"`);
  for (const [a, b] of [[a0, b0], [a1, b1]]) {
    const x = v.X(a), y = v.Y(b);
    v.raw(`<circle cx="${x}" cy="${y}" r="15" fill="${C.ink}"/><text x="${x}" y="${y + 6}" font-size="17" font-weight="800" fill="#fff" text-anchor="middle">${label}</text>`);
    v.raw(`<path d="M${x + da * 17} ${y + db * 17} l${da * 14 - db * 8} ${db * 14 + da * 8} l${db * 16} ${-da * 16} Z" fill="${C.ink}"/>`);
  }
}

// ------------------------------------------------------------------ sheets
const sheets = [];
const lg = (svg, txt) => `<div class="lg"><svg width="44" height="26" viewBox="0 0 44 26">${svg}</svg><span>${txt}</span></div>`;

// 1 — dimensioned floor plan
{
  const v = new View(1165, 556, 104);
  planBase(v, { tags: true });
  v.line(-0.69, -1.85, 0.05, -1.85, `stroke="${C.glass}" stroke-width="3"`);
  // top chains (rear wall)
  v.chainH([-3.8, -3.2, -1.6, -0.3, 0.3, 1.6, 3.2, 3.8], -3.55, -3.0);
  v.chainH([-3.8, -3.6, -0.8, -0.7, 0.7, 0.8, 3.6, 3.8], -4.08, -3.0);
  v.chainH([-3.8, 3.8], -4.58, -3.0, { size: 19 });
  // bottom chain (front wall openings)
  v.chainH([-3.8, -3.4, -1.0, -0.5, 0.5, 1.0, 3.4, 3.8], 4.42, 3.0);
  // left / right chains
  v.chainV([-3.0, -2.8, 2.8, 3.0, 3.5], -4.55, -3.8);
  v.chainV([-3.0, 3.0], -5.08, -3.8, { size: 19 });
  v.chainV([-3.0, -2.8, 0.2, 0.3, 2.8, 3.0], 4.5, 3.8, { side: 1 });
  // interior door setting-out
  v.chainH([-0.7, -0.6, 0.2, 0.7], -0.12, 0.2, { size: 14, lift: 0 });
  v.dimV(1.75, 2.65, -0.48, { side: 1, size: 14 }); v.dimV(2.65, 2.8, -0.48, { side: 1, size: 13, lift: 2 });
  v.dimV(1.75, 2.65, 0.48, { size: 14 });
  // room labels
  for (const [x, n] of [[-2.2, 1], [2.2, 2]]) { v.text(x, -0.35, `غرفة نوم ${n}`, { size: 25, weight: 800 }); v.text(x, 0.0, '5.60 × 2.80', { size: 19, fill: C.dim, ltr: 1 }); v.text(x, 0.32, '15.68 م²', { size: 19 }); }
  v.text(0, -1.4, 'دورة مياه', { size: 20, weight: 800 }); v.text(0, -1.12, '3.00 × 1.40', { size: 16, fill: C.dim, ltr: 1 }); v.text(0, -0.86, '4.20 م²', { size: 16 });
  v.text(0, 1.3, 'ممر', { size: 20, weight: 800 }); v.text(0, 1.58, '2.50 × 1.40', { size: 16, fill: C.dim, ltr: 1 }); v.text(0, 1.86, '3.50 م²', { size: 16 });
  v.text(-2.2, 1.25, 'منسوب الأرضية ' + L('+0.30'), { size: 15, fill: C.grey }); v.text(2.2, 1.25, 'منسوب الأرضية ' + L('+0.30'), { size: 15, fill: C.grey });
  v.text(2.75, 3.32, 'مصطبة ' + L('+0.30'), { size: 14, fill: C.ink }); v.text(-2.75, 3.32, 'مصطبة ' + L('+0.30'), { size: 14, fill: C.ink });
  v.text(2.6, 4.0, 'الحديقة ' + L('±0.00'), { size: 15, fill: C.grey }); v.text(0, 3.73, 'درجة ' + L('1.60 × 0.35'), { size: 13, fill: C.ink });
  sectionMark(v, -5.5, -1.75, 5.05, -1.75, 'A', 0, -1);
  sectionMark(v, -2.95, -4.95, -2.95, 4.7, 'B', -1, 0);
  sheets.push({ title: 'المسقط الأفقي بالمقاسات', svg: v.o.join(''), panel: `
    <h3>البيانات الأساسية</h3>
    <div class="kv"><span>الطول الخارجي</span><span>7.60 م</span><span>العرض الخارجي</span><span>6.00 م</span><span>المساحة الإجمالية</span><span>45.60 م²</span>
      <span>الارتفاع الصافي</span><span>2.70 م</span><span>جدران خارجية</span><span>0.20 م</span><span>جدران داخلية</span><span>0.10 م</span></div>
    <h3>الرموز</h3>
    ${lg(`<circle cx="22" cy="13" r="11" fill="#fffdf8" stroke="#1f1b16" stroke-width="1.6"/><text x="22" y="17.5" font-size="11" font-weight="800" text-anchor="middle">D1</text>`, 'باب — انظر جدول الأبواب')}
    ${lg(`<polygon points="6,13 13,3 31,3 38,13 31,23 13,23" fill="#fffdf8" stroke="#1f1b16" stroke-width="1.6"/><text x="22" y="17.5" font-size="11" font-weight="800" text-anchor="middle">W1</text>`, 'شباك / واجهة زجاجية')}
    ${lg(`<circle cx="22" cy="13" r="10" fill="#1f1b16"/><text x="22" y="17.5" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">A</text>`, 'خط القطاع واتجاه النظر')}
    ${lg(`<rect x="4" y="5" width="36" height="16" fill="none" stroke="#8b857c" stroke-dasharray="6 4" stroke-width="1.4"/>`, 'حد السقف والمظلة من فوق')}
    <h3>ملاحظات</h3>
    <ul><li>جميع المقاسات بالمتر، ومقاسات الغرف صافية من وجه الجدار.</li><li>المظلة الأمامية تبرز 0.55 م عن الواجهة، والسقف يبرز 0.15 م من الخلف.</li>
    <li>الإطار الجانبي الأسود يبرز 0.25 م من كل جهة.</li><li>الغرفتان متماثلتان حول محور المدخل.</li></ul>` });
}

// 2 — furniture layout
{
  const v = new View(1165, 474, 118);
  garden(v, 4.7); planBase(v); bedroomFurn(v, -1, { nums: true }); bedroomFurn(v, 1); bathFurn(v, { nums: true, id: 2 }); corridorFurn(v, { nums: true });
  v.chainH([-3.8, 3.8], -3.6, -3.0, { size: 18 }); v.chainV([-3.0, 3.0], -4.45, -3.8, { size: 18 });
  // clearances shown in bedroom 2
  v.dimH(0.8, 1.46, 1.2, { size: 15, lift: 0 });                       // passage at the bed foot
  v.dimV(-0.8, -0.2, 1.1, { size: 15, lift: 0 });                      // wardrobe to bed
  v.dimV(1.68, 2.8, 1.62, { size: 15 });                               // bed to front wall
  v.dimV(-2.8, -0.2, 1.68, { size: 15 });                              // rear wall to bed
  v.dimH(1.4, 3.6, -1.45, { size: 15, label: '2.20' });                // free width in front of the wardrobe
  v.dimV(-1.85, -1.0, -0.38, { size: 14 });                            // WC zone
  v.dimV(-2.8, -1.85, -0.38, { size: 14 });                            // shower
  v.text(-2.2, 2.3, 'غرفة نوم 1', { size: 19, weight: 800 }); v.text(2.45, 2.3, 'غرفة نوم 2', { size: 19, weight: 800 });
  sheets.push({ title: 'مسقط الأثاث والتجهيزات', svg: v.o.join(''), panel: `
    <h3>أثاث غرفة النوم (لكل غرفة)</h3>
    <div class="kv"><span>① سرير (مرتبة)</span><span>1.80 × 2.00</span><span>② كومودينو ×2</span><span>0.40 × 0.50</span><span>③ خزانة مدمجة سحاب</span><span>0.60 × 2.00</span>
      <span>④ مكتب تحت الشباك</span><span>0.40 × 1.20</span><span>⑤ كرسي</span><span>0.45 × 0.45</span><span>⑥ مرآة طولية</span><span>0.60 × 1.80</span>
      <span>⑦ سجادة</span><span>2.10 × 2.80</span><span>⑧ ستائر شيفون</span><span>ارتفاع 2.55</span></div>
    <h3>دورة المياه</h3>
    <div class="kv"><span>⑨ دش زجاجي</span><span>0.95 × 1.40</span><span>⑩ كرسي معلق</span><span>0.37 × 0.55</span><span>⑪ مغسلة بكونتر</span><span>0.50 × 1.20</span><span>مرآة مضاءة</span><span>0.80 × 1.20</span></div>
    <h3>الممر والمدخل</h3>
    <div class="kv"><span>⑫ كونسول معلق</span><span>0.28 × 0.90</span><span>⑬ حوض زرع زيتون ×2</span><span>Ø 0.45</span></div>
    <h3>ملاحظات</h3>
    <ul><li>الخزانة بارتفاع كامل 2.70 م وأبوابها سحاب.</li><li>ظهر السرير منجّد بعرض 2.20 م وارتفاع 1.30 م، وعلى جانبيه كسوة خشب شرائح بعرض 0.68 م.</li>
    <li>ممر 0.60 م بين الخزانة والسرير، و0.66 م عند رجل السرير.</li><li>غرفة نوم 2 متماثلة مع غرفة نوم 1.</li></ul>` });
}

// 3 — elevations
{
  const v = new View(1165, 468, 112, true), g = [];
  const front = (v) => {
    v.rect(-XO, XO, 0, F, `fill="${C.grey}" stroke="${C.ink}" stroke-width="1.3"`);
    v.rect(-XO, XO, F, F + H, `fill="#f1e8d7" stroke="${C.ink}" stroke-width="1.6"`);
    v.rect(-0.8, 0.8, 0, 0.15, `fill="${C.stone}" stroke="${C.ink}" stroke-width="1.3"`);
    for (const s of [-1, 1]) {
      v.rect(s * 1.0, s * 3.4, F, F + 2.4, `fill="#cfe1ea" stroke="${C.ink}" stroke-width="4"`);
      v.line(s * 2.2, F, s * 2.2, F + 2.4, `stroke="${C.ink}" stroke-width="4"`);
      v.rect(s * XO, s * FIN, 0, TOP, `fill="${C.dark}" stroke="${C.ink}" stroke-width="1.3"`);
    }
    v.rect(-0.62, 0.62, F, F + H, `fill="${C.wood}" stroke="${C.ink}" stroke-width="1.3"`);
    for (let x = -0.62 + 0.0375; x < 0.62; x += 0.075) v.line(x, F, x, F + H, `stroke="${C.woodD}" stroke-width="2.4"`);
    v.rect(-0.5, 0.5, F, F + 2.4, `fill="none" stroke="${C.ink}" stroke-width="2.6"`);
    v.rect(0.36, 0.385, F + 0.55, F + 1.95, `fill="${C.ink}"`);
    v.rect(-FIN, FIN, F + H, TOP, `fill="${C.dark}" stroke="${C.ink}" stroke-width="1.3"`);
    v.line(-3.78, F + H - 0.035, 3.78, F + H - 0.035, `stroke="${C.led}" stroke-width="3"`);
    for (const x of [-3.6, -0.81, 0.81, 3.6]) {
      v.poly([[x, F + 2.08], [x - 0.16, F + 2.6], [x + 0.16, F + 2.6]], `fill="#ffd27a" opacity="0.55"`);
      v.poly([[x, F + 1.82], [x - 0.16, F + 1.2], [x + 0.16, F + 1.2]], `fill="#ffd27a" opacity="0.55"`);
      v.rect(x - 0.04, x + 0.04, F + 1.82, F + 2.08, `fill="${C.ink}"`);
    }
    for (const s of [-1, 1]) { v.poly([[s * 0.8 - 0.24, F + 0.62], [s * 0.8 + 0.24, F + 0.62], [s * 0.8 + 0.18, F], [s * 0.8 - 0.18, F]], `fill="${C.dark}"`);
      v.line(s * 0.8, F + 0.62, s * 0.8, F + 1.5, `stroke="${C.ink}" stroke-width="2"`); v.circle(s * 0.8, F + 1.85, 0.36, `fill="${C.green}" fill-opacity="0.18" stroke="${C.green}" stroke-width="1.6" stroke-dasharray="5 4"`); }
    v.line(-5.3, 0, 5.3, 0, `stroke="${C.ink}" stroke-width="3"`);
  };
  front(v);
  v.chainH([-FIN, -3.8, -3.4, -1.0, -0.5, 0.5, 1.0, 3.4, 3.8, FIN], -0.42, 0);
  v.chainH([-3.8, 3.8], -0.85, 0, { size: 19 });
  v.chainV([0, F, F + 2.4, F + H, TOP], 4.55, FIN, { side: 1 });
  v.chainV([F, TOP], 5.05, FIN, { side: 1, size: 19 });
  v.level(-4.75, 0, '±0.00'); v.level(-4.75, F, '+0.30'); v.level(-4.75, F + H, '+3.00'); v.level(-4.75, TOP, '+3.30');
  v.text(0, TOP + 0.2, 'الواجهة الأمامية', { size: 25, weight: 800 });
  v.tag(-2.2, F + 1.2, 'W1', 'win'); v.tag(2.2, F + 1.2, 'W1', 'win'); v.tag(0, F + 1.3, 'D1');
  // rear elevation
  const r = new View(1165, 1000, 112, true);
  r.rect(-XO, XO, 0, F, `fill="${C.grey}" stroke="${C.ink}" stroke-width="1.3"`);
  r.rect(-XO, XO, F, F + H, `fill="#f1e8d7" stroke="${C.ink}" stroke-width="1.6"`);
  for (const s of [-1, 1]) { r.rect(s * 1.6, s * 3.2, F + 0.9, F + 2.3, `fill="#cfe1ea" stroke="${C.ink}" stroke-width="4"`); r.line(s * 2.4, F + 0.9, s * 2.4, F + 2.3, `stroke="${C.ink}" stroke-width="4"`);
    r.rect(s * XO, s * FIN, 0, TOP, `fill="#b9b3a8" stroke="${C.ink}" stroke-width="1" stroke-dasharray="6 4"`); }
  r.rect(-0.3, 0.3, F + 1.9, F + 2.5, `fill="#e8eef0" stroke="${C.ink}" stroke-width="4"`);
  r.rect(-FIN, FIN, F + H, TOP, `fill="${C.dark}" stroke="${C.ink}" stroke-width="1.3"`);
  r.line(-5.3, 0, 5.3, 0, `stroke="${C.ink}" stroke-width="3"`);
  r.chainH([-3.8, -3.2, -1.6, -0.3, 0.3, 1.6, 3.2, 3.8], -0.4, 0);
  r.chainV([0, F, F + 0.9, F + 2.3, F + H, TOP], 4.55, FIN, { side: 1 });
  r.chainV([F, F + 1.9, F + 2.5, F + H], -4.55, -FIN);
  r.text(0, TOP + 0.2, 'الواجهة الخلفية', { size: 25, weight: 800 });
  r.tag(-2.4, F + 1.6, 'W3', 'win'); r.tag(2.4, F + 1.6, 'W3', 'win'); r.tag(0, F + 1.55, 'W2', 'win');
  sheets.push({ title: 'الواجهات', svg: v.o.join('') + r.o.join(''), panel: `
    <h3>المناسيب (من الحديقة)</h3>
    <div class="kv"><span>الحديقة</span><span>±0.00</span><span>أرضية المبنى والمصطبة</span><span>+0.30</span><span>أعلى الأبواب والزجاج</span><span>+2.70</span>
      <span>أسفل السقف</span><span>+3.00</span><span>أعلى السقف</span><span>+3.30</span></div>
    <h3>الواجهة الأمامية</h3>
    <ul><li>لياسة ودهان كريمي دافئ.</li><li>كسوة خشب شرائح حول الباب بعرض 1.24 م وبكامل الارتفاع، الشريحة 5 سم والفاصل 2.5 سم.</li>
    <li>إطار أسود (كلادينج أو دهان) للسقف بسماكة 0.30 م وللجانبين بعرض 0.25 م.</li>
    <li>إضاءة جدارية (أعلى وأسفل) عدد 4، مركزها على ارتفاع 1.95 م من الأرضية وفي منتصف الأكتاف.</li>
    <li>إضاءة LED مخفية تحت المظلة بطول الواجهة.</li><li>الدرج: درجة واحدة 0.15 م ثم المصطبة.</li></ul>
    <h3>الواجهة الخلفية</h3>
    <ul><li>شباك W3 لكل غرفة نوم: جلسة 0.90 م.</li><li>شباك W2 لدورة المياه: جلسة 1.90 م.</li></ul>` });
}

// 4 — sections
{
  const hatch = (id) => `<defs><pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#cfc8bb"/><line x1="0" y1="0" x2="0" y2="8" stroke="${C.ink}" stroke-width="1.2"/></pattern></defs>`;
  const a = new View(1165, 452, 110, true);
  a.raw(hatch('hx'));
  a.rect(-XE, XE, F, F + H, `fill="#fbf7ee"`);
  // beyond the cut: rear wall windows, desks, shower, WC
  for (const s of [-1, 1]) { a.rect(s * 1.6, s * 3.2, F + 0.9, F + 2.3, `fill="#cfe1ea" stroke="${C.ink}" stroke-width="2"`);
    a.rect(s * 1.95, s * 3.15, F + 0.74, F + 0.78, S.wood); a.rect(s * 2.0, s * 3.1, F + 0.6, F + 0.74, S.wood);
    for (const x of [1.98, 3.12]) a.line(s * x, F, s * x, F + 0.6, `stroke="${C.ink}" stroke-width="2"`);
    a.rect(s * 0.8, s * 1.4, F, F + H, S.wood); a.line(s * 0.8, F, s * 1.4, F + H, `stroke="${C.ink}" stroke-width="0.9"`); a.line(s * 1.4, F, s * 0.8, F + H, `stroke="${C.ink}" stroke-width="0.9"`);
    a.circle(s * 3.4, F + 1.0, 0.25, `fill="${C.green}" opacity="0.8"`); a.rect(s * 3.28, s * 3.52, F, F + 0.42, S.furn); }
  a.rect(-0.3, 0.3, F + 1.9, F + 2.5, `fill="#e8eef0" stroke="${C.ink}" stroke-width="2"`);
  a.rect(-0.69, 0.05, F + 0.02, F + 2.05, `fill="#cfe1ea" opacity="0.5" stroke="${C.glass}" stroke-width="1.6"`);
  a.rect(-0.15, 0.15, F + 2.18, F + 2.2, `fill="${C.ink}"`);
  // cut elements
  a.rect(-XO, XO, 0, F, `fill="url(#hx)" stroke="${C.ink}" stroke-width="1.6"`);
  for (const [x0, x1] of [[-3.8, -3.6], [3.6, 3.8], [-0.8, -0.7], [0.7, 0.8]]) a.rect(x0, x1, F, F + H, S.wall);
  a.rect(-FIN, FIN, F + H, TOP, `fill="url(#hx)" stroke="${C.ink}" stroke-width="1.6"`);
  a.line(-5.3, 0, 5.3, 0, `stroke="${C.ink}" stroke-width="3"`);
  a.chainH([-3.8, -3.6, -0.8, -0.7, 0.7, 0.8, 3.6, 3.8], -0.42, 0); a.chainH([-3.8, 3.8], -0.85, 0, { size: 19 });
  a.chainV([0, F, F + H, TOP], 4.55, FIN, { side: 1 }); a.chainV([0, TOP], 5.05, FIN, { side: 1, size: 19 });
  a.level(-4.75, 0, '±0.00'); a.level(-4.75, F, '+0.30'); a.level(-4.75, F + H, '+3.00'); a.level(-4.75, TOP, '+3.30');
  a.text(-2.3, F + 2.45, 'غرفة نوم 1', { size: 19 }); a.text(2.3, F + 2.45, 'غرفة نوم 2', { size: 19 }); a.text(0.38, F + 1.5, 'دورة', { size: 15 }); a.text(0.38, F + 1.28, 'مياه', { size: 15 });
  a.text(0, TOP + 0.2, 'قطاع طولي A-A', { size: 25, weight: 800 });
  // B-B through bedroom 1, looking at the headboard wall (front of the house on the left)
  const b = new View(1165, 990, 110, true), zc = BED_Z, A = (z) => -z;
  b.rect(A(2.8), A(-2.8), F, F + H, `fill="#f4ecdc"`);
  for (const sz of [-1, 1]) { const z0 = zc + sz * 1.12, z1 = zc + sz * 1.8; b.rect(A(z0), A(z1), F, F + H, `fill="${C.wood}" stroke="${C.ink}" stroke-width="1"`);
    for (let z = Math.min(z0, z1) + 0.0375; z < Math.max(z0, z1); z += 0.075) b.line(A(z), F, A(z), F + H, `stroke="${C.woodD}" stroke-width="2.2"`);
    b.rect(A(zc + sz * 1.4 - 0.2), A(zc + sz * 1.4 + 0.2), F, F + 0.52, S.wood);
    b.rect(A(zc + sz * 1.4 - 0.07), A(zc + sz * 1.4 + 0.07), F + 0.52, F + 0.78, S.furn);
    b.poly([[A(zc + sz * 1.4) - 0.15, F + 0.78], [A(zc + sz * 1.4) + 0.15, F + 0.78], [A(zc + sz * 1.4) + 0.12, F + 0.98], [A(zc + sz * 1.4) - 0.12, F + 0.98]], `fill="#ffe2a8" stroke="${C.ink}" stroke-width="1"`); }
  for (let i = 0; i < 5; i++) b.rect(A(zc - 1.1 + i * 0.44), A(zc - 1.1 + (i + 1) * 0.44), F + 0.32, F + 1.3, `fill="${C.fabric}" stroke="${C.ink}" stroke-width="1" rx="6"`);
  b.rect(A(zc - 0.55), A(zc + 0.55), F + 1.45, F + 2.15, `fill="#efe6d4" stroke="${C.ink}" stroke-width="2"`);
  b.rect(A(zc - 0.8), A(zc + 0.8), F, F + 0.1, `fill="${C.dark}"`);
  b.rect(A(zc - 0.94), A(zc + 0.94), F + 0.1, F + 0.38, `fill="${C.fabric}" stroke="${C.ink}" stroke-width="1.3"`);
  b.rect(A(zc - 0.9), A(zc + 0.9), F + 0.38, F + 0.6, `fill="#fff" stroke="${C.ink}" stroke-width="1.3" rx="6"`);
  b.rect(A(-2.4), A(-2.8), F + 0.74, F + 0.78, S.wood); b.rect(A(-2.44), A(-2.78), F + 0.6, F + 0.74, S.wood); b.line(A(-2.43), F, A(-2.43), F + 0.6, `stroke="${C.ink}" stroke-width="2"`);
  b.rect(A(-2.44), A(-2.68), F, F + 0.42, S.furn); b.circle(A(-2.56), F + 1.0, 0.24, `fill="${C.green}" opacity="0.8"`);
  b.rect(A(2.8), A(2.62), F + H - 0.12, F + H, `fill="#fff" stroke="${C.ink}" stroke-width="1"`);
  b.line(A(2.72), F, A(2.72), F + H - 0.12, `stroke="${C.grey}" stroke-width="3" stroke-dasharray="3 3"`);
  b.raw(hatch('hy'));
  b.rect(A(3.5), A(-3.0), 0, F, `fill="url(#hy)" stroke="${C.ink}" stroke-width="1.6"`);
  b.rect(A(3.0), A(2.8), F + 2.4, F + H, S.wall); b.line(A(2.9), F, A(2.9), F + 2.4, `stroke="${C.glass}" stroke-width="4"`);
  b.rect(A(-2.8), A(-3.0), F, F + 0.9, S.wall); b.rect(A(-2.8), A(-3.0), F + 2.3, F + H, S.wall); b.line(A(-2.9), F + 0.9, A(-2.9), F + 2.3, `stroke="${C.glass}" stroke-width="4"`);
  b.rect(A(3.55), A(-3.15), F + H, TOP, `fill="url(#hy)" stroke="${C.ink}" stroke-width="1.6"`);
  b.rect(A(3.55), A(3.0), 0, F + H, `fill="#b9b3a8" opacity="0.45" stroke="${C.ink}" stroke-width="1" stroke-dasharray="6 4"`);
  b.circle(A(3.05), F + H - 0.03, 0.035, `fill="${C.led}"`);
  b.line(-5.3, 0, 5.3, 0, `stroke="${C.ink}" stroke-width="3"`);
  b.chainH([A(3.55), A(3.0), A(2.8), A(-2.8), A(-3.0)], -0.42, 0); b.dimH(A(-3.0), A(-3.15), -0.42, { side: 1, lift: 0, size: 14 });
  b.chainV([0, F, F + 2.4, F + H, TOP], -4.1, A(3.55));
  b.chainV([F, F + 0.9, F + 2.3, F + H], 3.7, A(-3.15), { side: 1 });
  b.dimV(F, F + H, 1.45, { label: '2.70 صافي', side: 1 });
  b.text(A(3.28), F + 1.3, 'مظلة', { size: 14, rot: -90 });
  b.text(0, TOP + 0.2, 'قطاع عرضي B-B — غرفة النوم (جدار ظهر السرير)', { size: 25, weight: 800 });
  sheets.push({ title: 'القطاعات', svg: a.o.join('') + b.o.join(''), panel: `
    <h3>الارتفاعات</h3>
    <div class="kv"><span>ارتفاع المصطبة عن الحديقة</span><span>0.30 م</span><span>الارتفاع الصافي الداخلي</span><span>2.70 م</span><span>سماكة السقف</span><span>0.30 م</span>
      <span>ارتفاع المبنى من الأرضية</span><span>3.00 م</span><span>الارتفاع الكلي من الحديقة</span><span>3.30 م</span></div>
    <h3>القطاع B-B</h3>
    <ul><li>الواجهة الزجاجية W1 من الأرضية حتى 2.40 م، وفوقها عتب 0.30 م.</li><li>الشباك الخلفي W3: جلسة 0.90 م وارتفاع 1.40 م.</li>
    <li>بيت ستارة جبس 0.18 × 0.12 م بطول الواجهة الزجاجية مع LED مخفي.</li><li>كسوة خشب شرائح على جانبي ظهر السرير بكامل الارتفاع مع شريط LED رأسي.</li></ul>
    <h3>تنبيه</h3>
    <ul><li>سماكة السقف والقواعد والميدة والتسليح قيم معمارية مبدئية، ويحددها المهندس الإنشائي.</li><li>يضاف عزل مائي وحراري للسقف مع ميول لتصريف المطر.</li></ul>` });
}

// 5 — schedules
sheets.push({ title: 'جداول الأبواب والشبابيك والتشطيبات', html: `<div class="content">
  <h2>جدول الأبواب والشبابيك</h2>
  <table><tr><th class="c">الرمز</th><th>النوع والخامة</th><th class="c" style="white-space:nowrap">العرض × الارتفاع (م)</th><th class="c">العدد</th><th class="c" style="white-space:nowrap">الجلسة (م)</th><th>ملاحظات</th></tr>
  <tr><td class="tag">D1</td><td>باب المدخل — خشب شرائح رأسية</td><td class="n">1.00 × 2.40</td><td class="n">1</td><td class="n">0.00</td><td>يفتح للداخل، مقبض طولي أسود 1.40 م</td></tr>
  <tr><td class="tag">D2</td><td>باب غرفة نوم — خشب</td><td class="n">0.90 × 2.40</td><td class="n">2</td><td class="n">0.00</td><td>يفتح داخل الغرفة باتجاه الواجهة، يبعد 0.15 م عن الجدار الأمامي</td></tr>
  <tr><td class="tag">D3</td><td>باب دورة المياه — مقاوم للرطوبة</td><td class="n">0.80 × 2.40</td><td class="n">1</td><td class="n">0.00</td><td>يفتح على الممر، يبعد 0.10 م عن جدار غرفة نوم 1</td></tr>
  <tr><td class="tag">W1</td><td>واجهة زجاجية سحاب — ألمنيوم أسود</td><td class="n">2.40 × 2.40</td><td class="n">2</td><td class="n">0.00</td><td>درفتان، زجاج مزدوج</td></tr>
  <tr><td class="tag">W2</td><td>شباك علوي لدورة المياه — زجاج مصنفر</td><td class="n">0.60 × 0.60</td><td class="n">1</td><td class="n">1.90</td><td>قلاب للتهوية، في منتصف الجدار الخلفي</td></tr>
  <tr><td class="tag">W3</td><td>شباك غرفة نوم خلفي — ألمنيوم أسود</td><td class="n">1.60 × 1.40</td><td class="n">2</td><td class="n">0.90</td><td>يبعد 0.60 م عن الركن الخارجي (من رسم المسقط الأصلي)</td></tr></table>
  <h2>جدول التشطيبات</h2>
  <table><tr><th>الفراغ</th><th>الأرضية</th><th>الجدران</th><th>السقف</th></tr>
  <tr><td><b>غرف النوم</b></td><td><span class="sw" style="background:#ded3c1"></span>بورسلان بيج 120 × 60 سم</td><td><span class="sw" style="background:#e8d9c1"></span>دهان رملي دافئ، وكسوة <span class="sw" style="background:#c79a67"></span>خشب شرائح على جانبي السرير</td><td>جبس أبيض، إضاءة مخفية، سبوت</td></tr>
  <tr><td><b>الممر</b></td><td><span class="sw" style="background:#ded3c1"></span>بورسلان بيج 120 × 60 سم</td><td><span class="sw" style="background:#e8d9c1"></span>دهان رملي دافئ</td><td>جبس أبيض، سبوت</td></tr>
  <tr><td><b>دورة المياه</b></td><td><span class="sw" style="background:#cfcac2"></span>رخام أو بورسلان بيج مانع للانزلاق</td><td><span class="sw" style="background:#e8e5e0"></span>رخام بيج بكامل الارتفاع 2.70 م</td><td>جبس مقاوم للرطوبة، سبوت</td></tr>
  <tr><td><b>الواجهة والمظلة</b></td><td><span class="sw" style="background:#c9c2b6"></span>حجر أو بلاط خارجي للمصطبة والدرج</td><td><span class="sw" style="background:#eee3d0"></span>لياسة ودهان كريمي، <span class="sw" style="background:#c79a67"></span>خشب شرائح حول الباب</td><td><span class="sw" style="background:#2a2826"></span>إطار أسود، وسقف المظلة خشب مع LED</td></tr></table>
  <h2>جدول المساحات</h2>
  <table><tr><th>الفراغ</th><th class="c">المقاس الصافي (م)</th><th class="c">المساحة (م²)</th><th>الفراغ</th><th class="c">المقاس (م)</th><th class="c">المساحة (م²)</th></tr>
  <tr><td>غرفة نوم 1</td><td class="n">2.80 × 5.60</td><td class="n">15.68</td><td>دورة المياه</td><td class="n">1.40 × 3.00</td><td class="n">4.20</td></tr>
  <tr><td>غرفة نوم 2</td><td class="n">2.80 × 5.60</td><td class="n">15.68</td><td>الممر</td><td class="n">1.40 × 2.50</td><td class="n">3.50</td></tr>
  <tr><td><b>صافي الغرف</b></td><td class="n"></td><td class="n">39.06</td><td><b>الإجمالي مع الجدران</b></td><td class="n">7.60 × 6.00</td><td class="n">45.60</td></tr></table></div>`,
  panel: `<h3>قراءة الجداول</h3><ul><li>الرموز D و W مطابقة للرموز على المسقط والواجهات.</li><li>مقاسات الأبواب والشبابيك هي مقاس الفتحة في الجدار.</li>
    <li>الجلسة: ارتفاع أسفل الفتحة عن أرضية المبنى.</li></ul>
    <h3>الخامات</h3><ul><li>الألمنيوم أسود مطفي لكل الشبابيك والواجهات.</li><li>يمكن استعمال بديل الخشب (WPC) للكسوات الخارجية.</li><li>الألوان والعينات تعتمد من المالك قبل التوريد.</li></ul>` });

// 6 — lighting plan
{
  const v = new View(1165, 404, 110);
  garden(v, 5.6); planBase(v);
  v.raw('<g opacity="0.3">'); bedroomFurn(v, -1); bedroomFurn(v, 1); bathFurn(v, { id: 6 }); corridorFurn(v); v.raw('</g>');
  const led = (a0, b0, a1, b1) => v.line(a0, b0, a1, b1, `stroke="${C.led}" stroke-width="4" stroke-dasharray="10 5"`);
  const spot = (a, b) => { v.circle(a, b, 0.1, `fill="#fff" stroke="${C.ink}" stroke-width="1.6"`); v.line(a - 0.1, b, a + 0.1, b, `stroke="${C.ink}" stroke-width="1.2"`); v.line(a, b - 0.1, a, b + 0.1, `stroke="${C.ink}" stroke-width="1.2"`); };
  for (const s of [-1, 1]) {
    const X = (u) => s * (XE - u), zc = BED_Z;
    for (const u of [0.9, 1.9]) for (const z of [-1.9, 1.9]) spot(X(u), z);
    led(X(0.05), -2.74, X(0.05), 2.6); led(X(2.75), -0.75, X(2.75), 2.6); led(X(0.05), 2.61, X(2.75), 2.61);
    for (const sz of [-1, 1]) { v.rect(X(0) - 0.0, X(0.12), zc + sz * 1.12 - 0.05, zc + sz * 1.12 + 0.05, `fill="${C.led}"`);
      v.circle(X(0.27), zc + sz * 1.4, 0.12, `fill="#ffe2a8" stroke="${C.ink}" stroke-width="1.4"`); v.circle(X(0.27), zc + sz * 1.4, 0.035, `fill="${C.ink}"`); }
    v.rect(X(2.14), X(2.2), -0.86, -0.8, `fill="${C.led}"`);
    for (const z of [5.0]) { v.rect(s * 0.95 - 0.07, s * 0.95 + 0.07, z - 0.07, z + 0.07, `fill="${C.ink}"`); }
    for (const x of [s * 3.6, s * 0.81]) v.raw(`<path d="M${v.X(x - 0.13)} ${v.Y(3.0)} A${0.13 * v.s} ${0.13 * v.s} 0 0 0 ${v.X(x + 0.13)} ${v.Y(3.0)} Z" fill="${C.led}" stroke="${C.ink}" stroke-width="1.4"/>`);
  }
  for (const z of [-2.35, -1.3, -0.35, 0.9, 2.2]) spot(0, z);
  spot(0, 3.3);
  led(-3.78, 3.05, 3.78, 3.05);
  led(0.66, -0.8, 0.66, 0.0); led(0.44, -0.96, 0.44, 0.15); led(-0.66, -2.6, -0.66, -2.07); led(0.44, 0.6, 0.44, 1.4);
  v.text(-2.2, -1.2, 'غرفة نوم 1', { size: 18, fill: C.ink }); v.text(2.5, -1.2, 'غرفة نوم 2', { size: 18, fill: C.ink });
  v.dimH(-3.6, -2.7, -2.25, { size: 13, lift: 0 }); v.dimH(-2.7, -1.7, -2.25, { size: 13, lift: 0 }); v.dimH(-1.7, -0.8, -2.25, { size: 13, lift: 0 });
  v.dimV(-2.8, -1.9, 1.25, { size: 13, lift: 0 }); v.dimV(-1.9, 1.9, 1.25, { size: 13 }); v.dimV(1.9, 2.8, 1.25, { size: 13, lift: 0 });
  v.text(0, 5.78, 'أعمدة إنارة الممشى كل 1.90 م على الجانبين', { size: 14, fill: C.ink });
  sheets.push({ title: 'مخطط الإضاءة', svg: v.o.join(''), panel: `
    <h3>الرموز والكميات</h3>
    ${lg(`<circle cx="22" cy="13" r="9" fill="#fff" stroke="#1f1b16" stroke-width="1.6"/><line x1="13" y1="13" x2="31" y2="13" stroke="#1f1b16"/><line x1="22" y1="4" x2="22" y2="22" stroke="#1f1b16"/>`, 'سبوت سقف غاطس — 13 داخلي + 1 فوق باب المدخل')}
    ${lg(`<line x1="3" y1="13" x2="41" y2="13" stroke="#e07b00" stroke-width="4" stroke-dasharray="10 5"/>`, 'شريط LED مخفي دافئ 3000K')}
    ${lg(`<rect x="12" y="7" width="20" height="12" fill="#e07b00"/>`, 'شريط LED رأسي بجانب ظهر السرير والخزانة')}
    ${lg(`<circle cx="22" cy="13" r="9" fill="#ffe2a8" stroke="#1f1b16" stroke-width="1.4"/><circle cx="22" cy="13" r="3" fill="#1f1b16"/>`, 'أباجورة على الكومودينو — 4')}
    ${lg(`<path d="M10 8 A12 12 0 0 0 34 8 Z" fill="#e07b00" stroke="#1f1b16" stroke-width="1.4"/>`, 'إضاءة جدارية خارجية أعلى وأسفل — 4')}
    ${lg(`<rect x="16" y="7" width="12" height="12" fill="#1f1b16"/>`, 'عمود إنارة حديقة قصير 0.45 م — 6')}
    <h3>مواقع شرائط LED</h3>
    <ul><li>غرف النوم: محيط السقف عند الجدارين الجانبيين، وبيت الستارة.</li><li>دورة المياه: خلف المرآة، تحت المغسلة، وفي رف الدش.</li><li>الممر: تحت الكونسول. الواجهة: تحت المظلة بطول 7.56 م.</li></ul>
    <h3>ملاحظات</h3>
    <ul><li>السبوتات في غرف النوم على بعد 0.90 م من الجدران.</li><li>مواقع المفاتيح والأفياش والأحمال والقواطع يحددها فني أو مهندس الكهرباء.</li></ul>` });
}

// 7 — general notes
sheets.push({ title: 'ملاحظات عامة ونطاق العمل', html: `<div class="content">
  <h2>ما تغطيه هذه اللوحات</h2>
  <ul class="notes"><li>المقاسات المعمارية الكاملة: الجدران، الفتحات، الارتفاعات، مواقع الأثاث والإضاءة والتشطيبات.</li>
  <li>جميع المقاسات بالمتر. مقاسات الغرف صافية بعد التشطيب، ومقاسات الفتحات هي فتحة الجدار.</li>
  <li>عند أي تعارض بين الرسم والرقم المكتوب يعتمد الرقم المكتوب، ويراجع المالك قبل التنفيذ.</li></ul>
  <h2>ما لا تغطيه ويلزم له مختص</h2>
  <ul class="notes"><li><b>الإنشائي:</b> فحص التربة، القواعد، الميدات، الأعمدة، سماكة وتسليح السقف. تصميم واعتماد مكتب هندسي.</li>
  <li><b>الكهرباء:</b> الأحمال، اللوحة، القواطع، مواقع المفاتيح والأفياش، التأريض.</li>
  <li><b>السباكة والصرف:</b> تغذية وصرف دورة المياه، ميول الأرضيات، تصريف مطر السقف، السخان.</li>
  <li><b>التكييف والعزل:</b> مواقع وحدات التكييف، العزل الحراري للجدران والسقف، العزل المائي لدورة المياه والسقف.</li>
  <li><b>التراخيص:</b> رخصة البناء والارتدادات حسب نظام البلدية.</li></ul>
  <h2>قيم مقترحة تحتاج اعتماد قبل التنفيذ</h2>
  <table><tr><th>البند</th><th class="c">القيمة في اللوحات (م)</th><th>ملاحظة</th></tr>
  <tr><td>منسوب أرضية المبنى عن الحديقة</td><td class="n">+0.30</td><td>اللوحة الأصلية تظهر درجاً عند المدخل بدون رقم</td></tr>
  <tr><td>سماكة السقف</td><td class="n">0.30</td><td>مطابقة للوحة الأصلية (ارتفاع كلي 3.00 وصافي 2.70)، وتحدد إنشائياً</td></tr>
  <tr><td>الجدران الداخلية</td><td class="n">0.10</td><td>إذا نفذت 0.15 أو 0.20 م يزيد طول المبنى 0.10 أو 0.20 م للحفاظ على عرض الغرف</td></tr>
  <tr><td>بروز المظلة الأمامية</td><td class="n">0.55</td><td>مع إطار جانبي أسود 0.25 م</td></tr></table>
  <div class="warn"><b>الفروقات عن اللوحة الأصلية:</b> طول المبنى 7.60 م بدل 7.00 م حتى يبقى عرض كل غرفة نوم 2.80 م، فصارت المساحة 45.60 م² بدل 42.00 م².
  السرير 1.80 × 2.00 م بدل 1.60 × 2.00 م. عمق غرفة النوم 5.60 م كما في رسم المسقط. أضيف الشباك الخلفي W3 إلى الجدول.</div></div>`,
  panel: `<h3>ترتيب اللوحات</h3><ul><li>1 — المسقط الأفقي بالمقاسات</li><li>2 — مسقط الأثاث والتجهيزات</li><li>3 — الواجهات</li><li>4 — القطاعات</li><li>5 — الجداول</li><li>6 — مخطط الإضاءة</li><li>7 — ملاحظات عامة</li></ul>
    <h3>مرفق</h3><ul><li>فيديو ثلاثي الأبعاد يوضح الشكل النهائي والخامات والإضاءة.</li></ul>` });

// ------------------------------------------------------------------ render
document.getElementById('root').innerHTML = sheets.map((sh, i) => `
<div class="sheet" id="s${i + 1}">
  ${sh.svg ? `<svg class="draw" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">${sh.svg}</svg>` : ''}
  ${sh.html || ''}
  <div class="tb"><div class="proj"><h1>غرف الشيوخ</h1><p>غرفتين نوم + دورة مياه</p><p style="font-size:15px;color:#bfae93">مخططات تنفيذية معمارية</p></div>
    <div class="ttl"><small>لوحة ${i + 1} من ${TOTAL}</small><b>${sh.title}</b></div>
    <div class="body">${sh.panel}</div>
    <div class="foot"><span>المقاسات بالمتر</span><span>7.60 × 6.00 م — 45.60 م²</span></div></div>
  <div class="frame"></div>
</div>`).join('');
