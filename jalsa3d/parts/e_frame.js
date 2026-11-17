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
