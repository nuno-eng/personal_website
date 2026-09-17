// Builds site photos (JPEG + WebP) and the 1200x630 social share images.
// Originals live in ../../photos (git-ignored): hero.png, smile.png, beret.jpg, suit.png.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const SRC = path.join(ROOT, 'photos');
const IMG = path.join(ROOT, 'publish/assets/images');
const OG = path.join(ROOT, 'publish/assets/og');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// name, source, output width/height, crop focus (0..1) used when aspect ratios differ
const PHOTOS = [
  { out: 'hero', src: 'hero.png', w: 1600, h: 1600, fx: 0.5, fy: 0.3 },
  { out: 'portrait', src: 'smile.png', w: 768, h: 960, fx: 0.5, fy: 0.0 },
  { out: 'marines', src: 'beret.jpg', w: 1200, h: 803, fx: 0.5, fy: 0.5 },
];

const SUB = {
  en: 'Founder, NabiaEdge &middot; Ex-Portuguese Marines officer &middot; 7.5 years at Amazon',
  pt: 'Fundador, NabiaEdge &middot; Ex-oficial dos Fuzileiros &middot; 7,5 anos na Amazon',
};
const SHARE = [
  { out: 'home', lang: 'en', kicker: 'Nuno Fontoura', title: 'Your agency shouldn&rsquo;t stop <b>when you do.</b>' },
  { out: 'home-pt', lang: 'pt', kicker: 'Nuno Fontoura', title: 'A sua ag&ecirc;ncia n&atilde;o devia <b>depender de si para tudo.</b>' },
  { out: 'about', lang: 'en', kicker: 'About', title: 'Operations under pressure in <b>three very different worlds.</b>' },
  { out: 'business-advisory', lang: 'en', kicker: 'Business Advisory', title: 'Stop being <b>founder-led.</b>' },
  { out: 'business-advisory-pt', lang: 'pt', kicker: 'Assessoria de Neg&oacute;cio', title: 'Deixe de ser <b>imprescind&iacute;vel.</b>' },
  { out: 'case-studies', lang: 'en', kicker: 'Case studies', title: 'What changes when the business <b>stops running through the founder.</b>' },
  { out: 'case-study-yunik', lang: 'en', kicker: 'Case study &middot; Yunik', title: '30% fewer decisions on the owner&rsquo;s desk <b>in five months.</b>' },
  { out: 'case-study-psicodramatizar', lang: 'en', kicker: 'Case study &middot; Psicodramatizar', title: '70% less money owed, <b>80% fewer late payments.</b>' },
  { out: 'free-resources', lang: 'en', kicker: 'Free Resources', title: 'Four ways to see where your agency <b>actually stands.</b>' },
  { out: 'micro-consulting', lang: 'en', kicker: 'Micro consulting &middot; NabiaEdge', title: 'One operational problem, <b>fixed properly.</b>' },
  { out: 'vessel-operating-system', lang: 'en', kicker: 'The Vessel Operating System', title: 'See where your business stands, <b>then fix the weakest part first.</b>' },
];

const fileUrl = (p) => pathToFileURL(p).href;

function shareHtml(s) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;500;600&display=swap">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;overflow:hidden;font-family:Archivo,system-ui,sans-serif;background:#0F1D3D;color:#fff;display:flex}
  .copy{width:720px;padding:64px 56px 56px 72px;display:flex;flex-direction:column}
  .k{font-size:22px;font-weight:600;color:#a8c8ff}
  h1{margin-top:auto;font-size:58px;line-height:1.06;font-weight:300;letter-spacing:-0.035em}
  h1 b{font-weight:600}
  .s{margin-top:auto;font-size:21px;line-height:1.45;color:#b8c2d8;font-weight:500}
  .photo{position:relative;flex:1;overflow:hidden}
  .photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:24% 30%;opacity:.62;filter:saturate(.85)}
  .photo::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,#0F1D3D 0%,rgba(15,29,61,.55) 30%,rgba(15,29,61,.25) 100%)}
</style></head><body>
<div class="copy"><div class="k">${s.kicker}</div><h1>${s.title}</h1><div class="s">${SUB[s.lang]}</div></div>
<div class="photo"><img src="${fileUrl(path.join(SRC, 'suit.png'))}"></div>
</body></html>`;
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();

for (const p of PHOTOS) {
  const src = path.join(SRC, p.src);
  await page.goto('about:blank');
  const out = await page.evaluate(async ({ url, w, h, fx, fy }) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / scale, sh = h / scale;
    const sx = (img.naturalWidth - sw) * fx, sy = (img.naturalHeight - sh) * fy;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    return { jpg: c.toDataURL('image/jpeg', 0.82), webp: c.toDataURL('image/webp', 0.8) };
  }, { url: 'data:image/' + (p.src.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(src).toString('base64'), w: p.w, h: p.h, fx: p.fx, fy: p.fy });
  for (const [ext, data] of Object.entries(out)) {
    const file = path.join(IMG, `${p.out}.${ext}`);
    fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
    console.log(path.relative(ROOT, file), Math.round(fs.statSync(file).size / 1024) + 'KB');
  }
}

await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
for (const s of SHARE) {
  const tmp = path.join(here, '.share.html');
  fs.writeFileSync(tmp, shareHtml(s));
  await page.goto(fileUrl(tmp), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(OG, `${s.out}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 86 });
  fs.unlinkSync(tmp);
  console.log(path.relative(ROOT, file));
}
await browser.close();
