
// ---------------------------------------------------------------- tour timeline
const XF = 0.45, E = Y0 + 1.5;
const tourShots = [
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
const CLIPTXT = {
  projector: { title: 'بروجكتر وشاشة تنزل من السقف', closed: ['مسكّر: الشاشة ملفوفة داخل الكمرة الأمامية', 'الواجهة مفتوحة بالكامل على الحديقة'],
    open: ['الشاشة تنزل بالريموت', 'شاشة 110 بوصة • البروجكتر يشتغل معها'], detail: ['البروجكتر مخفي فوق الكنب', 'مثبّت تحت الكمرة الخلفية', 'المروحة على الجنب عشان ما تقطع الصورة'],
    card: 'شاشة 110 بوصة   •   تنزل بالريموت   •   الواجهة مفتوحة وهي مسكّرة' },
  drop: { title: 'تلفزيون ينزل من السقف', closed: ['مسكّر: التلفزيون مطبّق تحت السقف', 'الواجهة والأرض فاضية'],
    open: ['ينفتح وينزل بالريموت', 'ينزل 0.55 م بعد ما ينفتح • شاشة 65 بوصة'], detail: ['قاعدة مثبتة في الكمرة الوسطى', 'محرك كهربائي داخل العلبة', 'يشتغل بالليل والنهار'],
    card: 'شاشة 65 بوصة   •   ينفتح وينزل بالريموت   •   الأرض فاضية' },
};
const CT = CLIPTXT[TVOPT] || CLIPTXT.projector;
const clipShots = [
  { name: 'clipMain', t0: 0, t1: 11, fov: 62, cam: lin(0, 11 + XF, [0.7, Y0 + 1.27, -1.8, 0, Y0 + 1.5, 2.4], [0.3, Y0 + 1.2, -1.3, 0, Y0 + 1.55, 2.4]),
    state: (t) => ({ louver: 0, labels: 0, tv: clamp((t - 5.0) / 3.8) }) },
  { name: 'clipDetail', t0: 11, t1: DURATION, fov: 62, cam: TVOPT === 'drop'
      ? lin(11 - XF, DURATION, [2.2, Y0 + 1.25, -0.35, 0, Y0 + 2.05, 1.25], [1.85, Y0 + 1.35, -0.05, 0, Y0 + 2.1, 1.25])
      : lin(11 - XF, DURATION, [2.45, Y0 + 1.45, 0.0, -0.6, Y0 + 1.95, 0.4], [2.35, Y0 + 1.55, 0.45, -0.6, Y0 + 2.0, 0.3]),
    state: () => ({ louver: 0, labels: 0, tv: 1 }) },
];
const shots = CLIP ? clipShots : tourShots;

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
function clipCard(a) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.direction = 'rtl'; ctx.textAlign = 'center';
  const gr = ctx.createLinearGradient(0, 0, 0, H * 0.42); gr.addColorStop(0, 'rgba(0,0,0,0.65)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H * 0.42);
  ctx.fillStyle = '#fbf3e6'; ctx.font = `700 ${50 * K}px Cairo`; ctx.fillText(CT.title, W / 2, 92 * K);
  ctx.fillStyle = GOLD; ctx.fillRect(W / 2 - 60 * K, 112 * K, 120 * K, 3 * K);
  ctx.fillStyle = '#e6d3b2'; ctx.font = `700 ${21 * K}px Cairo`; ctx.fillText(CT.card, W / 2, 156 * K);
  ctx.restore();
}
function overlays(t, shot, w) {
  if (shot.name === 'clipMain') {
    caption(CT.title, CT.closed[0], w * smooth(0.6, 1.2, t) * (1 - smooth(4.4, 4.9, t)), CT.closed[1]);
    caption(CT.title, CT.open[0], w * smooth(5.4, 6.0, t) * (1 - smooth(10.2, 10.7, t)), CT.open[1]);
  } else if (shot.name === 'clipDetail') {
    caption(CT.detail[0], CT.detail[1], w * smooth(11.5, 12.0, t) * (1 - smooth(13.3, 13.8, t)), CT.detail[2]);
    clipCard(w * smooth(13.8, 14.6, t));
  } else if (shot.name === 'ext') {
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

