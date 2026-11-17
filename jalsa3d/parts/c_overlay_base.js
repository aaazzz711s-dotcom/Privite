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
