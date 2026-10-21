import puppeteer from '/Users/nunofontoura/Documents/Claude/personal_website/tools/pdf/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import fs from 'node:fs';
const dir = process.argv[2];
const make = (img, kicker, title, sub) => `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;800&display=swap"><style>
body{margin:0;width:1600px;height:900px;font-family:Archivo,sans-serif;position:relative;overflow:hidden}
img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 30%}
.g{position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,29,61,.94) 0%,rgba(15,29,61,.82) 34%,rgba(15,29,61,0) 64%)}
.t{position:absolute;left:96px;top:150px;width:640px;color:#fff}
.k{font-weight:800;font-size:26px;letter-spacing:.12em;text-transform:uppercase;color:#9fb4ff;margin:0 0 26px}
h1{font-weight:800;font-size:72px;line-height:1.06;letter-spacing:-.01em;margin:0 0 28px}
p{font-weight:500;font-size:30px;line-height:1.35;margin:0;color:#dfe5f5}
</style></head><body><img src="data:image/jpeg;base64,${fs.readFileSync(img).toString('base64')}"><div class="g"></div><div class="t"><div class="k">${kicker}</div><h1>${title}</h1><p>${sub}</p></div></body></html>`;
const pages = {
  G: make(`${dir}/base-faq.jpg`, 'FAQ &middot; 4 min', 'The questions founders ask me', 'Nuno Fontoura &middot; Business Operations Advisor'),
  H: make(`${dir}/base-faq.jpg`, 'Before you book', 'Who this is for, and how it works', 'Nuno Fontoura &middot; Business Operations Advisor'),
  I: make(`${dir}/base-vsl.jpg`, 'Overview &middot; 4 min', 'How I work with agency founders', 'Nuno Fontoura &middot; Business Operations Advisor'),
  J: make(`${dir}/base-vsl.jpg`, 'Overview &middot; 4 min', 'Stop running a job. Start owning a business.', 'Nuno Fontoura &middot; Business Operations Advisor'),
};
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
for (const [k, html] of Object.entries(pages)) {
  const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900 });
  await p.setContent(html, { waitUntil: 'networkidle0' });
  await p.screenshot({ path: `${dir}/${k}.jpg`, type: 'jpeg', quality: 82 });
}
await b.close();
