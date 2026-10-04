// STATIC_PAGES=1 derlemesinin son adımı: GitHub Pages alt yoluna (/detox-gr) uyarla.
// public/ varlıklarına kodda sabit mutlak yolla bağlanıldığı için (vite base bunları yeniden yazmaz)
// derlenmiş çıktıdaki bu yolları taban yolla öneklerler. Sunucu/ödeme işlevi YOKTUR.
import { copyFileSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "/detox-gr";
const ROOT = "dist/client";
const ASSET = /(["'`(=])\/(products|photos|fonts|favicon\.svg|logo\.svg|og\.jpg|manifest\.webmanifest|__grok)/g;
const EXT = new Set([".js", ".css", ".html", ".json", ".webmanifest"]);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

let changed = 0;
for (const file of walk(ROOT)) {
  const ext = file.slice(file.lastIndexOf("."));
  if (!EXT.has(ext)) continue;
  const src = readFileSync(file, "utf8");
  let out = src.replace(ASSET, (_m, pre, name) => `${pre}${BASE}/${name}`);
  if (file.endsWith(".webmanifest")) out = out.replaceAll('"/media/', `"${BASE}/media/`);
  if (out !== src) {
    writeFileSync(file, out);
    changed++;
  }
}

copyFileSync(join(ROOT, "_shell.html"), join(ROOT, "index.html"));
copyFileSync(join(ROOT, "_shell.html"), join(ROOT, "404.html"));
writeFileSync(join(ROOT, ".nojekyll"), "");
console.log(`[static-pages] ${changed} dosya yeniden yazıldı, index.html + 404.html + .nojekyll hazır`);
