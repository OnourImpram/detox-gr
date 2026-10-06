import { readFileSync, writeFileSync } from 'node:fs';
const files = new Map();
function edit(path, before, after) {
  const text = files.get(path) ?? readFileSync(path, 'utf8');
  if (text.split(before).length !== 2) throw new Error(`Expected exactly one reviewed replacement in ${path}`);
  files.set(path, text.replace(before, after));
}
edit('src/components/message-actions.tsx', "const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle');", "const [feedback, setFeedback] = useState<{ message: string; kind: 'copied' | 'manual' } | null>(null);\n  const status = feedback?.message === message ? feedback.kind : 'idle';");
edit('src/components/message-actions.tsx', "setStatus('copied');", "setFeedback({ message, kind: 'copied' });");
edit('src/components/message-actions.tsx', "setStatus('manual');", "setFeedback({ message, kind: 'manual' });");
edit('src/components/product-media.tsx', '{caption && <figcaption>{mediaCopy(locale, kind)}</figcaption>}', '{caption && <figcaption aria-hidden={kind === "pending" ? true : undefined}>{kind === "pending" ? "" : mediaCopy(locale, kind)}</figcaption>}');
edit('scripts/refinement-browser.mjs', "const selected=await page.locator('.customer-message details textarea').evaluate", "await page.waitForFunction(()=>{const el=document.querySelector('.customer-message details textarea');return el===document.activeElement&&el.selectionStart===0&&el.selectionEnd===el.value.length;});\n  const selected=await page.locator('.customer-message details textarea').evaluate");
edit('scripts/refinement-browser.mjs', '  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),text);', "  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),text);\n  await page.locator('.ed-inquiry-fields input').fill('60 EUR');\n  assert.equal(await page.locator('.customer-message__status').innerText(),'');");
edit('src/routes/p.$slug.tsx', '<div><dt>{r(locale, "unitPrice")}</dt><dd>{product.unit === "kg" ? "kg" : unitLabel(product.unit, locale) === "ürün" ? r(locale, "items") : unitLabel(product.unit, locale)}</dd></div>', '{product.unit !== "ürün" && <div><dt>{r(locale, "unitPrice")}</dt><dd>{unitLabel(product.unit, locale)}</dd></div>}');
const css='src/styles/refinement.css';
files.set(css,readFileSync(css,'utf8')+'\n.dt-page-heading h1, .dt-shop__heading h1, .dt-cart h1, .dt-checkout h1 { font-weight:650; font-size:clamp(2rem,3.5vw,3.2rem); letter-spacing:-.03em; line-height:1.2; }\n.customer-destination { display:grid; gap:8px; font-size:13px; margin-top:18px; color:var(--dt-muted); }\n.customer-destination select { width:100%; }\n.customer-unknown-price { font-size:13px; line-height:1.7; color:var(--dt-primary); margin-top:10px; }\n');
for(const path of ['src/data/release.json','public/version.json']) { edit(path,'"version": "3.1.1"','"version": "3.2.0"');edit(path,'"name": "Detoks v3.1"','"name": "Detoks v3.2"'); }
edit('package.json','"version": "3.1.1"','"version": "3.2.0"');
const lock=readFileSync('package-lock.json','utf8');
const metadata=JSON.parse(lock);if(metadata.version!=='3.0.0'||metadata.packages[''].version!=='3.0.0')throw new Error('Unexpected lock metadata');
files.set('package-lock.json',lock.replace('"version": "3.0.0"','"version": "3.2.0"').replace('"version": "3.0.0"','"version": "3.2.0"'));
for(const [path,text] of files)writeFileSync(path,text);
console.log(`Applied ${files.size} reviewed source refinements. No media or commerce approvals changed.`);
