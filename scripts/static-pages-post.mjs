import { applyPageMeta, describeRoute } from "./static-page-meta.mjs";
import { catalogueRoutePaths, writeRouteShells } from "./static-route-shells.mjs";
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
const routeCount = writeRouteShells(ROOT, readFileSync(join(ROOT, "_shell.html"), "utf8"), catalogueRoutePaths(process.cwd()));
console.log(`[static-pages] ${routeCount} known route entry points written. Unknown paths retain 404 status.`);
console.log(`[static-pages] ${changed} dosya yeniden yazıldı, index.html + 404.html + .nojekyll hazır`);

// Give shared links a truthful route-specific head without changing app hydration scripts.
for (const path of ["/", ...catalogueRoutePaths(process.cwd())]) {
 const file = path === "/" ? join(ROOT,"index.html") : join(ROOT,path.slice(1),"index.html");
 writeFileSync(file, applyPageMeta(readFileSync(file,"utf8"),describeRoute(path,process.cwd())));
}
writeFileSync(join(ROOT,"404.html"),applyPageMeta(readFileSync(join(ROOT,"404.html"),"utf8"),describeRoute("/not-found",process.cwd())));
