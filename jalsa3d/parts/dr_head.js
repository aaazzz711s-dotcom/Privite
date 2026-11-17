// Construction drawing sheets for the outdoor lounge, winter mode: 6.00 x 5.00 m pergola (same data as scene.js).
// Open drawings.html in a browser, or run export-drawings.js for PNG sheets + PDF.
const C = { ink: '#1f1b16', wall: '#2b2622', dim: '#8a4b12', paper: '#fffdf8', wood: '#d2a878', woodD: '#9a6a3c', glass: '#3f86ad',
  grey: '#8b857c', floor: '#fbf7ee', bath: '#e3ebee', green: '#7f9d68', stone: '#d9d3c7', led: '#e07b00', fabric: '#e9dcc4', dark: '#3a3632' };
const f2 = (n) => (Math.round(n * 100) / 100).toFixed(2);
const PLAT = 0.60, YB = 3.35, YT = 3.60, X1 = 3.0, Z1 = 2.5, PX = 3.3, PZ = 2.8, SX0 = -3.1, SX1 = -0.3, GX = 2.86, GP = 1.144, TVZ = 1.95, FZ = -0.5, HTX = 2.3, HTZ = 1.75;
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
    this.o.push(`<text x="${(x0 + x1) / 2}" y="${ty}" font-size="${size}" font-weight="800" fill="${C.dim}" stroke="#f7f2e8" stroke-width="4.5" stroke-linejoin="round" paint-order="stroke" text-anchor="middle">${o.label ?? f2(Math.abs(a1 - a0))}</text>`);
  }
  dimV(b0, b1, al, o = {}) {
    const y0 = this.Y(b0), y1 = this.Y(b1), x = this.X(al), h = Math.abs(y1 - y0), small = h < 46;
    this.o.push(`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${C.dim}" stroke-width="1.3"/>`);
    for (const y of [y0, y1]) this.o.push(`<line x1="${x - 5}" y1="${y + 5}" x2="${x + 5}" y2="${y - 5}" stroke="${C.dim}" stroke-width="2.2"/>`);
    const size = o.size || (small ? 14.5 : 17), side = o.side || -1;
    const tx = side < 0 ? x - 6 - (small ? (o.lift ?? 15) : 0) : x + size + 2 + (small ? (o.lift ?? 15) : 0), ty = (y0 + y1) / 2;
    this.o.push(`<text x="${tx}" y="${ty}" font-size="${size}" font-weight="800" fill="${C.dim}" stroke="#f7f2e8" stroke-width="4.5" stroke-linejoin="round" paint-order="stroke" text-anchor="middle" transform="rotate(-90 ${tx} ${ty})">${o.label ?? f2(Math.abs(b1 - b0))}</text>`);
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

