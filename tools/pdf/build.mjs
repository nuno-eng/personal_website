// Builds the four free-resource PDFs as designed, fillable documents.
//
//   cd tools/pdf && npm install && npm run build
//
// Each document is laid out in HTML (fixed A4 pages), printed with Chrome, then
// pdf-lib adds form fields exactly where the HTML placeholders are:
//   <div data-field="name" [data-ml]>   text field (data-ml = multi-line)
//   <span data-check="name">            checkbox
//   <span data-radio="group" data-value="3">  radio option
// Content lives in ./content.mjs. Set CHROME_PATH if Chrome isn't in the default location.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DOCS } from './content.mjs';

const OUT = path.resolve(import.meta.dirname, '../../publish/assets/free-resources');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PX_TO_PT = 0.75;
const PAGE_H_PX = 1122.52; // 297mm at 96dpi
const PAGE_H_PT = 841.89;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap');
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Archivo, 'Helvetica Neue', Arial, sans-serif; color: #201e1d; font-size: 10.5pt; line-height: 1.55; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; position: relative; overflow: hidden; padding: 16mm 17mm 20mm; page-break-after: always; background: #fff; }
.page:last-child { page-break-after: auto; }
.content { height: calc(297mm - 36mm); overflow: visible; }
.page.first { padding-top: 0; }
.page.first .content { height: calc(297mm - 20mm); }
.run { display: flex; justify-content: space-between; font-size: 7.5pt; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #77726f; border-bottom: 1px solid #e4e1e0; padding-bottom: 3mm; margin-bottom: 7mm; }
.run b { color: #1E3A8A; }
.pf { position: absolute; left: 17mm; right: 17mm; bottom: 9mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #77726f; border-top: 1px solid #e4e1e0; padding-top: 2.5mm; }
.pf a { color: #77726f; text-decoration: none; }
.cover { background: #1E3A8A; color: #fff; margin: 0 -17mm 9mm; padding: 14mm 17mm 11mm; position: relative; }
.cover .brand { display: flex; align-items: center; gap: 3mm; font-size: 8pt; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; opacity: .9; margin-bottom: 9mm; }
.cover .brand i { display: inline-block; width: 5mm; height: 5mm; background: #fff; }
.cover .type { font-size: 8pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #a8c8ff; margin-bottom: 2mm; }
.cover h1 { font-size: 28pt; line-height: 1.05; letter-spacing: -.02em; margin: 0 0 4mm; font-weight: 800; }
.cover p { font-size: 12pt; line-height: 1.45; margin: 0; max-width: 150mm; color: #e8eefc; }
.cover .meta { margin-top: 7mm; display: flex; gap: 6mm; font-size: 8pt; font-weight: 600; color: #cfdcf7; }
.cover .meta span::before { content: '■ '; color: #a8c8ff; }
.kicker { font-size: 8pt; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #1E3A8A; margin: 0 0 1.5mm; }
h2 { font-size: 16pt; line-height: 1.2; letter-spacing: -.01em; margin: 0 0 3mm; font-weight: 800; }
h3 { font-size: 11.5pt; margin: 0 0 1.5mm; font-weight: 800; }
p { margin: 0 0 3mm; }
.muted { color: #6b6766; }
.small { font-size: 8.5pt; }
section.block { margin: 0 0 7mm; }
.lead { font-size: 11.5pt; }
.steps { counter-reset: s; margin: 0; padding: 0; list-style: none; }
.steps li { counter-increment: s; position: relative; padding: 0 0 3mm 10mm; }
.steps li::before { content: counter(s); position: absolute; left: 0; top: 0; width: 6.5mm; height: 6.5mm; background: #1E3A8A; color: #fff; font-weight: 800; font-size: 9pt; display: grid; place-items: center; }
.cards { display: grid; gap: 4mm; }
.cards.c3 { grid-template-columns: repeat(3, 1fr); }
.card { background: #f3f5fa; border-top: 3px solid #1E3A8A; padding: 4mm; }
.card .big { font-size: 20pt; font-weight: 800; color: #1E3A8A; line-height: 1.05; margin-bottom: 1.5mm; }
.card p { font-size: 9pt; line-height: 1.45; margin: 0; }
.card .src { font-size: 7.5pt; color: #77726f; margin-top: 2mm; }
.callout { border-left: 4px solid #1E3A8A; background: #f3f5fa; padding: 4mm 5mm; margin: 0 0 6mm; }
.callout p:last-child { margin: 0; }
.label { display: block; font-size: 8pt; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #3a3736; margin: 0 0 1mm; }
.hint { font-weight: 500; letter-spacing: 0; text-transform: none; color: #77726f; }
.fld { background: #f5f6fa; border-bottom: 1.2px solid #9aa6c6; height: 8mm; margin: 0 0 3.2mm; }
.fld.ml { height: 18mm; }
.fld.xl { height: 28mm; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 6mm; }
.grid3 { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 0 5mm; }
.rule { border: 1px solid #d9deea; padding: 4.5mm 5mm 1.5mm; margin: 0 0 5mm; position: relative; }
.rule .num { position: absolute; top: -3mm; left: 4mm; background: #1E3A8A; color: #fff; font-size: 7.5pt; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 1mm 2.5mm; }
table.t { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
table.t th { text-align: left; font-size: 7pt; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #fff; background: #1E3A8A; padding: 2mm; }
table.t td { border-bottom: 1px solid #e4e1e0; padding: 1.3mm 2mm; vertical-align: middle; }
table.t td .fld { margin: 0; height: 7mm; }
table.t td.c { text-align: center; }
table.t tr.shade td { background: #fafbfd; }
.chk { display: inline-block; width: 4.2mm; height: 4.2mm; border: 1.2px solid #1E3A8A; background: #fff; vertical-align: middle; }
.chkrow { display: flex; gap: 3mm; align-items: flex-start; margin: 0 0 3mm; }
.chkrow .chk { flex: none; margin-top: .8mm; }
.yn { display: inline-flex; gap: 1.5mm; align-items: center; font-size: 7.5pt; color: #3a3736; margin-right: 2mm; }
.rad { display: inline-block; width: 4.4mm; height: 4.4mm; border: 1.2px solid #1E3A8A; border-radius: 50%; background: #fff; vertical-align: middle; }
.rates { display: inline-flex; gap: 2.2mm; align-items: center; }
.rates span.n { font-size: 7pt; color: #77726f; margin-right: -1.2mm; }
.cta { background: #1E3A8A; color: #fff; padding: 6mm 7mm; margin: 2mm 0 5mm; }
.cta h2 { color: #fff; font-size: 14pt; margin-bottom: 2mm; }
.cta p { color: #e8eefc; margin: 0 0 4mm; }
.cta .btns { display: flex; gap: 4mm; flex-wrap: wrap; }
.cta a { display: inline-block; padding: 2.8mm 5mm; font-weight: 800; font-size: 9.5pt; text-decoration: none; }
.cta a.primary { background: #fff; color: #1E3A8A; }
.cta a.secondary { border: 1px solid #fff; color: #fff; }
.sig { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e4e1e0; padding-top: 3mm; font-size: 8.5pt; }
.sig b { display: block; font-size: 10pt; }
.pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
.pillar { border: 1px solid #d9deea; padding: 4mm; }
.pillar h3 { color: #1E3A8A; margin-bottom: .5mm; }
.pillar .sub { font-size: 7.5pt; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 2mm; }
.pillar p { font-size: 9pt; line-height: 1.45; margin: 0; }
table.areas td.area { width: 34%; font-weight: 700; }
table.areas td.area span { display: block; font-size: 7pt; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #1E3A8A; }
table.areas td.rate { width: 25%; white-space: nowrap; }
table.bands td { padding: 2mm; }
.stages { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2mm; }
.stage { background: #f3f5fa; padding: 3mm; font-size: 8pt; line-height: 1.4; }
.stage b { display: block; color: #1E3A8A; font-size: 9pt; margin-bottom: 1mm; }
`;

function html(doc) {
  const total = doc.pages.length;
  const pages = doc.pages.map((body, i) => `
<section class="page${i === 0 ? ' first' : ''}">
  <div class="content">
    ${i === 0 ? `<div class="cover"><div class="brand"><i></i>Nuno Fontoura &middot; Free resource</div><div class="type">${doc.type}</div><h1>${doc.title}</h1><p>${doc.subtitle}</p><div class="meta">${doc.meta.map((m) => `<span>${m}</span>`).join('')}</div></div>` : `<div class="run"><span><b>${doc.title}</b></span><span>Nuno Fontoura &middot; NabiaEdge</span></div>`}
    ${body}
  </div>
  <div class="pf"><a href="https://www.nunofontoura.com">nunofontoura.com</a><span>${doc.title} &middot; Page ${i + 1} of ${total}</span></div>
</section>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${doc.title}</title><style>${CSS}</style></head><body>${pages}</body></html>`;
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
for (const doc of DOCS) {
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.emulateMediaType('print');
  await page.setContent(html(doc), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);

  const overflow = await page.evaluate(() => [...document.querySelectorAll('.content')].map((c, i) => (c.scrollHeight > c.clientHeight + 1 ? i + 1 : 0)).filter(Boolean));
  if (overflow.length) throw new Error(`${doc.file}: content overflows on page(s) ${overflow.join(', ')}`);

  const widgets = await page.evaluate(() => {
    const out = [];
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
    for (const el of document.querySelectorAll('[data-field]')) out.push({ kind: 'text', name: el.dataset.field, ml: el.hasAttribute('data-ml'), ...rect(el) });
    for (const el of document.querySelectorAll('[data-check]')) out.push({ kind: 'check', name: el.dataset.check, ...rect(el) });
    for (const el of document.querySelectorAll('[data-radio]')) out.push({ kind: 'radio', name: el.dataset.radio, value: el.dataset.value, ...rect(el) });
    return out;
  });

  const printed = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.close();

  const pdf = await PDFDocument.load(printed);
  const pages = pdf.getPages();
  if (pages.length !== doc.pages.length) throw new Error(`${doc.file}: expected ${doc.pages.length} pages, Chrome produced ${pages.length}`);
  const form = pdf.getForm();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const ink = rgb(0.125, 0.118, 0.114);
  const navy = rgb(0.118, 0.227, 0.541);
  const radios = {};
  for (const w of widgets) {
    const pageIndex = Math.floor((w.y + 0.5) / PAGE_H_PX);
    const target = pages[pageIndex];
    const box = { x: w.x * PX_TO_PT, y: PAGE_H_PT - (w.y - pageIndex * PAGE_H_PX + w.h) * PX_TO_PT, width: w.w * PX_TO_PT, height: w.h * PX_TO_PT };
    if (w.kind === 'text') {
      const f = form.createTextField(w.name);
      if (w.ml) f.enableMultiline();
      f.addToPage(target, { ...box, borderWidth: 0, backgroundColor: rgb(0.961, 0.965, 0.98), textColor: ink, font });
      f.setFontSize(w.ml ? 9 : 10);
    } else if (w.kind === 'check') {
      const c = form.createCheckBox(w.name);
      c.addToPage(target, { ...box, borderWidth: 1, borderColor: navy, backgroundColor: rgb(1, 1, 1), textColor: navy });
    } else {
      const g = radios[w.name] || (radios[w.name] = form.createRadioGroup(w.name));
      g.addOptionToPage(w.value, target, { ...box, borderWidth: 1, borderColor: navy, backgroundColor: rgb(1, 1, 1), textColor: navy });
    }
  }
  form.updateFieldAppearances(font);
  pdf.setTitle(doc.title);
  pdf.setSubject(doc.subtitle.replace(/<[^>]+>/g, ''));
  pdf.setAuthor('Nuno Fontoura');
  pdf.setCreator('NabiaEdge · nunofontoura.com');
  pdf.setKeywords(['NabiaEdge', 'Vessel Operating System', 'founder-led agencies']);
  fs.writeFileSync(path.join(OUT, doc.file), await pdf.save());
  console.log(`${doc.file}: ${pages.length} pages, ${widgets.length} fields`);
}
await browser.close();
