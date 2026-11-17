// Renders comparison stills of the TV options (closed / open) from the same seat.
//   node tv-options.js outDir
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, OUT = path.resolve(process.argv[2] || 'tv-options');
const THREE_DIR = process.env.THREE_DIR || path.join(ROOT, 'node_modules/three');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const Y0 = 0.6;
const CAM = [1.55, Y0 + 1.22, -1.5, -0.55, Y0 + 1.35, 2.4];
const OPTS = [
  ['projector', 'الخيار 1: بروجكتر وشاشة تنزل من السقف', 'شاشة 110 بوصة • البروجكتر مخفي فوق الكنب'],
  ['drop', 'الخيار 2: تلفزيون ينزل من السقف', 'شاشة 65 بوصة على قاعدة في الكمرة الوسطى'],
  ['arm', 'الخيار 3: تلفزيون على الجدار الأيسر بذراع', 'شاشة 65 بوصة • الذراع يطلع 0.70 م ويلف للكنب'],
  ['lift', 'الخيار 4: كبت تلفزيون مخفي (الحالي)', 'كبت 1.80 × 0.45 × 0.90 م • شاشة 65 بوصة'],
];
(async () => {
  await new Promise((r) => server.listen(0, r));
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [opt, title, spec] of OPTS) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    page.on('pageerror', (e) => { console.log('[pageerror]', opt, e.message); process.exit(1); });
    await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (r) => r.fulfill({ path: path.join(THREE_DIR, r.request().url().split('three@0.170.0/')[1]), contentType: 'text/javascript' }));
    await page.goto(`http://localhost:${server.address().port}/index.html?render=1&tvopt=${opt}`);
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000 });
    for (const [v, label] of [[0, 'مسكّر'], [1, 'مفتوح وقت المشاهدة']]) {
      const b64 = await page.evaluate(([cam, v, cap]) => window.renderView(cam, 66, { louver: 0, labels: 0, tv: v }, 30.7, cap), [CAM, v, [title, label, spec]]);
      const f = path.join(OUT, `${opt}-${v}.png`); fs.writeFileSync(f, Buffer.from(b64, 'base64')); console.log(f);
    }
    await page.close();
  }
  await browser.close(); server.close();
})();
