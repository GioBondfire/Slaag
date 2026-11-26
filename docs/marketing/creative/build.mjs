// Builds Slaag ad images (1:1 and 9:16) from the ad definitions in ./ads.mjs.
// Usage: node docs/marketing/creative/build.mjs <set-folder>   e.g. term1-set1
// Output: <set-folder>/<ad-id>-1x1.png, <ad-id>-9x16.png and the HTML source of each.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sets } from './ads.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const setName = process.argv[2] || 'term1-set1';
const ads = sets[setName];
if (!ads) { console.error(`Unknown set ${setName}`); process.exit(1); }

// Brand tokens (DESIGN-BRIEF.md)
const T = {
  bg: '#FFFBF5', text: '#1F2A24', muted: '#3D4842', subtle: '#55625B', line: '#E6DFD3',
  primary: '#0E7A5A', primaryDark: '#0A5C44', primarySoft: '#E3F2EC',
  accent: '#FF8A3D', onAccent: '#1F2A24', accentText: '#B4540F', cream: '#FFF3E3',
};

const logo = (size) => `
  <div style="display:flex;align-items:center;gap:${size * 0.28}px;color:${T.primary}">
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="10" fill="${T.primary}"/><path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#FFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="25" cy="7" r="4" fill="${T.accent}"/></svg>
    <span style="font-size:${size * 0.85}px;font-weight:900;letter-spacing:-0.01em">Slaag</span>
    <span style="align-self:stretch;width:3px;margin:${size * 0.12}px ${size * 0.08}px;background:${T.line};border-radius:2px"></span>
    <span style="font-size:${size * 0.5}px;font-weight:800;color:${T.primaryDark}">${DESCRIPTOR}</span>
  </div>`;
// Fixed product descriptor locked up with the logo on every ad (decision 2026-11-25).
const DESCRIPTOR = 'Slim toetsvoorbereiding · Graad 4–7';

const check = (c = T.primary, s = 28) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

const card = (inner, extra = '') => `<div style="background:#FFF;border:2px solid ${T.line};border-radius:32px;padding:40px;box-shadow:0 18px 40px rgba(31,42,36,.10);${extra}">${inner}</div>`;

const pill = (txt, bg, fg) => `<span style="display:inline-flex;align-items:center;gap:10px;padding:10px 22px;border-radius:999px;background:${bg};color:${fg};font-weight:800;font-size:28px">${txt}</span>`;

// Mock components, one per visual idea
const mocks = {
  testCard: () => card(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px">
      <div>
        <div style="font-size:30px;color:${T.subtle};font-weight:700">Kwartaal 1 · Anja</div>
        <div style="font-size:42px;font-weight:900;margin-top:6px">Natuurwetenskappe-toets</div>
        <div style="font-size:30px;color:${T.muted};margin-top:6px">Vrydag 12 Feb · bl. 56–71</div>
      </div>
      ${pill(check(T.primaryDark, 24) + 'Op koers', T.primarySoft, T.primaryDark)}
    </div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:32px">
      ${pill('Uit jul eie handboek', T.cream, T.accentText)}${pill('Graad 4–7', T.cream, T.accentText)}${pill('In Afrikaans', T.cream, T.accentText)}
    </div>`),

  notification: () => card(`
    <div style="display:flex;align-items:center;gap:16px;color:${T.subtle};font-size:28px;font-weight:700">
      <svg width="44" height="44" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="10" fill="${T.primary}"/><path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#FFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Slaag · nou
    </div>
    <div style="font-size:40px;font-weight:900;margin-top:18px;display:flex;align-items:center;gap:12px">${check(T.primary, 36)}Anja se sessie is klaar</div>
    <div style="font-size:32px;color:${T.muted};margin-top:12px;line-height:1.4">8 uit 10 reg · Oefen nog: <b style="color:${T.text}">bestuiwing</b><br>Volgende sessie: Donderdag 16:00</div>`),

  readiness: () => `
    <div style="align-self:flex-start;background:${T.accent};color:${T.onAccent};font-size:44px;font-weight:900;padding:26px 40px;border-radius:40px 40px 40px 8px;margin-bottom:28px">“Ek het geleer, Ma!”</div>
    ${card(`
      <div style="font-size:30px;color:${T.subtle};font-weight:700">Wat jy op jou foon sien</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:20px">
        <div style="font-size:40px;font-weight:900">Natuurwetenskappe-toets</div>
        ${pill(check(T.primaryDark, 24) + 'Op koers', T.primarySoft, T.primaryDark)}
      </div>
      <div style="display:flex;align-items:baseline;gap:18px;margin-top:22px">
        <div style="font-size:88px;font-weight:900;color:${T.primary};line-height:1">72%</div>
        <div style="font-size:30px;color:${T.muted}">gereed · 3 van 4 sessies gedoen</div>
      </div>
      <div style="height:18px;border-radius:999px;background:${T.primarySoft};margin-top:22px"><div style="width:72%;height:100%;border-radius:999px;background:${T.primary}"></div></div>
      <div style="font-size:30px;color:${T.muted};margin-top:20px">Oefen nog: <b style="color:${T.text}">bestuiwing, bevrugting</b></div>`)}`,

  feedback: () => card(`
    <div style="font-size:30px;color:${T.subtle};font-weight:700">Vraag 6</div>
    <div style="font-size:38px;font-weight:800;margin-top:8px;line-height:1.3">Wat is bestuiwing?</div>
    <div style="margin-top:22px;padding:22px 26px;border-radius:20px;border:2px solid ${T.line};background:${T.bg};font-size:32px;color:${T.muted}">“Wanneer stuifmeel na ’n blom toe gaan.”</div>
    <div style="margin-top:26px;border-radius:24px;background:${T.cream};padding:26px 30px">
      <div style="display:inline-block;background:${T.accent};color:${T.onAccent};font-weight:900;font-size:32px;padding:8px 22px;border-radius:999px">Amper daar!</div>
      <div style="font-size:30px;margin-top:16px;line-height:1.4"><b>Reg:</b> stuifmeel word oorgedra.<br><b>Wat kort:</b> van die helmknop na die stempel.</div>
    </div>`),
};

function html(ad, fmt) {
  const tall = fmt === '9x16';
  const W = 1080, H = tall ? 1920 : 1080;
  // Stories: keep text out of the top ~250px and bottom ~340px.
  const pad = tall ? '250px 72px 340px' : '64px 72px 56px';
  const hSize = tall ? 92 : (ad.headline.length > 34 ? 66 : 76);
  return `<!doctype html><html lang="af"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap">
<style>html,body{margin:0}*{box-sizing:border-box}</style></head>
<body><div style="width:${W}px;height:${H}px;background:${T.bg};color:${T.text};font-family:Nunito,system-ui,sans-serif;padding:${pad};display:flex;flex-direction:column;gap:${tall ? 56 : 36}px;overflow:hidden;position:relative">
  <div style="position:absolute;right:-140px;top:-140px;width:420px;height:420px;border-radius:999px;background:${T.primarySoft}"></div>
  <div style="position:relative">${logo(tall ? 64 : 52)}</div>
  <div style="position:relative;font-size:${hSize}px;line-height:1.05;font-weight:900;letter-spacing:-0.015em;max-width:940px">${ad.imageHeadline}</div>
  <div style="position:relative;display:flex;flex-direction:column;flex:1;justify-content:center;${tall ? 'zoom:1.15' : ''}">${mocks[ad.mock]()}</div>
  <div style="position:relative;align-self:flex-start;background:${T.primary};color:#FFF;font-size:${tall ? 38 : 30}px;font-weight:800;padding:${tall ? '22px 40px' : '18px 32px'};border-radius:${tall ? '36px' : '999px'};line-height:1.3">${ad.footer ?? 'Kyk hoe Slaag werk →'}</div>
</div></body></html>`;
}

const outDir = join(here, setName);
mkdirSync(join(outDir, 'src'), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const ad of ads) {
  for (const fmt of ['1x1', '9x16']) {
    const doc = html(ad, fmt);
    writeFileSync(join(outDir, 'src', `${ad.id}-${fmt}.html`), doc);
    await page.setViewportSize({ width: 1080, height: fmt === '1x1' ? 1080 : 1920 });
    await page.setContent(doc, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(outDir, `${ad.id}-${fmt}.png`) });
    console.log('wrote', `${ad.id}-${fmt}.png`);
  }
}
await browser.close();
