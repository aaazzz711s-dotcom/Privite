// Renders the design images of the evening lounge.   node stills.js outDir [view[:WxH] ...]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, OUT = path.resolve(process.argv[2] || 'stills');
const THREE_DIR = process.env.THREE_DIR || path.join(ROOT, 'node_modules/three');
const LIST = (process.argv.slice(3).length ? process.argv.slice(3) : ['entrance_portrait:900x1200', 'entrance', 'back', 'seat', 'tv', 'plan']);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise((r) => server.listen(0, r));
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const bySize = {};
  for (const item of LIST) { const [name, size = '1920x1080'] = item.split(':'); (bySize[size] = bySize[size] || []).push(name); }
  for (const [size, names] of Object.entries(bySize)) {
    const [w, h] = size.split('x').map(Number);
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on('pageerror', (e) => { console.log('[pageerror]', e.message); process.exit(1); });
    await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (r) => r.fulfill({ path: path.join(THREE_DIR, r.request().url().split('three@0.170.0/')[1]), contentType: 'text/javascript' }));
    await page.goto(`http://localhost:${server.address().port}/index.html?render=1&w=${w}&h=${h}`);
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000 });
    for (const name of names) {
      const t0 = Date.now(); const b64 = await page.evaluate((n) => window.renderView(n), name);
      const f = path.join(OUT, `${name}.png`); fs.writeFileSync(f, Buffer.from(b64, 'base64')); console.log(f, Date.now() - t0, 'ms');
    }
    await page.close();
  }
  await browser.close(); server.close();
})();
