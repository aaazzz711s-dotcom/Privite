
// ---------------------------------------------------------------- boot
await document.fonts.load(`700 30px Cairo`, 'تصميم 8.00');
await document.fonts.load(`400 30px Cairo`, 'تصميم 8.00');
renderer.compile(scene, camera);
for (const t of [2, 12, 20, 28, 33, 40]) frame(t);
window.__ready = true;

if (!RENDER) {
  let mode = 'tour', roofOpen = false, start = performance.now();
  const controls = new OrbitControls(camera, out); controls.enabled = false; controls.target.set(0, 1.6, 0);
  const bTour = document.getElementById('bTour'), bOrbit = document.getElementById('bOrbit'), bRoof = document.getElementById('bRoof');
  const setMode = (m) => {
    mode = m; bTour.classList.toggle('on', m === 'tour'); bOrbit.classList.toggle('on', m === 'orbit');
    controls.enabled = m === 'orbit';
    if (m === 'orbit') { camera.position.set(-7, 5, 9); camera.fov = 50; camera.updateProjectionMatrix(); controls.target.set(0, 1.6, 0); controls.update(); }
    else start = performance.now();
  };
  bTour.onclick = () => setMode('tour'); bOrbit.onclick = () => setMode('orbit');
  bRoof.onclick = () => { roofOpen = !roofOpen; bRoof.classList.toggle('on', roofOpen); if (mode !== 'orbit') setMode('orbit'); };
  const loop = () => {
    if (mode === 'tour') frame(((performance.now() - start) / 1000) % DURATION);
    else { controls.update(); applyState({ louver: roofOpen ? 1 : 0 }, performance.now() / 1000); composer.render(); ctx.drawImage(renderer.domElement, 0, 0); }
    requestAnimationFrame(loop);
  };
  loop();
}
