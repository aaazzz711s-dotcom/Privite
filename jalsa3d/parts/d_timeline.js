
// ---------------------------------------------------------------- tour timeline
const XF = 0.45, E = Y0 + 1.5;
const shots = [
  { name: 'ext', t0: 0, t1: 26, fov: 50, cam: track([
      [0, -6.6, 1.5, 11.5, -0.5, 1.9, 0.5],
      [4.5, -4.4, 1.7, 8.6, -0.6, 1.95, 0.4],
      [9, 0.4, 2.0, 8.2, 0, 1.9, 0],
      [13, 6.8, 2.6, 6.6, 0.4, 1.8, 0],
      [16.5, 7.4, 6.8, 5.6, 0, 1.3, 0],
      [20, 0.6, 11.2, 4.2, 0, 0.6, 0.35],
      [23.5, -5.4, 6.6, 6.8, -0.4, 1.2, 0.3],
      [26.45, -3.6, 2.5, 6.8, -1.4, 1.6, 0.8]]),
    state: (t) => ({ louver: smooth(15.5, 18, t) * (1 - smooth(22.6, 24.6, t)), labels: smooth(18.2, 19.2, t) * (1 - smooth(22.0, 22.8, t)) }) },
  { name: 'enter', t0: 26, t1: 31, fov: 60, cam: lin(26 - XF, 31 + XF, [-1.93, 1.75, 5.2, -1.3, 1.75, 0], [-1.7, E, 0.78, 1.9, Y0 + 1.05, -1.2]),
    state: () => ({ louver: 0, labels: 0 }), cap: ['داخل الجلسة', 'طاولة نار وسطية • شاشة • دفاية', 'جلسة على شكل U بطول 6.70 م'] },
  { name: 'seat', t0: 31, t1: 35.6, fov: 62, cam: lin(31 - XF, 35.6 + XF, [2.0, Y0 + 1.2, 0.95, -2.6, Y0 + 0.9, -0.5], [1.7, Y0 + 1.25, 0.7, -1.2, Y0 + 2.15, -0.3]),
    state: () => ({ louver: 0, labels: 0 }), cap: ['سقف شرائح متحرك', 'مروحة سقف • إضاءة LED مخفية', 'جدران خشب شرائح • زجاج سحاب'] },
  { name: 'final', t0: 35.6, t1: DURATION, fov: 50, cam: lin(35.6 - XF, DURATION, [-4.0, 1.9, 8.2, -0.3, 1.9, 0.3], [-5.6, 3.4, 12.6, 0, 1.8, 0]),
    state: () => ({ louver: 0, labels: 0 }) },
];

let lastStateKey = '';
function applyState(st, t) {
  const a = -ease(st.louver) * 1.22;      // blades turn edge-on to the overhead camera
  for (const m of louvers) m.rotation.x = a;
  fan.rotation.y = t * 2.6;
  updateFire(t);
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
  ctx.fillText('سقف شرائح متحرك   •   زجاج سحاب جانبي   •   مروحة سقف   •   طاولة نار   •   دفاية   •   جلسات فاخرة', W / 2, 160 * K);
  const items = [['العرض', '8.00 م'], ['العمق', '3.00 م'], ['الارتفاع', '3.00 م'], ['ارتفاع المصطبة', '0.60 م']];
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
  const labels = [['جلسة على شكل U', 0, YT + 0.2, -1.0], ['طاولة نار', 0, YT + 0.2, 0.36], ['دفاية', 3.58, YT + 0.2, 1.1], ['شاشة', 1.75, YT + 0.2, -1.62], ['درج بإضاءة مخفية', -1.6, 0.7, 2.4]];
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
  dim([-X1, 0.05, 3.7], [X1, 0.05, 3.7], '8.00 م'); dim([5.2, 0.05, -Z1], [5.2, 0.05, Z1], '3.00 م');
  ctx.restore();
}
function overlays(t, shot, w) {
  if (shot.name === 'ext') {
    titleCard(w * smooth(0.6, 1.6, t) * (1 - smooth(5.6, 6.6, t)));
    caption('الواجهة', 'إطار ألمنيوم أسود • زجاج سحاب', w * smooth(8.6, 9.2, t) * (1 - smooth(14.2, 14.8, t)), 'إضاءة LED مخفية تحت المصطبة والدرج');
    planLabels(w * shot.state(t).labels);
    caption('المسقط من الأعلى', '8.00 × 3.00 م  •  المساحة 24 م²', w * smooth(18.2, 18.8, t) * (1 - smooth(22.4, 23, t)), 'سقف الشرائح مفتوح');
  } else if (shot.cap) {
    caption(shot.cap[0], shot.cap[1], w * smooth(shot.t0 + 0.4, shot.t0 + 0.9, t) * (1 - smooth(shot.t1 - 0.7, shot.t1 - 0.25, t)), shot.cap[2]);
  } else if (shot.name === 'final') {
    endCard(w * smooth(36.8, 38, t));
  }
}

