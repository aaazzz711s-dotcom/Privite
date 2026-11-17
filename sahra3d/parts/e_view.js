
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
