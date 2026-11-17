
// ------------------------------------------------------------------ shared plan pieces
const lg = (svg, txt) => `<div class="lg"><svg width="44" height="26" viewBox="0 0 44 26">${svg}</svg><span>${txt}</span></div>`;
function sectionMark(v, a0, b0, a1, b1, label, da, db) {
  v.line(a0, b0, a1, b1, `stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="18 5 3 5"`);
  for (const [a, b] of [[a0, b0], [a1, b1]]) {
    const x = v.X(a), y = v.Y(b);
    v.raw(`<circle cx="${x}" cy="${y}" r="15" fill="${C.ink}"/><text x="${x}" y="${y + 6}" font-size="17" font-weight="800" fill="#fff" text-anchor="middle">${label}</text>`);
    v.raw(`<path d="M${x + da * 17} ${y + db * 17} l${da * 14 - db * 8} ${db * 14 + da * 8} l${db * 16} ${-da * 16} Z" fill="${C.ink}"/>`);
  }
}
const PLANTERS = [[-0.15, 1.25, 2.86, 3.5], [2.25, 3.55, 2.86, 3.6], [-4.45, -3.25, 2.86, 3.6]];
function planBase(v, o = {}) {
  v.rect(-PX, PX, -PZ, PZ, `fill="${C.floor}" stroke="${C.ink}" stroke-width="1.8"`);                       // platform
  for (let i = 0; i < 3; i++) v.rect(SX0, SX1, PZ + 0.35 * i, PZ + 0.35 * (i + 1), `fill="${C.stone}" stroke="${C.ink}" stroke-width="1.2"`);
  for (const p of PLANTERS) { v.rect(p[0], p[1], p[2], p[3], `fill="#dfe6d2" stroke="${C.ink}" stroke-width="1.2"`); v.circle((p[0] + p[1]) / 2, (p[2] + p[3]) / 2, 0.22, `fill="${C.green}" opacity="0.8"`); }
  v.rect(-X1, X1, -Z1, Z1, S.dash);                                                                          // roof outline
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) v.rect(sx * X1, sx * (X1 - 0.14), sz * Z1, sz * (Z1 - 0.14), S.wall);   // posts
  v.rect(-GX, GX, -Z1, -Z1 + 0.08, `fill="${C.woodD}" stroke="${C.ink}" stroke-width="1"`);                  // rear slat wall
  v.rect(-X1, -X1 + 0.08, -Z1 + 0.14, Z1 - 0.14, `fill="${C.woodD}" stroke="${C.ink}" stroke-width="1"`);    // left slat screen
  // front sliding glass: five panels, the first one parked behind the second
  for (let i = 1; i < 5; i++) v.line(-GX + GP * i, Z1 - 0.07, -GX + GP * (i + 1), Z1 - 0.07, `stroke="${C.glass}" stroke-width="4"`);
  v.line(-GX + GP - 0.06, Z1 - 0.13, -GX + 2 * GP - 0.06, Z1 - 0.13, `stroke="${C.glass}" stroke-width="4"`);
  for (let i = 0; i <= 5; i++) v.line(-GX + GP * i, Z1 - 0.15, -GX + GP * i, Z1 - 0.02, `stroke="${C.ink}" stroke-width="1.6"`);
  const zs = 1.18;
  v.line(X1 - 0.07, -Z1 + 0.14, X1 - 0.07, Z1 - 0.14, `stroke="${C.glass}" stroke-width="4"`);
  for (let i = 0; i <= 4; i++) v.line(X1 - 0.13, -Z1 + 0.14 + zs * i, X1 - 0.01, -Z1 + 0.14 + zs * i, `stroke="${C.ink}" stroke-width="1.6"`);
  // TV wall
  v.rect(-1.1, 1.1, TVZ, TVZ + 0.12, `fill="${C.woodD}" stroke="${C.ink}" stroke-width="1.4"`);
  v.line(-0.76, TVZ - 0.03, 0.76, TVZ - 0.03, `stroke="${C.ink}" stroke-width="5"`);
  if (o.shelf !== false) v.rect(-0.9, 0.9, TVZ - 0.3, TVZ, `fill="none" stroke="${C.ink}" stroke-width="1" stroke-dasharray="4 3"`);
}
function furniture(v, o = {}) {
  v.rect(-1.95, 1.95, -1.5, 0.75, S.dash);                                                                   // rug
  const sofa = `fill="${C.fabric}" stroke="${C.ink}" stroke-width="1.5"`, cush = `stroke="${C.ink}" stroke-width="0.8"`;
  v.rect(-2.85, 2.85, -2.4, -1.6, sofa); v.rect(-2.85, -2.05, -1.6, 0.4, sofa); v.rect(2.05, 2.85, -1.6, 0.4, sofa);
  v.rect(-2.85, 2.85, -2.4, -2.16, `fill="#d9c9ac" stroke="${C.ink}" stroke-width="0.8"`);
  for (const s of [-1, 1]) v.rect(s * 2.85, s * 2.61, -2.16, 0.4, `fill="#d9c9ac" stroke="${C.ink}" stroke-width="0.8"`);
  for (let i = 1; i < 7; i++) v.line(-2.85 + 5.7 / 7 * i, -2.16, -2.85 + 5.7 / 7 * i, -1.6, cush);
  for (const s of [-1, 1]) v.line(s * 2.61, -0.6, s * 2.05, -0.6, cush);
  v.rect(-0.95, 0.95, FZ - 0.33, FZ + 0.33, `fill="${C.dark}" stroke="${C.ink}" stroke-width="1.4"`);          // fire table
  v.rect(-0.72, 0.72, FZ - 0.1, FZ + 0.1, `fill="${C.led}"`);
  v.rect(HTX - 0.21, HTX + 0.21, HTZ - 0.21, HTZ + 0.21, `fill="${C.dark}" stroke="${C.ink}" stroke-width="1.3"`);   // heater
  v.circle(HTX, HTZ, 0.36, `fill="none" stroke="${C.led}" stroke-width="1.6" stroke-dasharray="5 4"`);
  for (const [x, z] of [[1.56, 2.08], [-2.64, 1.05]]) { v.rect(x - 0.19, x + 0.19, z - 0.19, z + 0.19, S.furn); v.circle(x, z, 0.3, `fill="${C.green}" opacity="0.75"`); }
  if (o.fan !== false) { v.circle(0, -0.45, 0.78, `fill="none" stroke="${C.grey}" stroke-width="1.4" stroke-dasharray="8 5"`); v.circle(0, -0.45, 0.11, `fill="${C.ink}"`); }
}

// ------------------------------------------------------------------ sheets
const sheets = [];

// 1 — dimensioned plan
{
  const v = new View(1165, 512, 100);
  planBase(v);
  v.chainH([-X1, -GX, GX, X1], -3.25, -PZ);
  v.chainH([-PX, -X1, X1, PX], -3.75, -PZ);
  v.chainH([-PX, PX], -4.25, -PZ, { size: 19 });
  v.chainH([-X1, -GX, -GX + GP, -GX + 2 * GP, -GX + 3 * GP, -GX + 4 * GP, GX, X1], 4.35, 3.85);
  v.chainH([-PX, SX0, SX1, PX], 4.9, 3.85);
  v.chainV([-PZ, -Z1, Z1, PZ, 3.85], -4.95, -PX);
  v.chainV([-PZ, PZ], -5.45, -PX, { size: 19 });
  v.chainV([-Z1, -Z1 + 0.14, -Z1 + 1.32, 0, 1.18, Z1 - 0.14, Z1], 3.85, PX, { side: 1 });
  v.chainV([-PZ, -Z1, Z1, PZ], 4.4, PX, { side: 1 });
  // TV wall setting-out
  v.chainH([-X1 + 0.08, -1.1, 1.1, X1 - 0.07], 1.45, TVZ, { size: 15 });
  v.dimV(TVZ, Z1, 1.42, { size: 14, side: 1, lift: 0 });
  v.text(0.9, -1.75, 'الجلسة', { size: 26, weight: 800 }); v.text(0.9, -1.38, '5.00 × 6.00', { size: 19, fill: C.dim, ltr: 1 }); v.text(0.9, -1.05, '30.00 م²', { size: 19 });
  v.text(0.9, 0.35, 'منسوب المصطبة ' + L('+0.60'), { size: 15, fill: C.grey });
  v.text(0.25, TVZ - 0.16, 'جدار التلفزيون', { size: 14 });
  v.text(1.3, -Z1 + 0.32, 'جدار خشب شرائح', { size: 14 }); v.text(-X1 + 0.34, -0.2, 'جدار خشب شرائح', { size: 14, rot: -90 });
  v.text(X1 - 0.34, -0.2, 'زجاج سحاب 4 ألواح', { size: 14, rot: -90 }); v.text(2.25, Z1 - 0.27, 'زجاج سحاب', { size: 13 });
  v.text(-GX + GP / 2, Z1 - 0.38, 'المدخل', { size: 14, weight: 800 });
  v.text((SX0 + SX1) / 2, PZ + 0.6, 'درج 3 نائمات × 0.35', { size: 14 }); v.text((SX0 + SX1) / 2, 4.08, 'الأرض ' + L('±0.00'), { size: 14, fill: C.grey });
  sectionMark(v, -5.95, FZ, 4.95, FZ, 'A', 0, -1);
  sectionMark(v, -0.6, -4.7, -0.6, 5.3, 'B', -1, 0);
  sheets.push({ title: 'المسقط الأفقي بالمقاسات', svg: v.o.join(''), panel: `
    <h3>البيانات الأساسية</h3>
    <div class="kv"><span>المظلة (عرض × عمق)</span><span>6.00 × 5.00 م</span><span>المساحة</span><span>30.00 م²</span><span>المصطبة</span><span>6.60 × 5.60 م</span>
      <span>ارتفاع المصطبة</span><span>0.60 م</span><span>ارتفاع المظلة فوق المصطبة</span><span>3.00 م</span><span>الأعمدة</span><span>0.14 × 0.14 م</span></div>
    <h3>الرموز</h3>
    ${lg(`<line x1="3" y1="13" x2="41" y2="13" stroke="#3f86ad" stroke-width="4"/>`, 'زجاج سحاب')}
    ${lg(`<rect x="4" y="8" width="36" height="10" fill="#9a6a3c" stroke="#1f1b16"/>`, 'جدار خشب شرائح')}
    ${lg(`<rect x="13" y="4" width="18" height="18" fill="#2b2622"/>`, 'عمود ألمنيوم 14 × 14 سم')}
    ${lg(`<rect x="4" y="5" width="36" height="16" fill="none" stroke="#8b857c" stroke-dasharray="6 4" stroke-width="1.4"/>`, 'حد السقف من فوق')}
    ${lg(`<circle cx="22" cy="13" r="10" fill="#1f1b16"/><text x="22" y="17.5" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">A</text>`, 'خط القطاع واتجاه النظر')}
    <h3>ملاحظات</h3>
    <ul><li>المقاسات بالمتر. مقاس المظلة من الوجه الخارجي للأعمدة.</li><li>المصطبة تبرز 0.30 م عن المظلة من كل جهة.</li>
    <li>الواجهة الأمامية 5 ألواح زجاج بعرض 1.14 م، واللوح الأيسر هو المدخل وينسحب خلف اللوح الثاني.</li>
    <li>جدار التلفزيون حر بسماكة 0.12 م، ووجهه الداخلي يبعد 0.55 م عن حد المظلة الأمامي.</li>
    <li>الدرج يبدأ على بعد 0.20 م من طرف المصطبة الأيسر.</li></ul>` });
}

// 2 — furniture layout
{
  const v = new View(1165, 500, 112);
  planBase(v); furniture(v);
  v.chainH([-2.85, 2.85], -3.15, -2.4, { size: 17 });
  v.chainV([-2.4, -1.6, 0.4], -3.75, -2.85);
  v.dimH(-2.85, -2.05, 0.62, { size: 15, side: 1 }); v.dimH(2.05, 2.85, 0.62, { size: 15, side: 1 });
  v.dimH(-0.95, 0.95, FZ + 0.52, { size: 15, side: 1 }); v.dimV(FZ - 0.33, FZ + 0.33, 1.12, { size: 15, side: 1 });
  v.dimV(-1.6, FZ - 0.33, -0.55, { size: 15 });
  v.dimH(0.95, 2.05, FZ, { size: 15 }); v.dimH(-2.05, -0.95, FZ, { size: 15 });
  v.dimV(FZ + 0.33, TVZ, -0.75, { size: 15 });
  v.dimV(0.4, HTZ, HTX, { size: 15 }); v.dimH(HTX, X1, HTZ + 0.42, { size: 15, side: 1 }); v.dimV(HTZ, Z1, HTX + 0.42, { size: 15, side: 1 });
  v.dimH(-X1 + 0.08, -1.1, 1.72, { size: 15 });
  v.num(0, -2.0, 1); v.num(0.55, FZ, 2); v.num(0.55, TVZ + 0.06, 3); v.num(-0.55, TVZ - 0.17, 4); v.num(HTX, HTZ, 5); v.num(0.55, -0.9, 6); v.num(1.6, 0.4, 7); v.num(1.56, 2.08, 8); v.num(-2.64, 1.05, 8); v.num(0.55, 3.18, 9);
  sheets.push({ title: 'مسقط الأثاث والتجهيزات', svg: v.o.join(''), panel: `
    <h3>العناصر</h3>
    <div class="kv"><span>① كنب U بعمق 0.80</span><span>5.70 + 2 × 2.00</span><span>② طاولة نار رخام أسود</span><span>1.90 × 0.66</span><span>③ جدار التلفزيون</span><span>2.20 × 2.30</span>
      <span>④ رف معلق تحت الشاشة</span><span>1.80 × 0.30</span><span>⑤ دفاية هرمية</span><span>0.42 × 0.42</span><span>⑥ مروحة سقف</span><span>Ø 1.55</span>
      <span>⑦ سجادة</span><span>3.90 × 2.25</span><span>⑧ حوض نبات داخلي ×2</span><span>0.38 × 0.38</span><span>⑨ أحواض زرع خارجية ×3</span><span>ارتفاع 0.50</span></div>
    <h3>الارتفاعات</h3>
    <div class="kv"><span>جلسة الكنب</span><span>0.47</span><span>ظهر الكنب</span><span>0.86</span><span>طاولة النار</span><span>0.42</span><span>مركز الشاشة 65 بوصة</span><span>1.40</span><span>الدفاية</span><span>2.15</span></div>
    <h3>المسافات</h3>
    <ul><li>بين الكنب الخلفي وطاولة النار: 0.77 م.</li><li>بين طاولة النار وذراعي الكنب: 1.10 م من كل جهة.</li>
    <li>بين طاولة النار وجدار التلفزيون: 2.12 م.</li><li>مركز الدفاية يبعد 1.35 م عن طرف الكنب، و0.70 م و0.75 م عن حدّي المظلة.</li>
    <li>ممر الدخول بين الجدار الأيسر وجدار التلفزيون: 1.82 م.</li></ul>` });
}

// 3 — elevations
{
  const hatch = `<defs><pattern id="sl3" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${C.wood}"/><line x1="2" y1="0" x2="2" y2="8" stroke="${C.woodD}" stroke-width="2.2"/></pattern></defs>`;
  const v = new View(1165, 470, 104, true); v.raw(hatch);
  v.rect(-1.1, 1.1, PLAT, PLAT + 2.3, `fill="url(#sl3)" opacity="0.55" stroke="${C.ink}" stroke-width="1" stroke-dasharray="6 4"`);      // TV wall behind the glass
  v.rect(-PX, PX, 0, 0.52, `fill="url(#sl3)" stroke="${C.ink}" stroke-width="1.3"`); v.rect(-PX, PX, 0.52, PLAT, `fill="${C.stone}" stroke="${C.ink}" stroke-width="1.3"`);
  v.line(-PX, 0.5, PX, 0.5, `stroke="${C.led}" stroke-width="3"`);
  for (let i = 1; i <= 3; i++) { const top = PLAT - 0.15 * i; v.rect(SX0, SX1, 0, top, `fill="${C.stone}" stroke="${C.ink}" stroke-width="1.2"`); v.line(SX0 + 0.03, top - 0.05, SX1 - 0.03, top - 0.05, `stroke="${C.led}" stroke-width="2.5"`); }
  for (const s of [-1, 1]) v.rect(s * X1, s * GX, PLAT, YB, S.wall);
  v.rect(-X1, X1, YB, YT, S.wall);
  for (let i = 0; i < 5; i++) v.rect(-GX + GP * i, -GX + GP * (i + 1), PLAT + 0.012, YB - 0.05, `fill="#cfe1ea" fill-opacity="0.45" stroke="${C.ink}" stroke-width="2.6"`);
  v.line(-GX + 0.15, PLAT + 1.35, -GX + GP - 0.15, PLAT + 1.35, `stroke="${C.ink}" stroke-width="1.6" marker-end="url(#ar)"`);
  v.raw(`<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${C.ink}"/></marker></defs>`);
  v.text(-GX + GP / 2, PLAT + 1.6, 'مدخل', { size: 14, weight: 800 });
  for (const p of PLANTERS) { v.rect(p[0], p[1], 0, 0.5, `fill="#e9e0cf" stroke="${C.ink}" stroke-width="1.3"`); v.circle((p[0] + p[1]) / 2, 0.85, 0.36, `fill="${C.green}" fill-opacity="0.35" stroke="${C.green}" stroke-width="1.4"`); }
  v.line(-5.6, 0, 5.6, 0, `stroke="${C.ink}" stroke-width="3"`);
  v.chainH([-X1, -GX, -GX + GP, -GX + 2 * GP, -GX + 3 * GP, -GX + 4 * GP, GX, X1], -0.42, 0);
  v.chainH([-PX, -X1, X1, PX], -0.88, 0);
  v.chainV([0, PLAT, YB, YT], 4.0, PX, { side: 1 }); v.chainV([0, YT], 4.5, PX, { side: 1, size: 19 });
  v.level(-5.0, 0, '±0.00'); v.level(-5.0, PLAT, '+0.60'); v.level(-5.0, YB, '+3.35'); v.level(-5.0, YT, '+3.60');
  v.text(0, YT + 0.2, 'الواجهة الأمامية', { size: 25, weight: 800 });
  v.text(0, PLAT + 2.48, 'جدار التلفزيون (خلف الزجاج)', { size: 13, fill: C.dim });
  // right side elevation (front of the lounge on the left)
  const r = new View(1165, 1000, 104, true), A = (z) => -z;
  r.raw(hatch.replace('sl3', 'sl3b'));
  r.rect(A(TVZ + 0.12), A(TVZ), PLAT, PLAT + 2.3, `fill="url(#sl3b)" opacity="0.6" stroke="${C.ink}" stroke-width="1"`);
  r.rect(A(-1.6), A(-2.4), PLAT + 0.07, PLAT + 0.86, `fill="${C.fabric}" opacity="0.7" stroke="${C.ink}" stroke-width="1"`); r.rect(A(0.4), A(-1.6), PLAT + 0.07, PLAT + 0.86, `fill="${C.fabric}" opacity="0.7" stroke="${C.ink}" stroke-width="1"`);
  r.rect(A(HTZ + 0.21), A(HTZ - 0.21), PLAT, PLAT + 0.74, `fill="${C.dark}"`); r.poly([[A(HTZ) - 0.2, PLAT + 0.74], [A(HTZ) + 0.2, PLAT + 0.74], [A(HTZ) + 0.1, PLAT + 2.02], [A(HTZ) - 0.1, PLAT + 2.02]], `fill="#ffd27a" fill-opacity="0.5" stroke="${C.ink}" stroke-width="1.2"`);
  r.poly([[A(HTZ) - 0.36, PLAT + 2.03], [A(HTZ) + 0.36, PLAT + 2.03], [A(HTZ), PLAT + 2.17]], `fill="${C.dark}"`);
  r.rect(A(-Z1 + 0.08), A(-Z1), PLAT, YB, `fill="url(#sl3b)" stroke="${C.ink}" stroke-width="1"`);
  for (let i = 1; i <= 3; i++) r.rect(A(PZ + 0.35 * i), A(PZ), 0, PLAT - 0.15 * i, `fill="${C.stone}" stroke="${C.ink}" stroke-width="1.1"`);
  r.rect(A(PZ), A(-PZ), 0, 0.52, `fill="url(#sl3b)" stroke="${C.ink}" stroke-width="1.3"`); r.rect(A(PZ), A(-PZ), 0.52, PLAT, `fill="${C.stone}" stroke="${C.ink}" stroke-width="1.3"`);
  r.line(A(PZ), 0.5, A(-PZ), 0.5, `stroke="${C.led}" stroke-width="3"`);
  r.rect(A(3.6), A(2.86), 0, 0.5, `fill="#e9e0cf" stroke="${C.ink}" stroke-width="1.3"`); r.circle(A(3.23), 0.85, 0.36, `fill="${C.green}" fill-opacity="0.35" stroke="${C.green}" stroke-width="1.4"`);
  for (const s of [-1, 1]) r.rect(s * Z1, s * (Z1 - 0.14), PLAT, YB, S.wall);
  r.rect(-Z1, Z1, YB, YT, S.wall);
  for (let i = 0; i < 4; i++) r.rect(-Z1 + 0.14 + 1.18 * i, -Z1 + 0.14 + 1.18 * (i + 1), PLAT + 0.012, YB - 0.05, `fill="#cfe1ea" fill-opacity="0.4" stroke="${C.ink}" stroke-width="2.6"`);
  r.line(-5.6, 0, 5.6, 0, `stroke="${C.ink}" stroke-width="3"`);
  r.chainH([A(3.85), A(PZ), -Z1, -Z1 + 0.14, -Z1 + 1.32, 0, 1.18, Z1 - 0.14, Z1, A(-PZ)], -0.42, 0);
  r.chainV([0, PLAT, YB, YT], 3.5, PZ, { side: 1 }); r.chainV([PLAT, YT], 4.0, PZ, { side: 1, size: 19 });
  r.text(-4.75, 0.42, '4 قوائم', { size: 14 }); r.text(-4.75, 0.16, L('0.15 ×'), { size: 14, fill: C.dim });
  r.text(0, YT + 0.2, 'الواجهة الجانبية اليمنى', { size: 25, weight: 800 });
  sheets.push({ title: 'الواجهات', svg: v.o.join('') + r.o.join(''), panel: `
    <h3>المناسيب (من الأرض)</h3>
    <div class="kv"><span>الأرض</span><span>±0.00</span><span>سطح المصطبة</span><span>+0.60</span><span>أسفل كمرات السقف</span><span>+3.35</span><span>أعلى المظلة</span><span>+3.60</span></div>
    <h3>الواجهة الأمامية</h3>
    <ul><li>إطار ألمنيوم أسود مطفي: أعمدة 14 × 14 سم وكمرات 14 × 25 سم.</li><li>5 ألواح زجاج سحاب، ارتفاع اللوح 2.69 م.</li>
    <li>جدار التلفزيون يظهر خلف الزجاج في المنتصف بعرض 2.20 م وارتفاع 2.30 م، ووجهه الخارجي خشب شرائح.</li>
    <li>جوانب المصطبة كسوة خشب شرائح مع LED مخفي تحت حافة البلاط.</li><li>الدرج: 4 قوائم × 0.15 م و3 نائمات × 0.35 م، مع LED تحت كل نائمة.</li></ul>
    <h3>الواجهة الجانبية</h3>
    <ul><li>4 ألواح زجاج بعرض 1.18 م.</li><li>الدفاية في الركن الأمامي، والكنب وجدار التلفزيون يظهران خلف الزجاج.</li></ul>` });
}

// 4 — sections
{
  const defs = (id) => `<defs><pattern id="hx${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#cfc8bb"/><line x1="0" y1="0" x2="0" y2="8" stroke="${C.ink}" stroke-width="1.2"/></pattern>
    <pattern id="sl${id}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${C.wood}"/><line x1="2" y1="0" x2="2" y2="8" stroke="${C.woodD}" stroke-width="2.2"/></pattern></defs>`;
  const sconce = (v, a, y) => { v.poly([[a, y + 0.14], [a - 0.17, y + 0.7], [a + 0.17, y + 0.7]], `fill="#ffd27a" opacity="0.55"`); v.poly([[a, y - 0.14], [a - 0.17, y - 0.7], [a + 0.17, y - 0.7]], `fill="#ffd27a" opacity="0.55"`); v.rect(a - 0.04, a + 0.04, y - 0.14, y + 0.14, `fill="${C.ink}"`); };
  // A-A: across the width through the fire table, looking at the rear wall
  const a = new View(1165, 462, 104, true); a.raw(defs('a'));
  a.rect(-GX, GX, PLAT, YB, `fill="url(#sla)" stroke="${C.ink}" stroke-width="1"`);
  for (const x of [-1.9, 0, 1.9]) sconce(a, x, PLAT + 1.75);
  a.rect(-2.85, 2.85, PLAT + 0.07, PLAT + 0.47, `fill="${C.fabric}" stroke="${C.ink}" stroke-width="1.2"`); a.rect(-2.85, 2.85, PLAT + 0.47, PLAT + 0.86, `fill="#efe6d4" stroke="${C.ink}" stroke-width="1.2"`);
  for (let i = 1; i < 7; i++) a.line(-2.85 + 5.7 / 7 * i, PLAT + 0.3, -2.85 + 5.7 / 7 * i, PLAT + 0.86, `stroke="${C.ink}" stroke-width="0.8"`);
  for (const s of [-1, 1]) { a.rect(s * 2.85, s * 2.05, PLAT + 0.07, PLAT + 0.47, `fill="#d9c9ac" stroke="${C.ink}" stroke-width="1.6"`); a.rect(s * 2.85, s * 2.61, PLAT + 0.47, PLAT + 0.86, `fill="#d9c9ac" stroke="${C.ink}" stroke-width="1.6"`); }
  a.rect(-0.95, 0.95, PLAT + 0.05, PLAT + 0.42, `fill="${C.dark}" stroke="${C.ink}" stroke-width="1.6"`); a.poly([[-0.7, PLAT + 0.43], [0.7, PLAT + 0.43], [0.45, PLAT + 0.66], [0.2, PLAT + 0.55], [0, PLAT + 0.72], [-0.25, PLAT + 0.56], [-0.5, PLAT + 0.68]], `fill="${C.led}" opacity="0.8"`);
  a.line(0, YB, 0, YB - 0.3, `stroke="${C.ink}" stroke-width="3"`); a.rect(-0.11, 0.11, YB - 0.43, YB - 0.3, `fill="${C.ink}"`); a.line(-0.78, YB - 0.37, 0.78, YB - 0.37, `stroke="${C.woodD}" stroke-width="5"`);
  a.rect(-PX, PX, 0, PLAT, `fill="url(#hxa)" stroke="${C.ink}" stroke-width="1.6"`);
  a.rect(-X1, -X1 + 0.08, PLAT, YB, `fill="${C.woodD}" stroke="${C.ink}" stroke-width="1.4"`); a.line(X1 - 0.07, PLAT, X1 - 0.07, YB, `stroke="${C.glass}" stroke-width="4"`);
  for (const s of [-1, 1]) a.rect(s * X1, s * GX, YB, YT, `fill="url(#hxa)" stroke="${C.ink}" stroke-width="1.6"`);
  a.rect(-0.05, 0.05, YB + 0.03, YT, `fill="url(#hxa)" stroke="${C.ink}" stroke-width="1.4"`);
  for (const [x0, x1] of [[-GX, -0.05], [0.05, GX]]) a.rect(x0, x1, YT - 0.115, YT - 0.085, `fill="${C.wood}" stroke="${C.ink}" stroke-width="1"`);
  a.line(-5.6, 0, 5.6, 0, `stroke="${C.ink}" stroke-width="3"`);
  a.chainH([-PX, -X1, X1, PX], -0.42, 0); a.dimH(-X1 + 0.08, X1 - 0.07, PLAT + 1.25, { size: 15, label: '5.85 صافي' });
  a.chainV([0, PLAT, YB, YT], 4.0, PX, { side: 1 }); a.chainV([0, YT], 4.5, PX, { side: 1, size: 19 });
  a.dimV(PLAT, PLAT + 0.47, -1.55, { size: 13, side: 1, lift: 0 }); a.dimV(PLAT, PLAT + 0.86, -2.3, { size: 13, lift: 0 }); a.dimV(PLAT, PLAT + 1.75, 0.95, { size: 14, side: 1 });
  a.dimV(PLAT, YB - 0.43, 0.42, { size: 14 });
  a.level(-5.0, 0, '±0.00'); a.level(-5.0, PLAT, '+0.60'); a.level(-5.0, YB, '+3.35'); a.level(-5.0, YT, '+3.60');
  a.text(0, YT + 0.2, 'قطاع A-A — عبر طاولة النار (النظر إلى الجدار الخلفي)', { size: 24, weight: 800 });
  // B-B: front-to-back through the steps, TV wall and fire table, looking at the left slat screen
  const b = new View(1165, 992, 104, true), A = (z) => -z; b.raw(defs('b'));
  b.rect(A(Z1 - 0.14), A(-Z1 + 0.14), PLAT, YB, `fill="url(#slb)" stroke="${C.ink}" stroke-width="1"`);
  for (const z of [-0.9, 1.0]) sconce(b, A(z), PLAT + 1.75);
  b.rect(A(0.4), A(-1.6), PLAT + 0.07, PLAT + 0.47, `fill="${C.fabric}" stroke="${C.ink}" stroke-width="1.2"`); b.rect(A(0.4), A(-1.6), PLAT + 0.47, PLAT + 0.86, `fill="#efe6d4" stroke="${C.ink}" stroke-width="1.2"`);
  b.rect(A(1.24), A(0.86), PLAT, PLAT + 0.5, S.furn); b.circle(A(1.05), PLAT + 1.55, 0.36, `fill="${C.green}" opacity="0.75"`); b.line(A(1.05), PLAT + 0.5, A(1.05), PLAT + 1.3, `stroke="${C.ink}" stroke-width="2"`);
  // cut: steps, platform, TV wall, fire table, rear sofa, rear wall, beams, louvers
  for (let i = 1; i <= 3; i++) b.rect(A(PZ + 0.35 * i), A(PZ), 0, PLAT - 0.15 * i, `fill="url(#hxb)" stroke="${C.ink}" stroke-width="1.4"`);
  b.rect(A(PZ), A(-PZ), 0, PLAT, `fill="url(#hxb)" stroke="${C.ink}" stroke-width="1.6"`);
  b.rect(A(TVZ + 0.12), A(TVZ), PLAT, PLAT + 2.3, `fill="${C.woodD}" stroke="${C.ink}" stroke-width="1.6"`);
  b.rect(A(TVZ), A(TVZ - 0.045), PLAT + 0.96, PLAT + 1.84, `fill="${C.ink}"`); b.rect(A(TVZ), A(TVZ - 0.3), PLAT + 0.42, PLAT + 0.47, S.wood);
  b.line(A(Z1 - 0.07), PLAT, A(Z1 - 0.07), YB, `stroke="${C.glass}" stroke-width="4"`);
  b.rect(A(FZ + 0.33), A(FZ - 0.33), PLAT + 0.05, PLAT + 0.42, `fill="${C.dark}" stroke="${C.ink}" stroke-width="1.6"`); b.poly([[A(FZ) - 0.1, PLAT + 0.43], [A(FZ) + 0.1, PLAT + 0.43], [A(FZ), PLAT + 0.72]], `fill="${C.led}" opacity="0.85"`);
  b.rect(A(-1.6), A(-2.4), PLAT + 0.07, PLAT + 0.47, `fill="#d9c9ac" stroke="${C.ink}" stroke-width="1.6"`); b.rect(A(-2.16), A(-2.4), PLAT + 0.47, PLAT + 0.86, `fill="#d9c9ac" stroke="${C.ink}" stroke-width="1.6"`);
  b.rect(A(-Z1 + 0.08), A(-Z1), PLAT, YB, `fill="${C.woodD}" stroke="${C.ink}" stroke-width="1.4"`);
  for (const s of [-1, 1]) b.rect(s * Z1, s * (Z1 - 0.14), YB, YT, `fill="url(#hxb)" stroke="${C.ink}" stroke-width="1.6"`);
  for (let i = 0; i < 24; i++) { const c = -Z1 + 0.14 + 4.72 / 24 * (i + 0.5); b.rect(c - 0.093, c + 0.093, YT - 0.115, YT - 0.085, `fill="${C.wood}" stroke="${C.ink}" stroke-width="0.9"`); }
  b.line(A(-0.45), YB, A(-0.45), YB - 0.3, `stroke="${C.ink}" stroke-width="3"`); b.rect(A(-0.45) - 0.11, A(-0.45) + 0.11, YB - 0.43, YB - 0.3, `fill="${C.ink}"`); b.line(A(-0.45) - 0.78, YB - 0.37, A(-0.45) + 0.78, YB - 0.37, `stroke="${C.woodD}" stroke-width="5"`);
  b.line(-5.6, 0, 5.6, 0, `stroke="${C.ink}" stroke-width="3"`);
  b.chainH([A(3.85), A(PZ), A(Z1), A(-Z1), A(-PZ)], -0.42, 0);
  b.chainH([A(Z1), A(TVZ), A(FZ + 0.33), A(FZ - 0.33), A(-1.6), A(-2.4), A(-Z1)], PLAT + 2.52, YB, { size: 14 });
  b.chainV([0, PLAT, YB, YT], 3.5, PZ, { side: 1 }); b.chainV([PLAT, YT], 4.0, PZ, { side: 1, size: 19 });
  b.dimV(PLAT, PLAT + 2.3, A(TVZ + 0.12) - 0.22, { size: 14 }); b.dimV(PLAT, PLAT + 1.4, A(TVZ) + 0.32, { size: 14, side: 1 });
  b.text(-4.75, 0.42, '4 قوائم', { size: 14 }); b.text(-4.75, 0.16, L('0.15 ×'), { size: 14, fill: C.dim });
  b.text(0, YT + 0.2, 'قطاع B-B — من الأمام للخلف (النظر إلى الجدار الأيسر)', { size: 24, weight: 800 });
  sheets.push({ title: 'القطاعات', svg: a.o.join('') + b.o.join(''), panel: `
    <h3>الارتفاعات (من سطح المصطبة)</h3>
    <div class="kv"><span>الارتفاع الصافي تحت الكمرات</span><span>2.75 م</span><span>أعلى المظلة</span><span>3.00 م</span><span>أسفل المروحة</span><span>2.32 م</span>
      <span>مركز الإضاءة الجدارية</span><span>1.75 م</span><span>جدار التلفزيون</span><span>2.30 م</span><span>مركز الشاشة</span><span>1.40 م</span></div>
    <h3>السقف</h3>
    <ul><li>شرائح متحركة على فتحتين، بينهما كمرة وسطية 10 × 22 سم.</li><li>24 شريحة في كل فتحة، عرض الشريحة حوالي 19 سم، بطول 2.81 م.</li>
    <li>وجه الشريحة السفلي بلون خشبي، وتُفتح وتُغلق بمحرك.</li><li>شريط LED مخفي على محيط الكمرات من الداخل.</li></ul>
    <h3>القطاع B-B</h3>
    <ul><li>من الأمام للخلف: زجاج، ثم 0.55 م، جدار التلفزيون، 2.12 م، طاولة النار 0.66 م، 0.77 م، الكنب 0.80 م.</li>
    <li>بناء المصطبة والقواعد تحت الأعمدة يحددها المهندس الإنشائي.</li></ul>` });
}

// 5 — schedules
sheets.push({ title: 'جداول العناصر والتشطيبات', html: `<div class="content">
  <h2>جدول العناصر</h2>
  <table><tr><th>العنصر</th><th class="c" style="white-space:nowrap">المقاس (م)</th><th class="c">العدد</th><th>المواصفة</th></tr>
  <tr><td><b>مظلة ألمنيوم</b></td><td class="n">6.00 × 5.00 × 3.00</td><td class="n">1</td><td>أعمدة 14 × 14 سم عدد 4، كمرات محيطية 14 × 25 سم، أسود مطفي</td></tr>
  <tr><td><b>سقف شرائح متحرك</b></td><td class="n">2.81 × 4.72</td><td class="n">2</td><td>فتحتان، 24 شريحة لكل فتحة بعرض 19 سم، بمحرك، الوجه السفلي بلون خشبي</td></tr>
  <tr><td><b>زجاج سحاب أمامي</b></td><td class="n">1.14 × 2.69</td><td class="n">5</td><td>زجاج سيكوريت، إطار ألمنيوم أسود، اللوح الأيسر مدخل</td></tr>
  <tr><td><b>زجاج سحاب جانبي</b></td><td class="n">1.18 × 2.69</td><td class="n">4</td><td>الجهة اليمنى</td></tr>
  <tr><td><b>جدار خشب شرائح خلفي</b></td><td class="n">5.72 × 2.75</td><td class="n">1</td><td>شريحة 5.5 سم وفاصل 2.5 سم على خلفية داكنة</td></tr>
  <tr><td><b>جدار خشب شرائح أيسر</b></td><td class="n">4.72 × 2.75</td><td class="n">1</td><td>نفس مواصفة الجدار الخلفي</td></tr>
  <tr><td><b>جدار التلفزيون</b></td><td class="n">2.20 × 2.30 × 0.12</td><td class="n">1</td><td>حر، شرائح على الوجهين، مع تمديد كهرباء وبيانات داخله</td></tr>
  <tr><td><b>مصطبة</b></td><td class="n">6.60 × 5.60 × 0.60</td><td class="n">1</td><td>بورسلان خارجي مانع للانزلاق، جوانب خشب شرائح</td></tr>
  <tr><td><b>درج</b></td><td class="n">2.80 × 1.05</td><td class="n">1</td><td>4 قوائم × 0.15 م، 3 نائمات × 0.35 م</td></tr>
  <tr><td><b>أحواض زرع خارجية</b></td><td class="n">1.40 × 0.64 / 1.30 × 0.74 / 1.20 × 0.74</td><td class="n">3</td><td>ارتفاع 0.50 م، حجر أو خرسانة بلون بيج</td></tr></table>
  <h2>جدول التشطيبات</h2>
  <table><tr><th>المادة</th><th>مكان الاستعمال</th><th>ملاحظات</th></tr>
  <tr><td><span class="sw" style="background:#ded3c1"></span>بورسلان خارجي بيج</td><td>سطح المصطبة ونائمات الدرج</td><td>مقاس كبير 120 × 60 سم، مانع للانزلاق</td></tr>
  <tr><td><span class="sw" style="background:#c79a67"></span>خشب شرائح</td><td>الجدران، جدار التلفزيون، جوانب المصطبة، أسفل شرائح السقف</td><td>يمكن بديل خشب WPC أو ألمنيوم بلون خشبي للأماكن المكشوفة</td></tr>
  <tr><td><span class="sw" style="background:#1c1c1c"></span>ألمنيوم أسود مطفي</td><td>الأعمدة، الكمرات، إطارات الزجاج</td><td>دهان بودرة</td></tr>
  <tr><td><span class="sw" style="background:#161617"></span>رخام أسود</td><td>طاولة النار</td><td>أو بورسلان بشكل رخام</td></tr>
  <tr><td><span class="sw" style="background:#5d7a3a"></span>جدار نباتي</td><td>السور الخلفي والأيسر خلف الجلسة</td><td>طبيعي أو صناعي</td></tr></table>
</table></div>`,
  panel: `<h3>قراءة الجداول</h3><ul><li>مقاسات الزجاج والجدران صافية بين الأعمدة.</li><li>الكميات تقريبية وتُراجع من المورد قبل الطلب.</li></ul>
    <h3>توريد السقف والزجاج</h3><ul><li>نظام السقف المتحرك والزجاج السحاب يورَّد من شركة متخصصة.</li><li>تطلب من المورد رسومات تصنيع معتمدة على المقاسات في هذه اللوحات.</li></ul>
    <h3>الأثاث</h3><ul><li>الكنب والدفاية والشاشة والمروحة توريد جاهز حسب المقاسات في لوحة 2.</li></ul>` });

// 6 — lighting and services plan
{
  const v = new View(1165, 505, 112);
  planBase(v, { shelf: false }); v.raw('<g opacity="0.3">'); furniture(v, { fan: false }); v.raw('</g>');
  const led = (a0, b0, a1, b1) => v.line(a0, b0, a1, b1, `stroke="${C.led}" stroke-width="4" stroke-dasharray="10 5"`);
  const i = 0.2;
  led(-GX, Z1 - i, GX, Z1 - i); led(-GX, -Z1 + i, GX, -Z1 + i); led(-X1 + i, -Z1 + i, -X1 + i, Z1 - i); led(X1 - i, -Z1 + i, X1 - i, Z1 - i);   // roof perimeter
  led(-PX + 0.04, PZ - 0.04, PX - 0.04, PZ - 0.04); led(PX - 0.04, -PZ + 0.04, PX - 0.04, PZ - 0.04); led(-PX + 0.04, -PZ + 0.04, -PX + 0.04, PZ - 0.04);   // platform edge
  for (let k = 1; k <= 3; k++) led(SX0 + 0.05, PZ + 0.35 * k - 0.03, SX1 - 0.05, PZ + 0.35 * k - 0.03);
  for (const s of [-1, 1]) v.rect(s * 1.1 - 0.06, s * 1.1 + 0.06, TVZ - 0.1, TVZ + 0.02, `fill="${C.led}"`);
  led(-0.88, TVZ - 0.17, 0.88, TVZ - 0.17);
  const sc = (x, z, rot) => v.raw(`<g transform="translate(${v.X(x)} ${v.Y(z)}) rotate(${rot})"><path d="M-14 0 A14 14 0 0 0 14 0 Z" fill="${C.led}" stroke="${C.ink}" stroke-width="1.4"/></g>`);
  for (const x of [-1.9, 0, 1.9]) sc(x, -Z1 + 0.08, 0);
  for (const z of [-0.9, 1.0]) sc(-X1 + 0.08, z, -90);
  v.circle(0, -0.45, 0.78, `fill="none" stroke="${C.ink}" stroke-width="1.4" stroke-dasharray="8 5"`); v.circle(0, -0.45, 0.12, `fill="${C.ink}"`);
  const pt = (x, z, t, col = '#b03030') => { v.rect(x - 0.09, x + 0.09, z - 0.09, z + 0.09, `fill="${col}" stroke="${C.ink}" stroke-width="1.2"`); v.raw(`<text x="${v.X(x)}" y="${v.Y(z) + 5}" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">${t}</text>`); };
  pt(0.45, TVZ + 0.06, 'ك'); pt(-0.45, TVZ + 0.06, 'ب', '#2c5f8a'); pt(0.3, -0.45, 'ك'); pt(-2.75, -2.3, 'م', '#4a7a3a'); pt(0, FZ, 'غ', '#c06a00');
  v.dimH(-1.9, 0, -1.3, { size: 13 }); v.dimH(0, 1.9, -1.3, { size: 13 }); v.dimV(-0.9, 1.0, -2.3, { size: 13, side: 1 });
  v.text(0, -1.02, 'مروحة سقف', { size: 14 });
  sheets.push({ title: 'مخطط الإضاءة والتمديدات', svg: v.o.join(''), panel: `
    <h3>الرموز</h3>
    ${lg(`<line x1="3" y1="13" x2="41" y2="13" stroke="#e07b00" stroke-width="4" stroke-dasharray="10 5"/>`, 'شريط LED مخفي دافئ 3000K')}
    ${lg(`<path d="M10 8 A12 12 0 0 0 34 8 Z" fill="#e07b00" stroke="#1f1b16" stroke-width="1.4"/>`, 'إضاءة جدارية أعلى وأسفل — 5')}
    ${lg(`<rect x="14" y="5" width="16" height="16" fill="#b03030" stroke="#1f1b16"/><text x="22" y="18" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">ك</text>`, 'نقطة كهرباء (شاشة، مروحة)')}
    ${lg(`<rect x="14" y="5" width="16" height="16" fill="#2c5f8a" stroke="#1f1b16"/><text x="22" y="18" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">ب</text>`, 'نقطة بيانات للشاشة')}
    ${lg(`<rect x="14" y="5" width="16" height="16" fill="#4a7a3a" stroke="#1f1b16"/><text x="22" y="18" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">م</text>`, 'محرك السقف ومحولات LED')}
    ${lg(`<rect x="14" y="5" width="16" height="16" fill="#c06a00" stroke="#1f1b16"/><text x="22" y="18" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">غ</text>`, 'تغذية طاولة النار (غاز أو وقود حيوي)')}
    <h3>كميات شرائط LED</h3>
    <div class="kv"><span>محيط السقف من الداخل والخط الأمامي</span><span>≈ 27 م</span><span>تحت حافة المصطبة (3 جهات) والدرج</span><span>≈ 26 م</span><span>طرفا جدار التلفزيون وتحت الرف</span><span>≈ 6.5 م</span></div>
    <h3>ملاحظات</h3>
    <ul><li>الإضاءة الجدارية: 3 على الجدار الخلفي بتباعد 1.90 م، و2 على الجدار الأيسر بتباعد 1.90 م.</li>
    <li>تمديدات الكهرباء داخل الأعمدة والكمرات وجدار التلفزيون، وتُنفّذ قبل التشطيب.</li>
    <li>كل ما هو خارج الزجاج بدرجة حماية خارجية ضد الماء.</li><li>الأحمال والقواطع ومسار الغاز يحددها المختص.</li></ul>` });
}

// 7 — general notes
sheets.push({ title: 'ملاحظات عامة ونطاق العمل', html: `<div class="content">
  <div class="warn" style="margin-top:0"><b>تنبيه سلامة مهم:</b> الدفاية الهرمية وطاولة النار التي تعمل بالغاز مصممة للأماكن المفتوحة. عند إغلاق الزجاج في الشتاء يلزم
  ترك فتحات تهوية دائمة (فتح جزئي لشرائح السقف أو لوح زجاج)، وتركيب كاشف أول أكسيد الكربون. البديل الآمن للمكان المغلق: دفاية كهربائية بالأشعة تحت الحمراء، وطاولة نار بالوقود الحيوي أو كهربائية.</div>
  <h2>ما تغطيه هذه اللوحات</h2>
  <ul class="notes"><li>المقاسات المعمارية للمظلة والمصطبة والدرج والزجاج والجدران ومواقع الأثاث والإضاءة، بالمتر. عند أي تعارض يعتمد الرقم المكتوب.</li>
</ul>
  <h2>ما لا تغطيه ويلزم له مختص</h2>
  <ul class="notes"><li><b>الإنشائي:</b> قواعد الأعمدة، بناء المصطبة، قطاعات الألمنيوم وتحمّلها للرياح. من المورد أو مهندس إنشائي.</li>
  <li><b>نظام السقف والزجاج:</b> رسومات تصنيع من الشركة الموردة، مع تصريف مياه المطر من الشرائح عبر الأعمدة.</li>
  <li><b>الكهرباء:</b> الأحمال، القواطع، التأريض، ومحولات شرائط LED.</li>
  <li><b>الغاز:</b> مسار التغذية والمحبس وفحص التسريب، إذا كانت طاولة النار بالغاز.</li></ul>
  <h2>قيم تحتاج اعتماد قبل التنفيذ</h2>
  <table><tr><th>البند</th><th class="c">القيمة في اللوحات (م)</th><th>ملاحظة</th></tr>
  <tr><td>اتجاه المقاس</td><td class="n">6.00 × 5.00</td><td>6.00 م عرض الواجهة و5.00 م العمق</td></tr>
  <tr><td>ارتفاع المصطبة</td><td class="n">0.60</td><td>من الصورة المرجعية، 4 قوائم درج</td></tr>
  <tr><td>ارتفاع المظلة فوق المصطبة</td><td class="n">3.00</td><td>من الصورة المرجعية، الصافي تحت الكمرات 2.75 م</td></tr>
  <tr><td>بُعد جدار التلفزيون عن حد المظلة الأمامي</td><td class="n">0.55</td><td>يترك 0.36 م بينه وبين الزجاج للتنظيف والتمديدات</td></tr></table>
  <h2>الفروقات عن الصورة المرجعية</h2>
  <ul class="notes"><li>المقاس 6.00 × 5.00 م بدل 8.00 × 3.00 م المكتوب على الصورة.</li><li>التلفزيون على جدار في الواجهة مقابل الكنب، بدل الجدار الخلفي.</li>
  <li>الكنب بعمق 0.80 م على شكل U، بدون كراسي مفردة أمامية.</li><li>الدفاية في الركن الأمامي الأيمن على بعد 1.35 م من أقرب مقعد.</li></ul></div>`,
  panel: `<h3>ترتيب اللوحات</h3><ul><li>1 — المسقط الأفقي بالمقاسات</li><li>2 — مسقط الأثاث والتجهيزات</li><li>3 — الواجهات</li><li>4 — القطاعات</li><li>5 — الجداول</li><li>6 — الإضاءة والتمديدات</li><li>7 — ملاحظات عامة</li></ul>
    <h3>مرفق</h3><ul><li>فيديو ثلاثي الأبعاد يوضح الشكل النهائي والخامات والإضاءة.</li></ul>` });

// ------------------------------------------------------------------ render
document.getElementById('root').innerHTML = sheets.map((sh, i) => `
<div class="sheet" id="s${i + 1}">
  ${sh.svg ? `<svg class="draw" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">${sh.svg}</svg>` : ''}
  ${sh.html || ''}
  <div class="tb"><div class="proj"><h1>الجلسة الخارجية</h1><p>الوضع الشتوي — مظلة وزجاج سحاب</p><p style="font-size:15px;color:#bfae93">مخططات تنفيذية معمارية</p></div>
    <div class="ttl"><small>لوحة ${i + 1} من ${TOTAL}</small><b>${sh.title}</b></div>
    <div class="body">${sh.panel}</div>
    <div class="foot"><span>المقاسات بالمتر</span><span>6.00 × 5.00 م — 30.00 م²</span></div></div>
  <div class="frame"></div>
</div>`).join('');
