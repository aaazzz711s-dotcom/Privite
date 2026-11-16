// Exports the construction sheets in drawings.html to PNG (one per sheet) and a single PDF.
//   node export-drawings.js [outDir]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, OUT = path.resolve(process.argv[2] || 'sheets');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise((r) => server.listen(0, r));
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => { console.log('[pageerror]', e.message); process.exit(1); });
  await page.goto(`http://localhost:${server.address().port}/drawings.html`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const n = await page.locator('.sheet').count();
  for (let i = 0; i < n; i++) await page.locator('.sheet').nth(i).screenshot({ path: path.join(OUT, `sheet-${i + 1}.png`) });
  await page.pdf({ path: path.join(OUT, 'drawings.pdf'), width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  console.log(`exported ${n} sheets to ${OUT}`);
  await browser.close(); server.close();
})();
