// Renders the tour to MP4 with headless Chromium (Playwright) + ffmpeg.
//   node render.js --stills 2,10,20 [--w 1280 --h 720]          -> PNG stills in ./stills
//   node render.js --out tour.mp4 [--from 0 --to 44 --fps 30]     -> H.264 video
//   node render.js --q 'tvopt=projector&clip=1' --out clip.mp4    -> screen-only clip for a TV option
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http'), fs = require('fs'), path = require('path');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const W = +arg('w', 1280), H = +arg('h', 720), FPS = +arg('fps', 30);
const ROOT = __dirname;
const THREE_DIR = process.env.THREE_DIR || [process.cwd(), ROOT].map((d) => path.join(d, 'node_modules/three')).find((d) => fs.existsSync(d));

const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('console', (m) => console.log('[page]', m.text()));
  page.on('pageerror', (e) => { console.log('[pageerror]', e.message); process.exit(1); });
  await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', (route) => {
    const rel = route.request().url().split('three@0.170.0/')[1];
    route.fulfill({ path: path.join(THREE_DIR, rel), contentType: 'text/javascript' });
  });
  await page.goto(`http://localhost:${port}/index.html?render=1&w=${W}&h=${H}${arg('q') ? '&' + arg('q') : ''}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 300000 });
  const DURATION = await page.evaluate(() => window.DURATION);

  const stills = arg('stills');
  if (stills) {
    fs.mkdirSync(path.join(process.cwd(), 'stills'), { recursive: true });
    for (const t of stills.split(',').map(Number)) {
      const t0 = Date.now();
      const b64 = await page.evaluate((t) => window.renderStill(t), t);
      const f = path.join(process.cwd(), 'stills', `t${String(t).padStart(5, '0')}.png`);
      fs.writeFileSync(f, Buffer.from(b64, 'base64'));
      console.log(f, (Date.now() - t0) + 'ms');
    }
  } else {
    const out = arg('out', 'tour.mp4');
    const f0 = Math.round(+arg('from', 0) * FPS), f1 = Math.round(+arg('to', DURATION) * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const started = Date.now();
    for (let f = f0; f < f1; f++) {
      const b64 = await page.evaluate((t) => window.renderFrame(t, 0.95), f / FPS);
      if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
      if ((f - f0) % 30 === 0) {
        const done = f - f0 + 1, el = (Date.now() - started) / 1000;
        console.log(`frame ${f}/${f1}  ${(el / done).toFixed(2)} s/frame  eta ${((f1 - f - 1) * el / done / 60).toFixed(1)} min`);
      }
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r));
    console.log('wrote', out);
  }
  await browser.close(); server.close();
})();
